'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { submitPasswordReset } from '@/lib/auth';
import Image from 'next/image';
import { Loader } from '@/components/ui/Loader';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) {
      router.replace('/login?error=Invalid%20reset%20link');
      return;
    }
    setToken(t);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSuccess(false);

    if (!password || password.length < 8) {
      toast.error(t('Passwordleast8'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('Passwordsnotmatch'));
      return;
    }

    setLoading(true);
    try {
      await submitPasswordReset({ token, password });
      setSuccess(true);
      setTimeout(() => {
        router.replace('/login?reset=1');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('Failedresetpassword');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">
        <svg
          className="h-12 w-12 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white px-4 sm:px-6">
      <div className="relative w-full max-w-[420px] rounded-[20px] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent dark:bg-[#535353] modalShadow py-2.25 px-3">
        <div className="relative px-5 pt-7 pb-6.25">
          <Image
            width={1000}
            height={1000}
            priority
            src="/assets/Frame 1597886320 (2).png"
            className="absolute top-0 left-0 w-full h-full"
            alt=""
          />
          <form onSubmit={handleSubmit} className="flex relative flex-col gap-7">
            <h2 className="text-[36px] leading-[90%] font-bold font-display">
              {t('Resetyour')} <br /> {t('password')}
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <label htmlFor="new-password" className="pl-3.5 text-[22px] font-bold font-ui text-[#FFFFFFA6]">
                  {t('NewPassword')}
                </label>
                <div
                  style={{
                    backdropFilter: 'blur(20.899999618530273px)',
                  }}
                  className="flex gap-6 items-center bg-[#FFFFFF0A] text-lg rounded-md font-alt font-normal pt-2.5 pb-2 px-4.5"
                >
                  <input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="dark:placeholder:text-white outline-none bg-transparent border-none "
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label htmlFor="confirm-password" className="pl-3.5 text-[22px] font-bold font-ui text-[#FFFFFFA6]">
                  {t('ConfirmPassword')}
                </label>
                <div
                  style={{
                    backdropFilter: 'blur(20.899999618530273px)',
                  }}
                  className="flex gap-6 items-center bg-[#FFFFFF0A] text-lg rounded-md font-alt font-normal pt-2.5 pb-2 px-4.5"
                >
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="dark:placeholder:text-white outline-none bg-transparent border-none "
                  />
                </div>
              </div>

              {success && <p className="text-sm text-green-400 font-ui">{t('Passwordresetsucc')}</p>}

              <button
                type="submit"
                disabled={loading}
                className="
                  flex items-center justify-center
                  h-15.25  rounded-xl w-full
                  font-semibold font-ui text-[22px]
                  text-[#656565]
                  hover:brightness-110
                  hover:shadow-lg
                  transition-all duration-200
                  disabled:text-[#656565]
                "
                style={{
                  background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
                }}
              >
                {loading ? <Loader className="h-6 w-6 text-white" ariaLabel="Resetting password" /> : t('ResetPassword')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
