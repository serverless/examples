#!/usr/bin/env node
// Regenerates what each example's example.json manifest drives: the README's
// frontmatter and badge line, and the example's entry in examples.json.
//
// Usage: node scripts/generate.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findExampleDirs, loadManifest, validateManifest, MANIFEST_FILE } from './lib/manifest.mjs';
import { applyGenerated, toExamplesJsonEntry } from './lib/readme.mjs';

const CATALOGUE_FILE = 'examples.json';

/**
 * Validates every manifest under `root`, then rewrites the READMEs and
 * examples.json. Throws without writing anything when a manifest is invalid.
 * Returns the number of manifests processed.
 */
export function generate(root) {
  const manifests = findExampleDirs(root).map((dir) => loadManifest(root, dir));
  const problems = manifests.flatMap((m) =>
    validateManifest(m).map((error) => `${m.dir}/${MANIFEST_FILE}: ${error}`),
  );
  if (problems.length) throw new Error(`invalid manifests:\n  ${problems.join('\n  ')}`);
  if (manifests.length === 0) return 0;

  const readmes = manifests.map((m) => {
    const file = path.join(root, m.dir, 'README.md');
    const before = fs.readFileSync(file, 'utf8');
    return { file, before, after: applyGenerated(before, m) };
  });

  const catalogueFile = path.join(root, CATALOGUE_FILE);
  const catalogue = JSON.parse(fs.readFileSync(catalogueFile, 'utf8'));
  for (const m of manifests) upsert(catalogue, toExamplesJsonEntry(m));

  for (const { file, before, after } of readmes) {
    if (after !== before) fs.writeFileSync(file, after);
  }
  writeIfChanged(catalogueFile, `${JSON.stringify(catalogue, null, 2)}\n`);
  return manifests.length;
}

// Replaces the entry with the same githubUrl in place, keeping keys the
// generated entry does not set (and their order); appends when there is none.
function upsert(catalogue, entry) {
  const i = catalogue.findIndex((e) => e.githubUrl === entry.githubUrl);
  if (i === -1) catalogue.push(entry);
  else catalogue[i] = { ...catalogue[i], ...entry };
}

function writeIfChanged(file, content) {
  if (fs.readFileSync(file, 'utf8') !== content) fs.writeFileSync(file, content);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const count = generate(root);
    console.log(`Generated README frontmatter and examples.json entries for ${count} example(s)`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
