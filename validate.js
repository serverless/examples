#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const REQUIRED = ['title', 'description', 'framework', 'platform', 'language', 'authorLink', 'authorName', 'authorAvatar'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', 'docs', 'images', '.serverless']);

// An example root is the shallowest directory containing serverless.yml/yaml.
// Do not recurse below an example root (multi-service examples validate once, at the root).
function findExampleDirs(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const hasConfig = ['serverless.yml', 'serverless.yaml'].some((f) => fs.existsSync(path.join(full, f)));
    if (hasConfig) { out.push(full); continue; }
    out.push(...findExampleDirs(full));
  }
  return out;
}

function frontmatterOf(readmePath) {
  const content = fs.readFileSync(readmePath, 'utf8');
  const match = content.match(/<!--([\s\S]*?)-->/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^\s*(\w+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return Object.keys(data).length ? data : null;
}

const errors = [];
for (const dir of findExampleDirs(ROOT)) {
  const rel = path.relative(ROOT, dir);
  const readme = path.join(dir, 'README.md');
  if (!fs.existsSync(readme)) { errors.push(`${rel}: missing README.md`); continue; }
  const fm = frontmatterOf(readme);
  if (!fm) { errors.push(`${rel}: README.md has no frontmatter HTML comment`); continue; }
  for (const key of REQUIRED) if (!fm[key]) errors.push(`${rel}: frontmatter missing "${key}"`);
  if (fm.title === 'TODO') errors.push(`${rel}: frontmatter title is TODO`);
  if (fm.framework && fm.framework !== 'v4') errors.push(`${rel}: frontmatter framework is "${fm.framework}", expected "v4"`);
  // serverless.com converts the frontmatter comment to YAML; an unquoted value
  // containing ": " is invalid YAML there and blanks the example's page.
  for (const [key, value] of Object.entries(fm)) {
    if (value.includes(': ') && !/^['"]/.test(value)) {
      errors.push(`${rel}: frontmatter "${key}" contains ": " — quote the value (breaks YAML parsing on serverless.com)`);
    }
  }
}

// The aws-mcp-servers examples all serve one canonical MCP server and ship
// one shared test client. The canonical copies live at aws-mcp-servers/
// (client.mjs, server.mjs); every example carries an identical copy so each
// directory stays self-contained. Edit the canonical, then re-copy.
const SHARED_FILES = [
  ['aws-mcp-servers/client.mjs', [
    'aws-mcp-servers/rest-api/client.mjs',
    'aws-mcp-servers/function-url/client.mjs',
    'aws-mcp-servers/hono/client.mjs',
    'aws-mcp-servers/express-web-adapter/client.mjs',
    'aws-mcp-servers/fastify-container/client.mjs',
    'aws-bedrock-agentcore/javascript/mcp-server/client.mjs',
  ]],
  ['aws-mcp-servers/server.mjs', [
    'aws-mcp-servers/rest-api/src/server.mjs',
    'aws-mcp-servers/function-url/src/server.mjs',
    'aws-mcp-servers/hono/src/server.mjs',
    'aws-mcp-servers/express-web-adapter/src/server.mjs',
    'aws-mcp-servers/fastify-container/src/server.mjs',
    'aws-bedrock-agentcore/javascript/mcp-server/src/server.mjs',
  ]],
];
for (const [canonical, copies] of SHARED_FILES) {
  const canonicalPath = path.join(ROOT, canonical);
  if (!fs.existsSync(canonicalPath)) { errors.push(`${canonical}: canonical shared file missing`); continue; }
  const want = fs.readFileSync(canonicalPath, 'utf8');
  for (const copy of copies) {
    const copyPath = path.join(ROOT, copy);
    if (!fs.existsSync(copyPath)) { errors.push(`${copy}: missing copy of ${canonical}`); continue; }
    if (fs.readFileSync(copyPath, 'utf8') !== want) {
      errors.push(`${copy}: differs from canonical ${canonical} — edit the canonical and re-copy`);
    }
  }
}

if (errors.length) {
  console.error(`${errors.length} validation error(s):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log('all example READMEs valid');
