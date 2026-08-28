import { readFile, readdir, writeFile } from 'node:fs/promises';

for (const filename of await readdir('research/audit')) {
  const match = filename.match(/^ind32-(.+)-audit\.md$/);
  if (!match) continue;
  const service = match[1];
  const ledgerPath = `ledger/${service}.json`;
  try {
    const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
    const audit = await readFile(`research/audit/${filename}`, 'utf8');
    const id = `roadblock_audit_${service.replaceAll('-', '_')}`;
    if (!ledger.roadblocks.some((item) => item.id === id)) ledger.roadblocks.push({
      id, title: 'Independent audit limitations', category: 'documentation',
      symptom: audit.replace(/^#[^\n]*\n*/,'').replace(/\n+/g, ' ').slice(0, 900),
      likelyCause: 'Evidence and schema boundaries identified by the single independent audit.',
      recovery: 'Read the cited evidence and retain Unknown or partial status where the public record stops.',
      ownerAgencyIds: [], nodeIds: [ledger.nodes[0]?.id ?? 'node_mutation'], scenarioIds: [ledger.scenarios[0]?.id ?? 'scenario_clean_sale'], claimIds: [], status: 'unknown',
    });
    await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  } catch { /* Audit may belong to an entry not yet materialized. */ }
}
