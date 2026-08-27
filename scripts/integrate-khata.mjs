import { readFile, writeFile } from 'node:fs/promises';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const base = await readJson('ledger/research.json');
const handoffs = await Promise.all([
  readJson('research/handoffs/ind32-khata-official.json'),
  readJson('research/handoffs/ind32-khata-workflow.json'),
  readJson('research/handoffs/ind32-khata-citizen.json'),
]);

for (const field of ['agencies', 'scenarios', 'sources', 'claims', 'nodes', 'edges', 'roadblocks', 'journeys']) {
  const records = new Map(base[field].map((record) => [record.id, record]));
  for (const handoff of handoffs) for (const record of handoff[field] ?? []) records.set(record.id, record);
  base[field] = [...records.values()];
}
base.meta = {
  ...base.meta,
  title: 'Bengaluru khata transfer and mutation evidence ledger — audited candidate v1',
  asOf: '2026-08-28',
  disclaimer: 'Research aid, not official advice. It records public evidence and uncertainty about Bengaluru khata transfer and mutation; do not submit personal data through this ledger.',
};
await writeFile('ledger/khata.json', `${JSON.stringify(base, null, 2)}\n`);
console.log('Integrated khata handoffs into ledger/khata.json.');
