import { useState } from 'react';
import { toast } from 'react-toastify';
import { requestPasswordReset } from '@/lib/auth';
import Image from 'next/image';
import { Loader } from './Loader';
import { useTranslation } from 'react-i18next';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

export default function ForgotPassword({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const resetState = () => {
    setEmail('');
    setLoading(false);
    setSuccess(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSuccess(null);
    if (!email.trim()) {
      toast.error(t('Please enter your email address'));
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('Failed to request password reset');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal – compact card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-[#F1F1FE] dark:bg-[#111113] border border-[#65656526] dark:border-[#FFFFFF14] shadow-2xl p-6 animate-fadeIn">
        {/* Close */}
        <button
          onClick={handleClose}
          className="w-6 h-6 flex items-center justify-center bg-[#FFFFFF1A] rounded-full absolute right-4 top-4 hover:bg-[#FFFFFF30] transition-colors"
        >
          <Image width={10} height={10} src="/assets/Group 1597884961.png" alt="" />
        </button>

        {/* Title */}
        <h2 className="text-sm font-normal font-ui text-[#656565] dark:text-white mb-5">
          {t('Forgotyour')} {t('password?')}
        </h2>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="forgot-email" className="text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">
              {t('EmailAddress')}
            </label>
            <div className="flex items-center h-9 bg-white dark:bg-[#1E1E20] border border-[#65656526] dark:border-[#FFFFFF14] text-sm rounded-full font-ui font-normal px-4">
              <input
                id="forgot-email"
                type="email"
                placeholder={t('Enter Email Address')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="placeholder:text-[#65656566] dark:placeholder:text-[#FFFFFF50] w-full outline-none bg-transparent border-none text-sm font-ui text-[#656565] dark:text-white"
              />
            </div>
          </div>

          {success && <p className="text-sm text-green-400 font-ui">{success}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-9 rounded-full w-auto mx-auto px-10 flex items-center justify-center font-normal font-ui text-sm text-[#656565] hover:brightness-110 hover:shadow-lg transition-all duration-200 disabled:opacity-60 mt-1"
            style={{
              background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
            }}
          >
            {loading ? <Loader className="h-4 w-4 text-[#656565]" ariaLabel="Sending password reset" /> : t('ResetPassword')}
          </button>
        </div>
      </div>
    </div>
  );
}
