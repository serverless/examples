// Loads and validates the `example.json` manifest that describes an example.
//
// Manifest fields:
//   title, description          required strings
//   language                    one of LANGUAGES
//   platform                    "AWS"
//   framework                   "v4"
//   author                      { name, link, avatar? }
//   services                    non-empty string[]
//   region?                     string
//   priority?                   number
//   onboarding?                 boolean
//   test?                       { tier: "fast"|"slow", checks: Check[], timeoutMinutes?, quarantine?: { reason, since },
//                                 prepare?: { path }, cleanup?: { path } }
//
// prepare and cleanup name Node.js scripts the live test runs before deploy and
// after remove; cleanup needs prepare.
//
// A Check has exactly one key:
//   http:   { output, path?, status?, contains? }   status or contains is required
//   invoke: { function, event?, args?, contains }   args: extra CLI arguments
//   script: { path }
//
// Keys not listed above are rejected at every level. title, description and the
// author fields go into README frontmatter, so they must not contain `-->` or a
// line break.

import fs from 'node:fs';
import path from 'node:path';

export const MANIFEST_FILE = 'example.json';
export const LANGUAGES = ['node', 'python', 'go', 'java', 'ruby', 'csharp', 'rust'];
export const TIERS = ['fast', 'slow'];
const CHECK_KINDS = ['http', 'invoke', 'script'];
const KEYS = {
  root: ['dir', 'title', 'description', 'language', 'platform', 'framework', 'author', 'services', 'region', 'priority', 'onboarding', 'test'],
  author: ['name', 'link', 'avatar'],
  test: ['tier', 'checks', 'timeoutMinutes', 'quarantine', 'prepare', 'cleanup'],
  hook: ['path'],
  quarantine: ['reason', 'since'],
  http: ['output', 'path', 'status', 'contains'],
  invoke: ['function', 'event', 'args', 'contains'],
  script: ['path'],
};
// Directories whose name starts with a dot are skipped too.
const SKIP_DIRS = new Set(['node_modules', 'tests', 'scripts']);

/**
 * Returns the repo-relative directories (forward slashes, sorted) that contain
 * an example.json. Does not descend below a directory that has one.
 */
export function findExampleDirs(root) {
  const found = [];
  const walk = (rel) => {
    for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (fs.existsSync(path.join(root, childRel, MANIFEST_FILE))) found.push(childRel);
      else walk(childRel);
    }
  };
  walk('');
  return found.sort();
}

/** Reads `<root>/<dir>/example.json` and returns its content with `dir` set. */
export function loadManifest(root, dir) {
  const file = path.join(root, dir, MANIFEST_FILE);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`${file}: ${err.message}`, { cause: err });
  }
  return { ...data, dir };
}

/** Returns a list of error messages; empty when the manifest is valid. */
export function validateManifest(m) {
  const errors = [];
  if (!isObject(m)) return ['manifest must be a JSON object'];
  rejectUnknownKeys(errors, m, KEYS.root, '');

  requireString(errors, m, 'title', 'title');
  requireString(errors, m, 'description', 'description');
  rejectFrontmatterBreaks(errors, m, 'title', 'title');
  rejectFrontmatterBreaks(errors, m, 'description', 'description');
  requireOneOf(errors, m.language, 'language', LANGUAGES);
  requireOneOf(errors, m.platform, 'platform', ['AWS']);
  requireOneOf(errors, m.framework, 'framework', ['v4']);

  if (!isObject(m.author)) {
    errors.push('author: required object with name and link');
  } else {
    rejectUnknownKeys(errors, m.author, KEYS.author, 'author.');
    requireString(errors, m.author, 'name', 'author.name');
    requireString(errors, m.author, 'link', 'author.link');
    optionalString(errors, m.author, 'avatar', 'author.avatar');
    for (const key of KEYS.author) rejectFrontmatterBreaks(errors, m.author, key, `author.${key}`);
  }

  if (!Array.isArray(m.services) || m.services.length === 0 || !m.services.every(isNonEmptyString)) {
    errors.push('services: required array of non-empty strings');
  }

  optionalString(errors, m, 'region', 'region');
  if (m.priority !== undefined && !Number.isFinite(m.priority)) errors.push('priority: must be a number');
  if (m.onboarding !== undefined && typeof m.onboarding !== 'boolean') errors.push('onboarding: must be true or false');

  if (m.test !== undefined) validateTest(errors, m.test);
  return errors;
}

function validateTest(errors, t) {
  if (!isObject(t)) {
    errors.push('test: must be an object');
    return;
  }
  rejectUnknownKeys(errors, t, KEYS.test, 'test.');
  requireOneOf(errors, t.tier, 'test.tier', TIERS);

  if (!Array.isArray(t.checks) || t.checks.length === 0) {
    errors.push('test.checks: required non-empty array');
  } else {
    t.checks.forEach((check, i) => validateCheck(errors, check, `test.checks[${i}]`));
  }

  if (t.timeoutMinutes !== undefined && !(Number.isFinite(t.timeoutMinutes) && t.timeoutMinutes > 0)) {
    errors.push('test.timeoutMinutes: must be a positive number');
  }

  for (const hook of ['prepare', 'cleanup']) {
    if (t[hook] === undefined) continue;
    if (!isObject(t[hook])) {
      errors.push(`test.${hook}: must be an object with path`);
      continue;
    }
    rejectUnknownKeys(errors, t[hook], KEYS.hook, `test.${hook}.`);
    requireString(errors, t[hook], 'path', `test.${hook}.path`);
  }
  if (t.cleanup !== undefined && t.prepare === undefined) {
    errors.push('test.cleanup: needs test.prepare; cleanup runs only after a prepare script ran');
  }

  if (t.quarantine !== undefined) {
    if (!isObject(t.quarantine)) {
      errors.push('test.quarantine: must be an object with reason and since');
    } else {
      rejectUnknownKeys(errors, t.quarantine, KEYS.quarantine, 'test.quarantine.');
      requireString(errors, t.quarantine, 'reason', 'test.quarantine.reason');
      if (!isIsoDate(t.quarantine.since)) errors.push('test.quarantine.since: required date as YYYY-MM-DD');
    }
  }
}

function validateCheck(errors, check, at) {
  const kinds = isObject(check) ? Object.keys(check) : [];
  if (kinds.length !== 1 || !CHECK_KINDS.includes(kinds[0])) {
    errors.push(`${at}: must have exactly one key, one of ${CHECK_KINDS.join(', ')}`);
    return;
  }
  const kind = kinds[0];
  const c = check[kind];
  const where = `${at}.${kind}`;
  if (!isObject(c)) {
    errors.push(`${where}: must be an object`);
    return;
  }
  rejectUnknownKeys(errors, c, KEYS[kind], `${where}.`);
  if (kind === 'http') {
    requireString(errors, c, 'output', `${where}.output`);
    optionalString(errors, c, 'path', `${where}.path`);
    optionalString(errors, c, 'contains', `${where}.contains`);
    if (c.status !== undefined && !Number.isInteger(c.status)) errors.push(`${where}.status: must be an integer`);
    if (c.status === undefined && c.contains === undefined) {
      errors.push(`${where}: no assertion; set status, contains or both`);
    }
  } else if (kind === 'invoke') {
    requireString(errors, c, 'function', `${where}.function`);
    optionalString(errors, c, 'event', `${where}.event`);
    if (c.args !== undefined && !(Array.isArray(c.args) && c.args.every(isNonEmptyString))) {
      errors.push(`${where}.args: must be an array of non-empty strings`);
    }
    requireString(errors, c, 'contains', `${where}.contains`);
  } else {
    requireString(errors, c, 'path', `${where}.path`);
  }
}

function rejectUnknownKeys(errors, obj, allowed, prefix) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) errors.push(`${prefix}${key}: unknown key; allowed keys are ${allowed.join(', ')}`);
  }
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function requireString(errors, obj, key, at) {
  if (!isNonEmptyString(obj[key])) errors.push(`${at}: required non-empty string`);
}

function optionalString(errors, obj, key, at) {
  if (obj[key] !== undefined && !isNonEmptyString(obj[key])) errors.push(`${at}: must be a non-empty string`);
}

// Values written into the README's `<!-- … -->` frontmatter: `-->` would end
// the comment and a line break would split the value.
function rejectFrontmatterBreaks(errors, obj, key, at) {
  const v = obj[key];
  if (typeof v !== 'string') return;
  if (v.includes('-->')) errors.push(`${at}: must not contain "-->", which would end the README frontmatter comment`);
  if (/[\r\n]/.test(v)) errors.push(`${at}: must not contain a line break, which would split the README frontmatter value`);
}

function requireOneOf(errors, value, at, allowed) {
  if (!allowed.includes(value)) {
    errors.push(`${at}: ${JSON.stringify(value) ?? 'missing'} is not allowed; use one of ${allowed.join(', ')}`);
  }
}

function isIsoDate(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
