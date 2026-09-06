import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';
import { generateJurisdictionScorecards, generateScorecards } from '../benchmark/scripts/generate-scorecards.mjs';

const projectRoot = process.cwd();
const inputPath = path.resolve(projectRoot, process.env.LEDGER_PATH ?? 'ledger/research.json');
const schemaPath = path.resolve(projectRoot, 'benchmark/schemas/ledger.json');
const manifestPath = path.resolve(projectRoot, 'ledger/services.manifest.json');
const manifestSchemaPath = path.resolve(projectRoot, 'benchmark/schemas/manifest.json');
const outputPath = path.resolve(projectRoot, 'public/data/ledger.json');
const serviceOutputPath = path.resolve(projectRoot, 'public/data/bescom.json');
const expectationsDirectory = path.resolve(projectRoot, 'ledger/expectations');
const expectationsOutputDirectory = path.resolve(projectRoot, 'public/data/expectations');
const portalsDirectory = path.resolve(projectRoot, 'ledger/portals');
const portalsOutputDirectory = path.resolve(projectRoot, 'public/data/portals');

// Some earlier hand-authored portal sidecars predate the structured route
// observation schema. Export a schema-shaped copy while preserving those source
// records unchanged. A status of 0 denotes an unrecorded legacy redirect or
// final response, rather than an observed HTTP status.
function normalizePortalSidecarForExport(sidecar) {
  return {
    ...sidecar,
    portals: sidecar.portals.map((portal) => ({
      ...portal,
      routeObservations: portal.routeObservations.map((route) => ({
        ...route,
        redirects: route.redirects.map((redirect) => {
          if (typeof redirect !== 'string') return redirect;
          const arrowIndex = redirect.indexOf(' -> ');
          return {
            status: 0,
            to: arrowIndex === -1 ? redirect : redirect.slice(arrowIndex + 4),
          };
        }),
        finalUrl: route.finalUrl ?? route.entryUrl,
        finalStatus: route.finalStatus ?? 0,
        authenticationPrerequisites: Array.isArray(route.authenticationPrerequisites)
          ? route.authenticationPrerequisites.join(' ')
          : route.authenticationPrerequisites,
      })),
    })),
  };
}

const [rawInput, rawSchema, rawManifest, rawManifestSchema] = await Promise.all([
  readFile(inputPath, 'utf8'),
  readFile(schemaPath, 'utf8'),
  readFile(manifestPath, 'utf8'),
  readFile(manifestSchemaPath, 'utf8'),
]);

const extension = path.extname(inputPath).toLowerCase();
const ledger = extension === '.yaml' || extension === '.yml' ? YAML.parse(rawInput) : JSON.parse(rawInput);
const schema = JSON.parse(rawSchema);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const validateManifest = ajv.compile(JSON.parse(rawManifestSchema));
if (!validateManifest(JSON.parse(rawManifest))) throw new Error(`services.manifest.json does not satisfy benchmark manifest schema: ${(validateManifest.errors ?? []).map((error) => `${error.instancePath} ${error.message}`).join('; ')}`);

if (!validate(ledger)) {
  const errors = (validate.errors ?? [])
    .map((error) => `${error.instancePath || '/'} ${error.message}`)
    .join('\n');
  throw new Error(`Ledger does not satisfy schema v1.0.0:\n${errors}`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
const serializedLedger = `${JSON.stringify(ledger, null, 2)}\n`;
await Promise.all([writeFile(outputPath, serializedLedger), writeFile(serviceOutputPath, serializedLedger)]);
const serviceLedgers = new Map();
for (const filename of (await readdir(path.resolve(projectRoot, 'ledger'))).filter((name) => !['research.json','example.json','demo.synthetic.json','schema.json','services.manifest.json'].includes(name) && name.endsWith('.json'))) {
  const serviceLedger = JSON.parse(await readFile(path.resolve(projectRoot, 'ledger', filename), 'utf8'));
  if (!validate(serviceLedger)) throw new Error(`${filename} does not satisfy schema: ${(validate.errors ?? []).map((error) => `${error.instancePath} ${error.message}`).join('; ')}`);
  serviceLedgers.set(path.basename(filename, '.json'), serviceLedger);
  await writeFile(path.resolve(projectRoot, 'public/data', filename), `${JSON.stringify(serviceLedger, null, 2)}\n`);
}
try {
  const expectationsSchema = JSON.parse(await readFile(path.resolve(projectRoot, 'benchmark/schemas/expectations.json'), 'utf8'));
  const validateExpectations = ajv.compile(expectationsSchema);
  await mkdir(expectationsOutputDirectory, { recursive: true });
  for (const filename of (await readdir(expectationsDirectory)).filter((name) => name.endsWith('.json') && name !== 'schema.json')) {
    const sidecar = JSON.parse(await readFile(path.resolve(expectationsDirectory, filename), 'utf8'));
    if (!validateExpectations(sidecar)) throw new Error(`${filename} does not satisfy expectations schema: ${(validateExpectations.errors ?? []).map((error) => `${error.instancePath} ${error.message}`).join('; ')}`);
    const ledgerForService = serviceLedgers.get(sidecar.serviceId);
    if (!ledgerForService) throw new Error(`${filename} has no matching ledger for ${sidecar.serviceId}.`);
    const claimIds = new Set(ledgerForService.claims.map((claim) => claim.id));
    for (const [cell, value] of Object.entries(sidecar.cells)) for (const claimId of value.claimIds) if (!claimIds.has(claimId)) throw new Error(`${filename} ${cell} references unknown claim ${claimId}.`);
    await writeFile(path.resolve(expectationsOutputDirectory, filename), `${JSON.stringify(sidecar, null, 2)}\n`);
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
try {
  const portalsSchema = JSON.parse(await readFile(path.resolve(projectRoot, 'benchmark/schemas/portals.json'), 'utf8'));
  const validatePortals = ajv.compile(portalsSchema);
  await mkdir(portalsOutputDirectory, { recursive: true });
  for (const filename of (await readdir(portalsDirectory)).filter((name) => name.endsWith('.json') && name !== 'schema.json')) {
    const sidecar = normalizePortalSidecarForExport(JSON.parse(await readFile(path.resolve(portalsDirectory, filename), 'utf8')));
    if (!validatePortals(sidecar)) throw new Error(`${filename} does not satisfy portals schema: ${(validatePortals.errors ?? []).map((error) => `${error.instancePath} ${error.message}`).join('; ')}`);
    const ledgerForService = serviceLedgers.get(sidecar.serviceId);
    if (!ledgerForService) throw new Error(`${filename} has no matching ledger for ${sidecar.serviceId}.`);
    const sourceIds = new Set(ledgerForService.sources.map((source) => source.id));
    const evidenceIds = new Set([...sourceIds, ...ledgerForService.claims.map((claim) => claim.id)]);
    for (const portal of sidecar.portals) {
      for (const sourceId of portal.evidenceSourceIds) if (!sourceIds.has(sourceId)) throw new Error(`${filename} ${portal.portalId} references unknown source ${sourceId}.`);
      for (const route of portal.routeObservations) for (const evidenceId of route.evidenceIds) if (!evidenceIds.has(evidenceId)) throw new Error(`${filename} ${route.routeId} references unknown evidence ${evidenceId}.`);
    }
    await writeFile(path.resolve(portalsOutputDirectory, filename), `${JSON.stringify(sidecar, null, 2)}\n`);
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await generateScorecards();
await generateJurisdictionScorecards();
console.log(`Prepared ${path.relative(projectRoot, inputPath)} for the site.`);
