'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (user === undefined) return; // still loading
    if (!user || user.role !== 'admin') {
      router.replace('/dashboard');
    } else {
      setOk(true);
    }
  }, [user, router]);

  if (!ok) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-lg font-ui text-[#FFFFFF80]">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
