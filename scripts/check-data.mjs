#!/usr/bin/env node
/* Data integrity checks that the build cannot make.
 *
 *   node scripts/check-data.mjs
 *
 * Three things went wrong at once while opening IT Quiz, Ludo and the
 * Hackathon, and none of them was a syntax error or a type error, so nothing
 * caught them:
 *
 *   - A duplicate key. An entry ended up with `stage` twice. JavaScript takes
 *     the last one silently, so the file said 'announced' where you read it and
 *     meant 'open' where it ran.
 *   - A registerHref pointing at another event's form. CTF showed a register
 *     button that opened the Hackathon form.
 *   - A status that disagreed with its stage, which is what the dev-time guard
 *     in routes.js warns about — but only in development, and only if someone
 *     is watching the console.
 *
 * This runs on the text, so it sees the duplicate the interpreter hides.
 */
import fs from 'node:fs';

const read = (f) => fs.readFileSync(f, 'utf8');
const problems = [];

/* Split a data file into its top-level entries. */
const entries = (src) => {
  const starts = [...src.matchAll(/\n  \{\n/g)].map((m) => m.index);
  starts.push(src.length);
  const out = [];
  for (let i = 0; i < starts.length - 1; i += 1) {
    const seg = src.slice(starts[i], starts[i + 1]);
    const slug = seg.match(/slug: '([a-z-]+)'/);
    const id = seg.match(/id: '([a-z-]+)'/);
    if (slug || id) out.push({ key: (slug || id)[1], seg, at: starts[i] });
  }
  return out;
};

const lineOf = (src, index) => src.slice(0, index).split('\n').length;

/* 1. Duplicate keys inside one entry. */
for (const file of ['src/data/events.js', 'src/data/gaming.js', 'src/data/content.js']) {
  const src = read(file);
  for (const { key, seg, at } of entries(src)) {
    const counts = {};
    for (const m of seg.matchAll(/^\s{4}(\w+):/gm)) {
      counts[m[1]] = (counts[m[1]] || 0) + 1;
    }
    for (const [k, n] of Object.entries(counts)) {
      if (n > 1) {
        problems.push(
          `${file}:${lineOf(src, at)}  "${key}" declares \`${k}\` ${n} times — JavaScript keeps the last one silently`
        );
      }
    }
  }
}

/* 2. A registerHref that names a different event. */
{
  const src = read('src/data/content.js');
  for (const { key, seg, at } of entries(src)) {
    const href = seg.match(/registerHref: ROUTES\.\w+\('([a-z-]+)'\)/);
    const slug = seg.match(/slug: '([a-z-]+)'/);
    if (href && slug && href[1] !== slug[1]) {
      problems.push(
        `src/data/content.js:${lineOf(src, at)}  "${key}" has slug '${slug[1]}' but registerHref points at '${href[1]}'`
      );
    }
  }
}

/* 3. status vs stage — the same rule routes.js warns about in development,
      checked here so CI sees it too. */
{
  const stages = {};
  for (const file of ['src/data/events.js', 'src/data/gaming.js']) {
    const src = read(file);
    for (const { key, seg } of entries(src)) {
      const stage = seg.match(/\n {4}stage: '(\w+)'/);
      if (stage) stages[key] = stage[1];
    }
  }

  const expected = { open: 'open', published: 'live', announced: 'coming-soon' };
  const src = read('src/data/content.js');
  for (const { key, seg, at } of entries(src)) {
    const slug = seg.match(/slug: '([a-z-]+)'/);
    const status = seg.match(/status: '([a-z-]+)'/);
    if (!slug || !status) continue;
    const stage = stages[slug[1]];
    if (!stage) continue;
    if (expected[stage] !== status[1]) {
      problems.push(
        `src/data/content.js:${lineOf(src, at)}  "${key}" is status '${status[1]}' but its data says stage '${stage}' (expected status '${expected[stage]}')`
      );
    }
  }
}

if (problems.length === 0) {
  console.log('Data checks passed.');
  process.exit(0);
}

console.error(`${problems.length} problem(s):\n`);
problems.forEach((p) => console.error('  ' + p));
process.exit(1);
