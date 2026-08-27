import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';

const projectRoot = process.cwd();
const inputPath = path.resolve(projectRoot, process.env.LEDGER_PATH ?? 'ledger/demo.synthetic.json');
const schemaPath = path.resolve(projectRoot, 'ledger/schema.json');
const outputPath = path.resolve(projectRoot, 'public/data/ledger.json');

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
await writeFile(outputPath, `${JSON.stringify(ledger, null, 2)}\n`);
console.log(`Prepared ${path.relative(projectRoot, inputPath)} for the site.`);
