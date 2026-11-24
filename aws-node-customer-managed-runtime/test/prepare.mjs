// Runs before the live test's deploy: what README.md → Deploy step 1 does.
// Creates the ECR repository the runtime service reads its image from, lets
// Lambda read this account's runtime images from it, then builds the runtime
// image for arm64 and pushes it as `v1`.
//
// Run by the example test runner with EXAMPLE_STAGE, EXAMPLE_REGION and
// EXAMPLE_DIR set, AWS credentials in the environment and Docker running.

import { execFileSync } from 'node:child_process';
import path from 'node:path';

const { EXAMPLE_STAGE: stage, EXAMPLE_REGION: region, EXAMPLE_DIR: dir } = process.env;
if (!stage || !region || !dir) fail('EXAMPLE_STAGE, EXAMPLE_REGION and EXAMPLE_DIR must be set');
const repository = `cmr-runtime-${stage}`;

const account = run('aws', ['sts', 'get-caller-identity', '--query', 'Account', '--output', 'text']).trim();
const registry = `${account}.dkr.ecr.${region}.amazonaws.com`;
const image = `${registry}/${repository}:v1`;

const policy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'LambdaRuntimeVersions',
      Effect: 'Allow',
      Principal: { Service: 'lambda.amazonaws.com' },
      Action: ['ecr:BatchGetImage', 'ecr:GetDownloadUrlForLayer'],
      Condition: {
        StringEquals: { 'aws:SourceAccount': account },
        ArnLike: { 'aws:SourceArn': `arn:aws:lambda:${region}:${account}:runtime/*` },
      },
    },
  ],
};

run('aws', ['ecr', 'create-repository', '--repository-name', repository, '--region', region]);
run('aws', ['ecr', 'set-repository-policy', '--repository-name', repository, '--region', region, '--policy-text', JSON.stringify(policy)]);
const password = run('aws', ['ecr', 'get-login-password', '--region', region]);
run('docker', ['login', '--username', 'AWS', '--password-stdin', registry], password);
run('docker', ['build', '--platform', 'linux/arm64', '--provenance=false', '-t', image, path.join(dir, 'runtime')]);
run('docker', ['push', image]);
console.log(`pushed the runtime image to ECR repository ${repository}`);

function run(cmd, args, input) {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8', input, stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'] });
  } catch (err) {
    return fail(`${cmd} ${args[0]} ${args[1] ?? ''}: ${(err.stderr || err.message).trim()}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
