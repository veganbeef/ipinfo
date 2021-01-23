export interface ILogEntry {
  methodName: string;
  className: string;
  message?: string;
  error?: any;
  graphql?: {
    query?: string;
    variables?: string;
    response?: string;
    headers?: string;
  }
}

export interface IKinesisRecord extends ILogEntry {
  result: 'Success' | 'Error';
  version: string;
  environment: string;
}