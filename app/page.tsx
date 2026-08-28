import type { Metadata } from 'next';
import Link from 'next/link';
import { atlasServices, registerOpenedOn } from '@/lib/atlas-data';
import { buildGapRegister } from '@/lib/gap-register';
import { collectUndocumentedQuestions } from '@/lib/undocumented';

export const metadata: Metadata = {
  title: 'Public Service Dependency Atlas',
  description: 'A Bengaluru-first atlas of the undocumented handoffs between public services.',
};

export default function AtlasHome() {
  const serviceGaps = atlasServices.map((service) => ({ service, gaps: collectUndocumentedQuestions(service.ledger) }));
  const register = buildGapRegister();
  const headlineGaps = serviceGaps
    .filter((item) => item.gaps.length)
    .map((item) => ({ service: item.service, gap: item.gaps[0] }))
    .sort((a, b) => a.gap.priority - b.gap.priority || a.service.title.localeCompare(b.service.title))
    .slice(0, 5);

  return (
    <main className="atlas-page">
      <header className="site-header">
        <a className="wordmark" href="#top">Public service dependency atlas</a>
        <nav aria-label="Page navigation">
          <a href="#register">Gap register</a>
          <a href="#directory">Service directory</a>
          <a href="#method">Contribute</a>
        </nav>
        <span className="schema-pill">Bengaluru first</span>
      </header>

      <section className="atlas-hero" id="top">
        <p className="eyebrow">Bengaluru utilities &amp; municipal services</p>
        <h1>Public Service<br />Dependency Atlas</h1>
        <p className="atlas-lede">A birth, a marriage, a death in the family, a move, a new home, a new business — every life event comes with paperwork. The record you need is often blocked by another record, held by another department, that nobody told you about.</p>
        <p className="atlas-thesis">Government services are digitized as separate departments, but citizens live connected events. When the links between systems are undocumented, the citizen becomes the integration layer. This atlas documents those links.</p>
        <p className="prototype-note">This is a working prototype of a method for mapping documentation gaps across government services, demonstrated on Bengaluru utilities and municipal services.</p>
        <div className="hero-actions">
          <a className="primary-link" href="#directory">Explore the directory <span>↓</span></a>
          <a className="secondary-link" href="#register">Open the gap register →</a>
        </div>
      </section>

      <section className="atlas-gap-rollup" id="register" aria-labelledby="atlas-gap-heading">
        <div>
          <p className="step-label">Working register · opened {registerOpenedOn}</p>
          <h2 id="atlas-gap-heading">The documentation-debt register</h2>
          <p className="register-tally">{register.length} so far, from {atlasServices.length} services in one city — a lower bound, from desk research against public sources.</p>
        </div>
        <div>
          <p>This is a day-zero public register of documentation debt. Under Section 4(1)(b) of the RTI Act 2005, public authorities are already expected to proactively publish their procedures.</p>
          <p className="falsifiability-line">A gap means our research found no published procedure. If one of these is documented somewhere public, show us — we verify and close it. Closure is the system working.</p>
          <p>A gap closes when the responsible authority publishes the missing document or procedure, we verify it, and the closed record links to that source with a date.</p>
          <ul>
            {headlineGaps.map(({ service, gap }) => {
              const record = register.find((item) => item.service.id === service.id && item.id === gap.id);
              return <li key={`${service.href}:${gap.id}`}><Link href={record ? `/register/${record.slug}` : service.href}>{service.title}</Link><strong>{gap.situation}</strong><span>{gap.missing}</span></li>;
            })}
          </ul>
          <Link className="register-link" href="/register">View all {register.length} open gaps →</Link>
        </div>
      </section>

      <section className="failure-layers synthesis" aria-labelledby="synthesis-heading">
        <div className="section-heading">
          <p className="step-label">Cross-service synthesis</p>
          <h2 id="synthesis-heading">The recurring handoffs</h2>
        </div>
        <div className="layer-grid">
          <article><span>01</span><h3>Property identity</h3><p><Link href="/khata">Khata and property-record changes</Link> surface the record that later utility and tax journeys can depend on. The entries distinguish published requirements from reported handoffs.</p></article>
          <article><span>02</span><h3>Proof moves, records do not</h3><p>Across <Link href="/property-tax">property tax</Link>, <Link href="/water-account">water</Link>, and <Link href="/bescom">electricity</Link>, a citizen is repeatedly asked to carry evidence between separate records.</p></article>
          <article><span>03</span><h3>A visible form is not a complete path</h3><p>Published forms and portals exist for services such as <Link href="/lpg">LPG</Link> and <Link href="/trade-license">trade licences</Link>; their case-specific routing, decisions, and recovery paths often remain partial or unknown.</p></article>
        </div>
        <p className="atlas-thesis">The pattern is a finding, not an assumption: individual entries retain the source, access date, grade, and status behind each statement. Where the sources stop, the atlas says so.</p>
      </section>

      <section className="failure-layers" aria-labelledby="layers-heading">
        <div className="section-heading">
          <p className="step-label">Where journeys break</p>
          <h2 id="layers-heading">Three layers of failure</h2>
        </div>
        <div className="layer-grid">
          <article><span>01</span><h3>Documentation</h3><p>The actual handoff between agencies is not described in one public, usable place.</p></article>
          <article><span>02</span><h3>Process</h3><p>A form or portal exists, but its prerequisites, exceptions, and recovery routes are unclear.</p></article>
          <article><span>03</span><h3>Infrastructure</h3><p>Systems hold related records, yet no public contract explains how they connect or who can repair a failed link.</p></article>
        </div>
      </section>

      <section className="atlas-directory" id="directory" aria-labelledby="directory-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="step-label">Bengaluru-first directory</p>
            <h2 id="directory-heading">Which journey needs a map?</h2>
          </div>
          <p>Every card is a published, evidence-led entry. “Partially mapped” means the available record still leaves important questions unanswered; those questions are listed in the entry.</p>
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
