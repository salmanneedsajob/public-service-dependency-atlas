import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const recordTypeCollections = new Map([
  ['agency', 'agencies'],
  ['scenario', 'scenarios'],
  ['source', 'sources'],
  ['claim', 'claims'],
  ['node', 'nodes'],
  ['edge', 'edges'],
  ['roadblock', 'roadblocks'],
  ['journey', 'journeys'],
]);
const sidecarRecordTypes = new Set(['expectation', 'expectations', 'portal']);

function canonicalRecordType(recordType) {
  return recordType === 'expectations' ? 'expectation' : recordType;
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function decodePointer(pointer) {
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) throw new Error('fieldPath must be a JSON Pointer beginning with /.');
  if (pointer === '/') return [];
  return pointer.slice(1).split('/').map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'));
}

function getCollection(ledger, correction) {
  if (correction.recordType === 'meta') return { collectionName: 'meta', records: [ledger] };
  const collectionName = recordTypeCollections.get(correction.recordType);
  if (!collectionName) throw new Error(`Unsupported recordType ${correction.recordType}.`);
  return { collectionName, records: ledger[collectionName] };
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
  for (const field of ['recordType', 'recordId', 'fieldPath', 'old', 'new', 'reason', 'support']) {
    if (correction[field] === undefined) throw new Error(`Correction is missing ${field}.`);
  }
  if (!correction.reason?.trim()) throw new Error('Correction reason must be non-empty.');
  if (correction.support === null || typeof correction.support !== 'object') throw new Error('Correction support must be an object.');
  decodePointer(correction.fieldPath);
}

function asLimitation(correction, error) {
  return {
    id: correction?.id ?? null,
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
  if (correction.recordType === 'meta') {
    const { target, key } = getTarget(ledger.meta, correction.fieldPath);
    const actual = readValue(target, key);
    if (!deepEqual(actual, correction.old)) throw new Error(`Drift at ${correction.fieldPath}: expected ${JSON.stringify(correction.old)}, found ${JSON.stringify(actual)}.`);
    if (correction.new === null) deleteValue(target, key);
    else replaceValue(target, key, structuredClone(correction.new));
    return;
  }
  const { collectionName, records } = getCollection(ledger, correction);
  const recordIndex = records.findIndex((item) => item.id === correction.recordId);
  if (correction.fieldPath === '/') {
    if (correction.old === null) {
      if (recordIndex !== -1) throw new Error(`${correction.recordType} record ${correction.recordId} already exists.`);
      if (correction.new === null || correction.new.id !== correction.recordId) throw new Error('A whole-record addition must supply a matching record ID.');
      records.push(structuredClone(correction.new));
      return;
    }
    if (recordIndex === -1) throw new Error(`${correction.recordType} record ${correction.recordId} does not exist.`);
    if (!deepEqual(records[recordIndex], correction.old)) throw new Error(`Drift at ${collectionName}/${correction.recordId}: expected ${JSON.stringify(correction.old)}, found ${JSON.stringify(records[recordIndex])}.`);
    if (correction.new === null) records.splice(recordIndex, 1);
    else {
      if (correction.new.id !== correction.recordId) throw new Error('A whole-record replacement must preserve the record ID.');
      records[recordIndex] = structuredClone(correction.new);
    }
    return;
  }
  if (recordIndex === -1) throw new Error(`${correction.recordType} record ${correction.recordId} does not exist.`);
  const record = records[recordIndex];
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

function applySidecarCorrection(sidecar, correction) {
  validateCorrection(correction);
  const isDocumentExpectation = correction.recordType === 'expectations';
  const record = isDocumentExpectation
    ? sidecar
    : correction.recordType === 'expectation'
      ? sidecar.cells?.[correction.recordId]
    : sidecar.portals?.find((portal) => portal.portalId === correction.recordId);
  if (!record) throw new Error(`${correction.recordType} record ${correction.recordId} does not exist in its sidecar.`);
  if (correction.fieldPath === '/') {
    if (correction.recordType !== 'portal') throw new Error(`Whole-record ${correction.recordType} corrections are not supported.`);
    const recordIndex = sidecar.portals.findIndex((portal) => portal.portalId === correction.recordId);
    if (!deepEqual(sidecar.portals[recordIndex], correction.old)) throw new Error(`Drift at portals/${correction.recordId}.`);
    if (correction.new === null) sidecar.portals.splice(recordIndex, 1);
    else sidecar.portals[recordIndex] = structuredClone(correction.new);
    return;
  }
  const { target, key } = getTarget(record, correction.fieldPath);
  const actual = readValue(target, key);
  if (correction.old === null) {
    if (actual !== undefined) throw new Error(`Drift at ${correction.fieldPath}: expected no value, found ${JSON.stringify(actual)}.`);
    if (correction.new === null) throw new Error('A correction cannot add and delete the same value.');
    writeValue(target, key, structuredClone(correction.new));
  } else {
    if (actual === undefined || !deepEqual(actual, correction.old)) throw new Error(`Drift at ${correction.fieldPath}: expected ${JSON.stringify(correction.old)}, found ${JSON.stringify(actual)}.`);
    if (correction.new === null) deleteValue(target, key);
    else replaceValue(target, key, structuredClone(correction.new));
  }
}

function applyCorrections(ledger, corrections, sidecars = {}) {
  const working = structuredClone(ledger);
  const workingSidecars = Object.fromEntries(Object.entries(sidecars).map(([type, sidecar]) => [type, structuredClone(sidecar)]));
  const applied = [];
  const unapplied = [];
  for (const correction of corrections) {
    try {
      if (sidecarRecordTypes.has(correction.recordType)) {
        const sidecar = workingSidecars[canonicalRecordType(correction.recordType)];
        if (!sidecar) throw new Error(`No ${correction.recordType} sidecar was supplied.`);
        applySidecarCorrection(sidecar, correction);
      } else applyCorrection(working, correction);
      applied.push(correction);
    } catch (error) {
      unapplied.push(asLimitation(correction, error));
    }
  }
  return { ledger: working, sidecars: workingSidecars, applied, unapplied };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function selfTest() {
  const ledger = { claims: [{ id: 'claim_sample', status: 'partial', labels: [] }], agencies: [], scenarios: [], sources: [], nodes: [], edges: [], roadblocks: [], journeys: [] };
  const corrections = [
    { recordType: 'claim', recordId: 'claim_sample', fieldPath: '/status', old: 'partial', new: 'verified', reason: 'Confirmed by the cited source.', support: { sourceIds: ['source_sample'] } },
    { recordType: 'claim', recordId: 'claim_sample', fieldPath: '/labels/-', old: null, new: 'audited', reason: 'Add audit marker.', support: { auditNote: 'Self-test.' } },
  ];
  const result = applyCorrections(ledger, corrections);
  if (result.unapplied.length || result.ledger.claims[0].status !== 'verified' || result.ledger.claims[0].labels[0] !== 'audited') throw new Error('Apply-audit self-test failed to apply corrections.');
  const drift = applyCorrections(ledger, [{ ...corrections[0], old: 'unknown' }]);
  if (drift.unapplied.length !== 1 || ledger.claims[0].status !== 'partial') throw new Error('Apply-audit self-test failed to reject drift atomically.');
  const rootCorrections = [
    { id: 'test-add', recordType: 'claim', recordId: 'claim_added', fieldPath: '/', old: null, new: { id: 'claim_added', status: 'partial' }, reason: 'Add a split claim.', support: { auditNote: 'Self-test.' } },
    { id: 'test-delete', recordType: 'claim', recordId: 'claim_sample', fieldPath: '/', old: { id: 'claim_sample', status: 'partial', labels: [] }, new: null, reason: 'Remove an unsupported claim.', support: { auditNote: 'Self-test.' } },
  ];
  const rootResult = applyCorrections(ledger, rootCorrections);
  if (rootResult.unapplied.length || rootResult.ledger.claims.length !== 1 || rootResult.ledger.claims[0].id !== 'claim_added') throw new Error('Apply-audit self-test failed whole-record corrections.');
  const sidecarResult = applyCorrections(ledger, [
    { recordType: 'expectation', recordId: 'cost', fieldPath: '/state', old: 'mentioned', new: 'stated', reason: 'A current fee is cited.', support: { auditNote: 'Self-test.' } },
    { recordType: 'portal', recordId: 'portal_sample', fieldPath: '/routeObservations/0/deadLinkCount', old: 0, new: 1, reason: 'A route link was observed dead.', support: { auditNote: 'Self-test.' } },
  ], {
    expectation: { cells: { cost: { state: 'mentioned' } } },
    portal: { portals: [{ portalId: 'portal_sample', routeObservations: [{ deadLinkCount: 0 }] }] },
  });
  if (sidecarResult.unapplied.length || sidecarResult.sidecars.expectation.cells.cost.state !== 'stated' || sidecarResult.sidecars.portal.portals[0].routeObservations[0].deadLinkCount !== 1) throw new Error('Apply-audit self-test failed sidecar corrections.');
  const documentSidecarResult = applyCorrections(
    { meta: { asOf: '2026-09-04' }, claims: [], agencies: [], scenarios: [], sources: [], nodes: [], edges: [], roadblocks: [], journeys: [] },
    [
      { recordType: 'meta', recordId: 'ignored', fieldPath: '/asOf', old: '2026-09-04', new: '2026-09-05', reason: 'Refresh the source access date.', support: { auditNote: 'Self-test.' } },
      { recordType: 'expectations', recordId: 'service_sample', fieldPath: '/cells/time/state', old: 'absent', new: 'stated', reason: 'A duration is cited.', support: { auditNote: 'Self-test.' } },
      { recordType: 'portal', recordId: 'portal_sample', fieldPath: '/', old: { portalId: 'portal_sample' }, new: null, reason: 'Remove an unsupported portal.', support: { auditNote: 'Self-test.' } },
    ],
    { expectation: { cells: { time: { state: 'absent' } } }, portal: { portals: [{ portalId: 'portal_sample' }] } },
  );
  if (documentSidecarResult.unapplied.length || documentSidecarResult.ledger.meta.asOf !== '2026-09-05' || documentSidecarResult.sidecars.expectation.cells.time.state !== 'stated' || documentSidecarResult.sidecars.portal.portals.length) throw new Error('Apply-audit self-test failed document sidecar or meta corrections.');
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
  const service = ledgerPath.split('/').at(-1).replace(/\.json$/u, '');
  const sidecars = {};
  for (const type of new Set([...sidecarRecordTypes].map(canonicalRecordType))) {
    if (!corrections.some((correction) => canonicalRecordType(correction.recordType) === type)) continue;
    const correction = corrections.find((candidate) => canonicalRecordType(candidate.recordType) === type);
    const targetPath = correction.targetFile ?? `ledger/${type === 'expectation' ? 'expectations' : 'portals'}/${service}.json`;
    sidecars[type] = await readJson(targetPath);
    sidecars[type]._targetPath = targetPath;
  }
  const result = applyCorrections(ledger, corrections, sidecars);
  const report = { appliedCount: result.applied.length, unappliedLimitations: result.unapplied };
  console.log(JSON.stringify(report, null, 2));
  if (result.unapplied.length) {
    process.exitCode = 1;
  } else if (!dryRun) {
    await writeFile(ledgerPath, `${JSON.stringify(result.ledger, null, 2)}\n`);
    for (const [type, sidecar] of Object.entries(result.sidecars)) {
      const targetPath = sidecars[type]._targetPath;
      delete sidecar._targetPath;
      await writeFile(targetPath, `${JSON.stringify(sidecar, null, 2)}\n`);
    }
  }
}

export { applyCorrections };
