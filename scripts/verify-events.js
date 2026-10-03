#!/usr/bin/env node
// Inventories the domain-event contract by reading the code, not a document.
//
// Written because docs/diagram-language.md carried a hardcoded registry count
// that went stale by three, inside the paragraph warning against undercounting
// the registry. A number in prose cannot notice when it stops being true; this
// script can. Anything in the doc set that states a count, a publisher or a
// consumer should cite this command instead of the number.
//
//   node scripts/verify-events.js                    # human-readable inventory
//   node scripts/verify-events.js --markdown         # the tables, ready to paste
//   node scripts/verify-events.js --strict           # exit 1 on contract drift
//   node scripts/verify-events.js --pill <name>      # may this event be drawn?
//
// The two exit codes answer different questions and are deliberately not merged.
// --strict is a CI gate on contract integrity: the API references a name the
// shared contract does not declare. --pill is a lookup for one event, for the
// diagram rule that a pill needs a publish site (diagram-language.md §3). A name
// that is declared but never published fails --pill and passes --strict, which
// is correct: it breaks no runtime, and it is still undrawable.
//
// No dependencies, no build step: it must run before anything is installed.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(REPO_ROOT, 'packages/shared/src/events/domain-event.ts');
const API_SOURCE_ROOT = path.join(REPO_ROOT, 'packages/api/src');

// How far below a publish call to look for its `name:` property. Six lines
// covers `publishWithin(manager, {` followed by a multi-line payload; anchoring
// on the call is what keeps `'Contract.pdf'` and `'NDA.pdf'` out of the results,
// which a bare /'\w+\.\w+'/ sweep does not.
const NAME_LOOKAHEAD_LINES = 6;

function readRegistryNames() {
  const source = fs.readFileSync(REGISTRY_FILE, 'utf8');
  const block = source.match(/DOMAIN_EVENT_NAMES = \[([\s\S]*?)\] as const/);
  if (!block) {
    throw new Error(`Could not find DOMAIN_EVENT_NAMES in ${REGISTRY_FILE}`);
  }
  return [...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

function collectSourceFiles(directory) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectSourceFiles(full));
    } else if (
      entry.name.endsWith('.ts') &&
      !entry.name.includes('.spec.') &&
      !full.includes(`${path.sep}migrations${path.sep}`)
    ) {
      found.push(full);
    }
  }
  return found;
}

function relative(file) {
  return path.relative(REPO_ROOT, file).split(path.sep).join('/');
}

// Publish sites, keyed by event name. A name is only recorded when it sits
// inside a `publisher.publish(...)` / `publishWithin(...)` call — a registry
// entry, a spec file or a consumer registration is not a publisher (§3).
function findPublishers(files) {
  const byEvent = new Map();
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!/publisher\.publish(Within)?\(/.test(line)) {
        return;
      }
      const limit = Math.min(index + NAME_LOOKAHEAD_LINES, lines.length);
      for (let cursor = index; cursor < limit; cursor += 1) {
        const named = lines[cursor].match(/name:\s*'([^']+)'/);
        if (named) {
          const sites = byEvent.get(named[1]) ?? [];
          sites.push(`${relative(file)}:${cursor + 1}`);
          byEvent.set(named[1], sites);
          return;
        }
      }
    });
  }
  return byEvent;
}

// Consumer registrations. A consumer proves someone listens, never that anyone
// fires — the two lists are kept separate for exactly that reason.
function findConsumers(files) {
  const byEvent = new Map();
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      const registered = line.match(/\.register\(\s*'([^']+)'/);
      if (!registered) {
        return;
      }
      const sites = byEvent.get(registered[1]) ?? [];
      sites.push(`${relative(file)}:${index + 1}`);
      byEvent.set(registered[1], sites);
    });
  }
  return byEvent;
}

function main() {
  const wantsMarkdown = process.argv.includes('--markdown');
  const isStrict = process.argv.includes('--strict');
  const pillFlag = process.argv.indexOf('--pill');
  const pillName = pillFlag === -1 ? null : process.argv[pillFlag + 1];

  if (pillFlag !== -1 && !pillName) {
    console.error('--pill needs an event name, e.g. --pill leave.approved');
    return 2;
  }

  const names = readRegistryNames();
  const files = collectSourceFiles(API_SOURCE_ROOT);
  const publishers = findPublishers(files);
  const consumers = findConsumers(files);

  const published = names.filter((name) => publishers.has(name));
  const unpublished = names.filter((name) => !publishers.has(name));
  const consumed = names.filter((name) => consumers.has(name));
  const unregistered = [...publishers.keys()].filter((name) => !names.includes(name));
  const phantomConsumers = [...consumers.keys()].filter((name) => !names.includes(name));
  const registrationCount = [...consumers.values()].reduce((total, s) => total + s.length, 0);

  // One event, one answer, no interpretation required. The rule this serves
  // ("a pill is justified only by a publish site") used to be checked with a
  // grep that also matched the registry entry and every consumer registration,
  // leaving the reader to filter those out from prose. A check whose
  // correctness depends on the reader reading carefully is the weak kind.
  if (pillName) {
    if (!names.includes(pillName)) {
      console.log(`${pillName}: NOT DECLARED — absent from DOMAIN_EVENT_NAMES. Do not draw.`);
      return 1;
    }
    const sites = publishers.get(pillName);
    if (!sites) {
      console.log(`${pillName}: DECLARED BUT NEVER PUBLISHED — no publish site in packages/api/src.`);
      console.log('  Do not draw. A pill for a never-fired event manufactures a seam that does not exist.');
      return 1;
    }
    console.log(`${pillName}: DRAWABLE — published at`);
    for (const site of sites) {
      console.log(`  ${site}`);
    }
    const listeners = consumers.get(pillName) ?? [];
    console.log(
      listeners.length === 0
        ? '  No consumer. Pill only — band 3 gets no consequence step for this event.'
        : `  ${listeners.length} consumer(s) — a consequence step in band 3 is justified:`,
    );
    for (const site of listeners) {
      console.log(`    ${site}`);
    }
    return 0;
  }

  if (wantsMarkdown) {
    console.log('| Event | Publisher |');
    console.log('|---|---|');
    for (const name of published) {
      console.log(`| \`${name}\` | ${publishers.get(name).map((s) => `\`${s}\``).join(', ')} |`);
    }
    console.log('');
    console.log('| Event | Consumer |');
    console.log('|---|---|');
    for (const name of consumed) {
      for (const site of consumers.get(name)) {
        console.log(`| \`${name}\` | \`${site}\` |`);
      }
    }
    return 0;
  }

  console.log(`Registry:       ${names.length} events   (${relative(REGISTRY_FILE)})`);
  console.log(`Published:      ${published.length}`);
  console.log(`Consumed:       ${consumed.length} events over ${registrationCount} registrations`);
  console.log('');

  console.log('PUBLISHED');
  for (const name of published) {
    console.log(`  ${name.padEnd(34)}${publishers.get(name).join('  |  ')}`);
  }

  if (unpublished.length > 0) {
    console.log('');
    console.log('NO PUBLISHER — declared and typed, never fired. Not drawable in any diagram.');
    for (const name of unpublished) {
      console.log(`  ${name}`);
    }
  }

  console.log('');
  console.log('CONSUMED — the only real runtime couplings; everything else is emitted and unheard.');
  for (const name of consumed) {
    console.log(`  ${name.padEnd(34)}${consumers.get(name).join('  |  ')}`);
  }

  // Drift: a publisher or consumer for a name the shared contract does not
  // declare. Unlike an unpublished event, which is a known and legible state,
  // this means the contract and the code disagree about what exists.
  const hasDrift = unregistered.length > 0 || phantomConsumers.length > 0;
  if (hasDrift) {
    console.log('');
    console.log('DRIFT — referenced in the API but absent from DOMAIN_EVENT_NAMES:');
    for (const name of unregistered) {
      console.log(`  published: ${name}  ${publishers.get(name).join(' | ')}`);
    }
    for (const name of phantomConsumers) {
      console.log(`  consumed:  ${name}  ${consumers.get(name).join(' | ')}`);
    }
  }

  return isStrict && hasDrift ? 1 : 0;
}

process.exit(main());
