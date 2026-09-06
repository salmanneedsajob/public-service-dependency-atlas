import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { columns, score } from './score.mjs';

const projectRoot = process.cwd();
const jurisdiction = 'Bengaluru, Karnataka, India';
const outputDirectory = path.join(projectRoot, 'public/data/scorecards');
const auditFiles = {
  passport: 'research/audits/ind71-passport-audit.md',
  'aadhaar-address-update': 'research/audits/ind70-aadhaar-address-update-fee-audit.md',
  'property-tax-payment': 'research/audits/ind72-property-tax-payment-closeout-audit.md',
  'sale-deed-registration': 'research/audits/ind78-sale-deed-registration-audit.md',
  'occupancy-certificate': 'research/audits/ind77-occupancy-certificate-audit.md',
};

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function optionalJson(file) {
  try {
    await access(file);
    return readJson(file);
  } catch {
    return null;
  }
}

function reviewedExpectations(service, tags) {
  const reviewed = tags.services[service.reportServiceId ?? service.id]?.claims ?? {};
  const cells = Object.fromEntries(columns.map((column) => {
    const states = Object.values(reviewed).map((entry) => entry.reviewState?.[column]).filter(Boolean);
    const state = states.includes('stated') ? 'stated' : states.includes('mentioned') ? 'mentioned' : states.includes('absent') ? 'absent' : 'absent';
    return [column, { state, claimIds: [], searchedRoutes: [], note: 'State derived from reviewed expectation tags.' }];
  }));
  return { serviceId: service.id, primaryScenarioId: service.primaryScenarioId, cells };
}

async function generateScorecards() {
  const [manifest, tags, schema] = await Promise.all([
    readJson(path.join(projectRoot, 'ledger/services.manifest.json')),
    readJson(path.join(projectRoot, 'report/expectation-tags.json')),
    readJson(path.join(projectRoot, 'benchmark/schemas/scorecard.json')),
  ]);
  const services = manifest.services.filter((service) => service.published);
  await mkdir(outputDirectory, { recursive: true });
  const results = [];
  for (const service of services) {
    const ledgerPath = path.join(projectRoot, 'ledger', service.ledgerFile);
    const expectationPath = path.join(projectRoot, 'ledger/expectations', `${service.id}.json`);
    const portalPath = path.join(projectRoot, 'ledger/portals', `${service.id}.json`);
    const [ledger, authored, portals] = await Promise.all([readJson(ledgerPath), optionalJson(expectationPath), optionalJson(portalPath)]);
    const source = authored ? 'authored' : 'reviewed-regex';
    const expectations = authored ?? reviewedExpectations(service, tags);
    const scorecard = score({ ledger, expectations, portals, jurisdiction, source, auditFile: auditFiles[service.id] ?? null, schema });
    await writeFile(path.join(outputDirectory, `${service.id}.json`), `${JSON.stringify(scorecard, null, 2)}\n`);
    results.push(scorecard);
  }
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const results = await generateScorecards();
  console.log(`Generated ${results.length} Bengaluru scorecards.`);
}

export { generateScorecards, reviewedExpectations };
