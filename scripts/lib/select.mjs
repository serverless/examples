// Decides which examples a test run covers: the ones a diff touches, or every
// tested example in a tier.
//
// An example is tested when its manifest has a `test` block. A tested example
// with `test.quarantine` is never selected; it is reported in `quarantined`
// so a run summary can count it.

// Root-level files whose changes do not affect any example.
const ROOT_FILES_WITHOUT_EFFECT = new Set(['README.md', 'examples.json', 'LICENSE.txt', 'AGENTS.md', '.gitignore']);
// Directories whose changes affect every example.
const TOOLING_DIRS = ['scripts/', '.github/'];

/**
 * @param {object} options
 * @param {Array<{dir: string, test?: object}>} options.manifests  loaded manifests
 * @param {string[]} [options.changedFiles]  repository-relative paths, forward slashes
 * @param {boolean} [options.all]            select every tested example instead of a diff
 * @param {'fast'|'slow'} [options.tier]     keep only examples in this tier
 * @param {Record<string, string[]>} [options.sharedFiles]  canonical file → paths of its copies
 * @returns {{dirs: string[], quarantined: string[], reason: string}}
 */
export function selectExamples({ manifests, changedFiles, all = false, tier, sharedFiles = {} }) {
  if (all === (changedFiles !== undefined)) throw new Error('pass either changedFiles or all: true');

  const testedAll = manifests.filter((m) => m.test);
  const tested = testedAll.filter((m) => tier === undefined || m.test.tier === tier);

  if (all) {
    if (testedAll.length === 0) throw new Error('no tested examples found');
    if (tested.length === 0) return { dirs: [], quarantined: [], reason: 'tier has no examples' };
    const split = splitQuarantined(tested);
    const label = tier ? `tier ${tier}` : 'all tiers';
    return { ...split, reason: `${label}: ${split.dirs.length} example(s), ${split.quarantined.length} quarantined` };
  }

  const toolingFile = changedFiles.find(affectsEveryExample);
  if (toolingFile) {
    const split = splitQuarantined(tested);
    if (split.dirs.length + split.quarantined.length > 0) {
      return { ...split, reason: `${toolingFile} changed; selecting every tested example` };
    }
  }

  const dirs = dirsLongestFirst(manifests);
  const hit = new Set();
  for (const file of changedFiles) {
    for (const target of [file, ...(sharedFiles[file] ?? [])]) {
      const dir = dirs.find((d) => target.startsWith(`${d}/`));
      if (dir) hit.add(dir);
    }
  }
  const split = splitQuarantined(tested.filter((m) => hit.has(m.dir)));
  if (split.dirs.length === 0) return { ...split, reason: 'no tested example changed' };
  return { ...split, reason: `${split.dirs.length} example(s) changed` };
}

function affectsEveryExample(file) {
  if (TOOLING_DIRS.some((d) => file.startsWith(d))) return true;
  return !file.includes('/') && !ROOT_FILES_WITHOUT_EFFECT.has(file);
}

// Longest first, so a file selects the deepest example directory that holds it.
function dirsLongestFirst(manifests) {
  return manifests.map((m) => m.dir).sort((a, b) => b.length - a.length);
}

function splitQuarantined(tested) {
  const dirs = [];
  const quarantined = [];
  for (const m of tested) (m.test.quarantine ? quarantined : dirs).push(m.dir);
  return { dirs: dirs.sort(), quarantined: quarantined.sort() };
}
