import type { Metadata } from 'next';
import Link from 'next/link';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { notFound } from 'next/navigation';

type Params = { jurisdictionSlug: string; serviceId: string };
type CellState = 'stated' | 'mentioned' | 'absent';
type Source = { id: string; title: string; url: string; accessedAt: string; publishedAt?: string; type: string; notes?: string; publisher?: string };
type Claim = { id: string; text: string; sourceIds: string[]; evidenceGrade: string; basis: string; status: string };
type Ledger = { meta: { title: string; jurisdiction: string; asOf: string; disclaimer?: string }; scenarios: Array<{ id: string; label: string; summary: string }>; sources: Source[]; claims: Claim[] };
type Expectations = { primaryScenarioId: string; cells: Record<string, { state: CellState; claimIds: string[]; note: string; searchedRoutes: string[] }> };
type Scorecard = { jurisdiction: string; asOf: string; statedCount: number; source: string; benchmarkVersion: string; scorecardPath?: string };
type Correction = { id: string; recordType: string; recordId: string; fieldPath: string; old: unknown; new: unknown; reason: string };
type CorrectionsDocument = { corrections?: Correction[]; runs?: Array<{ file?: string; data?: { corrections?: Correction[]; auditDate?: string } }> };

const cells = ['cost', 'documents', 'eligibility', 'time', 'owner', 'after-submission'];
const gradeMeaning: Record<string, string> = { A: 'binding law, regulation, commission order, or gazette notification', B: 'current official procedure, form, service portal, circular, or agency page', C: 'official but indirect, incomplete, archived, undated, or potentially outdated material', D: 'reputable secondary reporting', E: 'genuine public first-person evidence', F: 'uncorroborated lead', Unknown: 'no usable source' };
const bengaluruServices = ['passport', 'aadhaar-address-update', 'property-tax-payment', 'sale-deed-registration', 'occupancy-certificate'];

function cellLabel(cell: string) { return cell === 'after-submission' ? 'After submission' : cell.replaceAll('-', ' ').replace(/^./u, (letter) => letter.toUpperCase()); }
function host(url: string) { try { return new URL(url).host; } catch { return url; } }
function isCitizen(source: Source) { return source.type.toLowerCase().includes('citizen'); }
function archiveOutcome(notes = '') { const match = notes.match(/Archive:\s*([^\n]+?)(?:\s+Limitation:|$)/u); return match?.[1] ?? 'No archive outcome recorded.'; }
function simpleMarkdown(markdown: string) {
  return markdown.split(/\n\n+/u).filter(Boolean).map((block, index) => {
    if (block.startsWith('### ')) return <h4 key={index}>{block.slice(4)}</h4>;
    if (block.startsWith('## ')) return <h3 key={index}>{block.slice(3)}</h3>;
    if (block.startsWith('# ')) return <h2 key={index}>{block.slice(2)}</h2>;
    if (block.startsWith('- ')) return <ul key={index}>{block.split('\n').map((line) => <li key={line}>{line.replace(/^- /u, '')}</li>)}</ul>;
    return <p key={index}>{block.replaceAll('**', '').replaceAll('`', '')}</p>;
  });
}

async function readJson<T>(file: string) { return JSON.parse(await readFile(file, 'utf8')) as T; }

function locations(params: Params) {
  if (params.jurisdictionSlug === 'bengaluru' && bengaluruServices.includes(params.serviceId)) return {
    ledger: join(process.cwd(), 'public/data', `${params.serviceId}.json`), expectations: join(process.cwd(), 'public/data/expectations', `${params.serviceId}.json`), audit: join(process.cwd(), 'public/data/audits', `${params.serviceId}.md`), corrections: join(process.cwd(), 'public/data/audits', `${params.serviceId}.corrections.json`), scorecard: join(process.cwd(), 'public/data/scorecards', `${params.serviceId}.json`),
  };
  const root = join(process.cwd(), 'public/data/jurisdictions', params.jurisdictionSlug);
  return { ledger: join(root, `${params.serviceId}.json`), expectations: join(root, 'expectations', `${params.serviceId}.json`), audit: join(root, 'audits', `${params.serviceId}.md`), corrections: join(root, 'audits', `${params.serviceId}.corrections.json`), scorecard: join(process.cwd(), 'public/data/scorecards', params.jurisdictionSlug, `${params.serviceId}.json`) };
}

async function loadEvidence(params: Params) {
  try {
    const paths = locations(params);
    const [ledger, expectations, audit, corrections, scorecard] = await Promise.all([readJson<Ledger>(paths.ledger), readJson<Expectations>(paths.expectations), readFile(paths.audit, 'utf8'), readJson<CorrectionsDocument>(paths.corrections), readJson<Scorecard>(paths.scorecard)]);
    return { ...paths, ledger, expectations, audit, corrections, scorecard };
  } catch { notFound(); }
}

export async function generateStaticParams(): Promise<Params[]> {
  const manifest = await readJson<{ entries: Array<{ jurisdictionSlug: string; serviceId: string }> }>(join(process.cwd(), 'ledger/jurisdictions/manifest.json'));
  return [...manifest.entries.map(({ jurisdictionSlug, serviceId }) => ({ jurisdictionSlug, serviceId })), ...bengaluruServices.map((serviceId) => ({ jurisdictionSlug: 'bengaluru', serviceId }))];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { jurisdictionSlug, serviceId } = await params;
  return { title: `${serviceId.replaceAll('-', ' ')} evidence | Public Service Legibility Benchmark` };
}

export default async function EvidencePage({ params }: { params: Promise<Params> }) {
  const route = await params;
  const evidence = await loadEvidence(route);
  const scenario = evidence.ledger.scenarios.find((item) => item.id === evidence.expectations.primaryScenarioId) ?? evidence.ledger.scenarios[0];
  const sourceById = new Map(evidence.ledger.sources.map((source) => [source.id, source]));
  const corrections = evidence.corrections.corrections ? [{ label: 'Audit corrections', corrections: evidence.corrections.corrections }] : (evidence.corrections.runs ?? []).map((run) => ({ label: run.data?.auditDate ?? run.file ?? 'Audit corrections', corrections: run.data?.corrections ?? [] }));
  const scorecardUrl = route.jurisdictionSlug === 'bengaluru' ? `/public/data/scorecards/${route.serviceId}.json` : `/public/data/scorecards/${route.jurisdictionSlug}/${route.serviceId}.json`;

  return <main className="report-page evidence-page">
    <header className="report-header"><Link className="wordmark" href="/"><span className="wordmark-accent">BLR</span><span>Public Service Dependency Atlas</span></Link><nav aria-label="Evidence navigation"><Link href="/benchmark">Benchmark</Link><a href="#sources">Sources</a><a href="#audit">Audit</a></nav><a className="report-back" href={scorecardUrl}>Scorecard JSON ↗</a></header>
    <section className="report-hero"><p className="report-kicker">Evidence page · benchmark v{evidence.scorecard.benchmarkVersion}</p><h1>{evidence.ledger.meta.title.replace(/ evidence ledger v1$/u, '')}</h1><p className="report-deck">{evidence.scorecard.jurisdiction}</p><div className="report-notice"><p><b>{evidence.scorecard.statedCount} of 6 stated.</b> Source: {evidence.scorecard.source}. As of <time dateTime={evidence.scorecard.asOf}>{evidence.scorecard.asOf}</time>.</p><p>v{evidence.scorecard.benchmarkVersion}</p></div></section>
    <div className="report-chapters"><article className="report-chapter"><header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>Scope</p><h2>{scenario?.label ?? 'Primary scenario'}</h2></div></header><div className="report-copy"><p>{scenario?.summary ?? 'No primary scenario summary was recorded.'}</p></div></article>
      <article className="report-chapter"><header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>Six expectations</p><h2>What public evidence states.</h2></div></header>{cells.map((cell) => { const value = evidence.expectations.cells[cell]; const claims = value.claimIds.map((id) => evidence.ledger.claims.find((claim) => claim.id === id)).filter((claim): claim is Claim => Boolean(claim)); return <section className="evidence-cell-section" id={`cell-${cell}`} key={cell}><div><p className="report-section-label">{cellLabel(cell)}</p><h3><span className={`benchmark-cell benchmark-cell-${value.state}`}><b>{value.state}</b><span aria-hidden="true">{value.state === 'stated' ? '●' : value.state === 'mentioned' ? '◐' : '○'}</span></span></h3><p>{value.note}</p></div>{claims.length ? <div className="evidence-claims">{claims.map((claim) => <article id={`claim-${claim.id}`} key={claim.id}><p><b>{claim.id}</b> · Grade {claim.evidenceGrade} — {gradeMeaning[claim.evidenceGrade] ?? 'meaning not recorded'}</p><p>{claim.text}</p><dl><dt>Basis</dt><dd>{claim.basis}</dd><dt>Status</dt><dd>{claim.status}</dd></dl>{claim.sourceIds.map((id) => { const source = sourceById.get(id); return source ? <div className="evidence-source" key={id}>{isCitizen(source) ? <p><b>Citizen evidence</b> · {host(source.url)} · accessed {source.accessedAt} · <a href={source.url}>Open source ↗</a></p> : <><p><b>{source.title}</b> · {host(source.url)}</p><p>Accessed {source.accessedAt}{source.publishedAt ? ` · published ${source.publishedAt}` : ''}. Archive: {archiveOutcome(source.notes)} <a href={source.url}>Open source ↗</a></p></>}</div> : null; })}</article>)}</div> : null}{value.searchedRoutes.length ? <div className="evidence-searched"><b>Searched routes</b><ul>{value.searchedRoutes.map((routeName) => <li key={routeName}>{routeName}</li>)}</ul></div> : null}</section>; })}</article>
      <article className="report-chapter"><header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>Limitations</p><h2>What remains bounded.</h2></div></header><div className="report-copy"><p>{evidence.ledger.meta.disclaimer ?? 'No limitations text was recorded.'}</p></div></article>
      <article className="report-chapter" id="audit"><header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>Audit</p><h2>Independent review and corrections.</h2></div></header><div className="audit-rendered">{simpleMarkdown(evidence.audit)}</div>{route.jurisdictionSlug === 'delhi' && route.serviceId === 'property-tax-payment' ? <p className="evidence-special-note">The cost cell changed through the corrections contract with an independent verifier and was not re-audited afterwards.</p> : null}{corrections.map((run) => <section className="evidence-corrections" key={run.label}><h3>{run.label} · {run.corrections.length} corrections</h3><div className="report-wide-scroll" tabIndex={0}><table><thead><tr><th>Record</th><th>Field</th><th>Old</th><th>New</th><th>Reason</th></tr></thead><tbody>{run.corrections.map((correction) => <tr key={correction.id}><td>{correction.recordType} · {correction.recordId}</td><td>{correction.fieldPath}</td><td>{JSON.stringify(correction.old)}</td><td>{JSON.stringify(correction.new)}</td><td>{correction.reason}</td></tr>)}</tbody></table></div></section>)}</article>
      <article className="report-chapter" id="sources"><header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>Sources</p><h2>Every recorded source.</h2></div></header><div className="evidence-sources">{evidence.ledger.sources.map((source) => <article id={`source-${source.id}`} key={source.id}>{isCitizen(source) ? <p><b>Citizen evidence</b> · {host(source.url)} · accessed {source.accessedAt} · <a href={source.url}>Open source ↗</a></p> : <><h3>{source.title}</h3><p>{source.type} · {host(source.url)} · accessed {source.accessedAt}{source.publishedAt ? ` · published ${source.publishedAt}` : ''}</p><p>Archive: {archiveOutcome(source.notes)}</p><a href={source.url}>Open source ↗</a></>}</article>)}</div></article></div>
  </main>;
}
