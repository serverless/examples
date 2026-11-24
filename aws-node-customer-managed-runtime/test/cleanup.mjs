// Runs after the live test's remove: deletes the ECR repository that
// test/prepare.mjs created, with its images. Passes when it is already gone.

import { execFileSync } from 'node:child_process';

const { EXAMPLE_STAGE: stage, EXAMPLE_REGION: region } = process.env;
if (!stage || !region) {
  console.error('EXAMPLE_STAGE and EXAMPLE_REGION must be set');
  process.exit(1);
}
const repository = `cmr-runtime-${stage}`;

try {
  execFileSync('aws', ['ecr', 'delete-repository', '--repository-name', repository, '--force', '--region', region], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  console.log(`deleted ECR repository ${repository}`);
} catch (err) {
  if (!/RepositoryNotFoundException/.test(err.stderr ?? '')) {
    console.error(`aws ecr delete-repository: ${(err.stderr || err.message).trim()}`);
    process.exit(1);
  }
  console.log(`ECR repository ${repository} does not exist; nothing to delete`);
}
