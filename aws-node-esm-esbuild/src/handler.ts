// Bundled by esbuild to .serverless/build/src/handler.mjs and loaded by the
// Lambda runtime as an ES module — import.meta is only available in ESM.
const loadedAs = import.meta.url.endsWith('.mjs') ? 'ES module' : 'CommonJS'

export const currentTime = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: `Hello from a handler loaded as an ${loadedAs}!`,
    time: new Date().toISOString(),
  }),
})
