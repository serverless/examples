import { greeting } from '/opt/nodejs/util.mjs';

export const hello = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: greeting('Serverless') }),
});
