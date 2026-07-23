<!--
title: 'AWS Node.js ES Module Bundles with esbuild'
description: 'This example demonstrates how to bundle TypeScript handlers as ES modules (.mjs) with the built-in esbuild support, without adding a package.json to the deployment artifact.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# AWS Node.js ES Module Bundles with esbuild

This example demonstrates how to bundle a TypeScript handler as an ES module using the Serverless Framework's built-in esbuild support. The `outExtension` option emits the bundle as `.mjs`, which makes the Lambda Node.js runtime load it with the ESM loader — no `package.json` with `"type": "module"` needs to be shipped inside the deployment artifact.

```yaml
build:
  esbuild:
    format: esm
    outExtension:
      '.js': '.mjs'
```

The handler proves it runs as an ES module by reading `import.meta.url`, which is only available in ESM. Function `handler` values stay unchanged — Lambda resolves the handler file extension automatically.

This is useful when:

- You want ES module semantics on Lambda (for example top-level `await` for initialization) with a CommonJS or extension-less project setup, such as a monorepo where the root `package.json` cannot declare `"type": "module"`.
- You want the deployment artifact to contain nothing but the bundled handler files.

Both `format` and `outExtension` can also be returned from a `configFile` JavaScript configuration — see the [building documentation](https://www.serverless.com/framework/docs/providers/aws/guide/building) for all esbuild options.

## Usage

### Deploy

```bash
serverless deploy
```

### Invoke

After deployment, call the HTTP endpoint printed in the deploy output:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/time
```

Which should respond with:

```json
{
  "message": "Hello from a handler loaded as an ES module!",
  "time": "2026-07-24T12:00:00.000Z"
}
```

You can also invoke the function directly, locally or remotely:

```bash
serverless invoke local -f time
serverless invoke -f time
```

### Clean up

```bash
serverless remove
```
