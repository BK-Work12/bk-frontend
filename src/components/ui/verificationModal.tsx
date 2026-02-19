'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import { getVerificationAccessToken } from '@/lib/auth';
import { Loader } from './Loader';
import { useTranslation } from 'react-i18next';

const SumsubWebSdk = dynamic(() => import('@sumsub/websdk-react').then((mod) => mod.default), { ssr: false });

const SDK_LOAD_DELAY_MS = 1800;

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

/** TC-F1/F2: "Almost There" pop-up when Step 2 complete and Step 3 incomplete; Verify Identity CTA opens SumSub verification flow. */
export default function VerificationModal({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const expirationHandler = useCallback(() => getVerificationAccessToken().then((r) => r.token), []);

  useEffect(() => {
    if (!accessToken) {
      setSdkReady(false);
      return;
    }
    const t = setTimeout(() => setSdkReady(true), SDK_LOAD_DELAY_MS);
    return () => clearTimeout(t);
  }, [accessToken]);

  const handleVerifyClick = async () => {
    setLoading(true);
    try {
      const { token } = await getVerificationAccessToken();
      setAccessToken(token);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start verification');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAccessToken(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center">
        <div className="absolute inset-0 h-full bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative w-full h-full lg:h-auto max-w-full lg:max-w-105.25 rounded-none lg:rounded-[20px] border bg-[#F1F1FE] dark:bg-[#111113] border-[#65656526] dark:border-transparent pt-3 pb-4.5 px-3 animate-fadeIn flex flex-col justify-center lg:block">
          <div className="flex flex-col gap-2.75">
            {!accessToken ? (
              <>
                <div className="relative px-5 flex items-end justify-center h-85.25">
                  <button
                    onClick={handleClose}
                    className="w-6.25 h-6.25 flex items-center justify-center bg-[#FFFFFF1A] close z-10 rounded-full absolute right-1.75 top-1.75"
                  >
                    <Image width={12} height={12} src="/assets/Group 1597884961.png" alt="" />
                  </button>
                  <Image
                    width={1000}
                    height={1000}
                    src="/assets/Group 1597884989.png"
                    className="absolute top-0 left-0 w-full h-full"
                    alt=""
                  />
                  <Image
                    src={'/assets/Vector (2).png'}
                    width={49.5}
                    height={49.5}
                    alt=""
                    className="absolute top-[32%] -translate-1/2 left-[50%]"
                  />
                  <div className="w-full relative pb-14 flex flex-col gap-9 text-center">
                    <h2 className="text-[32px] font-bold leading-[90%] font-ui">{t('AlmostThere')}</h2>
                    <p className="text-sm font-ui max-w-89.25 w-full mx-auto text-[#FFFFFF99] leading-[100%]">
                      {t('Completetheverificationsteps')}
                    </p>
                  </div>
                </div>
                <div className="w-full gap-2.75">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleVerifyClick}
                    className="h-14.75 w-full rounded-xl flex justify-center items-center gap-3 text-[22px] font-bold font-ui text-white disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                    }}
                  >
                    {loading ? (
                      <Loader className="h-6 w-6 text-white" ariaLabel="Starting verification" />
                    ) : (
                      'Verify Identity'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Header: title left, close right */}
                <div className="flex items-center justify-between px-1 pb-3">
                  <h2 className="text-xl font-bold font-ui text-white">{t('Identityverification')}</h2>
                  <button
                    onClick={handleClose}
                    className="w-6.25 h-6.25 flex items-center justify-center bg-[#FFFFFF1A] rounded-full hover:bg-[#FFFFFF26] transition-colors"
                    aria-label="Close"
                  >
                    <Image width={12} height={12} src="/assets/Group 1597884961.png" alt="" />
                  </button>
                </div>
                {/* Content: loader until SDK ready, then Sumsub */}
                <div className="relative min-h-[320px] rounded-xl overflow-hidden bg-[#1a1a1a]">
                  {!sdkReady ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <Loader className="h-12 w-12 text-[#53A7FF]" ariaLabel="Loading verification" />
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden h-full min-h-[320px]">
                      <SumsubWebSdk
                        accessToken={accessToken}
                        expirationHandler={expirationHandler}
                        config={{
                          lang: 'en',
                        }}
                        options={{
                          theme: 'dark',
                        }}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
