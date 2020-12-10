import {ApolloError} from 'apollo-server-express';

export class NoDataError extends ApolloError {
  constructor(message: string) {
    super(message, 'NO_DATA');
  }
}