'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { enforceVersion } from '@/lib/version';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [versionOk, setVersionOk] = useState(false);

  useEffect(() => {
    // If version is stale, enforceVersion() clears everything and redirects
    if (enforceVersion()) return;
    setVersionOk(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (!versionOk || loading || !user) {
    return null;
  }

  return <>{children}</>;
}
