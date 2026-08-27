import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Why is my BESCOM transfer blocked?',
  description:
    'Trace the upstream record, system handoff, and evidence behind a blocked BESCOM name transfer.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
