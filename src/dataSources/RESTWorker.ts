import fetch from 'node-fetch';

import {Service} from '../schema/schema-types';
import {NetworkError, NoDataError, ValidationError} from '../customErrors';
import {IWorkerJob, IWorkerResponse} from '../interfaces';
import {cleanURL, isIPAddress, isURL} from '../utils';
import {pingAPIKey, virusTotalAPIKey} from '../secretKeys';

/**
 * Class to encapsulate all functionality needed in a single child process
 */
class RESTWorker {

  /**
   * Main method to accept and validate a message before sending it to the proper service method
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
   * Internal method to ensure the message is properly formatted
   * @throws {ValidationError}
   */
  private _validateMessage(message: any): IWorkerJob {
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
   * Service method to query the ip-api.com API
   */
  private async _getIPAPIInfo(domain: string): Promise<{}> {
    const cleanedDomain = cleanURL(domain);
    return this._get(`http://ip-api.com/json/${cleanedDomain}`);
  }

  /**
   * Service method to query the rdap.org API and extract relevanat info from the response
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
   * Service method to query the viewdns.info ping API
   */
  private async _getPingInfo(domain: string): Promise<{}> {
    const cleanedDomain = cleanURL(domain);
    return this._get(`https://api.viewdns.info/ping/?host=${cleanedDomain}&apikey=${pingAPIKey}&output=json`);
  }

  /**
   * Service method to query the virustotal.com API
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
   * Internal method to wrap fetch() with error handling and response decoding
   * @throws {NetworkError | NoDataError}
   */
  private async _get(url: string, headers = {}): Promise<any> {
    const response = await fetch(url, {headers}).catch(error => {
      throw new NetworkError('request failed');
    });
    if (!response.ok) {
      throw new NoDataError(`response has error code: ${response.status}`);
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
    (<any> process).send(response);
  });
});