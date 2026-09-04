import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const recordTypes = new Set(['agencies', 'scenarios', 'sources', 'claims', 'nodes', 'edges', 'roadblocks', 'journeys']);

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function decodePointer(pointer) {
  if (typeof pointer !== 'string' || !pointer.startsWith('/') || pointer === '/') throw new Error('fieldPath must be a non-root JSON Pointer beginning with /.');
  return pointer.slice(1).split('/').map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'));
}

function getRecord(ledger, correction) {
  if (!recordTypes.has(correction.recordType)) throw new Error(`Unsupported recordType ${correction.recordType}.`);
  const record = ledger[correction.recordType]?.find((item) => item.id === correction.recordId);
  if (!record) throw new Error(`${correction.recordType} record ${correction.recordId} does not exist.`);
  return record;
}

function getTarget(record, fieldPath) {
  const parts = decodePointer(fieldPath);
  let target = record;
  for (const part of parts.slice(0, -1)) {
    if (target === null || typeof target !== 'object' || !(part in target)) throw new Error(`fieldPath ${fieldPath} does not resolve.`);
    target = target[part];
  }
  const key = parts.at(-1);
  if (target === null || typeof target !== 'object') throw new Error(`fieldPath ${fieldPath} has no mutable parent.`);
  return { target, key };
}

function readValue(target, key) {
  if (Array.isArray(target)) {
    if (key === '-') return undefined;
    if (!/^\d+$/u.test(key) || Number(key) >= target.length) return undefined;
    return target[Number(key)];
  }
  return Object.hasOwn(target, key) ? target[key] : undefined;
}

function writeValue(target, key, value) {
  if (Array.isArray(target)) {
    if (key === '-') target.push(value);
    else if (/^\d+$/u.test(key) && Number(key) <= target.length) target.splice(Number(key), 0, value);
    else throw new Error(`Array index ${key} is not valid for an addition.`);
  } else target[key] = value;
}

function replaceValue(target, key, value) {
  if (Array.isArray(target)) {
    if (!/^\d+$/u.test(key) || Number(key) >= target.length) throw new Error(`Array index ${key} is not valid for a replacement.`);
    target[Number(key)] = value;
  } else target[key] = value;
}

function deleteValue(target, key) {
  if (Array.isArray(target)) {
    if (!/^\d+$/u.test(key) || Number(key) >= target.length) throw new Error(`Array index ${key} is not valid for a deletion.`);
    target.splice(Number(key), 1);
  } else delete target[key];
}

function validateCorrection(correction) {
  for (const field of ['recordType', 'recordId', 'fieldPath', 'reason', 'support']) {
    if (correction[field] === undefined) throw new Error(`Correction is missing ${field}.`);
  }
  if (!correction.reason?.trim()) throw new Error('Correction reason must be non-empty.');
  if (correction.support === null || typeof correction.support !== 'object') throw new Error('Correction support must be an object.');
  decodePointer(correction.fieldPath);
}

function asLimitation(correction, error) {
  return {
    status: 'unapplied',
    recordType: correction?.recordType ?? null,
    recordId: correction?.recordId ?? null,
    fieldPath: correction?.fieldPath ?? null,
    reason: correction?.reason ?? null,
    support: correction?.support ?? null,
    limitation: `Audit correction was not applied: ${error.message}`,
  };
}

function applyCorrection(ledger, correction) {
  validateCorrection(correction);
  const record = getRecord(ledger, correction);
  const { target, key } = getTarget(record, correction.fieldPath);
  const actual = readValue(target, key);
  const expected = correction.old;
  if (expected === null) {
    if (actual !== undefined) throw new Error(`Drift at ${correction.fieldPath}: expected no value, found ${JSON.stringify(actual)}.`);
    if (correction.new === null) throw new Error('A correction cannot add and delete the same value.');
    writeValue(target, key, structuredClone(correction.new));
  } else {
    if (actual === undefined || !deepEqual(actual, expected)) throw new Error(`Drift at ${correction.fieldPath}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
    if (correction.new === null) deleteValue(target, key);
    else replaceValue(target, key, structuredClone(correction.new));
  }
}

function applyCorrections(ledger, corrections) {
  const working = structuredClone(ledger);
  const applied = [];
  const unapplied = [];
  for (const correction of corrections) {
    try {
      applyCorrection(working, correction);
      applied.push(correction);
    } catch (error) {
      unapplied.push(asLimitation(correction, error));
    }
  }
  return { ledger: working, applied, unapplied };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function selfTest() {
  const ledger = { claims: [{ id: 'claim_sample', status: 'partial', labels: [] }], agencies: [], scenarios: [], sources: [], nodes: [], edges: [], roadblocks: [], journeys: [] };
  const corrections = [
    { recordType: 'claims', recordId: 'claim_sample', fieldPath: '/status', old: 'partial', new: 'verified', reason: 'Confirmed by the cited source.', support: { sourceIds: ['source_sample'] } },
    { recordType: 'claims', recordId: 'claim_sample', fieldPath: '/labels/-', old: null, new: 'audited', reason: 'Add audit marker.', support: { auditNote: 'Self-test.' } },
  ];
  const result = applyCorrections(ledger, corrections);
  if (result.unapplied.length || result.ledger.claims[0].status !== 'verified' || result.ledger.claims[0].labels[0] !== 'audited') throw new Error('Apply-audit self-test failed to apply corrections.');
  const drift = applyCorrections(ledger, [{ ...corrections[0], old: 'unknown' }]);
  if (drift.unapplied.length !== 1 || ledger.claims[0].status !== 'partial') throw new Error('Apply-audit self-test failed to reject drift atomically.');
  console.log('Generic audit application self-test verified.');
}

const args = process.argv.slice(2);
if (args[0] === '--self-test') selfTest();
else {
  const [ledgerPath, correctionsPath] = args;
  const dryRun = args.includes('--dry-run');
  if (!ledgerPath || !correctionsPath) throw new Error('Usage: node scripts/apply-audit.mjs <ledger.json> <corrections.json> [--dry-run]');
  const [ledger, correctionDocument] = await Promise.all([readJson(ledgerPath), readJson(correctionsPath)]);
  const corrections = Array.isArray(correctionDocument) ? correctionDocument : correctionDocument.corrections;
  if (!Array.isArray(corrections)) throw new Error('Corrections JSON must be an array or an object with a corrections array.');
  const result = applyCorrections(ledger, corrections);
  const report = { appliedCount: result.applied.length, unappliedLimitations: result.unapplied };
  console.log(JSON.stringify(report, null, 2));
  if (result.unapplied.length) {
    process.exitCode = 1;
  } else if (!dryRun) {
    await writeFile(ledgerPath, `${JSON.stringify(result.ledger, null, 2)}\n`);
  }
}

export { applyCorrections };
