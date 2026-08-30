import type { Metadata } from 'next';
import Link from 'next/link';
import { atlasServices } from '@/lib/atlas-data';
import { collectUndocumentedQuestions } from '@/lib/undocumented';
import { ModeToggle } from '@/components/ModeToggle';
import { SlopfolioBadge } from '@/components/SlopfolioBadge';

export const metadata: Metadata = {
  title: 'Public Service Dependency Atlas',
  description: 'A Bengaluru-first atlas showing where one public service relies on records held by another.',
};

export default function AtlasHome() {
  const serviceGaps = atlasServices.map((service) => ({ service, gaps: collectUndocumentedQuestions(service.ledger) }));
  const atlasMetrics = {
    serviceCount: serviceGaps.length,
    curatedGapCount: serviceGaps.reduce((total, item) => total + item.gaps.length, 0),
    claimCount: atlasServices.reduce((total, service) => total + service.ledger.claims.length, 0),
    sourceCount: atlasServices.reduce((total, service) => total + service.ledger.sources.length, 0),
    distinctUrlCount: new Set(atlasServices.flatMap((service) => service.ledger.sources.map((source) => source.url))).size,
  };
  const exampleGaps = serviceGaps
    .filter((item) => item.gaps.length)
    .map((item) => ({ service: item.service, gap: item.gaps[0] }))
    .sort((a, b) => a.gap.priority - b.gap.priority || a.service.title.localeCompare(b.service.title))
    .slice(0, 5);

  return (
    <main className="atlas-page">
      <header className="site-header">
        <Link className="wordmark" href="/"><span className="wordmark-accent">BLR</span><span>Public Service Dependency Atlas</span></Link>
        <nav aria-label="Page navigation">
          <a className="primary-nav-link" href="#directory">Service directory</a>
          <a href="#method">Contribute</a>
        </nav>
        <ModeToggle mode="normal" />
      </header>

      <section className="atlas-hero" id="top">
        <p className="eyebrow">Bengaluru utilities &amp; municipal services</p>
        <h1>Public Service<br />Dependency Atlas</h1>
        <p className="atlas-lede">A birth, a marriage, a death in the family, a move, a new home, a new business — every life event comes with paperwork. The record you need is often blocked by another record, held by another department, that nobody told you about.</p>
        <p className="atlas-thesis">This atlas maps those links for 12 Bengaluru services — what each one depends on, where it can break, and what no public document explains.</p>
        <div className="hero-actions">
          <a className="primary-link" href="#directory">Explore the directory <span>↓</span></a>
        </div>
      </section>

      <section className="atlas-missing" id="missing" aria-labelledby="missing-heading">
        <div className="atlas-missing-intro">
          <p className="step-label">What the public record leaves out</p>
          <h2 id="missing-heading">What&apos;s missing</h2>
          <p>Across {atlasMetrics.serviceCount} services we found {atlasMetrics.curatedGapCount} steps where no public document explains what to do. Here are {exampleGaps.length}. We only searched public sources, so there are probably more.</p>
        </div>
        <div className="missing-list-area">
          <ol className="missing-example-list">
            {exampleGaps.map(({ service, gap }) => <li key={`${service.href}:${gap.id}`}><strong>{gap.situation}</strong><span>{gap.missing}</span><Link href={`${service.href}#what-nobody-has-documented`}>See this in {service.title} →</Link></li>)}
          </ol>
          <a className="missing-directory-link" href="#directory">See every researched service in the directory →</a>
        </div>
      </section>

      <section className="failure-layers" aria-labelledby="layers-heading">
        <div className="section-heading">
          <p className="step-label">Where journeys break</p>
          <h2 id="layers-heading">Three layers of failure</h2>
        </div>
        <div className="layer-grid">
          <article><span>01</span><h3>Documentation</h3><p>An older BESCOM account says it needed a builder NOC; a 2026 account says it did not. No public document explains when that NOC is required. Property-tax pages list name correction and an ARO contact path, but do not say what the office will accept or what a completed correction looks like.</p></article>
          <article><span>02</span><h3>Process</h3><p>You need to move a BWSSB water account into your name, but the public portal shows only new or additional connections — not the transfer route.</p></article>
          <article><span>03</span><h3>Infrastructure</h3><p>BESCOM’s system can’t match your property ID (EPID) to your account — and no public document says who repairs that.</p></article>
        </div>
        <a className="section-onward-link" href="#directory">Find your service in the directory →</a>
      </section>

      <section className="atlas-directory" id="directory" aria-labelledby="directory-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="step-label">Bengaluru-first directory</p>
            <h2 id="directory-heading">Which service are you stuck on?</h2>
          </div>
          <p>Each entry traces the records the service depends on, what can block it, and the evidence behind every statement.</p>
        </div>
        <p className="directory-status-key"><b>Mapped</b> = we traced the full published route and its gaps. <b>Partially mapped</b> = the public record stops before the journey does. Both are researched; neither means the service is complete or incomplete.</p>
        <p className="directory-status-rule">Mapped means every record on the main route has been researched: each answer is published, or we checked and found no public procedure. Every handoff is sourced.</p>
        <div className="service-grid">
          {serviceGaps.map(({ service, gaps }) => {
            const firstGap = gaps[0];
            const cardCopy = service.status === 'Mapped'
              ? `Published route with ${gaps.length} ${gaps.length === 1 ? 'place' : 'places'} where the public procedure stops, kept visible.`
              : `${gaps.length === 1 ? 'One place' : `${gaps.length} places`} where the public record stops, including: ${firstGap?.situation ?? 'the remaining route has not been fully traced.'}`;
            const statusDefinition = service.status === 'Mapped'
              ? 'Mapped: we traced the full published route and its gaps.'
              : 'Partially mapped: the public record stops before the journey does.';
            const { fullyDocumentedRecords, totalRecords, unknownRecords } = service.mappingSummary;
            const completeness = `${fullyDocumentedRecords} of ${totalRecords} records researched`;
            const unknownCopy = unknownRecords > 0 ? ` · ${unknownRecords} ${unknownRecords === 1 ? 'step has' : 'steps have'} no public procedure` : '';
            return <a className="service-card mapped-service" href={service.href} key={service.title}><span className="service-category">{service.category}</span><div className={`service-status service-${service.status.toLowerCase().replaceAll(' ', '-')}`} title={statusDefinition} aria-label={`${service.status}. ${completeness}${unknownCopy}`}>{service.status} · {completeness}{unknownCopy}</div><h3>{service.title}</h3><p>{cardCopy}</p><span className="service-cta">Open this entry →</span></a>;
          })}
        </div>
      </section>

      <section className="explorer-strip" aria-labelledby="explorer-strip-heading">
        <div>
          <p className="eyebrow">Another way to look at this</p>
          <h2 id="explorer-strip-heading">The same services, as a filing cabinet</h2>
          <p>Every service is a folder of the public documents that exist — and the grey files are procedures that should be there and aren&apos;t.</p>
        </div>
        <Link className="explorer-strip-link" href="/explorer">Open the filing cabinet →</Link>
      </section>

      <section className="contribution" id="method" aria-labelledby="contribution-heading">
        <div>
          <p className="step-label">Open contribution format</p>
          <h2 id="contribution-heading">Want to strengthen a map?</h2>
        </div>
        <div>
          <p>Use the shared research format to add a source, record a gap, or show a contradiction without turning uncertainty into a guess. The existing entries are a starting point, not a claim that every public journey is fully documented.</p>
          <p className="prototype-note contribution-prototype">This is a working prototype of a method for mapping documentation gaps across government services, demonstrated on Bengaluru utilities and municipal services.</p>
          <div className="contribution-links"><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas/blob/main/ledger/schema.json" target="_blank" rel="noreferrer">Research format ↗</a><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas/blob/main/ledger/AGENT_PROTOCOL.md" target="_blank" rel="noreferrer">Research protocol ↗</a><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas" target="_blank" rel="noreferrer">Open-source atlas ↗</a></div>
        </div>
      </section>

      <footer className="footer atlas-footer">
        <div className="footer-title"><span>Scope & limits</span><h2>Map the links.<br />Keep the gaps.</h2></div>
        <div className="footer-copy"><p>This atlas is independent research, not official government guidance. Each entry shows the evidence held, the questions that remain, and the date the material was checked.</p><div className="footer-meta"><span>Not official advice. Verify current requirements with the responsible agency and do not submit personal data through this site.</span></div><small>Atlas snapshot 2026-08-28 · Bengaluru, Karnataka, India</small><SlopfolioBadge /></div>
      </footer>
    </main>
  );
}
