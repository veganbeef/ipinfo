import { Service } from '../schema/schema-types';

/**
 * Interface for job data to be passed to a single worker
 */
export interface IWorkerJob {
  service: Service;
  domain: string;
}

/**
 * Interface for the response from a single worker
 */
export interface IWorkerResponse extends IWorkerJob {
  data?: {}; // TODO: add service response interfaces
  error?: Error;
}