import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';

const projectRoot = process.cwd();
const inputPath = path.resolve(projectRoot, process.env.LEDGER_PATH ?? 'ledger/research.json');
const schemaPath = path.resolve(projectRoot, 'ledger/schema.json');
const outputPath = path.resolve(projectRoot, 'public/data/ledger.json');
const serviceOutputPath = path.resolve(projectRoot, 'public/data/bescom.json');
const expectationsDirectory = path.resolve(projectRoot, 'ledger/expectations');
const expectationsOutputDirectory = path.resolve(projectRoot, 'public/data/expectations');

const [rawInput, rawSchema] = await Promise.all([
  readFile(inputPath, 'utf8'),
  readFile(schemaPath, 'utf8'),
]);

const extension = path.extname(inputPath).toLowerCase();
const ledger = extension === '.yaml' || extension === '.yml' ? YAML.parse(rawInput) : JSON.parse(rawInput);
const schema = JSON.parse(rawSchema);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

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
  const expectationsSchema = JSON.parse(await readFile(path.resolve(expectationsDirectory, 'schema.json'), 'utf8'));
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
console.log(`Prepared ${path.relative(projectRoot, inputPath)} for the site.`);
