import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import * as queries from './resolvers/queries';
import * as mutations from './resolvers/mutations';
import typeDefs from './type-defs';

const NODE_ENV = process.env.NODE_ENV;

const IS_DEV = !NODE_ENV || !['production'].includes(NODE_ENV);

const resolvers = {
  Mutation: mutations,
  Query: queries,
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: IS_DEV,
});

export default startServerAndCreateLambdaHandler(
  apolloServer,
  handlers.createAPIGatewayProxyEventRequestHandler(),
);
