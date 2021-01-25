import { IResolvers } from 'graphql-tools';
import {GetIPInfoQueryArgs, ServiceResponse} from './schema/schema-types';
import {Domain} from './schema/domainScalar';
import {workerManager} from './server';
import {ExpressContext} from 'apollo-server-express/dist/ApolloServer';

const resolverMap: IResolvers = {
  Domain,
  Query: {
    getIPInfo: async (source: any, args: GetIPInfoQueryArgs, context: ExpressContext): Promise<ServiceResponse[]> => {
      return workerManager.processIPInfoQuery(args, context);
    }
  },
};
export default resolverMap;
