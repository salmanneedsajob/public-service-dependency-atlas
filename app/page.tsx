import type { Metadata } from 'next';
import Link from 'next/link';
import { atlasServices } from '@/lib/atlas-data';
import { collectUndocumentedQuestions } from '@/lib/undocumented';
import { ModeToggle, RestoreExplorerPreference } from '@/components/ModeToggle';

export const metadata: Metadata = {
  title: 'Public Service Dependency Atlas',
  description: 'A Bengaluru-first atlas of the undocumented handoffs between public services.',
};

export default function AtlasHome() {
  const serviceGaps = atlasServices.map((service) => ({ service, gaps: collectUndocumentedQuestions(service.ledger) }));
  const exampleGaps = serviceGaps
    .filter((item) => item.gaps.length)
    .map((item) => ({ service: item.service, gap: item.gaps[0] }))
    .sort((a, b) => a.gap.priority - b.gap.priority || a.service.title.localeCompare(b.service.title))
    .slice(0, 5);
  const documentedGapCount = serviceGaps.reduce((count, item) => count + item.gaps.length, 0);

  return (
    <main className="atlas-page">
      <RestoreExplorerPreference />
      <header className="site-header">
        <a className="wordmark" href="#top">Public service dependency atlas</a>
        <nav aria-label="Page navigation">
          <a href="#directory">Service directory</a>
          <a href="#method">Contribute</a>
        </nav>
        <ModeToggle mode="normal" />
      </header>

      <section className="atlas-hero" id="top">
        <p className="eyebrow">Bengaluru utilities &amp; municipal services</p>
        <h1>Public Service<br />Dependency Atlas</h1>
        <p className="atlas-lede">A birth, a marriage, a death in the family, a move, a new home, a new business — every life event comes with paperwork. The record you need is often blocked by another record, held by another department, that nobody told you about.</p>
        <p className="atlas-thesis">Government services are digitized as separate departments, but citizens live connected events. When the links between systems are undocumented, the citizen becomes the integration layer. This atlas documents those links.</p>
        <p className="prototype-note">This is a working prototype of a method for mapping documentation gaps across government services, demonstrated on Bengaluru utilities and municipal services.</p>
        <div className="hero-actions">
          <a className="primary-link" href="#directory">Explore the directory <span>↓</span></a>
        </div>
      </section>

      <section className="atlas-missing" id="missing" aria-labelledby="missing-heading">
        <div>
          <p className="step-label">What the public record leaves out</p>
          <h2 id="missing-heading">What&apos;s missing</h2>
          <p>{documentedGapCount} gaps so far, from {atlasServices.length} services in one city — a lower bound from desk research against public sources.</p>
        </div>
        <ol className="missing-example-list">
          {exampleGaps.map(({ service, gap }) => <li key={`${service.href}:${gap.id}`}><strong>{gap.situation}</strong><span>{gap.missing}</span><Link href={`${service.href}#what-nobody-has-documented`}>See this in {service.title} →</Link></li>)}
        </ol>
      </section>

      <section className="failure-layers synthesis" aria-labelledby="synthesis-heading">
        <div className="section-heading">
          <p className="step-label">Cross-service synthesis</p>
          <h2 id="synthesis-heading">One property record, three services</h2>
          <p className="section-intro">Your property record follows you into electricity, water, and tax — three journeys, one record, and you carry it between them.</p>
        </div>
        <div className="layer-grid">
          <article><span>01</span><h3>Electricity</h3><p>For an <Link href="/bescom">electricity name transfer</Link>, BESCOM needs to match your property ID (EPID) to your account. The public record does not say who repairs that match when it fails.</p></article>
          <article><span>02</span><h3>Water</h3><p>For a <Link href="/water-account">water-account transfer</Link>, BWSSB’s public page shows new-connection controls, not an existing-account name-transfer control. The next step is not published.</p></article>
          <article><span>03</span><h3>Property tax</h3><p><Link href="/property-tax">Property-tax</Link> pages list name correction and an ARO contact path, but not what the office will accept or what a completed correction looks like.</p></article>
        </div>
        <p className="atlas-thesis">The pattern is a finding, not an assumption: individual entries retain the source, access date, grade, and status behind each statement. Where the sources stop, the atlas says so.</p>
      </section>

      <section className="failure-layers" aria-labelledby="layers-heading">
        <div className="section-heading">
          <p className="step-label">Where journeys break</p>
          <h2 id="layers-heading">Three layers of failure</h2>
        </div>
        <div className="layer-grid">
          <article><span>01</span><h3>Documentation</h3><p>An older BESCOM account says it needed a builder NOC; a 2026 account says it did not. No public document explains when that NOC is required.</p></article>
          <article><span>02</span><h3>Process</h3><p>You need to move a BWSSB water account into your name, but the public portal shows only new or additional connections — not the transfer route.</p></article>
          <article><span>03</span><h3>Infrastructure</h3><p>BESCOM’s system can’t match your property ID (EPID) to your account — and no public document says who repairs that.</p></article>
        </div>
      </section>

      <section className="atlas-directory" id="directory" aria-labelledby="directory-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="step-label">Bengaluru-first directory</p>
            <h2 id="directory-heading">Which service are you stuck on?</h2>
          </div>
          <p>Each entry traces the records the service depends on, what can block it, and the evidence behind every statement.</p>
        </div>
        <div className="service-grid">
          {serviceGaps.map(({ service, gaps }) => {
            const firstGap = gaps[0];
            const cardCopy = service.status === 'Mapped'
              ? `Published route with ${gaps.length} documented gaps kept visible.`
              : `${gaps.length} documented gaps, including: ${firstGap?.situation ?? 'the remaining public record has not been fully mapped.'}`;
            return <a className="service-card mapped-service" href={service.href} key={service.title}><span className="service-category">{service.category}</span><div className={`service-status service-${service.status.toLowerCase().replaceAll(' ', '-')}`}>{service.status}</div><h3>{service.title}</h3><p>{cardCopy}</p><span className="service-cta">Open this entry →</span></a>;
          })}
        </div>
      </section>

      <section className="contribution" id="method" aria-labelledby="contribution-heading">
        <div>
          <p className="step-label">Open contribution format</p>
          <h2 id="contribution-heading">Want to strengthen a map?</h2>
        </div>
        <div>
          <p>Use the shared research format to add a source, record a gap, or show a contradiction without turning uncertainty into a guess. The existing entries are a starting point, not a claim that every public journey is fully documented.</p>
          <div className="contribution-links"><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas/blob/main/ledger/schema.json" target="_blank" rel="noreferrer">Research format ↗</a><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas/blob/main/ledger/AGENT_PROTOCOL.md" target="_blank" rel="noreferrer">Research protocol ↗</a><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas" target="_blank" rel="noreferrer">Open-source atlas ↗</a></div>
        </div>
      </section>

      <footer className="footer atlas-footer">
        <div className="footer-title"><span>Scope & limits</span><h2>Map the links.<br />Keep the gaps.</h2></div>
        <div className="footer-copy"><p>This atlas is independent research, not official government guidance. Each entry shows the evidence held, the questions that remain, and the date the material was checked.</p><div className="footer-meta"><span>Not official advice. Verify current requirements with the responsible agency and do not submit personal data through this site.</span></div><small>Atlas snapshot 2026-08-28 · Bengaluru, Karnataka, India</small></div>
      </footer>
    </main>
  );
}
