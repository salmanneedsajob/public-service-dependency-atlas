import type { Metadata } from 'next';
import './globals.css';

const siteOrigin = new URL('https://public-service-atlas.vercel.app');

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  title: 'Public Service Dependency Atlas',
  description:
    'A Bengaluru-first atlas of the undocumented dependencies between public services.',
  openGraph: {
    type: 'website',
    title: 'Public Service Dependency Atlas',
    description: 'Map the undocumented links between public services.',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'BESCOM transfer dependency chain preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public Service Dependency Atlas',
    description: 'Map the undocumented links between public services.',
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
