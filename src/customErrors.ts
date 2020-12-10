import {ApolloError} from 'apollo-server-express';

export class ValidationError extends ApolloError {
  constructor(message: string) {
    super(message, 'BAD_REQUEST');
  }
}

export class NoDataError extends ApolloError {
  constructor(message: string) {
    super(message, 'NO_DATA');
  }
}

export class NetworkError extends ApolloError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}