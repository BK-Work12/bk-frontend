import { useEffect } from 'react';
import ArrowDown from '../icons/arrowDown';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

export default function WithdrawModal({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const container = document.querySelector('body');
    if (isOpen) container!.style.overflow = 'hidden';
    else container!.style.overflow = '';
    return () => {
      container!.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const body = document.body;

    if (isOpen) {
      body.style.overflow = 'hidden';
      body.classList.add('modal-open');
    } else {
      body.style.overflow = '';
      body.classList.remove('modal-open');
    }

    return () => {
      body.style.overflow = '';
      body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full h-full lg:h-auto max-w-full lg:max-w-105.25 rounded-none lg:rounded-[20px] bg-[#F1F1FE] 
        border border-[#65656526] dark:border-transparent dark:bg-[#111113] 
        modalShadow py-2.25 px-3 animate-fadeIn overflow-y-auto flex flex-col justify-center lg:block"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="w-6.25 h-6.25 flex items-center justify-center 
          bg-[#FFFFFF1A] close z-10 rounded-full absolute right-5 top-5"
        >
          <Image width={12} height={12} src="/assets/Group 1597884961.png" alt="Close" />
        </button>

        {/* ================= CONFIRM SCREEN ================= */}
        <div>
          <div className="relative px-5 pt-7 pb-6.25">
            <Image
              width={1000}
              height={1000}
              src="/assets/Frame 1597886320 (2).png"
              className="absolute top-0 left-0 w-full h-full"
              alt=""
            />

            <div className="flex relative flex-col gap-11.5">
              <h2 className="text-[36px] leading-[90%] font-bold font-ui">
                {t('Entercodebefore')}
              </h2>

              <div className="flex flex-col gap-4">
                {/* Input */}
                <div className="flex flex-col gap-2.5">
                  <label className="pl-3.5 text-[22px] font-bold font-ui text-[#FFFFFFA6]">{t('Emailcode')}</label>

                  <div
                    style={{ backdropFilter: 'blur(20.9px)' }}
                    className="flex gap-6 items-center bg-[#FFFFFF0A] 
                    text-lg rounded-md font-ui font-normal 
                    pt-2.5 pb-2 px-4.5"
                  >
                    <input
                      type="text"
                      placeholder="Enter your code here"
                      className="w-full dark:placeholder:text-white 
                      outline-none bg-transparent border-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-5">
                  <button
                    className="h-15.25 rounded-xl w-full
                    font-semibold font-ui text-[22px]
                    text-[#656565] hover:brightness-110
                    hover:shadow-lg transition-all duration-200"
                    style={{
                      background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
                    }}
                  >
                    {t('Submit')}
                  </button>

                  <p className="text-[#FFFFFF66] text-lg font-normal font-ui">
                    {t('Nocodeyet')}{' '}
                    <span className="underline cursor-pointer text-[#F5FF1E] font-bold">{t('Requestanewcode')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
