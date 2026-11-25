// Runs before the live test's deploy: what README.md → Deploy does before
// `serverless deploy`. Builds the Next.js standalone server into
// .next/standalone/, the directory serverless.yml deploys.
//
// Run by the example test runner in the example copy, after `npm ci`.

import { execFileSync } from 'node:child_process';

try {
  execFileSync('npm', ['run', 'build'], { stdio: ['ignore', 'inherit', 'inherit'] });
} catch (err) {
  console.error(`npm run build: ${err.message}`);
  process.exit(1);
}
