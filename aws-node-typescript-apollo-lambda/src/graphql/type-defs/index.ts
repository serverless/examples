import { gql } from 'apollo-server-lambda';

// Inputs
import DummyInput from './inputs/DummyInput';
// Objects
import DummyObject from './objects/DummyObject';
// Root types
import Mutation from './root/Mutation'; // tslint:disable-line ordered-imports
import Query from './root/Query'; // tslint:disable-line ordered-imports

const typeDefStrings = [
  // Inputs
  DummyInput,
  // Objects
  DummyObject,
  // Root types
  Mutation,
  Query,
];

const typeDefs = typeDefStrings.map(typeDef => gql(typeDef));

export default typeDefs;
