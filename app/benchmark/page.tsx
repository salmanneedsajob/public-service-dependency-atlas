import type { Metadata } from 'next';
import Link from 'next/link';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { atlasServices } from '@/lib/atlas-data';

export const metadata: Metadata = {
  title: 'Public Service Legibility Benchmark | Public Service Dependency Atlas',
  description: 'A cross-jurisdiction comparison of what public documentation states before a public-service case begins.',
};

type CellState = 'stated' | 'mentioned' | 'absent';
type ScorecardRow = {
  jurisdiction: string;
  jurisdictionSlug: string;
  serviceId: string;
  source: 'authored' | 'reviewed-regex';
  comparable: boolean;
  statedCount: number;
  cost: CellState;
  documents: CellState;
  eligibility: CellState;
  time: CellState;
  owner: CellState;
  'after-submission': CellState;
  asOf: string;
  scorecardPath: string;
};

type JurisdictionTable = { rows: ScorecardRow[] };

const cellColumns = ['cost', 'documents', 'eligibility', 'time', 'owner', 'after-submission'] as const;
const pilotServices = ['birth-certificate', 'property-tax-payment', 'water-connection'];
const serviceNames: Record<string, string> = {
  'birth-certificate': 'Birth certificate',
  'property-tax-payment': 'Property-tax payment',
  'water-connection': 'Water connection',
};
const benchmarkVersion = '0.1';
const atlasServiceLinks = new Map(atlasServices.map((service) => [service.id, service.href]));

function comparePilotRows(left: ScorecardRow, right: ScorecardRow) {
  return Number(right.comparable) - Number(left.comparable) || left.jurisdiction.localeCompare(right.jurisdiction) || left.source.localeCompare(right.source);
}

function label(value: string) {
  if (value === 'after-submission') return 'After submission';
  return value.replaceAll('-', ' ').replace(/^./u, (letter) => letter.toUpperCase());
}

function sourceLabel(row: ScorecardRow) {
  return row.comparable ? 'Comparable · authored' : 'Method comparison · reviewed-regex';
}

function Cell({ state }: { state: CellState }) {
  return <span className={`benchmark-cell benchmark-cell-${state}`}><b>{state}</b><span aria-hidden="true">{state === 'stated' ? '●' : state === 'mentioned' ? '◐' : '○'}</span></span>;
}

function ScorecardLink({ row }: { row: ScorecardRow }) {
  const atlasLink = row.jurisdictionSlug === '' ? atlasServiceLinks.get(row.serviceId) : undefined;
  return <span className="benchmark-links"><a href={`/${row.scorecardPath}`}>Scorecard JSON ↗</a>{atlasLink ? <Link href={atlasLink}>Atlas entry →</Link> : null}</span>;
}

function ScorecardTable({ rows, caption, pilot = false }: { rows: ScorecardRow[]; caption: string; pilot?: boolean }) {
  return (
    <figure className="benchmark-figure">
      <div className="report-wide-scroll" tabIndex={0} aria-label={caption}>
        <table className="benchmark-table">
          <thead><tr><th scope="col">Jurisdiction</th>{cellColumns.map((column) => <th scope="col" key={column}>{label(column)}</th>)}<th scope="col">Stated of 6</th><th scope="col">Source</th><th scope="col">As of</th><th scope="col">Links</th></tr></thead>
          <tbody>{rows.map((row) => (
            <tr data-service-id={row.serviceId} data-jurisdiction-slug={row.jurisdictionSlug} data-stated-count={row.statedCount} key={`${row.serviceId}:${row.jurisdictionSlug}:${row.source}`}>
              <th scope="row"><span>{row.jurisdiction}</span>{pilot && !row.comparable ? <small>Method comparison</small> : null}</th>
              {cellColumns.map((column) => <td key={column}><Cell state={row[column]} /></td>)}
              <td className="benchmark-stated-count"><b>{row.statedCount}</b><span>of 6</span></td>
              <td><span className={`benchmark-source benchmark-source-${row.source}`}>{sourceLabel(row)}</span></td>
              <td><time dateTime={row.asOf}>{row.asOf}</time></td>
              <td><ScorecardLink row={row} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <figcaption className="report-caption">{caption}</figcaption>
    </figure>
  );
}

async function getJurisdictionTable() {
  const source = await readFile(join(process.cwd(), 'public', 'data', 'scorecards', 'jurisdiction-table.json'), 'utf8');
  return JSON.parse(source) as JurisdictionTable;
}

export default async function BenchmarkPage() {
  const { rows } = await getJurisdictionTable();
  const pilotRows = rows.filter((row) => pilotServices.includes(row.serviceId));
  const bengaluruRows = rows.filter((row) => row.jurisdictionSlug === '');

  return (
    <main className="report-page benchmark-page">
      <header className="report-header">
        <Link className="wordmark" href="/"><span className="wordmark-accent">BLR</span><span>Public Service Dependency Atlas</span></Link>
        <nav aria-label="Benchmark navigation"><a href="#pilot">Pilot comparison</a><a href="#bengaluru">Bengaluru directory</a><a href="#method">Method</a></nav>
        <Link className="report-back" href="/">Atlas index ↗</Link>
      </header>

      <section className="report-hero">
        <p className="report-kicker">Public Service Legibility Benchmark · v{benchmarkVersion}</p>
        <h1>What does public<br />documentation state?</h1>
        <p className="report-deck">The question is: for one clearly scoped public-service route, how many of six practical expectations are stated in public evidence?</p>
        <div className="report-notice"><p><b>The one number:</b> cells stated out of six, per service and jurisdiction.</p><p>Benchmark version {benchmarkVersion}</p></div>
      </section>

      <div className="report-chapters">
        <article className="report-chapter" id="pilot">
          <header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>Cross-city pilot</p><h2>Same scope, different public records.</h2></div></header>
          <div className="report-copy"><p>Rows are grouped by service. State words and symbols make the distinctions readable without relying on colour.</p></div>
          <div className="report-legend benchmark-legend" aria-label="Cell-state key"><span className="key-stated">● stated</span><span className="key-mentioned">◐ mentioned</span><span className="key-absent">○ absent</span></div>
          {pilotServices.map((serviceId) => {
            const serviceRows = pilotRows.filter((row) => row.serviceId === serviceId).sort(comparePilotRows);
            return <section className="benchmark-service" key={serviceId}><h3>{serviceNames[serviceId]}</h3><ScorecardTable pilot rows={serviceRows} caption={`${serviceNames[serviceId]} across the pilot jurisdictions.`} />{serviceRows.some((row) => !row.comparable) ? <p className="benchmark-method-note">The authored and reviewed-regex source values measure different things; the reviewed-regex row is retained as a method comparison rather than dropped.</p> : null}</section>;
          })}
        </article>

        <article className="report-chapter" id="bengaluru">
          <header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>Bengaluru directory</p><h2>All seventeen Bengaluru services.</h2></div></header>
          <div className="report-copy"><p>This directory is not the headline comparison. It keeps the original and later scorecards reachable, with each row marked by its source.</p></div>
          <ScorecardTable rows={bengaluruRows} caption="All Bengaluru scorecards, marked by source." />
        </article>

        <article className="report-chapter" id="method">
          <header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>Method and limits</p><h2>Bounded public-source legibility.</h2></div></header>
          <div className="benchmark-method-box">
            <section><h3>Grid-only</h3><p>Grid-only mode uses one official-source pass, a light audit of the six cells, and a scorecard.</p><p>It is the scaling and cross-jurisdiction unit.</p></section>
            <section><h3>Deep ledger</h3><p>Deep-ledger mode uses official-source, public-workflow, citizen-evidence, integration, and a separate fresh audit.</p><p>It includes nodes, edges, roadblocks, journeys, and portal records; use it for pilot sites and disputed services.</p></section>
            <section><h3>Login boundary</h3><p>Personal case data behind login is private by right, not a documentation failure.</p></section>
          </div>
          <div className="benchmark-limitations"><p>Desk research, no counter visited.</p><p>A structured, preregistered comparison, not a statistical study.</p><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas/blob/main/benchmark/SPEC.md">Read the benchmark specification ↗</a></div>
        </article>
      </div>
    </main>
  );
}
