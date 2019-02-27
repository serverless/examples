import { Task } from '../db';

// eslint-disable-next-line import/prefer-default-export
export function handler({ args, identity }) {
  // FIXME require authorization
  console.log({ args, identity });
  return Task.create(args);
}
