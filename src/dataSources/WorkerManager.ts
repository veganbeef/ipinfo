import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { ChildProcess, fork } from 'child_process';

import { IWorkerJob, IWorkerResponse } from '../interfaces';
import { logger } from '../logger';
import { GetIPInfoQueryArgs, ServiceResponse } from '../schema/schema-types';

/**
 * Class to create and manage a pool of child processes
 */
export class WorkerManager {
  private _workerPool: ChildProcess[] = [];
  private _nextWorker = 0;

  constructor(workerCount = 2) {
    for (let i = 0; i < workerCount; i++) {
      this._workerPool.push(this._createNewWorker(i));
    }
  }

  /**
   * Resolver method to break down a request into jobs, add those jobs to the queue, and formulate a response
   * @param {GetIPInfoQueryArgs} args - input args from the getIPInfo GraphQL query
   * @returns {Promise<ServiceResponse[]>}
   */
  public processIPInfoQuery(args: GetIPInfoQueryArgs, context: ExpressContext): Promise<ServiceResponse[]> {
    return new Promise(resolve => {
      const responses: ServiceResponse[] = [];
      for (const service of args.services) {
        this._queueJob({
          domain: args.domain,
          service
        }, (message: IWorkerResponse) => {
          if (message.error) {
            logger.addLog({
              methodName: 'processIPInfoQuery',
              className: 'WorkerManager',
              error: JSON.stringify(message.error),
              graphql: {
                query: context.connection!.query,
                variables: JSON.stringify(context.connection!.variables),
                operationName: context.connection!.operationName,
                response: JSON.stringify(context.res),
                headers: JSON.stringify(context.req.headers)
              }
            });
          }
          if (!responses.map(resp => resp.service).includes(message.service)) {
            responses.push({
              service: message.service,
              data: (message.data) ? message.data : undefined,
              error: (message.error) ? message.error : undefined
            });
            if (responses.length === (args.services.length)) {
              resolve(responses);
            }
          }
        });
      }
    });

  }

  /**
   * Internal method to assign work to the next worker
   * TODO: reorganize so .on('message') callback is not added multiple times
   * @param {IWorkerJob} job - object containing info about the job to be sent to the worker pool
   * @param {(message: IWorkerResponse) => any} callback - anonymous function to handle 'message' event from worker
   * @returns {void}
   */
  private _queueJob(job: IWorkerJob, callback: (message: IWorkerResponse) => any): void {
    this._workerPool[this._nextWorker].send(job);
    this._workerPool[this._nextWorker].on('message', callback);
    this._iterateNextWorker();
  }

  /**
   * Internal method to update the next worker index
   * @returns {void}
   */
  private _iterateNextWorker(): void {
    if (this._nextWorker < (this._workerPool.length - 1)) {
      this._nextWorker++;
    } else {
      this._nextWorker = 0;
    }
  }

  /**
   * Internal method to recreate any workers that go down
   * TODO: handle potential lost tasks from workers that have errored out
   * @param {any} error - error object from worker
   * @param {number} index - index of worker within the worker pool
   * @returns {void}
   */
  private _processWorkerError(error: any, index: number): void {
    this._workerPool[index].kill();
    this._workerPool[index] = this._createNewWorker(index);
    logger.addLog({
      methodName: '_processWorkerError',
      className: 'WorkerManager',
      message: `worker ${index} errored out`,
      error: JSON.stringify(error),
    });
  }

  /**
   * Internal method to create a new worker in a forked process and add an error handler
   * @param {number} index
   * @returns {ChildProcess}
   */
  private _createNewWorker(index: number): ChildProcess {
    const worker = fork(__dirname + '/RESTWorker.ts');
    worker.on('error', error => this._processWorkerError(error, index));
    return worker;
  }

}