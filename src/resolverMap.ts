import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { IResolvers } from 'graphql-tools';

import { GetIPInfoQueryArgs, ServiceResponse } from './schema/schema-types';
import * as Scalars from './schema/scalars';
import { workerManager } from './server';

const resolverMap: IResolvers = {
  ...Scalars,
  Query: {
    getIPInfo: async (source: any, args: GetIPInfoQueryArgs, context: ExpressContext): Promise<ServiceResponse[]> => {
      return workerManager.processIPInfoQuery(args, context);
    }
  },
};
export default resolverMap;
