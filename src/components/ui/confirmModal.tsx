import { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Loader } from './Loader';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Called when user clicks Confirm/Continue. If returns a promise, modal shows loading until it resolves. */
  onConfirm?: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm
}: ModalProps) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  const handleClose = () => {
    if (!confirming) onClose();
  };

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 h-full bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full h-full lg:h-auto max-w-full lg:max-w-105.25 rounded-none lg:rounded-[20px] bg-[#F1F1FE] dark:bg-[#111113] border border-[#65656526] dark:border-transparent pt-3 pb-4.5 px-3 animate-fadeIn flex flex-col justify-center lg:block">
        <div className="flex flex-col gap-2.75">
          <div className="relative px-5 flex items-end justify-center h-105">
            <button
              onClick={handleClose}
              disabled={confirming}
              className="w-6.25 h-6.25 flex items-center justify-center bg-[#FFFFFF1A] close z-10 rounded-full absolute right-1.75 top-1.75 disabled:opacity-50"
            >
              <Image width={12} height={12} src="/assets/Group 1597884961.png" alt="" />
            </button>
            <Image
              width={1000}
              height={1000}
              src="/assets/Group 1597884989 (1).png"
              className="absolute top-0 left-0 w-full h-full"
              alt=""
            />
            <Image
              width={43}
              height={43}
              src="/assets/Vector (3).png"
              className="absolute top-24 left-[50%] -translate-1/2"
              alt=""
            />
            <div className="w-full relative pb-14.75 flex flex-col gap-9 text-center">
              <h2 className="text-[32px] font-bold leading-[90%] font-ui">{t('ConfirmEarlyRedemption')}</h2>
              <p className="text-sm font-ui max-w-89.25 w-full mx-auto text-[#FFFFFF99] leading-[100%]">
                {t('earlyredemption')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.75">
            <button
              onClick={handleClose}
              disabled={confirming}
              className="h-14.75 w-full flex items-center justify-center rounded-xl bg-[#0000001A]  dark:bg-[#FFFFFF1A] glassShadowCustom text-[22px] font-bold text-[#656565] dark:text-white font-ui disabled:opacity-50"
            >
              {t('Cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming || !onConfirm}
              className="h-14.75 rounded-xl flex justify-center items-center gap-3 text-[22px] font-bold font-ui disabled:opacity-70"
              style={{
                background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
              }}
            >
              {confirming ? (
                <>
                  <Loader className="h-6 w-6 text-white" ariaLabel={t('Continue')} />
                  {t('Continue')}...
                </>
              ) : (
                <>{t('Continue')}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
