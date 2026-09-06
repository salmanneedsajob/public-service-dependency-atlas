import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();
const scorecardsDirectory = path.join(projectRoot, 'public/data/scorecards');
const outputPath = path.join(scorecardsDirectory, 'jurisdiction-table.json');
const cells = ['cost', 'documents', 'eligibility', 'time', 'owner', 'after-submission'];

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function scorecardRow(scorecard, jurisdictionSlug, scorecardPath) {
  return {
    jurisdiction: scorecard.jurisdiction,
    jurisdictionSlug,
    serviceId: scorecard.serviceId,
    source: scorecard.source,
    comparable: scorecard.source === 'authored',
    statedCount: scorecard.statedCount,
    ...Object.fromEntries(cells.map((cell) => [cell, scorecard.cells[cell].state])),
    asOf: scorecard.asOf,
    scorecardPath,
    auditFile: scorecard.auditFile,
  };
}

function compareRows(left, right) {
  return left.serviceId.localeCompare(right.serviceId) || left.jurisdiction.localeCompare(right.jurisdiction);
}

function markdownTable(rows) {
  const headers = ['Jurisdiction', 'Jurisdiction slug', 'Service', 'Source', 'Comparable', 'Stated', 'Cost', 'Documents', 'Eligibility', 'Time', 'Owner', 'After submission', 'As of', 'Scorecard path', 'Audit file'];
  const line = (values) => `| ${values.map((value) => String(value ?? '').replaceAll('|', '\\|')).join(' | ')} |`;
  return [line(headers), line(headers.map(() => '--')), ...rows.map((row) => line([
    row.jurisdiction, row.jurisdictionSlug, row.serviceId, row.source, row.comparable,
    row.statedCount, row.cost, row.documents, row.eligibility, row.time, row.owner,
    row['after-submission'], row.asOf, row.scorecardPath, row.auditFile,
  ]))].join('\n');
}

async function listScorecardFiles() {
  const entries = await readdir(scorecardsDirectory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'jurisdiction-table.json') files.push({ file: path.join(scorecardsDirectory, entry.name), jurisdictionSlug: '', scorecardPath: `public/data/scorecards/${entry.name}` });
    if (!entry.isDirectory()) continue;
    for (const child of await readdir(path.join(scorecardsDirectory, entry.name), { withFileTypes: true })) {
      if (child.isFile() && child.name.endsWith('.json')) files.push({ file: path.join(scorecardsDirectory, entry.name, child.name), jurisdictionSlug: entry.name, scorecardPath: `public/data/scorecards/${entry.name}/${child.name}` });
    }
  }
  return files;
}

async function generateJurisdictionTable() {
  const files = await listScorecardFiles();
  const rows = (await Promise.all(files.map(async ({ file, jurisdictionSlug, scorecardPath }) => scorecardRow(await readJson(file), jurisdictionSlug, scorecardPath)))).sort(compareRows);
  await mkdir(scorecardsDirectory, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({ rows }, null, 2)}\n`);
  const table = markdownTable(rows);
  console.log(table);
  return rows;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await generateJurisdictionTable();

export { generateJurisdictionTable, markdownTable };
