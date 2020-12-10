import { IResolvers } from 'graphql-tools';
import {GetIPInfoQueryArgs, ServiceResponse} from './schema/schema-types';
import {Domain} from './schema/domainScalar';
import {workerManager} from './server';

const resolverMap: IResolvers = {
  Domain,
  Query: {
    getIPInfo: async (_:void, args: GetIPInfoQueryArgs): Promise<ServiceResponse[]> => {
      return workerManager.processIPInfoQuery(args);
    }
  },
};
export default resolverMap;
