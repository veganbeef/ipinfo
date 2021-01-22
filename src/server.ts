import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import compression from 'compression';
import cors from 'cors';
import schema from './schema';
import {WorkerManager} from './dataSources/WorkerManager';

// create app and server
const app = express();
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)]
});

// initialize worker pool
export const workerManager = new WorkerManager();

app.use('*', cors());
app.use(compression());
server.applyMiddleware({ app, path: '/graphql' });

app.listen(
  { port: 3000 },
  (): void => console.log(`\n🚀      GraphQL is now running on http://localhost:3000/graphql`));
