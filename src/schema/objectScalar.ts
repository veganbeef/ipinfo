import {GraphQLScalarType} from 'graphql';
import {Kind} from 'graphql/language';

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