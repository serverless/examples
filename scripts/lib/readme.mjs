// Renders what an example's README and the examples.json catalogue derive from
// its example.json manifest: the frontmatter comment at the top of the README,
// the verification badge line under the README's H1, and the catalogue entry.

const REPO_URL = 'https://github.com/serverless/examples';
const BRANCH = 'v4';
const BADGE_BRANCH = 'verified';

// How each manifest language is spelled in README frontmatter.
const FRONTMATTER_LANGUAGE = {
  node: 'nodeJS',
  python: 'Python',
  go: 'Go',
  java: 'Java',
  ruby: 'Ruby',
  csharp: 'CSharp',
  rust: 'Rust',
};

const FRONTMATTER_RE = /^<!--[\s\S]*?-->/;
const BADGE_PREFIX = `[![Verified](https://raw.githubusercontent.com/serverless/examples/${BADGE_BRANCH}/badges/`;

/**
 * Returns the `<!-- … -->` frontmatter block. Free-text values (title,
 * description, author fields) are single-quoted with a quote inside a value
 * doubled; layout, framework, platform, language and priority are written
 * bare, as in the existing READMEs.
 */
export function renderFrontmatter(m) {
  const lines = [
    ['title', quote(m.title)],
    ['description', quote(m.description)],
    ['layout', 'Doc'],
    ['framework', m.framework],
    ['platform', m.platform],
    ['language', FRONTMATTER_LANGUAGE[m.language] ?? m.language],
  ];
  if (m.priority !== undefined) lines.push(['priority', String(m.priority)]);
  lines.push(['authorLink', quote(m.author.link)], ['authorName', quote(m.author.name)]);
  if (m.author.avatar !== undefined) lines.push(['authorAvatar', quote(m.author.avatar)]);
  return ['<!--', ...lines.map(([key, value]) => `${key}: ${value}`), '-->'].join('\n');
}

/** Returns the verification badge line for an example with a `test` section, else null. */
export function renderBadgeLine(m) {
  if (m.test === undefined) return null;
  return `${BADGE_PREFIX}${m.dir}.svg)](${REPO_URL}/blob/${BADGE_BRANCH}/results.json)`;
}

/**
 * Returns the README with its leading frontmatter comment replaced (or added)
 * and the badge line kept, inserted or removed directly under the first H1.
 * When the manifest has no author.avatar, the README's current authorAvatar is kept.
 */
export function applyGenerated(readme, m) {
  const current = readme.match(FRONTMATTER_RE);
  const avatar = m.author.avatar ?? (current && readFrontmatterValue(current[0], 'authorAvatar'));
  const manifest = avatar == null ? m : { ...m, author: { ...m.author, avatar } };
  const frontmatter = renderFrontmatter(manifest);
  const body = current ? readme.slice(current[0].length) : `\n\n${readme}`;
  return frontmatter + placeBadge(body, renderBadgeLine(m));
}

/** Returns the examples.json catalogue entry for the manifest. */
export function toExamplesJsonEntry(m) {
  const entry = {
    title: m.title,
    name: m.dir.replaceAll('/', '-'),
    description: m.description,
    githubUrl: `${REPO_URL}/tree/${BRANCH}/${m.dir}`,
    framework: m.framework,
    language: m.language,
    platform: m.platform.toLowerCase(),
    authorLink: m.author.link,
    authorName: m.author.name,
  };
  if (m.author.avatar !== undefined) entry.authorAvatar = m.author.avatar;
  if (m.priority !== undefined) entry.priority = m.priority;
  return entry;
}

/**
 * Returns `entry` merged over the catalogue entry it replaces: keys of
 * `existing` keep their order, keys the generated entry does not set are kept,
 * and so is the existing `name` (the website's page URL is built from it).
 */
export function mergeCatalogueEntry(existing, entry) {
  return { ...existing, ...entry, name: existing.name };
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function readFrontmatterValue(frontmatter, key) {
  const line = frontmatter.split('\n').find((l) => l.startsWith(`${key}:`));
  if (!line) return null;
  const raw = line.slice(key.length + 1).trim();
  if (raw.length >= 2 && raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1).replaceAll("''", "'");
  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) return raw.slice(1, -1);
  return raw || null;
}

// Removes an existing badge line (and the blank lines after it) from under the
// first H1, then inserts `badge` there when it is not null: one blank line
// above it, one below. Without an H1 the badge goes at the top of the body.
function placeBadge(body, badge) {
  const lines = body.split('\n');
  const h1 = lines.findIndex((l) => l.startsWith('# '));
  const anchor = h1 + 1;
  const firstContent = () => {
    let i = anchor;
    while (i < lines.length && lines[i].trim() === '') i += 1;
    return i;
  };

  const existing = firstContent();
  if (existing < lines.length && lines[existing].startsWith(BADGE_PREFIX)) {
    let end = existing + 1;
    while (end < lines.length && lines[end].trim() === '') end += 1;
    lines.splice(existing, end - existing);
  }

  if (badge !== null) {
    const at = firstContent();
    const insert = at === anchor && h1 !== -1 ? ['', badge, ''] : [badge, ''];
    lines.splice(at, 0, ...insert);
  }
  return lines.join('\n');
}
