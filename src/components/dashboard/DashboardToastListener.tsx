'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export function DashboardToastListener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const login = searchParams.get('login');
    const signup = searchParams.get('signup');
    if (!login && !signup) return;

    if (login === 'success') {
      toast.success('Login Successful!');
      router.replace(pathname ?? '/dashboard', { scroll: false });
      return;
    }
    if (signup === 'success') {
      toast.success('Sign up successful!');
      router.replace(pathname ?? '/dashboard', { scroll: false });
      return;
    }
  }, [searchParams, router, pathname]);

  return null;
}
