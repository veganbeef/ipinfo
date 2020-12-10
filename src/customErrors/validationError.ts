import {ApolloError} from 'apollo-server-express';

export class ValidationError extends ApolloError {
  constructor(message: string) {
    super(message, 'BAD_REQUEST');
  }
}