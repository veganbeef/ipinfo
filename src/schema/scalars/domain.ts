import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import { isIPAddress, isURL } from '../../utils';

/**
 * Validation method for the custom Domain scalar, both to parse inputs and serialize outputs.
 * Checks that value is a string with non-zero length.
 * @param {string} domain
 * @returns {string | undefined} - returns the input string if validation succeeds, otherwise returns undefined
 */
function validateDomain(domain: string): string | undefined {
  if (typeof domain !== 'string' || domain.length === 0) return undefined;
  return (isIPAddress(domain) || isURL(domain)) ? domain : undefined;
}

export const Domain = new GraphQLScalarType({
  name: 'Domain',
  description: 'an IPv4 address (e.g. 192.168.0.1) or standard URL (e.g. google.com)',
  serialize: validateDomain,
  parseValue: validateDomain,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return validateDomain(ast.value);
    }
    return undefined;
  }
});