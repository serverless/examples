import { util } from '@aws-appsync/utils';

// Writes one post with a generated ID and returns it.
export function request(ctx) {
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({ id: util.autoId() }),
    attributeValues: util.dynamodb.toMapValues({ title: ctx.args.title }),
  };
}

export function response(ctx) {
  return ctx.result;
}
