'use client';

import Link from 'next/link';

const modeKey = 'public-service-atlas-mode';

export function ModeToggle({ mode }: { mode: 'normal' | 'explorer' }) {
  const nextMode = mode === 'normal' ? 'explorer' : 'normal';
  const href = nextMode === 'explorer' ? '/explorer' : '/';

  return <Link className="mode-toggle" href={href} onClick={() => window.localStorage.setItem(modeKey, nextMode)}>{nextMode === 'explorer' ? 'Filing cabinet' : 'Normal site'}</Link>;
}
