import { util } from '@aws-appsync/utils';

// Reads one post by its ID. Returns null when there is no such post.
export function request(ctx) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({ id: ctx.args.id }),
  };
}

export function response(ctx) {
  return ctx.result;
}
