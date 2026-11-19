# Agent notes

## Serverless Framework CLI

- The CLI needs a Serverless sign-in or a key in `SERVERLESS_ACCESS_KEY` or `SERVERLESS_LICENSE_KEY`. With a key set, it runs without prompts.
- When you deploy an example to test it, always pass `--stage` with a unique name, and always run `serverless remove --stage <same name>` afterwards, also when the test did not pass.

## Commands

- `npm run validate`: checks every example's README frontmatter, then runs the static checks on every example that has an `example.json`.
- `npm run docs`: regenerates README frontmatter, the badge line, `examples.json` and the tables in the root `README.md` from the manifests.
- `npm test`: runs the tests of the repository's scripts.
- `node scripts/check-examples.mjs <dir>`: the static checks for one example.
- `node scripts/test-example.mjs <dir>`: deploys the example to the AWS account of the credentials in your environment, runs the checks its `example.json` declares, and removes it. It creates real resources and costs money.

## Rules

- Never hand-edit generated content: the frontmatter comment and the badge line at the top of a README that has an `example.json`, `examples.json` entries for those examples, and the tables in the root `README.md`. Change `example.json` and run `npm run docs`.
- An example with an `example.json` has a README with these H2 headings, in order: What it deploys, Prerequisites, Deploy, Try it, How it works, Cost and cleanup, Next steps. Other H2 headings go after How it works.
- Every check in `example.json` must be able to fail: assert on text the code really returns or logs.
- Examples with `"onboarding": true` are copied into new users' projects by the CLI. Change only their `README.md`, `example.json`, `events/` and `test/` files.
- Never commit secrets. Put the names an example needs in `.env.example` with fake values.
- One lesson per example. Add a new example rather than a second topic to an existing one.
