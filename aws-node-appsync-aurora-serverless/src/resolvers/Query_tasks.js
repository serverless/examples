import { Task } from '../db';

// eslint-disable-next-line import/prefer-default-export
export function handler() {
  return Task.findAll();
}
