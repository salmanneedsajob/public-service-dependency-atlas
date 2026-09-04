import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const protocolChecks = [
  'compound-claim',
  'duplicate-source',
  'grade-b-secondary',
  'grade-c-observed-form',
  'source-date-quality',
  'login-boundary-overclaim',
  'declared-scenario',
  'researched-no-source-route',
];

const visibleDateNote = /\b(?:visible[- ]date|published(?: on)?|dated|last[- ]updated)\b/i;
const datedOrArchived = /\b(?:stale|undated|outdated|archiv(?:e|ed))\b/i;
const limitation = /\b(?:limitation|not current|may be outdated|historical only)\b/i;
const archiveFailure = /\b(?:archive|wayback|internet archive)[^.]{0,80}\b(?:failed|failure|timed out|rejected|unsafe|http \d{3}|did not complete)\b/i;
const uncertainty = /\b(?:unknown|unclear|unobserved|not (?:publicly |fully )?(?:shown|known|verified|observed|established|attempted|opened|selected|entered)|not an? (?:observed|verified) (?:result|failure|outcome|signal)|cannot (?:be )?(?:checked|observed|verified)|outside (?:this )?scope|without (?:a )?(?:login|sign-in|authentication)|no (?:login|account|case data|personal data)[^.]{0,80}(?:was|were) (?:used|entered|requested)|no [^.]{0,80}case-specific (?:selection|determination)[^.]{0,80}(?:was|were) attempted|no [^.]{0,80}(?:was|were) selected)\b/i;
const loginBoundary = /\b(?:log ?in|sign ?in|authenticated|OTP|case[- ]specific|personal (?:data|account))\b/i;
const clauseVerb = /\b(?:is|are|was|were|says?|states?|shows?|lists?|instructs?|describes?|displays?|exposes?|identifies|warns?|reported|observed|did|does|do|calls?|requires?|includes?|selects?|sends?|refers?|referred|remained|generates?|can|may|must|will)\b/i;
const conjunction = /\b(?:and|or|while|but)\b/i;
const enumeration = /(?:^|\s)(?:[^,;.]{2,80},){2,}[^;.]{2,80}(?:\b(?:and|or)\b[^;.]{2,80})?/i;

function compoundReasons(text) {
  const reasons = [];
  const clauses = text.split(conjunction).map((clause) => clause.trim()).filter(Boolean);
  if (clauses.length >= 2 && clauses.filter((clause) => clauseVerb.test(clause)).length >= 2) {
    reasons.push('independent verb clauses joined by and, or, while, or but');
  }
  if (text.includes(';')) reasons.push('a semicolon');
  if (enumeration.test(text)) reasons.push('an enumeration of three or more items');
  if (text.length > 220) reasons.push(`text length ${text.length} exceeds 220 characters`);
  return reasons;
}

function findService(manifest, ledgerPath, explicitService) {
  if (explicitService) return manifest.services.find((service) => service.id === explicitService);
  const basename = path.basename(ledgerPath);
  return manifest.services.find((service) => service.ledgerFile === basename);
}

function lintLedger(ledger, service, handoff = {}) {
  const findings = [];
  const add = (check, recordId, message) => findings.push({ check, recordId, message });
  const sourcesById = new Map(ledger.sources.map((source) => [source.id, source]));

  for (const claim of ledger.claims) {
    const compound = compoundReasons(claim.text);
    if (compound.length) add('compound-claim', claim.id, `Claim must be atomic; it contains ${compound.join(', ')}.`);
    const sources = claim.sourceIds.map((id) => sourcesById.get(id)).filter(Boolean);
    if (claim.evidenceGrade === 'B' && sources.some((source) => source.type === 'secondary')) add('grade-b-secondary', claim.id, 'Grade B claim cites a secondary source.');
    if (claim.evidenceGrade === 'C' && claim.basis === 'observation' && sources.some((source) => source.type === 'official_form' && !datedOrArchived.test(source.notes ?? ''))) add('grade-c-observed-form', claim.id, 'Observed current official form must be Grade B, not C.');
    if (service) {
      const declared = new Set([service.primaryScenarioId, ...service.branchScenarioIds]);
      const unknown = claim.scenarioIds.filter((id) => !declared.has(id));
      if (unknown.length) add('declared-scenario', claim.id, `Claim uses undeclared scenario IDs: ${unknown.join(', ')}.`);
    }
    if (loginBoundary.test(`${claim.text} ${claim.notes ?? ''}`) && claim.status !== 'unknown' && !uncertainty.test(`${claim.text} ${claim.notes ?? ''}`)) add('login-boundary-overclaim', claim.id, 'Claim crosses a login or case-data boundary without recording uncertainty.');
  }

  const duplicateKeys = new Map();
  for (const source of ledger.sources) {
    const key = `${source.url}\u0000${source.accessedAt}`;
    const previous = duplicateKeys.get(key);
    if (previous) add('duplicate-source', source.id, `Duplicates ${previous} by URL and access date.`);
    else duplicateKeys.set(key, source.id);
    const notes = source.notes ?? '';
    if (!source.publishedAt && !visibleDateNote.test(notes)) add('source-date-quality', source.id, 'Source lacks publishedAt and a visible-date note.');
    if (datedOrArchived.test(notes) && !limitation.test(notes) && !archiveFailure.test(notes)) add('source-date-quality', source.id, 'Stale, undated, or archived source lacks a stated limitation.');
  }

  const searches = handoff.routeSearches ?? [];
  for (const node of ledger.nodes) {
    for (const field of node.researchedNoSourceFound ?? []) {
      const routeSearch = searches.find((search) => search.nodeId === node.id && search.field === field && (search.routeId || search.url) && search.searchNote);
      if (!routeSearch) add('researched-no-source-route', node.id, `${field} has researchedNoSourceFound without a matching documented public-route search.`);
    }
  }

  for (const scenario of ledger.scenarios) {
    if (!service) continue;
    const declared = new Set([service.primaryScenarioId, ...service.branchScenarioIds]);
    if (!declared.has(scenario.id)) add('declared-scenario', scenario.id, `Scenario is not declared for ${service.id} in the manifest.`);
  }

  const waivers = handoff.lintWaivers ?? [];
  const annotated = findings.map((finding) => {
    const waiver = waivers.find((item) => item.recordId === finding.recordId && item.check === finding.check && item.reason?.trim());
    return waiver ? { ...finding, waived: true, waiverReason: waiver.reason } : { ...finding, waived: false };
  });
  return { checks: protocolChecks, findings: annotated, unwaived: annotated.filter((finding) => !finding.waived) };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function runSelfTest() {
  const manifest = { services: [{ id: 'sample', ledgerFile: 'sample.json', primaryScenarioId: 'scenario_primary', branchScenarioIds: [] }] };
  const ledger = {
    sources: [{ id: 'source_sample', url: 'https://example.test/a', accessedAt: '2026-09-04', type: 'secondary', notes: 'Visible date: 2026-09-04.' }],
    claims: [{ id: 'claim_sample', text: 'The route requires identity proof, address proof, and a photo.', sourceIds: ['source_sample'], evidenceGrade: 'B', basis: 'observation', status: 'verified', scenarioIds: ['scenario_primary'], notes: '' }],
    nodes: [],
    scenarios: [{ id: 'scenario_primary' }],
  };
  const result = lintLedger(ledger, manifest.services[0]);
  if (!result.unwaived.some((finding) => finding.check === 'compound-claim') || !result.unwaived.some((finding) => finding.check === 'grade-b-secondary')) throw new Error('Pre-audit lint self-test did not detect required findings.');
  const ind71AuditSplitRegression = [
    'Passport Seva says the Passport Office decides whether police verification is required and says pre-passport verification is required in most cases.',
    'The public home page identifies the Ministry and exposes Login and Register handoffs, along with Quick Links labelled Apply, Track, and Feedback.',
    'The guidance instructs an applicant to register, confirm email, and then log in; it also says the password expires every three months.',
    'The public page displays a Login ID field, a Continue control, a trouble surface, and a Register path, and warns applicants not to share credentials.',
    'The guide calls RPO selection a prerequisite, says to select based on residence, says the selection reflects the nearest PSK, and states applicants may apply anywhere.',
    'The guide lists nine sections from type through verification and says submission generates an ARN and an application can be saved and resumed before submission.',
    'The guide says payment is mandatory before booking and describes selecting quota, selecting a PSK, seeing a date, and being redirected to a payment gateway.',
    'The guide says payment displays appointment details, sends an SMS, and instructs the user to carry documents on the visit date.',
    "One applicant reported that an official did not accept a digital record and referred the case to the regional office after the applicant lacked a physical document.",
    'One applicant reported that the case remained pending after a verification interaction and that, after raising the matter publicly, the applicant observed approval and dispatch.',
  ];
  const regressionLedger = {
    ...ledger,
    claims: ind71AuditSplitRegression.map((text, index) => ({ ...ledger.claims[0], id: `claim_ind71_f005_${index + 1}`, text })),
  };
  const regression = lintLedger(regressionLedger, manifest.services[0]);
  const flagged = regression.unwaived.filter((finding) => finding.check === 'compound-claim');
  if (flagged.length < 8) throw new Error(`Passport IND71 compound regression flagged only ${flagged.length}/10 claims.`);
  console.log('Pre-audit lint self-test verified.');
}

const args = process.argv.slice(2);
if (args[0] === '--self-test') await runSelfTest();
else {
  const [ledgerPath] = args;
  const serviceIndex = args.indexOf('--service');
  const handoffIndex = args.indexOf('--handoff');
  if (!ledgerPath) throw new Error('Usage: node scripts/pre-audit-lint.mjs <ledger.json> [--service <serviceId>] [--handoff <handoff.json>]');
  const [manifest, ledger, handoff] = await Promise.all([
    readJson('ledger/services.manifest.json'),
    readJson(ledgerPath),
    handoffIndex === -1 ? Promise.resolve({}) : readJson(args[handoffIndex + 1]),
  ]);
  const service = findService(manifest, ledgerPath, serviceIndex === -1 ? undefined : args[serviceIndex + 1]);
  if (!service) throw new Error(`No manifest service matches ${ledgerPath}; pass --service to select one.`);
  const result = lintLedger(ledger, service, handoff);
  console.log(JSON.stringify({ serviceId: service.id, ...result }, null, 2));
  if (result.unwaived.length) process.exitCode = 1;
}

export { lintLedger };
