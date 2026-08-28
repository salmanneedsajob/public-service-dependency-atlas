import type { Metadata } from 'next';
import Link from 'next/link';
import { buildGapRegister } from '@/lib/gap-register';

export const metadata: Metadata = { title: 'For the agencies named here | Public Service Dependency Atlas' };

export default function AgenciesPage() {
  const register = buildGapRegister();
  const groups = new Map<string, { name: string; url: string; records: typeof register }>();
  for (const record of register) for (const authority of record.authorities) {
    const group = groups.get(authority.id) ?? { name: authority.name, url: authority.url, records: [] };
    group.records.push(record);
    groups.set(authority.id, group);
  }

  return (
    <main className="agency-page"><header className="site-header"><Link className="wordmark" href="/">Public service dependency atlas</Link><nav aria-label="Page navigation"><Link href="/register">Gap register</Link><Link href="/">Atlas</Link></nav><span className="schema-pill">Publish-this checklist</span></header>
      <section className="agency-hero"><p className="eyebrow">A constructive one-pager</p><h1>For the agencies named here</h1><p>Every item in this register can be made easier for citizens by publishing one clear, current procedure. That is the cheapest possible fix: publish a document, close a gap.</p><Link className="primary-link" href="/register">View the public register <span>→</span></Link></section>
      <section className="agency-checklist"><div className="section-heading"><p className="step-label">Publish-this checklist</p><h2>{register.length} procedures to make visible</h2></div>{[...groups.values()].sort((a, b) => a.name.localeCompare(b.name)).map((group) => <article key={group.name}><div><a href={group.url} rel="noreferrer" target="_blank">{group.name} ↗</a><span>{group.records.length} open gap{group.records.length === 1 ? '' : 's'}</span></div><ul>{group.records.map((record) => <li key={record.slug}><Link href={`/register/${record.slug}`}>{record.systemicFix}</Link></li>)}</ul></article>)}</section>
      <footer className="footer"><div className="footer-title"><span>Practical next step</span><h2>Publish a document.<br />Close a gap.</h2></div><div className="footer-copy"><p>The register is intended as a constructive checklist. Its records preserve the evidence and the precise piece of documentation that would make a public journey more usable.</p></div></footer>
    </main>
  );
}
