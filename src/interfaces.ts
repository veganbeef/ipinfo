import {Service} from './schema/schema-types';

export interface IWorkerJob {
  service: Service;
  domain: string;
}

export interface IWorkerResponse extends IWorkerJob {
  data?: {}; // TODO: add service response interfaces
  error?: Error;
}