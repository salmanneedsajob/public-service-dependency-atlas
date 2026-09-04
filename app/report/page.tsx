import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createReportTokens, parseChapterCopy, resolveReportTemplate, tokenNumber } from '@/lib/report-tokens.js';

export const metadata: Metadata = {
  title: 'Field notes from twelve services | Public Service Dependency Atlas',
  description: 'A derived account of what public documentation does and does not let a Bengaluru citizen expect.',
  robots: {
    index: false,
    follow: false,
  },
};

type CellState = 'stated' | 'mentioned' | 'absent';
type ExpectationCell = {
  state: CellState;
  supportingClaimIds: { stated: string[]; mentioned: string[] };
  strongestEvidenceGradeBehindStated: string | null;
  reviewed: boolean;
  unreviewed: boolean;
  reviewNote: string | null;
  stale: boolean;
  staleReason: string | null;
};
type Report = {
  totals: {
    services: number;
    claims: { total: number; byGrade: Record<string, number>; byStatus: Record<string, number> };
    scenarios: { total: number; byStatus: Record<string, number> };
    journeySteps: { total: number; byStatus: Record<string, number> };
    nodesWithEmptyDetails: { anyEmpty: number; allThreeEmpty: number };
    researchWindow: { start: string; end: string };
    byService: Array<{ serviceId: string; service: string; href: string; claimsByGrade: Record<string, number>; claimTotal: number }>;
  };
  loginClassification: {
    rule: string;
    comparison: {
      claims: { fullCount: number; loginStrippedCount: number };
      unknownClaims: { fullCount: number; loginRelatedCount: number; loginStrippedCount: number };
      roadblocks: { fullCount: number; loginRelatedCount: number; loginStrippedCount: number; fullByCategory: Record<string, number>; loginStrippedByCategory: Record<string, number> };
    };
  };
  expectations: {
    columns: string[];
    countsByColumn: Record<string, Record<CellState, number>>;
    services: Array<{ serviceId: string; service: string; href: string; cells: Record<string, ExpectationCell> }>;
  };
  publicErrors: Array<{ serviceId: string; service: string; nodeId: string; nodeLabel: string; actualError: string; url: string | null }>;
  documentationShelf: {
    deduplicatedEntryCount: number;
    groups: Array<{ serviceId: string; service: string; entries: Array<{ title: string | null; url: string | null; whatItCovers: string | null; whereItStops: string | null }> }>;
  };
  auditorExcerpts: Array<{ file: string; heading: string | null; excerpt: string }>;
};

const gradeOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'Unknown'];
const statusOrder = ['verified', 'partial', 'contested', 'unknown'];

function label(value: string) {
  if (value === 'after-submission') return 'After submission';
  return value.replaceAll('-', ' ').replace(/^./u, (letter) => letter.toUpperCase());
}

function percentage(value: number, total: number) {
  return `${total ? (value / total) * 100 : 0}%`;
}

function barStyle(value: number, total: number) {
  return { '--segment-size': percentage(value, total) } as CSSProperties;
}

function StackedBar({ values, order, total, classPrefix }: { values: Record<string, number>; order: string[]; total: number; classPrefix: string }) {
  return (
    <div className="report-stacked-bar" aria-label={order.map((key) => `${label(key)}: ${values[key] ?? 0}`).join(', ')}>
      {order.filter((key) => values[key]).map((key) => (
        <span className={`${classPrefix}-${key.toLowerCase()} report-bar-segment`} key={key} style={barStyle(values[key], total)} title={`${label(key)}: ${values[key]}`} />
      ))}
    </div>
  );
}

function FigureCaption({ children }: { children: React.ReactNode }) {
  return <figcaption className="report-caption">{children}</figcaption>;
}

async function getReport() {
  const source = await readFile(join(process.cwd(), 'public', 'data', 'report.json'), 'utf8');
  return JSON.parse(source) as Report;
}

export default async function FieldNotesReport() {
  const [report, chapterCopy] = await Promise.all([
    getReport(),
    readFile(join(process.cwd(), 'report', 'chapter-copy.md'), 'utf8'),
  ]);
  const tokens = createReportTokens(report);
  const chapters = parseChapterCopy(chapterCopy);
  const copy = (section: string) => resolveReportTemplate(chapters[section] ?? '', tokens);
  const number = (key: string) => tokenNumber(tokens, key);
  const visibleGrades = gradeOrder.filter((grade) => report.totals.byService.some((service) => (service.claimsByGrade[grade] ?? 0) > 0));
  const auditMemo = report.auditorExcerpts.find((excerpt) => excerpt.heading?.toLowerCase() === 'ship decision') ?? report.auditorExcerpts[0];

  return (
    <main className="report-page">
      <header className="report-header">
        <Link className="wordmark" href="/"><span className="wordmark-accent">BLR</span><span>Public Service Dependency Atlas</span></Link>
        <nav aria-label="Report navigation"><a href="#grid">The grid</a><a href="#method-and-limits">Method</a></nav>
        <Link className="report-back" href="/">Atlas index ↗</Link>
      </header>

      <section className="report-hero">
        <p className="report-kicker">Field report · Bengaluru public services</p>
        <h1>Field notes from<br />twelve services</h1>
        <p className="report-deck">Can public documentation tell a citizen what to expect before a case begins?</p>
        <div className="report-notice">
          <p><b>Independent research, not official guidance.</b> No agent logged in, paid, uploaded personal data, or submitted an application.</p>
          <p>Research window <time dateTime={report.totals.researchWindow.start}>{report.totals.researchWindow.start}</time>—<time dateTime={report.totals.researchWindow.end}>{report.totals.researchWindow.end}</time></p>
        </div>
        <p className="report-hero-service-label">{copy('hero-services-label')}</p>
        <div className="report-hero-stats" aria-label="Report scope">
          <div><strong>{number('cost.servicesStated')}</strong><span>{copy('hero-fee-label')}</span></div>
          <div><strong>{number('owner.servicesStated')}</strong><span>{copy('hero-owner-label')}</span></div>
          <div><strong>{number('grid.mentioned')}</strong><span>{copy('hero-mentioned-label')}</span></div>
        </div>
      </section>

      <div className="report-chapters">
        <article className="report-chapter" id="the-question">
          <header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>The question</p><h2>What can a citizen know before beginning?</h2></div></header>
          <div className="report-copy"><p>{copy('the-question')}</p></div>

          <section className="report-subsection" id="the-rules">
            <p className="report-section-label">The rules and what they do and do not affect</p>
            <h3>The login boundary does not explain every unknown.</h3>
            <p className="report-sublede">{copy('the-rules')}</p>
            <figure className="report-figure login-comparison">
              <div className="login-columns">
                <div><span>Full public-source record</span><strong>{number('login.unknownFull')}</strong><small>Unknown claims</small><strong>{number('login.roadblocksFull')}</strong><small>Roadblocks</small></div>
                <div><span>After login-related items</span><strong>{number('login.unknownStripped')}</strong><small>Unknown claims remain</small><strong>{number('login.roadblocksStripped')}</strong><small>Roadblocks remain</small></div>
              </div>
              <FigureCaption>{copy('login-caption')}</FigureCaption>
            </figure>
          </section>

          <section className="report-subsection" id="grid">
            <p className="report-section-label">Core figure</p>
            <h3>The expectation grid</h3>
            <div className="report-legend" aria-label="Grid key"><span className="key-stated">Stated</span><span className="key-mentioned">Mentioned</span><span className="key-absent">Absent</span><span>○ stale</span></div>
            <figure className="report-figure">
              <div className="report-wide-scroll" tabIndex={0} aria-label="Scrollable expectations grid">
                <table className="expectation-grid">
                  <thead><tr><th scope="col">Service</th>{report.expectations.columns.map((column) => <th scope="col" id={`grid-column-${column}`} key={column}>{label(column)}</th>)}</tr></thead>
                  <tbody>{report.expectations.services.map((service) => (
                    <tr key={service.serviceId} id={`grid-${service.serviceId}`}>
                      <th scope="row"><Link href={service.href}>{service.service}</Link></th>
                      {report.expectations.columns.map((column) => {
                        const cell = service.cells[column];
                        const claimIds = [...cell.supportingClaimIds.stated, ...cell.supportingClaimIds.mentioned];
                        return (
                          <td className={`expectation-${cell.state}`} key={column} title={claimIds.join(', ') || 'No supporting claim'}>
                            <details>
                              <summary><span>{label(cell.state)}</span>{cell.stale && <abbr title={cell.staleReason ?? 'Stale support'}>○</abbr>}</summary>
                              <div><Link href={service.href}>Open service entry →</Link><p className={cell.unreviewed ? 'grid-review-status is-unreviewed' : 'grid-review-status'}>{cell.unreviewed ? '△ Unreviewed' : 'Human-reviewed'}: {cell.reviewNote}</p>{claimIds.length ? <><b>Supporting claims</b><ul>{claimIds.map((claimId) => <li key={claimId}>{claimId}</li>)}</ul></> : <p>No qualifying claim touches this expectation.</p>}{cell.strongestEvidenceGradeBehindStated && <small>Strongest stated evidence: grade {cell.strongestEvidenceGradeBehindStated}</small>}</div>
                            </details>
                          </td>
                        );
                      })}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <FigureCaption>{copy('grid-caption')}</FigureCaption>
            </figure>
            <p className="report-human-review-line">{copy('grid-human-review')}</p>
          </section>

          <section className="report-subsection">
            <p className="report-section-label">Evidence distribution</p>
            <h3>Claims by grade, service by service</h3>
            <figure className="report-figure">
              <div className="grade-legend">{visibleGrades.map((grade) => <span className={`grade-swatch grade-${grade.toLowerCase()}`} key={grade}>{grade}</span>)}</div>
              <div className="service-grade-chart">{report.totals.byService.map((service) => <div className="grade-row" key={service.serviceId}><Link href={service.href}>{service.service}</Link><StackedBar values={service.claimsByGrade} order={visibleGrades} total={number(`claims.service.${service.serviceId}.total`)} classPrefix="grade" /><b>{number(`claims.service.${service.serviceId}.total`)}</b></div>)}</div>
              <FigureCaption>{copy('grades-caption')}</FigureCaption>
            </figure>
          </section>

          <section className="report-subsection">
            <p className="report-section-label">Journey coverage</p>
            <h3>Scenarios and steps stop in different places.</h3>
            <figure className="report-figure status-figure">
              <div className="status-row"><span>Scenarios</span><StackedBar values={report.totals.scenarios.byStatus} order={statusOrder} total={number('scenarios.total')} classPrefix="status" /><b>{number('scenarios.total')}</b></div>
              <div className="status-row"><span>Journey steps</span><StackedBar values={report.totals.journeySteps.byStatus} order={statusOrder} total={number('journeySteps.total')} classPrefix="status" /><b>{number('journeySteps.total')}</b></div>
              <div className="status-key">{statusOrder.map((status) => <span className={`status-${status}`} key={status}>{label(status)}</span>)}</div>
              <FigureCaption>{copy('journeys-caption')}</FigureCaption>
            </figure>
          </section>

          <section className="report-subsection">
            <p className="report-section-label">Roadblocks</p>
            <h3>The obstruction remains after login-related items are removed.</h3>
            <figure className="report-figure roadblock-figure">
              {Object.entries(report.loginClassification.comparison.roadblocks.fullByCategory).map(([category, full]) => {
                const stripped = report.loginClassification.comparison.roadblocks.loginStrippedByCategory[category] ?? 0;
                return <div className="roadblock-row" key={category}><span>{label(category)}</span><div><i style={barStyle(full, number('login.roadblocksFull'))} /><em style={barStyle(stripped, number('login.roadblocksFull'))} /></div><b>{number(`roadblocks.full.${category}`)} / {number(`roadblocks.stripped.${category}`)}</b></div>;
              })}
              <div className="roadblock-key"><span>Full count</span><span>Login-stripped</span></div>
              <FigureCaption>{copy('roadblocks-caption')}</FigureCaption>
            </figure>
          </section>
        </article>

        {report.expectations.columns.map((column) => {
          return (
            <article className="report-chapter expectation-chapter" id={column} key={column}>
              <header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>{label(column)}</p><h2>{column === 'owner' ? 'Who holds the case?' : column === 'after-submission' ? 'What comes back?' : `Is ${column} actionable?`}</h2></div></header>
              <div className="expectation-summary"><p><strong>{number(`${column}.stated`)}</strong><span>stated</span></p><p><strong>{number(`${column}.mentioned`)}</strong><span>mentioned</span></p><p><strong>{number(`${column}.absent`)}</strong><span>absent</span></p></div>
              <p className="report-placeholder">{copy(column)}</p>
              <p><a className="report-inline-link" href={`#grid-column-${column}`}>Return to this column in the grid ↑</a></p>
            </article>
          );
        })}

        <article className="report-chapter" id="errors-and-shelf">
          <header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>The public errors and the shelf</p><h2>What the public surface actually said</h2></div></header>
          <section className="report-subsection">
            <h3>Public error catalogue</h3>
            <figure className="report-figure">
              <div className="report-wide-scroll" tabIndex={0} aria-label="Scrollable public error catalogue"><table className="error-table"><thead><tr><th>Service</th><th>Node</th><th>Actual error</th><th>Source</th></tr></thead><tbody>{report.publicErrors.map((error) => <tr key={`${error.serviceId}:${error.nodeId}:${error.actualError}`}><th>{error.service}</th><td>{error.nodeLabel}</td><td><code>{error.actualError}</code></td><td>{error.url ? <a href={error.url} target="_blank" rel="noreferrer">Open ↗</a> : 'No single URL'}</td></tr>)}</tbody></table></div>
              <FigureCaption>{copy('errors-caption')}</FigureCaption>
            </figure>
          </section>
          <section className="report-subsection">
            <h3>Documentation shelf</h3>
            <figure className="report-figure shelf-figure">
              {report.documentationShelf.groups.map((group) => <section className="shelf-group" key={group.serviceId}><h4>{group.service}<span>{number(`shelf.${group.serviceId}.entries`)}</span></h4>{group.entries.length ? <div>{group.entries.map((entry) => <article key={entry.url ?? entry.title}><a href={entry.url ?? '#'} target={entry.url ? '_blank' : undefined} rel={entry.url ? 'noreferrer' : undefined}>{entry.title ?? 'Untitled public document'} ↗</a><dl><dt>Covers</dt><dd>{entry.whatItCovers}</dd><dt>Stops</dt><dd>{entry.whereItStops}</dd></dl></article>)}</div> : <p>No documentation-shelf entry was present in the handoffs.</p>}</section>)}
              <FigureCaption>{copy('shelf-caption')}</FigureCaption>
            </figure>
          </section>
        </article>

        <article className="report-chapter" id="the-auditor">
          <header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>The auditor</p><h2>A memo from the review layer</h2></div></header>
          <figure className="report-figure audit-memo"><blockquote>{auditMemo.excerpt}</blockquote><cite>{auditMemo.file} · {auditMemo.heading}</cite><FigureCaption>{copy('auditor-caption')}</FigureCaption></figure>
          <section className="report-subsection" id="what-remained-unknown"><p className="report-section-label">What remained unknown</p><h3>Unknown is a recorded result, not an empty space.</h3><p className="report-placeholder">{copy('what-remained-unknown')}</p><div className="unknown-register"><p><strong>{number('login.unknownFull')}</strong><span>Unknown claims in full</span></p><p><strong>{number('login.unknownStripped')}</strong><span>remain without login items</span></p><p><strong>{number('nodes.anyEmpty')}</strong><span>nodes missing at least one detail family</span></p></div></section>
        </article>

        <article className="report-chapter report-conclusion" id="what-this-means">
          <header className="report-chapter-heading"><span className="report-chapter-number" /><div><p>What this means</p><h2>Documentation is part of the service.</h2></div></header>
          <p className="report-placeholder">{copy('what-this-means')}</p>
          <section className="report-subsection" id="what-we-do-next"><p className="report-section-label">What we do next</p><h3>Keep the claims reviewable.</h3><p className="report-placeholder">{copy('what-we-do-next')}</p></section>
          <section className="report-subsection" id="method-and-limits"><p className="report-section-label">Method and limits</p><h3>A public-source reader, bounded on purpose.</h3><p>{copy('method-and-limits')}</p><details className="method-rule"><summary>Read the login classification rule</summary><p>{report.loginClassification.rule}</p></details></section>
        </article>
      </div>

      <footer className="report-footer"><p>Field notes from twelve services</p><p>Independent public-source research · Bengaluru, Karnataka</p><Link href="/">Return to the atlas →</Link></footer>
    </main>
  );
}
