import {GraphQLScalarType} from 'graphql';
import {Kind} from 'graphql/language';

/**
 * Validation method for the custom Object scalar, both to parse inputs and serialize outputs.
 * Checks that value is an object or a string that can be parsed into an object.
 * @param {any} value
 * @returns {Object | undefined} - returns the input Object or parsed Object if validation succeeds, otherwise returns
 * undefined
 */
function validateObject(value: any): {} | undefined {
  if (typeof value === 'object') {
    return value;
  } else if (typeof value === 'string') {
    return JSON.parse(value);
  }
  return undefined;
}

export const Object = new GraphQLScalarType({
  name: 'Object',
  description: 'a standard JSON object',
  serialize: validateObject,
  parseValue: validateObject,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return validateObject(ast.value);
    }
    return undefined;
  }
});