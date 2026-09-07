// Everything at module scope runs once, when the function version is
// published. The snapshot captures the result, and every environment restored
// from it starts here without paying for this work again.
const initializedAt = new Date().toISOString()

export const hello = async (event, context) => ({
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    // "snap-start" when the environment was restored from a snapshot,
    // "on-demand" for a regular cold start (e.g. invoking $LATEST directly)
    initializationType: process.env.AWS_LAMBDA_INITIALIZATION_TYPE,
    functionVersion: context.functionVersion,
    initializedAt,
  }),
})
