import type { Metadata } from 'next';
import './globals.css';

const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  title: 'Why is my BESCOM transfer blocked?',
  description:
    'Trace the upstream record, system handoff, and evidence behind a blocked BESCOM name transfer.',
  openGraph: {
    type: 'website',
    title: 'Why is my BESCOM transfer blocked?',
    description: 'Trace the upstream record. See the evidence. Find the next step.',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'BESCOM transfer dependency chain preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why is my BESCOM transfer blocked?',
    description: 'Trace the upstream record. See the evidence. Find the next step.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
