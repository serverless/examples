import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkExample, packageExample } from '../scripts/lib/static-checks.mjs';
import { run } from '../scripts/check-examples.mjs';
import { findExampleDirs } from '../scripts/lib/manifest.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, '..');
const GOOD = path.join(here, 'fixtures', 'good');
const DIR = 'hello';

const tempRoots = [];
after(() => {
  for (const dir of tempRoots) fs.rmSync(dir, { recursive: true, force: true });
});

// Copies the good fixture to a temporary git repository, lets `mutate` change
// it, then stages every file so the secret scan sees it as tracked.
function fixture(mutate = () => {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'examples-check-'));
  tempRoots.push(root);
  fs.cpSync(GOOD, root, { recursive: true });
  const ex = path.join(root, DIR);
  mutate({ root, ex, file: (rel) => path.join(ex, rel) });
  git(root, 'init', '-q');
  git(root, 'add', '-A');
  return root;
}

function git(cwd, ...args) {
  execFileSync('git', args, { cwd, stdio: 'ignore' });
}

const read = (file) => fs.readFileSync(file, 'utf8');
const edit = (file, fn) => fs.writeFileSync(file, fn(read(file)));
const editJson = (file, fn) => {
  const data = JSON.parse(read(file));
  fn(data);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
};

// Asserts that the example reports exactly one error, from the named rule.
function assertOneError(root, rule, pattern) {
  const errors = checkExample(root, DIR);
  assert.equal(errors.length, 1, `expected one error, got:\n${errors.join('\n')}`);
  assert.ok(errors[0].startsWith(`${rule}: `), `expected rule ${rule}: ${errors[0]}`);
  if (pattern) assert.match(errors[0], pattern);
  return errors[0];
}

test('the good fixture passes every check', () => {
  assert.deepEqual(checkExample(fixture(), DIR), []);
});

test('findExampleDirs on the repository root does not pick up fixtures', () => {
  assert.ok(findExampleDirs(repoRoot).every((dir) => !dir.startsWith('tests/')));
});

// manifest

test('manifest: reports validation errors', () => {
  const root = fixture(({ file }) => editJson(file('example.json'), (m) => { m.language = 'cobol'; }));
  assertOneError(root, 'manifest', /language/);
});

test('manifest: reports a manifest that is not valid JSON', () => {
  const root = fixture(({ file }) => fs.writeFileSync(file('example.json'), '{'));
  assertOneError(root, 'manifest', /example\.json/);
});

// readme-headings

test('readme-headings: reports a missing heading', () => {
  const root = fixture(({ file }) => edit(file('README.md'), (s) => s.replace('## Next steps\n', '')));
  assertOneError(root, 'readme-headings', /"Next steps"/);
});

test('readme-headings: reports a heading with different text', () => {
  const root = fixture(({ file }) => edit(file('README.md'), (s) => s.replace('## Try it', '## Try It')));
  assertOneError(root, 'readme-headings', /"Try it"/);
});

test('readme-headings: reports headings out of order', () => {
  const root = fixture(({ file }) =>
    edit(file('README.md'), (s) =>
      s.replace('## Prerequisites', '## TMP').replace('## Deploy', '## Prerequisites').replace('## TMP', '## Deploy'),
    ),
  );
  assertOneError(root, 'readme-headings', /order/);
});

test('readme-headings: reports an extra H2 before "How it works"', () => {
  const root = fixture(({ file }) => edit(file('README.md'), (s) => s.replace('## Try it', '## Configure\n\nText.\n\n## Try it')));
  assertOneError(root, 'readme-headings', /"Configure"/);
});

test('readme-headings: allows an extra H2 after "How it works"', () => {
  const root = fixture(({ file }) =>
    edit(file('README.md'), (s) => s.replace('## Cost and cleanup', '## Variants\n\nText.\n\n## Cost and cleanup')),
  );
  assert.deepEqual(checkExample(root, DIR), []);
});

test('readme-headings: ignores "## " lines inside code fences', () => {
  const root = fixture(({ file }) =>
    edit(file('README.md'), (s) => s.replace('npm ci\n', 'npm ci\n## not a heading\n')),
  );
  assert.deepEqual(checkExample(root, DIR), []);
});

test('readme-headings: reports a missing README', () => {
  const root = fixture(({ file }) => fs.rmSync(file('README.md')));
  assertOneError(root, 'readme-headings', /README\.md/);
});

// readme-cleanup

test('readme-cleanup: reports "serverless remove" missing under "Cost and cleanup"', () => {
  const root = fixture(({ file }) =>
    edit(file('README.md'), (s) =>
      s.replace('```bash\nserverless remove\n```', 'Delete the stack.').replace('## Next steps\n', '## Next steps\n\nRun `serverless remove`.\n'),
    ),
  );
  assertOneError(root, 'readme-cleanup', /serverless remove/);
});

// code-fence-language

test('code-fence-language: reports a fence without a language and its line', () => {
  const root = fixture(({ file }) => edit(file('README.md'), (s) => s.replace('```bash\nserverless invoke', '```\nserverless invoke')));
  const error = assertOneError(root, 'code-fence-language', /README\.md:\d+/);
  const line = Number(error.match(/README\.md:(\d+)/)[1]);
  assert.equal(read(path.join(root, DIR, 'README.md')).split('\n')[line - 1], '```');
});

// readme-links

for (const [what, target] of [
  ['a relative link', 'handler.js'],
  ['a ./ link', './serverless.yml'],
  ['an http:// link', 'http://example.com/'],
]) {
  test(`readme-links: reports ${what} with its line and target`, () => {
    const root = fixture(({ file }) => edit(file('README.md'), (s) => s.replace('The handler returns', `The [handler](${target}) returns`)));
    const error = assertOneError(root, 'readme-links', /README\.md:\d+/);
    assert.ok(error.includes(target), error);
    const line = Number(error.match(/README\.md:(\d+)/)[1]);
    assert.match(read(path.join(root, DIR, 'README.md')).split('\n')[line - 1], /The \[handler\]/);
  });
}

test('readme-links: reports a relative image target', () => {
  const root = fixture(({ file }) => edit(file('README.md'), (s) => s.replace('Add an HTTP event.', '![Diagram](images/diagram.png)')));
  assertOneError(root, 'readme-links', /images\/diagram\.png/);
});

test('readme-links: accepts https://, #anchor and mailto: targets', () => {
  const root = fixture(({ file }) =>
    edit(file('README.md'), (s) =>
      s.replace(
        'The handler returns',
        'The [handler](https://github.com/serverless/examples/blob/v4/hello/handler.js) ([cleanup](#cost-and-cleanup), [mail](mailto:hello@example.com)) returns',
      ),
    ),
  );
  assert.deepEqual(checkExample(root, DIR), []);
});

test('readme-links: accepts a footnote definition and reports a relative reference definition', () => {
  const footnote = fixture(({ file }) =>
    edit(file('README.md'), (s) => s.replace('The handler returns', 'The handler[^1] returns').replace('## Next steps\n', '## Next steps\n\n[^1]: Billed per request.\n')),
  );
  assert.deepEqual(checkExample(footnote, DIR), []);

  const reference = fixture(({ file }) =>
    edit(file('README.md'), (s) => s.replace('The handler returns', 'The [handler][h] returns').replace('## Next steps\n', '## Next steps\n\n[h]: handler.js\n')),
  );
  assertOneError(reference, 'readme-links', /handler\.js/);
});

test('readme-links: ignores links inside code fences and inline code', () => {
  const root = fixture(({ file }) =>
    edit(file('README.md'), (s) =>
      s.replace('npm ci\n', 'npm ci\n# see [notes](./notes.md)\n').replace('The handler returns', 'Write `[handler](handler.js)` to link. The handler returns'),
    ),
  );
  assert.deepEqual(checkExample(root, DIR), []);
});

// lockfile

test('lockfile: reports a package.json with dependencies and no lockfile', () => {
  const root = fixture(({ file }) => fs.rmSync(file('package-lock.json')));
  assertOneError(root, 'lockfile', /package\.json/);
});

test('lockfile: accepts a package.json without dependencies and no lockfile', () => {
  const root = fixture(({ file }) => {
    fs.rmSync(file('package-lock.json'));
    editJson(file('package.json'), (p) => { delete p.dependencies; });
  });
  assert.deepEqual(checkExample(root, DIR), []);
});

test('lockfile: checks package.json files in subdirectories', () => {
  const root = fixture(({ file }) => {
    fs.mkdirSync(file('api'));
    fs.writeFileSync(file('api/package.json'), JSON.stringify({ devDependencies: { esbuild: '0.25.0' } }));
  });
  assertOneError(root, 'lockfile', /api\/package\.json/);
});

test('lockfile: an onboarding example may have no lockfile', () => {
  const root = fixture(({ file }) => {
    fs.rmSync(file('package-lock.json'));
    editJson(file('example.json'), (m) => { m.onboarding = true; });
  });
  assert.deepEqual(checkExample(root, DIR), []);
});

// exact-version

for (const range of ['^1.3.0', '~1.3.0', '*', 'latest']) {
  test(`exact-version: reports the range ${range}`, () => {
    const root = fixture(({ file }) => editJson(file('package.json'), (p) => { p.dependencies['left-pad'] = range; }));
    assertOneError(root, 'exact-version', /left-pad/);
  });
}

test('exact-version: checks devDependencies', () => {
  const root = fixture(({ file }) => editJson(file('package.json'), (p) => { p.devDependencies = { esbuild: '^0.25.0' }; }));
  assertOneError(root, 'exact-version', /devDependencies.*esbuild/);
});

test('exact-version: an onboarding example may use ranges', () => {
  const root = fixture(({ file }) => {
    editJson(file('package.json'), (p) => { p.dependencies['left-pad'] = '^1.3.0'; });
    editJson(file('example.json'), (m) => { m.onboarding = true; });
  });
  assert.deepEqual(checkExample(root, DIR), []);
});

test('onboarding relaxes only the lockfile and exact-version rules', () => {
  const root = fixture(({ file }) => {
    editJson(file('example.json'), (m) => { m.onboarding = true; });
    edit(file('serverless.yml'), (s) => s.replace('provider:\n', 'provider:\n  stage: dev\n'));
  });
  assertOneError(root, 'no-stage');
});

// no-stage

test('no-stage: reports a top-level stage line', () => {
  const root = fixture(({ file }) => edit(file('serverless.yml'), (s) => `${s}\nstage: dev\n`));
  assertOneError(root, 'no-stage', /serverless\.yml:\d+/);
});

test('no-stage: reports provider.stage', () => {
  const root = fixture(({ file }) => edit(file('serverless.yml'), (s) => s.replace('  runtime:', "  stage: ${opt:stage, 'dev'}\n  runtime:")));
  assertOneError(root, 'no-stage', /provider\.stage/);
});

test('no-stage: checks serverless.yaml in subdirectories and skips compose roots', () => {
  const root = fixture(({ file }) => {
    fs.writeFileSync(file('serverless-compose.yml'), 'stage: dev\nservices:\n  api:\n    path: api\n');
    fs.mkdirSync(file('api'));
    fs.writeFileSync(file('api/serverless.yaml'), 'service: api\nprovider:\n    name: aws\n    stage: dev\n');
  });
  assertOneError(root, 'no-stage', /api\/serverless\.yaml:4/);
});

// secrets

const SECRETS = [
  ['Stripe live key', `sk_live_${'0'.repeat(24)}`],
  ['Stripe test key', `sk_test_${'0'.repeat(24)}`],
  ['AWS access key id', `AKIA${'A'.repeat(16)}`],
  ['private key block', `-----BEGIN ${'RSA PRIVATE'} KEY-----`],
  ['Slack token', `xoxb-${'1'.repeat(12)}`],
];

for (const kind of ['', 'EC ', 'DSA ', 'OPENSSH ', 'ENCRYPTED ']) {
  test(`secrets: reports a "${kind}PRIVATE KEY" block`, () => {
    const root = fixture(({ file }) => fs.writeFileSync(file('key.pem'), `-----BEGIN ${kind}${'PRIVATE'} KEY-----\n`));
    assertOneError(root, 'secrets', /key\.pem.*private key block/);
  });
}

test('secrets: does not report a public certificate or public key', () => {
  const root = fixture(({ file }) =>
    fs.writeFileSync(file('public.pem'), '-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----\n-----BEGIN PUBLIC KEY-----\n'),
  );
  assert.deepEqual(checkExample(root, DIR), []);
});

for (const [name, value] of SECRETS) {
  test(`secrets: reports a ${name} by file and pattern name, not by value`, () => {
    const root = fixture(({ file }) => fs.writeFileSync(file('config.js'), `export const key = '${value}';\n`));
    const error = assertOneError(root, 'secrets', new RegExp(`config\\.js.*${name}`));
    assert.ok(!error.includes(value));
  });
}

test('secrets: scans only tracked text files and skips lockfiles', () => {
  const value = `AKIA${'B'.repeat(16)}`;
  const root = fixture(({ file }) => {
    fs.writeFileSync(file('image.bin'), Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from(value)]));
    edit(file('package-lock.json'), (s) => s.replace('"version": "1.3.0" }', `"version": "1.3.0", "x": "${value}" }`));
  });
  fs.writeFileSync(path.join(root, DIR, 'untracked.js'), `const key = '${value}';\n`);
  assert.deepEqual(checkExample(root, DIR), []);
});

test('secrets: skips tracked symlinks, also one to a directory, and still scans what they point to', () => {
  const value = `AKIA${'C'.repeat(16)}`;
  const root = fixture(({ file }) => {
    fs.mkdirSync(file('shared'));
    fs.writeFileSync(file('shared/config.js'), `export const key = '${value}';\n`);
    fs.symlinkSync('shared', file('linked-dir'));
    fs.symlinkSync('shared/config.js', file('linked-file.js'));
  });
  const errors = checkExample(root, DIR);
  assert.deepEqual(errors, ['secrets: shared/config.js: contains a value shaped like a AWS access key id']);
});

// generated-readme

test('generated-readme: reports frontmatter that differs from the manifest', () => {
  const root = fixture(({ file }) => edit(file('README.md'), (s) => s.replace("title: 'Hello function'", "title: 'Hello'")));
  assertOneError(root, 'generated-readme', /README\.md/);
});

test('generated-readme: reports a missing badge', () => {
  const root = fixture(({ file }) => edit(file('README.md'), (s) => s.replace(/\[!\[Verified\].*\n\n/, '')));
  assertOneError(root, 'generated-readme');
});

// generated-catalogue

test('generated-catalogue: reports an entry that differs from the manifest', () => {
  const root = fixture(({ root }) => editJson(path.join(root, 'examples.json'), (c) => { c[0].description = 'Old'; }));
  assertOneError(root, 'generated-catalogue', /examples\.json/);
});

test('generated-catalogue: reports a missing entry', () => {
  const root = fixture(({ root }) => fs.writeFileSync(path.join(root, 'examples.json'), '[]\n'));
  assertOneError(root, 'generated-catalogue', /no entry/);
});

test('generated-catalogue: an existing entry keeps its name', () => {
  const root = fixture(({ root }) => editJson(path.join(root, 'examples.json'), (c) => { c[0].name = 'hello-world'; }));
  assert.deepEqual(checkExample(root, DIR), []);
});

// check-paths

test('check-paths: reports a missing script check path', () => {
  const root = fixture(({ file }) => fs.rmSync(file('test/smoke.mjs')));
  assertOneError(root, 'check-paths', /test\/smoke\.mjs/);
});

test('check-paths: reports a missing invoke event file', () => {
  const root = fixture(({ file }) => fs.rmSync(file('events/hello.json')));
  assertOneError(root, 'check-paths', /events\/hello\.json/);
});

// --package

// Records each exec call; `statuses` maps a step ("npm ci", "serverless package") to its exit status.
function fakeExec(statuses = {}) {
  const calls = [];
  const exec = (cmd, args, opts) => {
    const step = `${cmd} ${args[0]}`;
    calls.push({
      step,
      args,
      cwd: opts.cwd,
      hasHandler: fs.existsSync(path.join(opts.cwd, 'handler.js')),
      hasNodeModules: fs.existsSync(path.join(opts.cwd, 'node_modules')),
    });
    return { status: statuses[step] ?? 0 };
  };
  return { exec, calls };
}

test('packageExample runs npm ci, then serverless package with the fixed stage, in a copy of the example', () => {
  const root = fixture();
  const { exec, calls } = fakeExec();
  assert.deepEqual(packageExample(root, DIR, { exec }), []);
  assert.deepEqual(calls.map((c) => c.step), ['npm ci', 'serverless package']);
  assert.deepEqual(calls[1].args, ['package', '--stage', 'ex000000']);
  for (const call of calls) {
    assert.notEqual(call.cwd, path.join(root, DIR));
    assert.ok(call.hasHandler);
  }
  assert.equal(calls[0].cwd, calls[1].cwd);
  assert.ok(!fs.existsSync(calls[0].cwd), 'the temporary copy is removed');
});

test('packageExample does not copy node_modules', () => {
  const root = fixture(({ file }) => fs.mkdirSync(file('node_modules/left-pad'), { recursive: true }));
  const { exec, calls } = fakeExec();
  packageExample(root, DIR, { exec });
  assert.ok(calls.every((c) => !c.hasNodeModules));
});

test('packageExample runs npm install when there is a package.json without a lockfile', () => {
  const root = fixture(({ file }) => fs.rmSync(file('package-lock.json')));
  const { exec, calls } = fakeExec();
  assert.deepEqual(packageExample(root, DIR, { exec }), []);
  assert.deepEqual(calls.map((c) => c.step), ['npm install', 'serverless package']);
});

test('packageExample installs nothing when there is no package.json', () => {
  const root = fixture(({ file }) => {
    fs.rmSync(file('package.json'));
    fs.rmSync(file('package-lock.json'));
  });
  const { exec, calls } = fakeExec();
  assert.deepEqual(packageExample(root, DIR, { exec }), []);
  assert.deepEqual(calls.map((c) => c.step), ['serverless package']);
});

test('packageExample reports a failed install as one error naming the step and does not package', () => {
  const { exec, calls } = fakeExec({ 'npm ci': 1 });
  assert.deepEqual(packageExample(fixture(), DIR, { exec }), ['package: npm ci exited with code 1']);
  assert.deepEqual(calls.map((c) => c.step), ['npm ci']);
});

test('packageExample reports a failed serverless package as one error naming the step', () => {
  const { exec } = fakeExec({ 'serverless package': 2 });
  assert.deepEqual(packageExample(fixture(), DIR, { exec }), ['package: serverless package exited with code 2']);
});

test('packageExample reports a missing serverless binary instead of throwing', () => {
  const exec = (cmd) =>
    cmd === 'serverless'
      ? { status: null, error: Object.assign(new Error('spawnSync serverless ENOENT'), { code: 'ENOENT' }) }
      : { status: 0 };
  const errors = packageExample(fixture(), DIR, { exec });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^package: .*serverless.*not found/);
});

test('packageExample reports a missing npm binary instead of throwing', () => {
  const exec = () => ({ status: null, error: Object.assign(new Error('spawnSync npm ENOENT'), { code: 'ENOENT' }) });
  const errors = packageExample(fixture(), DIR, { exec });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^package: .*npm.*not found/);
});

// validate.js

test('validate.js does not treat test fixtures as examples', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'examples-validate-'));
  tempRoots.push(root);
  fs.copyFileSync(path.join(repoRoot, 'validate.js'), path.join(root, 'validate.js'));
  fs.mkdirSync(path.join(root, 'tests', 'fixtures', 'bare'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tests', 'fixtures', 'bare', 'serverless.yml'), 'service: bare\n');
  const result = spawnSync(process.execPath, ['validate.js'], { cwd: root, encoding: 'utf8' });
  assert.doesNotMatch(result.stdout + result.stderr, /tests\/fixtures/);
});

// CLI

function cli(args, root, exec) {
  const out = [];
  const code = run(args, { root, exec, log: (line) => out.push(line) });
  return { code, out };
}

test('CLI --all prints one line per error and a final count, exiting 1', () => {
  const root = fixture(({ file }) => fs.rmSync(file('events/hello.json')));
  const { code, out } = cli(['--all'], root);
  assert.equal(code, 1);
  assert.match(out[0], /^hello: check-paths: /);
  assert.match(out.at(-1), /1 example\(s\), 1 error\(s\)/);
});

test('CLI exits 0 for a clean example given by path', () => {
  const root = fixture();
  const { code, out } = cli([`./${DIR}/`], root);
  assert.equal(code, 0);
  assert.match(out.at(-1), /1 example\(s\), 0 error\(s\)/);
});

test('CLI reports a directory without a manifest', () => {
  const root = fixture();
  const { code, out } = cli(['nope'], root);
  assert.equal(code, 1);
  assert.match(out[0], /^nope: no example\.json/);
});

test('CLI --all with no manifests says so and exits 0', () => {
  const root = fixture(({ file }) => fs.rmSync(file('example.json')));
  const { code, out } = cli(['--all'], root);
  assert.equal(code, 0);
  assert.match(out.join('\n'), /no examples with an example\.json manifest/i);
});

test('CLI --package packages each example through the injected exec', () => {
  const root = fixture();
  const { exec, calls } = fakeExec({ 'serverless package': 1 });
  const { code, out } = cli(['--all', '--package'], root, exec);
  assert.deepEqual(calls.map((c) => c.step), ['npm ci', 'serverless package']);
  assert.equal(code, 1);
  assert.equal(out[0], 'hello: package: serverless package exited with code 1');
});

test('CLI without arguments prints usage and exits 1', () => {
  const { code, out } = cli([], fixture());
  assert.equal(code, 1);
  assert.match(out.join('\n'), /usage/i);
});
