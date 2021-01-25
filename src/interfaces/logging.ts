export interface ILogEntry {
  methodName: string;
  className: string;
  message?: string;
  error?: any;
  graphql?: {
    query?: any;
    variables?: string;
    operationName?: string;
    response?: string;
    headers?: string;
  }
}

export interface IKinesisRecord extends ILogEntry {
  result: 'Success' | 'Error';
  version: string;
  environment: string;
}