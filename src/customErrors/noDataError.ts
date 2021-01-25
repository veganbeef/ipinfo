import { ApolloError } from 'apollo-server-express';

/**
 * Custom ApolloError to be returned when an HTTP request is successful but returns no data
 */
export class NoDataError extends ApolloError {

  /**
   * Constructor for NoDataError
   * @param {string} message - custom error message to be sent to client (meant to be human-readable)
   */
  constructor(message: string) {
    super(message, 'NO_DATA');
  }
}