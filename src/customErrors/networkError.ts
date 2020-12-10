import {ApolloError} from 'apollo-server-express';

export class NetworkError extends ApolloError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}