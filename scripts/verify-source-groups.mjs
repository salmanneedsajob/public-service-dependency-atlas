import { readFile, readdir } from 'node:fs/promises';

const ledgerFiles = (await readdir('ledger'))
  .filter((file) => file.endsWith('.json') && !['schema.json', 'example.json', 'demo.synthetic.json'].includes(file));

function isCitizenSource(source) {
  return source.type === 'citizen_evidence' || /(?:^|\.)reddit\.com$/i.test(new URL(source.url).hostname);
}

function isGeneralReference(source) {
  if (/^General-site reference\b/i.test(source.title)) return true;
  const path = new URL(source.url).pathname.replace(/\/$/, '');
  return !path || /\/(?:home|landing-page|main|index(?:\.html)?)$/i.test(path);
}

function groupSources(sources) {
  const byUrl = new Map();
  for (const source of sources) byUrl.set(source.url, [...(byUrl.get(source.url) ?? []), source]);
  const groups = { specific: [], general: [], citizen: [] };
  for (const [url, entries] of byUrl) {
    const kind = entries.every(isCitizenSource) ? 'citizen' : entries.every(isGeneralReference) ? 'general' : 'specific';
    groups[kind].push({ url, entries });
  }
  return groups;
}

let displayedFiles = 0;
for (const file of ledgerFiles) {
  const ledger = JSON.parse(await readFile(`ledger/${file}`, 'utf8'));
  const groups = groupSources(ledger.sources ?? []);
  const displayed = Object.values(groups).flat();
  const urls = new Set((ledger.sources ?? []).map((source) => source.url));
  if (displayed.length !== urls.size) throw new Error(`${file}: every URL must collapse to one displayed source.`);
  if (new Set(displayed.map((source) => source.url)).size !== displayed.length) throw new Error(`${file}: a displayed source URL repeats.`);
  if (groups.citizen.some((group) => !group.entries.every(isCitizenSource))) throw new Error(`${file}: citizen accounts may only contain citizen evidence.`);
  if (groups.general.some((group) => !group.entries.every(isGeneralReference))) throw new Error(`${file}: general references must be marked as general.`);
  displayedFiles += displayed.length;
}

const birth = JSON.parse(await readFile('ledger/birth-certificate.json', 'utf8'));
const birthGroups = groupSources(birth.sources);
if (birth.sources.length !== 18 || birthGroups.specific.length !== 1 || birthGroups.general.length !== 2 || birthGroups.citizen.length !== 3) {
  throw new Error('Birth-certificate grouping should expose 1 specific document, 2 general references, and 3 citizen accounts from 18 source records.');
}

console.log(`Source grouping verified: ${ledgerFiles.length} ledgers, ${displayedFiles} displayed URL-level sources; birth certificate is 1 document · 2 general references · 3 citizen accounts.`);
