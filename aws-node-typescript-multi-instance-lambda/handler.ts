import { Context } from "aws-lambda";

module.exports.hello = async (event: unknown, context: Context) => ({
  statusCode: 200,
  body: JSON.stringify(
    {
      message: `Function \`${context.functionName}\` executed successfully.`,
      input: event,
    },
    null,
    2
  ),
});
