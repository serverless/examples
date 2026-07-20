// v4's built-in esbuild bundler targets ESM because package.json declares
// "type": "module". Some transitive CommonJS dependencies (e.g. the LRU cache
// used internally by @apollo/server) call the bare `require()` function at
// runtime to conditionally load Node built-ins (e.g. `node:diagnostics_channel`).
// That global doesn't exist in an ESM module, so without this shim the bundled
// handler throws "Dynamic require ... is not supported" as soon as it runs.
export default () => ({
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
