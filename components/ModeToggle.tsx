'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const modeKey = 'public-service-atlas-mode';

export function ModeToggle({ mode }: { mode: 'normal' | 'explorer' }) {
  const nextMode = mode === 'normal' ? 'explorer' : 'normal';
  const href = nextMode === 'explorer' ? '/explorer' : '/';

  return <Link className="mode-toggle" href={href} onClick={() => window.localStorage.setItem(modeKey, nextMode)}>{nextMode === 'explorer' ? 'Explorer mode' : 'Normal site'}</Link>;
}

/** The normal site remains the default; a user who explicitly chose Explorer returns there from /. */
export function RestoreExplorerPreference() {
  const router = useRouter();

  useEffect(() => {
    if (window.localStorage.getItem(modeKey) === 'explorer') router.replace('/explorer');
  }, [router]);

  return null;
}
