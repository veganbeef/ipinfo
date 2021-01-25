import { ApolloError } from 'apollo-server-express';

/**
 * Custom ApolloError to be returned when the input arguments to the GraphQL request fail validation
 */
export class ValidationError extends ApolloError {

  /**
   * Constructor for ValidationError
   * @param {string} message - custom error message to be sent to client (meant to be human-readable)
   */
  constructor(message: string) {
    super(message, 'BAD_REQUEST');
  }
}