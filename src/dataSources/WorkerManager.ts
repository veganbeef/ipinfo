import {ChildProcess, fork} from 'child_process';
import {IWorkerJob, IWorkerResponse} from '../interfaces';
import {GetIPInfoQueryArgs, ServiceResponse} from '../schema/schema-types';


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
   */
  public processIPInfoQuery(args: GetIPInfoQueryArgs): Promise<ServiceResponse[]> {
    return new Promise(resolve => {
      let responses: ServiceResponse[] = [];
      for (let i = 0; i < args.services.length; i++) {
        this._queueJob({
          domain: args.domain,
          service: args.services[i]
        }, (message: IWorkerResponse) => {
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
   */
  private _queueJob(job: IWorkerJob, callback: (message: IWorkerResponse) => any): void {
    this._workerPool[this._nextWorker].send(job);
    this._workerPool[this._nextWorker].on('message', callback);
    this._iterateNextWorker();
  }

  /**
   * Internal method to update the next worker index
   */
  private _iterateNextWorker(): void {
    (this._nextWorker < (this._workerPool.length - 1))
      ? this._nextWorker++
      : this._nextWorker = 0;
  }

  /**
   * Internal method to recreate any workers that go down
   * TODO: handle potential lost tasks from workers that have errored out
   */
  private _processWorkerError(error: any, index: number): void {
    this._workerPool[index].kill();
    this._workerPool[index] = this._createNewWorker(index);
  }

  /**
   * Internal method to create a new worker in a forked process and add an error handler
   */
  private _createNewWorker(index: number): ChildProcess {
    const worker = fork(__dirname + '/RESTWorker.ts');
    worker.on('error', error => this._processWorkerError(error, index));
    return worker;
  }

}