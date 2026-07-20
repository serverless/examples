#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = 'https://github.com/serverless/examples';
const BRANCH = 'v4';
const readmePath = path.join(__dirname, 'README.md');
const examples = JSON.parse(fs.readFileSync(path.join(__dirname, 'examples.json'), 'utf8'));

const RUNTIME_LABELS = {
  nodejs: 'nodeJS', node: 'nodeJS', python: 'python', golang: 'golang', go: 'golang',
  ruby: 'ruby', java: 'java', dotnet: 'dotnet', csharp: 'dotnet', rust: 'rust',
  swift: 'swift', php: 'php', typescript: 'nodeJS',
};

function dirnameOf(example) {
  const m = (example.githubUrl || '').match(/\/tree\/[^/]+\/(.+?)\/?$/);
  return m ? m[1] : '';
}

function row(example) {
  const title = example.title && example.title !== 'TODO' ? example.title : example.name;
  const desc = example.description ? ` <br/> ${example.description}` : '';
  const runtime = RUNTIME_LABELS[(example.language || '').toLowerCase()] || example.language || 'unknown';
  const href = example.community
    ? example.githubUrl
    : `${REPO}/tree/${BRANCH}/${dirnameOf(example)}`;
  return `| [${title}](${href})${desc} | ${runtime} |`;
}

function table(rows) {
  return ['| Example | Runtime |', '|:--- |:--- |', ...rows].join('\n');
}

function splice(content, marker, replacement) {
  const startTag = `<!-- AUTO-GENERATED-CONTENT:START (${marker}`;
  const endTag = '<!-- AUTO-GENERATED-CONTENT:END -->';
  const startIdx = content.indexOf(startTag);
  if (startIdx === -1) throw new Error(`marker ${marker} not found in README.md`);
  const afterStart = content.indexOf('-->', startIdx) + 3;
  const endIdx = content.indexOf(endTag, afterStart);
  if (endIdx === -1) throw new Error(`END marker for ${marker} not found`);
  return `${content.slice(0, afterStart)}\n${replacement}\n${content.slice(endIdx)}`;
}

const firstParty = examples.filter((e) => !e.community);
const community = examples.filter((e) => e.community);

const badFirstParty = firstParty.filter((e) => !dirnameOf(e));
if (badFirstParty.length) {
  console.error('first-party entries with unparseable githubUrl:');
  badFirstParty.forEach((e) => console.error(`  - ${e.name}: ${e.githubUrl}`));
  process.exit(1);
}

let readme = fs.readFileSync(readmePath, 'utf8');
readme = splice(readme, 'SERVERLESS_EXAMPLE_TABLE', table(firstParty.map(row)));
readme = splice(readme, 'COMMUNITY_EXAMPLES_TABLE', table(community.map(row)));
fs.writeFileSync(readmePath, readme);
console.log(`README updated: ${firstParty.length} first-party, ${community.length} community examples`);
