# Agent notes

## Serverless Framework CLI

- The CLI needs a Serverless sign-in or a key in `SERVERLESS_ACCESS_KEY` or `SERVERLESS_LICENSE_KEY`. With a key set, it runs without prompts.
- When you deploy an example to test it, always pass `--stage` with a unique name, and always run `serverless remove --stage <same name>` afterwards, also when the test did not pass.

## Commands

- `npm run validate`: checks every example's README frontmatter, then runs the static checks on every example that has an `example.json`.
- `npm run docs`: regenerates README frontmatter, the badge line, `examples.json` and the tables in the root `README.md` from the manifests.
- `npm test`: runs the tests of the repository's scripts.
- `node scripts/check-examples.mjs <dir>`: the static checks for one example.
- `node scripts/test-example.mjs <dir>`: deploys the example to the AWS account of the credentials in your environment, runs the checks its `example.json` declares, and removes it. It creates real resources and costs money. `--stage <stage>` uses that stage (`ex` plus 1 to 13 lowercase letters or digits) instead of a new one; `--remove-only --stage <stage>` deploys nothing and only removes what that stage left.
- `node scripts/select-examples.mjs --changed <base-sha>` or `--all --tier fast|slow`: prints the examples a live test run covers, as JSON.
- `node scripts/publish-verified.mjs --results-dir <dir> --out <dir> --run-url <url>`: adds `latest` result files to `results.json` in `--out` and writes `badges/<example dir>.svg`. The `publish-verified` workflow runs it for the `verified` branch.
- `node scripts/cleanup-report.mjs --regions <list>`: lists CloudFormation stacks whose names end in a test stage and that are older than 24 hours. It deletes nothing.

## Workflows

- `ci`: static checks on every pull request and push; live tests of the changed examples on pushes to `v4` and on pull requests from branches of this repository, never from forks.
- `sweep`: live tests of every tested example, the fast tier nightly with `latest` and `canary`, the slow tier weekly with `latest`; run it by hand with a tier and a Framework version.
- `publish-verified`: after `sweep`, or `ci` on a push to `v4`, publishes the `latest` results and badges to the `verified` branch.
- `cleanup`: daily report of stacks that test runs left behind.

## Rules

- Never hand-edit generated content: the frontmatter comment and the badge line at the top of a README that has an `example.json`, `examples.json` entries for those examples, and the tables in the root `README.md`. Change `example.json` and run `npm run docs`.
- An example with an `example.json` has a README with these H2 headings, in order: What it deploys, Prerequisites, Deploy, Try it, How it works, Cost and cleanup, Next steps. Other H2 headings go after How it works.
- Links and images in the README of an example with an `example.json` use absolute `https://` URLs, in-page `#anchors` or `mailto:`; link to the example's own files as `https://github.com/serverless/examples/blob/v4/<example dir>/<file>`.
- Every check in `example.json` must be able to fail: assert on text the code really returns or logs.
- Examples with `"onboarding": true` are copied into new users' projects by the CLI. Change only their `README.md`, `example.json`, `events/` and `test/` files.
- Never commit secrets. Put the names an example needs in `.env.example` with fake values.
- One lesson per example. Add a new example rather than a second topic to an existing one.
