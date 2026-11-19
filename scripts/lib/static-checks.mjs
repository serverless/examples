// Static checks that every example with an example.json manifest must pass,
// plus an optional install and `serverless package` run in a copy of the example.
//
// Every message starts with the name of the rule it comes from:
//   manifest             example.json loads and passes validateManifest
//   readme-headings      README.md has the standard H2 headings, in order
//   readme-cleanup       `serverless remove` appears under "Cost and cleanup"
//   code-fence-language  every code fence in README.md names a language
//   lockfile             a package.json with dependencies has a lockfile beside it
//   exact-version        dependencies and devDependencies use exact versions
//   no-stage             serverless.yml sets no top-level or provider.stage
//   secrets              no secret-shaped values (keys, tokens, private key
//                        blocks) in files tracked by git
//   generated-readme     README.md frontmatter and badge match the manifest
//   generated-catalogue  the examples.json entry matches the manifest
//   check-paths          script check paths and invoke event files exist
//
// An example whose manifest sets `"onboarding": true` is exempt from the
// lockfile and exact-version rules only.

import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { copyExample, installCommands } from './exec.mjs';
import { loadManifest, validateManifest, MANIFEST_FILE } from './manifest.mjs';
import { applyGenerated, mergeCatalogueEntry, toExamplesJsonEntry } from './readme.mjs';

export const README_HEADINGS = [
  'What it deploys',
  'Prerequisites',
  'Deploy',
  'Try it',
  'How it works',
  'Cost and cleanup',
  'Next steps',
];
const EXTRA_HEADINGS_AFTER = 'How it works';
const CLEANUP_HEADING = 'Cost and cleanup';
const CLEANUP_COMMAND = 'serverless remove';

const NPM_LOCKFILES = ['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock', 'bun.lockb'];
const LOCKFILES = new Set([
  ...NPM_LOCKFILES,
  'poetry.lock',
  'Pipfile.lock',
  'uv.lock',
  'Cargo.lock',
  'Gemfile.lock',
  'go.sum',
  'composer.lock',
  'packages.lock.json',
]);
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies'];
const SERVICE_FILES = new Set(['serverless.yml', 'serverless.yaml']);
const WALK_SKIP = new Set(['node_modules', '.serverless', '.git']);

const SECRET_PATTERNS = [
  ['Stripe live key', /sk_live_/],
  ['Stripe test key', /sk_test_/],
  ['AWS access key id', /AKIA[0-9A-Z]{16}/],
  ['private key block', /-----BEGIN (RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/],
  ['Slack token', /xox[bp]-/],
];

export const PACKAGE_STAGE = 'ex000000';
const CATALOGUE_FILE = 'examples.json';

/**
 * Runs every static check on the example at `<root>/<dir>` (dir relative to
 * root, forward slashes). Returns error messages; empty when it passes.
 */
export function checkExample(root, dir) {
  const exampleDir = path.join(root, dir);
  const errors = [];

  let manifest = null;
  let manifestValid = false;
  try {
    manifest = loadManifest(root, dir);
    const problems = validateManifest(manifest);
    for (const p of problems) errors.push(`manifest: ${MANIFEST_FILE}: ${p}`);
    manifestValid = problems.length === 0;
  } catch (err) {
    errors.push(`manifest: ${MANIFEST_FILE} could not be read: ${err.message}`);
  }
  const onboarding = manifest?.onboarding === true;

  const readmeFile = path.join(exampleDir, 'README.md');
  const readme = fs.existsSync(readmeFile) ? fs.readFileSync(readmeFile, 'utf8') : null;
  if (readme === null) {
    errors.push('readme-headings: README.md is missing');
  } else {
    errors.push(...checkReadme(readme));
  }

  const files = listFiles(exampleDir);
  for (const rel of files.filter((f) => path.posix.basename(f) === 'package.json')) {
    errors.push(...checkPackageJson(exampleDir, rel, onboarding));
  }
  for (const rel of files.filter((f) => SERVICE_FILES.has(path.posix.basename(f)))) {
    errors.push(...checkNoStage(rel, fs.readFileSync(path.join(exampleDir, rel), 'utf8')));
  }

  errors.push(...checkSecrets(exampleDir));

  if (manifestValid) {
    if (readme !== null && applyGenerated(readme, manifest) !== readme) {
      errors.push('generated-readme: README.md frontmatter or badge line differs from example.json; run node scripts/generate.mjs');
    }
    errors.push(...checkCatalogue(root, manifest));
    errors.push(...checkPaths(exampleDir, manifest));
  }
  return errors;
}

/**
 * Copies the example (without node_modules and .serverless) to a temporary
 * directory and, there, installs dependencies (see installCommands: the root
 * and, for a Compose root, each service directory) and runs
 * `serverless package --stage ex000000`. Every step goes through `exec`, which
 * has the signature of child_process.spawnSync. Returns at most one error
 * message, naming the step that did not complete.
 */
export function packageExample(root, dir, { exec = spawnSync } = {}) {
  const { copy, cleanup } = copyExample(root, dir, 'example-package-');
  try {
    const steps = [...installCommands(copy), { cwd: copy, cmd: 'serverless', args: ['package', '--stage', PACKAGE_STAGE] }];
    for (const { cwd, cmd, args } of steps) {
      const step = `${cmd} ${args[0]}`;
      const result = exec(cmd, args, { cwd, stdio: 'inherit' });
      if (result.error?.code === 'ENOENT') {
        return [`package: ${step}: the ${cmd} command was not found on PATH; install it to use --package`];
      }
      if (result.error) return [`package: ${step} could not run: ${result.error.message}`];
      if (result.status !== 0) return [`package: ${step} exited with code ${result.status}`];
    }
    return [];
  } finally {
    cleanup();
  }
}

function checkReadme(readme) {
  const errors = [];
  const lines = readme.split('\n');
  const headings = [];
  const unlabeledFences = [];
  let fence = null;
  lines.forEach((line, i) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && marker[2].trim() === '') fence = null;
      return;
    }
    if (marker) {
      fence = marker[1];
      if (marker[2].trim() === '') unlabeledFences.push(i + 1);
      return;
    }
    const h2 = line.match(/^## +(.*?)\s*#*\s*$/);
    if (h2) headings.push({ text: h2[1], line: i });
  });

  errors.push(...checkHeadings(headings.map((h) => h.text)));
  for (const n of unlabeledFences) errors.push(`code-fence-language: README.md:${n}: code fence has no language`);

  const cleanup = headings.findIndex((h) => h.text === CLEANUP_HEADING);
  if (cleanup !== -1) {
    const end = headings[cleanup + 1]?.line ?? lines.length;
    if (!lines.slice(headings[cleanup].line + 1, end).some((l) => l.includes(CLEANUP_COMMAND))) {
      errors.push(`readme-cleanup: README.md: "${CLEANUP_COMMAND}" does not appear under "${CLEANUP_HEADING}"`);
    }
  }
  return errors;
}

// Reports all heading problems as one message.
function checkHeadings(texts) {
  const problems = [];
  const missing = README_HEADINGS.filter((h) => !texts.includes(h));
  if (missing.length) problems.push(`missing ${missing.map((h) => `"${h}"`).join(', ')}`);

  const found = texts.filter((t) => README_HEADINGS.includes(t));
  if (!missing.length && found.join('\n') !== README_HEADINGS.join('\n')) {
    problems.push(`out of order or repeated: ${found.map((h) => `"${h}"`).join(', ')}`);
  }

  const allowedFrom = texts.indexOf(EXTRA_HEADINGS_AFTER);
  const early = texts.filter((t, i) => !README_HEADINGS.includes(t) && (allowedFrom === -1 || i < allowedFrom));
  if (early.length) {
    problems.push(`extra ${early.map((h) => `"${h}"`).join(', ')} before "${EXTRA_HEADINGS_AFTER}"`);
  }

  if (!problems.length) return [];
  return [
    `readme-headings: README.md: ${problems.join('; ')}; the H2 headings must be ${README_HEADINGS.map((h) => `"${h}"`).join(', ')}, ` +
      `in that order, with other H2 headings only after "${EXTRA_HEADINGS_AFTER}"`,
  ];
}

function checkPackageJson(exampleDir, rel, onboarding) {
  if (onboarding) return [];
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(exampleDir, rel), 'utf8'));
  } catch (err) {
    return [`lockfile: ${rel} could not be read: ${err.message}`];
  }
  const errors = [];
  const deps = DEPENDENCY_FIELDS.flatMap((field) => Object.entries(pkg[field] ?? {}).map(([name, spec]) => ({ field, name, spec })));

  const dirOf = path.posix.dirname(rel);
  const hasLockfile = NPM_LOCKFILES.some((f) => fs.existsSync(path.join(exampleDir, dirOf, f)));
  if (deps.length && !hasLockfile) {
    errors.push(`lockfile: ${rel} has dependencies but no lockfile beside it (${NPM_LOCKFILES.join(', ')})`);
  }

  for (const { field, name, spec } of deps) {
    if (isRange(spec)) errors.push(`exact-version: ${rel}: ${field}.${name} is "${spec}"; use an exact version`);
  }
  return errors;
}

function isRange(spec) {
  return typeof spec === 'string' && (/^[\^~]/.test(spec) || spec === '*' || spec === 'latest');
}

// Line-based: flags `stage:` at column 0, and `stage:` at the indentation of
// provider's direct children.
function checkNoStage(rel, text) {
  const errors = [];
  let inProvider = false;
  let childIndent = null;
  text.split('\n').forEach((line, i) => {
    if (line.trim() === '' || line.trimStart().startsWith('#')) return;
    const indent = line.length - line.trimStart().length;
    const key = line.trimStart().match(/^([A-Za-z0-9_-]+)\s*:/)?.[1];
    if (indent === 0) {
      inProvider = key === 'provider';
      childIndent = null;
      if (key === 'stage') errors.push(`no-stage: ${rel}:${i + 1}: remove the top-level stage; the stage comes from --stage`);
      return;
    }
    if (!inProvider) return;
    childIndent ??= indent;
    if (indent === childIndent && key === 'stage') {
      errors.push(`no-stage: ${rel}:${i + 1}: remove provider.stage; the stage comes from --stage`);
    }
  });
  return errors;
}

function checkSecrets(exampleDir) {
  let tracked;
  try {
    tracked = execFileSync('git', ['ls-files', '-z', '--', '.'], { cwd: exampleDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      .split('\0')
      .filter(Boolean);
  } catch (err) {
    return [`secrets: could not list the files git tracks: ${err.message.split('\n')[0]}`];
  }
  const errors = [];
  for (const rel of tracked) {
    if (LOCKFILES.has(path.posix.basename(rel))) continue;
    const file = path.join(exampleDir, rel);
    if (!fs.existsSync(file)) continue;
    const buf = fs.readFileSync(file);
    if (buf.subarray(0, 8000).includes(0)) continue;
    const text = buf.toString('utf8');
    for (const [name, pattern] of SECRET_PATTERNS) {
      if (pattern.test(text)) errors.push(`secrets: ${rel}: contains a value shaped like a ${name}`);
    }
  }
  return errors;
}

function checkCatalogue(root, manifest) {
  const file = path.join(root, CATALOGUE_FILE);
  let catalogue;
  try {
    catalogue = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return [`generated-catalogue: ${CATALOGUE_FILE} could not be read: ${err.message}`];
  }
  const entry = toExamplesJsonEntry(manifest);
  const existing = Array.isArray(catalogue) ? catalogue.find((e) => e.githubUrl === entry.githubUrl) : undefined;
  if (!existing) {
    return [`generated-catalogue: ${CATALOGUE_FILE} has no entry for ${entry.githubUrl}; run node scripts/generate.mjs`];
  }
  if (JSON.stringify(mergeCatalogueEntry(existing, entry)) !== JSON.stringify(existing)) {
    return [`generated-catalogue: the ${CATALOGUE_FILE} entry differs from example.json; run node scripts/generate.mjs`];
  }
  return [];
}

function checkPaths(exampleDir, manifest) {
  const errors = [];
  (manifest.test?.checks ?? []).forEach((check, i) => {
    const target = check.script?.path ?? check.invoke?.event;
    if (target === undefined) return;
    const what = check.script ? 'script path' : 'invoke event file';
    if (!fs.existsSync(path.join(exampleDir, target))) {
      errors.push(`check-paths: test.checks[${i}]: ${what} ${target} does not exist`);
    }
  });
  return errors;
}

// Returns example-relative paths (forward slashes) of every file on disk,
// skipping dependency, build and git directories.
function listFiles(exampleDir) {
  const out = [];
  const walk = (rel) => {
    for (const entry of fs.readdirSync(path.join(exampleDir, rel), { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!WALK_SKIP.has(entry.name)) walk(childRel);
      } else if (entry.isFile()) {
        out.push(childRel);
      }
    }
  };
  walk('');
  return out.sort();
}
