// Keeps the record of live test results that the `verified` branch publishes:
// the last runs of each example and the run that verified it, and the badge
// each README shows.

// Runs kept per example, newest first.
const KEPT_RUNS = 2;
// Only results of the released Framework verify an example.
const VERIFIED_VERSION = 'latest';
// Example directories: relative, forward slashes, no empty, dot or dot-dot segments.
const SAFE_DIR = /^(?!.*(^|\/)\.{1,2}(\/|$))[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/;

/**
 * @typedef {{result: 'pass'|'fail', date: string, frameworkVersion: string, runUrl: string}} Run
 * @typedef {{date: string, frameworkVersion: string, runUrl: string}} Verification
 * @typedef {{runs: Run[], verified: Verification|null}} Entry
 * @typedef {Record<string, Entry>} Results  keyed by example directory
 */

/**
 * Returns `previous` with the `latest` results of one workflow run (`runs`,
 * Result objects of scripts/test-example.mjs) added. Each example keeps its
 * newest 2 runs, newest first. `verified` is the newest passing kept run, or
 * null when no kept run passed or the example is quarantined. Quarantined are
 * the examples in `options.quarantined` and those with a `skip` result; a skip
 * is not recorded as a run. Examples with no entry and no run stay absent.
 * Does not change `previous`.
 */
export function mergeResults(previous, runs, runUrl, { quarantined = [] } = {}) {
  const merged = structuredClone(previous ?? {});
  const held = new Set(quarantined);
  const latest = runs.filter((r) => r.frameworkVersion === VERIFIED_VERSION);
  for (const r of latest) if (r.result === 'skip') held.add(r.example);

  const added = latest
    .filter((r) => r.result === 'pass' || r.result === 'fail')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const byExample = Map.groupBy(added, (r) => r.example);
  for (const [example, results] of byExample) {
    const entry = merged[example] ?? { runs: [], verified: null };
    const fresh = results.map((r) => ({
      result: r.result,
      date: r.startedAt.slice(0, 10),
      frameworkVersion: r.resolvedVersion && r.resolvedVersion !== 'unknown' ? r.resolvedVersion : r.frameworkVersion,
      runUrl,
    }));
    entry.runs = [...fresh, ...entry.runs].slice(0, KEPT_RUNS);
    merged[example] = entry;
  }

  for (const [example, entry] of Object.entries(merged)) {
    const pass = entry.runs.find((r) => r.result === 'pass');
    entry.verified = pass && !held.has(example) ? { date: pass.date, frameworkVersion: pass.frameworkVersion, runUrl: pass.runUrl } : null;
  }
  return Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Returns the badge for one Results entry: an SVG reading
 * `Verified · <date> · Framework <version>`, or a 1×1 transparent SVG when
 * the example is not verified.
 */
export function renderBadge(entry) {
  if (!entry?.verified) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"/>\n';
  }
  const { date, frameworkVersion } = entry.verified;
  const text = escapeXml(`Verified · ${date} · Framework ${frameworkVersion}`);
  // Verdana 11px averages about 6.5px per character; 10px padding each side.
  const width = Math.round(`Verified · ${date} · Framework ${frameworkVersion}`.length * 6.5 + 20);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${text}">`,
    `<title>${text}</title>`,
    `<rect width="${width}" height="20" rx="3" fill="#2e7d32"/>`,
    `<text x="${width / 2}" y="14" fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">${text}</text>`,
    '</svg>',
    '',
  ].join('\n');
}

/** Returns the badge's path in the published tree: `badges/<example dir>.svg`, nested directories kept. */
export function badgePath(dir) {
  if (!isSafeDir(dir)) throw new Error(`not a safe example directory: ${JSON.stringify(dir)}`);
  return `badges/${dir}.svg`;
}

/** True for a relative example directory without empty, `.` or `..` segments. */
export function isSafeDir(dir) {
  return typeof dir === 'string' && SAFE_DIR.test(dir);
}

function escapeXml(text) {
  return text.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
}
