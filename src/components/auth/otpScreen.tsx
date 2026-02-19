'use client';
import Image from 'next/image';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { GradientBorderGray } from '../ui/gradientBorder';
import { Loader } from '../ui/Loader';
import { verifySignupOtp, sendSignupOtp } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
type Props = {
  email: string;
  phone: string;
  onVerified: (signupToken: string) => void;
  onBack: () => void;
};

export const OtpScreen = ({ email, phone, onVerified, onBack }: Props) => {
  const { t } = useTranslation();
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Distribute a full OTP string across all inputs (used by paste + iOS autofill)
  const fillOtp = (digits: string) => {
    const chars = digits.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    if (!chars.length) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    chars.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(chars.length, OTP_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleChange = (value: string, index: number) => {
    // iOS autofill may dump the full code into one input — detect and distribute
    if (value.length > 1) {
      fillOtp(value);
      return;
    }
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Native input event handler for iOS autofill (fires before React onChange in some cases)
  const handleNativeInput = (index: number) => (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.value.length > 1) {
      fillOtp(input.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text/plain') || '').replace(/\D/g, '');
    fillOtp(pasted);
  };

  // Attach native 'input' listeners for iOS SMS autofill (bypasses React onChange)
  useEffect(() => {
    const handlers: Array<{ el: HTMLInputElement; handler: (e: Event) => void }> = [];
    inputsRef.current.forEach((el, idx) => {
      if (!el) return;
      const handler = (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (input.value.length > 1) {
          fillOtp(input.value);
        }
      };
      el.addEventListener('input', handler);
      handlers.push({ el, handler });
    });
    return () => {
      handlers.forEach(({ el, handler }) => el.removeEventListener('input', handler));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const code = otp.join('');

  const verifyOtp = async () => {
    if (code.length !== OTP_LENGTH) return;
    setLoading(true);
    try {
      const { signupToken } = await verifySignupOtp({ email, phone, code });
      onVerified(signupToken);
    } catch (err: unknown) {
      const payload = err instanceof ApiError ? (err.payload as { message?: string; code?: string }) : undefined;
      const message = payload?.message ?? (err instanceof Error ? err.message : 'Verification failed');
      const codeType = payload?.code;
      if (codeType === 'expired') {
        toast.error(t('CodeExpired'));
      } else {
        toast.error(message || t('Invalidcode'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await sendSignupOtp({ email, phone });
      setOtp(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
      toast.success(t('New code sent'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('Failed to resend');
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const backLogin = () => {
    onBack();
  };

  return (
    <div className="max-w-126.25 mx-auto w-full  lg:py-12">
      <div className="bg-[#F1F1FE] border border-[#65656526] dark:border-transparent dark:bg-[#111111] rounded-[20px] glass-shadow22 py-2.25 flex flex-col gap-1.5 lg:gap-3.5 px-2 lg:px-3">
        <div className="relative px-3.25 flex justify-center items-end h-109.75 bg-[#1E1E20] rounded-[18px] overflow-hidden lg:h-118.25">
          <Image
            fill
            priority
            sizes="100vw"
            quality={80}
            src={'/assets/Group 1597887211.png'}
            className="w-full h-full   object-cover absolute top-0 left-0 z-0"
            alt=""
          />
          <Image
            src={'/assets/iconamoon_profile-fill (1).svg'}
            width={66}
            height={66}
            alt=""
            className="absolute z-1 top-18 left-[50%] -translate-x-1/2"
          />
          <div className="flex w-full justify-between items-center absolute top-2.75 px-3">
            <button
              onClick={backLogin}
              className="w-6.25 h-6.25 rounded-full bg-[#FFFFFF1A] close flex items-center justify-center"
            >
              <Image width={12} height={12} src={'/assets/Vector 91.svg'} alt="" />
            </button>
            <button
              onClick={backLogin}
              className="w-6.25 h-6.25 rounded-full bg-[#FFFFFF1A] close flex items-center justify-center"
            >
              <Image width={9.2} height={9.19} src={'/assets/Group 1597884981 (1).svg'} alt="" />
            </button>
          </div>
          <div className="flex relative flex-col items-center pb-5.5 lg:pb-14">
            <h2 className="text-[32px] font-bold font-ui leading-[90%] pb-5.75">{t('confirmationCode')}</h2>
            <p className="max-w-83.25 w-full text-[#FFFFFF99] text-sm text-center font-ui font-normal pb-6.75 leading-[100%]">
              {t('SmsCode')}
            </p>
            <div className="grid grid-cols-6 lg:flex pb-6.75 gap-2 items-center">
              {otp.map((digit, index) => {
                const isFilled = Boolean(digit);

                return (
                  <motion.input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={index === 0 ? OTP_LENGTH : 1}
                    value={digit}
                    placeholder="*"
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    initial={false}
                    animate={{
                      scale: isFilled ? 1.05 : 1,
                      borderColor: isFilled ? '#C8C8C8' : '#454545',
                    }}
                    transition={{
                      duration: 0.18,
                      ease: 'easeOut',
                    }}
                    className={`
        w-14.75 h-14.75
        rounded-lg
        bg-[#262628]
        border
        text-center
        text-lg
        leading-[100%]
        placeholder:text-[#FFFFFF80]
        font-bold
        text-[#8EDD23]
        focus:outline-none
      `}
                  />
                );
              })}
            </div>
            <p className="text-sm text-center leading-[100%] font-ui text-[#FFFFFF99]">
              {t('notgetSMS')}{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-[#8EDD23] cursor-pointer hover:underline disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                {resendLoading ? <Loader className="h-4 w-4" ariaLabel="Sending" /> : t('ResendCode')}
              </button>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={verifyOtp}
          disabled={code.length !== OTP_LENGTH || loading}
          className={`h-9 mt-1.75 max-w-max mx-auto px-10 rounded-full flex items-center justify-center font-normal font-ui text-sm transition-all duration-200
    ${
      code.length !== OTP_LENGTH || loading
        ? ' disabled:bg-[#FFFFFF1A] dark:disabled:bg-[#FFFFFF1A] disabled:border disabled:border-[#FFFFFF1A] disabled:text-white dark:disabled:text-[#FFFFFF80] disabled:cursor-not-allowed'
        : 'enabled:text-black enabled:hover:brightness-110 enabled:hover:shadow-lg'
    }`}
          style={
            code.length === OTP_LENGTH && !loading
              ? { background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }
              : {}
          }
        >
          {loading ? <Loader className="h-6 w-6" ariaLabel="Verifying" /> : t('Continue')}
        </button>
      </div>
    </div>
  );
};
