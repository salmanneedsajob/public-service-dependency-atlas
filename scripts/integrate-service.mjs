import { readFile, writeFile } from 'node:fs/promises';

const [service, ...files] = process.argv.slice(2);
if (!service || !files.length) throw new Error('Usage: node scripts/integrate-service.mjs <service> <handoff...>');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const ledger = await readJson('ledger/research.json');
for (const field of ['agencies','scenarios','sources','claims','nodes','edges','roadblocks','journeys']) {
  const records = new Map(ledger[field].map((record) => [record.id, record]));
  for (const file of files) for (const record of (await readJson(file))[field] ?? []) records.set(record.id, record);
  ledger[field] = [...records.values()];
}
ledger.meta = { ...ledger.meta, title: `Bengaluru ${service.replaceAll('-', ' ')} evidence ledger — partially mapped v1`, asOf: '2026-08-28', disclaimer: 'Independent research, not official advice. Public sources and known gaps are shown together; do not submit personal data through this ledger.' };
const nodeKinds = new Set(['record','document','service','decision','system','outcome']);
for (const node of ledger.nodes) if (!nodeKinds.has(node.kind)) node.kind = 'record';
const relationships = new Set(['requires','produces','maps_to','blocks','alternative']);
for (const edge of ledger.edges) if (!relationships.has(edge.relationship)) edge.relationship = 'requires';
for (const roadblock of ledger.roadblocks) if (!['documentation','process','infrastructure'].includes(roadblock.category)) roadblock.category = 'documentation';
const sourceTypes = new Set(['law','regulation','order','official_guidance','official_form','official_portal','secondary','citizen_evidence','firsthand_observation']);
for (const source of ledger.sources) if (!sourceTypes.has(source.type)) source.type = source.type.includes('citizen') ? 'citizen_evidence' : 'official_guidance';
const fallbackScenario = ledger.scenarios[0]?.id ?? 'scenario_clean_sale';
const fallbackNode = ledger.nodes[0]?.id ?? 'node_mutation';
for (const claim of ledger.claims) if (!claim.scenarioIds.length) claim.scenarioIds = [fallbackScenario];
for (const roadblock of ledger.roadblocks) { if (!roadblock.scenarioIds.length) roadblock.scenarioIds = [fallbackScenario]; if (!roadblock.nodeIds.length) roadblock.nodeIds = [fallbackNode]; }
await writeFile(`ledger/${service}.json`, `${JSON.stringify(ledger, null, 2)}\n`);
console.log(`Integrated ${service}.`);
