import fetch from 'node-fetch';

import {Service} from '../schema/schema-types';
import {NetworkError, NoDataError, ValidationError} from '../customErrors';
import {IWorkerJob, IWorkerResponse} from '../interfaces';
import {cleanURL, isIPAddress, isURL} from '../utils';
import {pingAPIKey, virusTotalAPIKey} from '../secretKeys';

/**
 * Class to encapsulate all functionality needed in a single child process that makes HTTP requests to various
 * API-based services. This class is instantiated in multiple child processes by the WorkerManager class in order to
 * create the worker pool.
 */
class RESTWorker {

  /**
   * Main method to accept and validate a message before sending it to the proper service method
   * @param {IWorkerJob} message - input message from WorkerManager
   * @returns {Promise<IWorkerResponse>}
   */
  public async processMessage(message: IWorkerJob): Promise<IWorkerResponse> {
    try {
      const validMessage: IWorkerJob = this._validateMessage(message);
      let data;
      if (validMessage.service === Service.ipapi) {
        data = await this._getIPAPIInfo(validMessage.domain);
      } else if (validMessage.service === Service.rdap) {
        data = await this._getRDAPInfo(validMessage.domain);
      } else if (validMessage.service === Service.ping) {
        data = await this._getPingInfo(validMessage.domain);
      } else if (validMessage.service === Service.virusTotal) {
        data = await this._getVirusTotalInfo(validMessage.domain);
      }
      return {
        data,
        service: validMessage.service,
        domain: validMessage.domain
      }
    } catch (error) {
      return {
        error,
        ...message
      };
    }
  }

  /**
   * Helper method to ensure the message is properly formatted
   * @param {IWorkerJob} message - input message from WorkerManager (via this.processMessage())
   * @returns {IWorkerJob}
   * @throws {ValidationError}
   */
  private _validateMessage(message: IWorkerJob): IWorkerJob {
    const messageKeys = Object.keys(message);
    if ((!messageKeys.includes('service') || !messageKeys.includes('domain')) ||
      !Object.values(Service).includes(message.service) ||
      !(isIPAddress(message.domain) || isURL(message.domain))
    ) {
      throw new ValidationError('invalid message');
    }
    return {
      service: message.service,
      domain: message.domain
    };
  }

  /**
   * Helper method to query the ip-api.com API
   * @param {string} domain - a URL that will be sent to the ip-api service
   * @returns {Promise<{}>}
   */
  private async _getIPAPIInfo(domain: string): Promise<{}> {
    const cleanedDomain = cleanURL(domain);
    return this._get(`http://ip-api.com/json/${cleanedDomain}`);
  }

  /**
   * Helper method to query the rdap.org API and extract relevanat info from the response
   * @param {string} domain - a URL that will be sent to the rdap service
   * @returns {Promise<{}>}
   */
  private async _getRDAPInfo(domain: string): Promise<{}> {
    const cleanedDomain = cleanURL(domain);
    const domainType = isIPAddress(cleanedDomain) ? 'ip' : 'domain';
    const response = await this._get(`https://rdap.org/${domainType}/${cleanedDomain}`);
    return {
      events: response.events,
      nameservers: response.nameservers
    };
  }

  /**
   * Helper method to query the viewdns.info ping API
   * @param {string} domain - a URL that will be sent to the viewdns service
   * @returns {Promise<{}>}
   */
  private async _getPingInfo(domain: string): Promise<{}> {
    const cleanedDomain = cleanURL(domain);
    return this._get(`https://api.viewdns.info/ping/?host=${cleanedDomain}&apikey=${pingAPIKey}&output=json`);
  }

  /**
   * Helper method to query the virustotal.com API
   * @param {string} domain - a URL that will be sent to the virustotal service
   * @returns {Promise<{}>}
   */
  private async _getVirusTotalInfo(domain: string): Promise<{}> {
    const cleanedDomain = cleanURL(domain);
    const response = await this._get(
      `https://www.virustotal.com/api/v3/domains/${cleanedDomain}`,
      {'x-apikey': virusTotalAPIKey}
    );
    return response.data;
  }

  /**
   * Helper method to wrap fetch() with error handling and response decoding
   * @param {string} url - destination URL for the query
   * @param {Object} [headers] - optional object containing key/value pairs to be sent as request headers
   * @returns {Promise<any>}
   * @throws {NetworkError | NoDataError}
   */
  private async _get(url: string, headers = {}): Promise<any> {
    const response = await fetch(url, {headers}).catch(error => {
      throw new NetworkError('request failed');
    });
    if (!response.ok) {
      throw new NetworkError(`response has error code: ${response.status}`);
    }
    const jsonResponse = await response.json().catch((error: any) => {
      throw new NoDataError('unable to parse JSON');
    });
    return jsonResponse;
  }

}

const worker = new RESTWorker();

process.on('message', message => {
  worker.processMessage(message).then(response => {
    (process as any).send(response);
  });
});