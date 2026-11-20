import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { applyGenerated, renderBadgeLine, renderFrontmatter, toExamplesJsonEntry } from '../scripts/lib/readme.mjs';
import { generate } from '../scripts/generate.mjs';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const BADGE =
  '[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-http-api.svg)]' +
  '(https://github.com/serverless/examples/blob/verified/results.json)';

function sampleManifest() {
  return {
    dir: 'aws-node-http-api',
    title: 'HTTP API on AWS Lambda (Node.js)',
    description: "A single HTTP endpoint on API Gateway and Lambda, using the Framework's defaults.",
    language: 'node',
    platform: 'AWS',
    framework: 'v4',
    priority: 1,
    author: {
      name: 'Serverless, Inc.',
      link: 'https://github.com/serverless',
      avatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4',
    },
    services: ['lambda', 'apigateway'],
    test: {
      tier: 'fast',
      checks: [{ http: { output: 'HttpApiUrl', path: '/', status: 200 } }],
    },
  };
}

const SAMPLE_FRONTMATTER = `<!--
title: 'HTTP API on AWS Lambda (Node.js)'
description: 'A single HTTP endpoint on API Gateway and Lambda, using the Framework''s defaults.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->`;

const README = `<!--
title: 'Old title'
description: 'Old description'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://example.com/existing.png'
-->

# Serverless Framework Node HTTP API on AWS

Body text.
`;

test('renderFrontmatter renders the sample manifest exactly', () => {
  assert.equal(renderFrontmatter(sampleManifest()), SAMPLE_FRONTMATTER);
});

test('renderFrontmatter omits priority and authorAvatar when the manifest has neither', () => {
  const m = sampleManifest();
  delete m.priority;
  delete m.author.avatar;
  const out = renderFrontmatter(m);
  assert.doesNotMatch(out, /^priority:/m);
  assert.doesNotMatch(out, /^authorAvatar:/m);
});

test('renderFrontmatter spells each language the way existing READMEs do', () => {
  const spelling = { node: 'nodeJS', python: 'Python', go: 'Go', java: 'Java', ruby: 'Ruby', csharp: 'CSharp', rust: 'Rust' };
  for (const [language, expected] of Object.entries(spelling)) {
    const out = renderFrontmatter({ ...sampleManifest(), language });
    assert.match(out, new RegExp(`^language: ${expected}$`, 'm'), language);
  }
});

test('renderBadgeLine returns the badge for a tested example and null otherwise', () => {
  assert.equal(renderBadgeLine(sampleManifest()), BADGE);
  const m = sampleManifest();
  delete m.test;
  assert.equal(renderBadgeLine(m), null);
});

test('applyGenerated replaces the frontmatter and puts the badge directly under the H1', () => {
  const out = applyGenerated(README, sampleManifest());
  assert.equal(
    out,
    `${SAMPLE_FRONTMATTER}\n\n# Serverless Framework Node HTTP API on AWS\n\n${BADGE}\n\nBody text.\n`,
  );
});

test('applyGenerated is idempotent', () => {
  const once = applyGenerated(README, sampleManifest());
  assert.equal(applyGenerated(once, sampleManifest()), once);

  const m = sampleManifest();
  delete m.test;
  const onceWithoutBadge = applyGenerated(README, m);
  assert.equal(applyGenerated(onceWithoutBadge, m), onceWithoutBadge);
});

test('applyGenerated adds frontmatter to a README that has none', () => {
  const out = applyGenerated('# Title\n\nBody.\n', sampleManifest());
  assert.equal(out, `${SAMPLE_FRONTMATTER}\n\n# Title\n\n${BADGE}\n\nBody.\n`);
});

test('applyGenerated removes an existing badge when the manifest has no test', () => {
  const withBadge = applyGenerated(README, sampleManifest());
  const m = sampleManifest();
  delete m.test;
  const out = applyGenerated(withBadge, m);
  assert.ok(!out.includes('[![Verified]'), out);
  assert.match(out, /^# Serverless Framework Node HTTP API on AWS\n\nBody text\.\n$/m);
});

test('applyGenerated leaves the body untouched when there is no badge to add or remove', () => {
  const m = sampleManifest();
  delete m.test;
  const readme = README.replace('# Serverless Framework Node HTTP API on AWS\n\n', '# Heading\nBody right below.\n');
  const out = applyGenerated(readme, m);
  assert.ok(out.endsWith('-->\n\n# Heading\nBody right below.\nBody text.\n'), out);
});

test('applyGenerated puts the badge at the top of a README without an H1, idempotently', () => {
  const once = applyGenerated('Intro text.\n', sampleManifest());
  assert.equal(once, `${SAMPLE_FRONTMATTER}\n\n${BADGE}\n\nIntro text.\n`);
  assert.equal(applyGenerated(once, sampleManifest()), once);
});

test('applyGenerated keeps the existing authorAvatar when the manifest has none', () => {
  const m = sampleManifest();
  delete m.author.avatar;
  const out = applyGenerated(README, m);
  assert.match(out, /^authorAvatar: 'https:\/\/example\.com\/existing\.png'$/m);
});

test('toExamplesJsonEntry matches the current aws-node-http-api entry apart from title and description', () => {
  const catalogue = JSON.parse(fs.readFileSync(path.join(repoRoot, 'examples.json'), 'utf8'));
  const current = catalogue.find((e) => e.githubUrl === 'https://github.com/serverless/examples/tree/v4/aws-node-http-api');
  const m = sampleManifest();
  assert.deepEqual(toExamplesJsonEntry(m), { ...current, title: m.title, description: m.description });
});

test('toExamplesJsonEntry turns slashes in nested directories into hyphens', () => {
  const entry = toExamplesJsonEntry({ ...sampleManifest(), dir: 'mcp/custom/rest-api' });
  assert.equal(entry.name, 'mcp-custom-rest-api');
  assert.equal(entry.githubUrl, 'https://github.com/serverless/examples/tree/v4/mcp/custom/rest-api');
});

const tempRoots = [];
after(() => {
  for (const root of tempRoots) fs.rmSync(root, { recursive: true, force: true });
});

function tempRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'examples-generate-'));
  tempRoots.push(root);
  const write = (rel, content) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  };
  return { root, write, read: (rel) => fs.readFileSync(path.join(root, rel), 'utf8') };
}

test('generate rewrites READMEs and upserts catalogue entries in place, appending new ones', () => {
  const { root, write, read } = tempRepo();
  const existing = {
    title: 'Old',
    name: 'aws-node-http-api',
    description: 'Old',
    githubUrl: 'https://github.com/serverless/examples/tree/v4/aws-node-http-api',
    framework: 'v4',
    language: 'node',
    platform: 'aws',
    authorLink: 'https://github.com/serverless',
    authorName: 'Serverless, Inc.',
    authorAvatar: 'https://example.com/existing.png',
  };
  const other = { ...existing, name: 'other', githubUrl: 'https://github.com/serverless/examples/tree/v4/other' };
  write('examples.json', `${JSON.stringify([existing, other], null, 2)}\n`);

  const first = sampleManifest();
  delete first.dir;
  delete first.author.avatar;
  write('aws-node-http-api/example.json', JSON.stringify(first));
  write('aws-node-http-api/README.md', README);

  const second = { ...sampleManifest(), title: 'Nested' };
  delete second.dir;
  delete second.test;
  write('mcp/minimal/example.json', JSON.stringify(second));
  write('mcp/minimal/README.md', '# Nested\n');

  generate(root);

  const catalogue = JSON.parse(read('examples.json'));
  assert.deepEqual(
    catalogue.map((e) => e.name),
    ['aws-node-http-api', 'other', 'mcp-minimal'],
  );
  assert.equal(catalogue[0].title, first.title);
  assert.equal(catalogue[0].authorAvatar, 'https://example.com/existing.png');
  assert.equal(catalogue[0].priority, 1);
  assert.deepEqual(catalogue[1], other);
  assert.match(read('aws-node-http-api/README.md'), /\n\[!\[Verified\]/);
  assert.match(read('mcp/minimal/README.md'), /^<!--\ntitle: 'Nested'\n/);

  const snapshot = [read('examples.json'), read('aws-node-http-api/README.md'), read('mcp/minimal/README.md')];
  generate(root);
  assert.deepEqual([read('examples.json'), read('aws-node-http-api/README.md'), read('mcp/minimal/README.md')], snapshot);
});

test('generate keeps the name of an existing catalogue entry', () => {
  const { root, write, read } = tempRepo();
  const existing = {
    title: 'Old',
    name: 'ruby-step-functions',
    description: 'Old',
    githubUrl: 'https://github.com/serverless/examples/tree/v4/aws-ruby-step-functions',
    framework: 'v4',
    language: 'ruby',
    platform: 'aws',
    authorLink: 'https://github.com/serverless',
    authorName: 'Serverless, Inc.',
    authorAvatar: 'https://example.com/existing.png',
  };
  write('examples.json', `${JSON.stringify([existing], null, 2)}\n`);
  const m = { ...sampleManifest(), language: 'ruby' };
  delete m.dir;
  write('aws-ruby-step-functions/example.json', JSON.stringify(m));
  write('aws-ruby-step-functions/README.md', '# Ruby\n');

  generate(root);

  const [entry] = JSON.parse(read('examples.json'));
  assert.equal(entry.name, 'ruby-step-functions');
  assert.equal(entry.title, m.title);
});

test('generate leaves examples.json untouched when there are no manifests', () => {
  const { root, write, read } = tempRepo();
  const content = '[\n  {"keep": "formatting"}\n]\n';
  write('examples.json', content);
  generate(root);
  assert.equal(read('examples.json'), content);
});

test('generate reports invalid manifests and writes nothing', () => {
  const { root, write, read } = tempRepo();
  write('examples.json', '[]\n');
  write('bad/example.json', JSON.stringify({ title: 'x' }));
  write('bad/README.md', '# Bad\n');
  assert.throws(() => generate(root), /bad\/example\.json/);
  assert.equal(read('bad/README.md'), '# Bad\n');
  assert.equal(read('examples.json'), '[]\n');
});
