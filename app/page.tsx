import type { Metadata } from 'next';
import Link from 'next/link';

type Survey = {
  outcome: string;
  systems: string[];
  officialJourney: string;
  sources: Array<{ label: string; url: string; grade: 'B' | 'E'; accessedAt: string }>;
  citizenPain: { text: string; url: string; accessedAt: string } | 'none found';
};

type Service = {
  title: string;
  category: string;
  status: 'Mapped' | 'Partially mapped' | 'Unmapped';
  href?: string;
  survey?: Survey;
};

const services: Service[] = [
  { title: 'Electricity name transfer', category: 'Utility account', status: 'Mapped', href: '/bescom' },
  { title: 'Birth certificate', category: 'Civil record', status: 'Partially mapped', href: '/birth-certificate' },
  { title: 'Death certificate', category: 'Civil record', status: 'Partially mapped', href: '/death-certificate' },
  { title: 'New water / sewer connection', category: 'BWSSB utility', status: 'Partially mapped', href: '/water-connection' },
  { title: 'Water account name transfer', category: 'BWSSB utility', status: 'Partially mapped', href: '/water-account' },
  { title: 'New electricity connection', category: 'Electricity utility', status: 'Partially mapped', href: '/new-electricity' },
  { title: 'Property tax name transfer', category: 'Municipal property', status: 'Partially mapped', href: '/property-tax' },
  { title: 'Khata transfer / mutation', category: 'Municipal property', status: 'Mapped', href: '/khata' },
  { title: 'Trade licence', category: 'Municipal business', status: 'Partially mapped', href: '/trade-license' },
  { title: 'Building plan approval', category: 'Municipal planning', status: 'Partially mapped', href: '/building-plan' },
  { title: 'Marriage registration', category: 'Civil record', status: 'Partially mapped', href: '/marriage' },
  { title: 'LPG connection transfer', category: 'Household utility', status: 'Partially mapped', href: '/lpg' },
];

export const metadata: Metadata = {
  title: 'Public Service Dependency Atlas',
  description: 'A Bengaluru-first atlas of the undocumented dependencies between public services.',
};

export default function AtlasHome() {
  return (
    <main className="atlas-page">
      <header className="site-header">
        <a className="wordmark" href="#top">Public service dependency atlas</a>
        <nav aria-label="Page navigation">
          <a href="#directory">Service directory</a>
          <a href="#method">Contribute</a>
        </nav>
        <span className="schema-pill">Bengaluru first</span>
      </header>

      <section className="atlas-hero" id="top">
        <p className="eyebrow">Utilities & municipal services</p>
        <h1>Public Service<br />Dependency Atlas</h1>
        <p className="atlas-lede">A change in your life should not become a scavenger hunt across government websites. But when you buy, inherit, rent, build, or register something, the service you need often depends on records held somewhere else.</p>
        <p className="atlas-thesis">Government services are digitized as separate departments, but citizens live connected events. When the links between systems are undocumented, the citizen becomes the integration layer. This atlas documents those links.</p>
        <a className="primary-link" href="#directory">Explore the directory <span>↓</span></a>
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
        <p className="atlas-thesis">The pattern is a finding, not an assumption: individual ledgers retain the source, access date, grade, and status behind each statement. Where the sources stop, the atlas says so.</p>
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
          <p>“Unmapped” is not an empty state. It means no verified public map of this journey’s dependencies exists — the documentation gap this project is here to show.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => {
            const content = <><span className="service-category">{service.category}</span><div className={`service-status service-${service.status.toLowerCase().replaceAll(' ', '-')}`}>{service.status}</div><h3>{service.title}</h3><p>{service.status !== 'Unmapped' ? 'Evidence-led entry with public documentation, reported roadblocks, and stated limitations.' : service.survey ? 'Unmapped — what we know so far.' : 'No verified public map of this journey exists; that absence is the documentation gap this project documents.'}</p>{service.status !== 'Unmapped' && <span className="service-cta">Open the {service.title} entry →</span>}</>;
            return service.href ? <a className="service-card mapped-service" href={service.href} key={service.title}>{content}</a> : <article className="service-card" key={service.title}>{content}</article>;
          })}
        </div>
      </section>

      <section className="contribution" id="method" aria-labelledby="contribution-heading">
        <div>
          <p className="step-label">Open contribution format</p>
          <h2 id="contribution-heading">Want to map one?</h2>
        </div>
        <div>
          <p>Every unmapped card is a bounded public-research task. Use the common ledger schema and agent protocol to record evidence, uncertainty, contradictions, dates, and sources without turning a gap into a guess.</p>
          <div className="contribution-links"><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas/blob/main/ledger/schema.json" target="_blank" rel="noreferrer">Ledger schema v1.0.0 ↗</a><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas/blob/main/ledger/AGENT_PROTOCOL.md" target="_blank" rel="noreferrer">Agent protocol ↗</a><a href="https://github.com/salmanneedsajob/public-service-dependency-atlas" target="_blank" rel="noreferrer">Open-source atlas ↗</a></div>
        </div>
      </section>

      <footer className="footer atlas-footer">
        <div className="footer-title"><span>Scope & limits</span><h2>Map the links.<br />Keep the gaps.</h2></div>
        <div className="footer-copy"><p>This atlas is independent research, not official government guidance. A mapped entry makes its evidence and uncertainty visible; an unmapped card makes the lack of a verified public map visible.</p><div className="footer-meta"><span>Not official advice. Verify current requirements with the responsible agency and do not submit personal data through this site.</span></div><small>Atlas snapshot 2026-08-28 · Bengaluru, Karnataka, India</small></div>
      </footer>
    </main>
  );
}
