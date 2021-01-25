import { ApolloError } from 'apollo-server-express';

/**
 * Custom ApolloError to be returned an HTTP request fails or returns an error code (HTTP status code of 300 or greater)
 */
export class NetworkError extends ApolloError {

  /**
   * Constructor for NetworkError
   * @param {string} message - custom error message to be sent to client (meant to be human-readable)
   */
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}