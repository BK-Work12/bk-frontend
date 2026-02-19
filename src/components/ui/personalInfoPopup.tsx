import { useState } from 'react';
import { toast } from 'react-toastify';
import ArrowDown from '../icons/arrowDown';
import { requestPasswordReset } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

export default function PersonalInfoPopup({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 h-full bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full h-full lg:h-auto max-w-full lg:max-w-105.25 rounded-none lg:rounded-[20px] dark:bg-[#111113] bg-white border border-[#65656526] dark:border-transparent pt-3 pb-4.5 px-3 animate-fadeIn flex flex-col justify-center lg:block">
        <div className="flex flex-col gap-2.75">
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
              <h2 className="text-[32px] font-bold leading-[90%] font-ui">{t('Finishsettingupaccount')}</h2>
              <p className="text-sm font-ui max-w-89.25 w-full mx-auto text-[#FFFFFF99] leading-[100%]">
                {t('Addyourpersonaldetails')}
              </p>
            </div>
          </div>
          <div className="  w-full gap-2.75">
            <Link
              href="/profile"
              onClick={onClose}
              className="h-14.75 w-full rounded-xl flex justify-center items-center gap-3 text-[22px] font-bold font-ui text-white"
              style={{
                background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
              }}
            >
              {t('AddPersonalInformation')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
