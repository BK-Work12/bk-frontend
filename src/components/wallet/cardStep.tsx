'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { GradientBorderGray } from '../ui/gradientBorder';
import Image from 'next/image';
import ArrowDown from '../icons/arrowDown';
import { getToken } from '@/lib/auth';
import { createFiatDeposit, getFiatFeePercent, type CreateDepositResponse } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { PayWithInput } from '../ui/PayWithInput';
import { useAuth } from '@/context/AuthContext';

const MIN_AMOUNT_USD = 1;
const PROVIDER_LABEL = 'NowPayments';
/** Fallback fee when API is unavailable (0.5%) */
const DEFAULT_FIAT_FEE_PERCENT = 0.005;

export const CardStep = ({
  setShowStep1,
  onSwitchToCrypto,
  kycRequiredAmount = 5000,
}: {
  setShowStep1: (value: boolean) => void;
  onSwitchToCrypto?: () => void;
  kycRequiredAmount?: number;
}) => {
  const { t } = useTranslation();
  const { step3Complete, openAlmostThereModal } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const [country, setCountry] = useState({
    label: 'United States',
    icon: '/assets/flags 1.svg',
    code: 'US',
  });
  const [feePercent, setFeePercent] = useState<number>(DEFAULT_FIAT_FEE_PERCENT);

  useEffect(() => {
    getFiatFeePercent()
      .then(setFeePercent)
      .catch(() => setFeePercent(DEFAULT_FIAT_FEE_PERCENT));
  }, []);

  const handleComplete = async () => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num < MIN_AMOUNT_USD) {
      toast.error(`Please enter a valid amount (min ${MIN_AMOUNT_USD} USD).`);
      return;
    }
    const token = getToken();
    if (!token) {
      toast.error('Please log in to deposit.');
      return;
    }
    setLoading(true);
    try {
      const data = await createFiatDeposit(token, { amount: num });
      const paymentLink = data.paymentLink;
      if (paymentLink) {
        window.location.href = paymentLink;
        return;
      }
      toast.error('No payment link received. Please try again or use crypto deposit.');
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Deposit failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const amountNum = amount && Number.isFinite(parseFloat(amount)) ? parseFloat(amount) : 0;
  const amountDisplay = amountNum > 0 ? amountNum.toFixed(2) : '0.00';
  const providerFeeUsd = amountNum > 0 ? amountNum * feePercent : 0;
  const providerFeeDisplay = providerFeeUsd > 0 ? providerFeeUsd.toFixed(2) : '0.00';
  const youWillGetUsd = amountNum > 0 ? amountNum - providerFeeUsd : 0;
  const youWillGetDisplay = youWillGetUsd > 0 ? youWillGetUsd.toFixed(2) : '0.00';

  return (
    <div className="py-18.25  max-w-197.5 w-full mx-auto">
      <div className=" flex flex-col   rounded-[20px]    ">
        <div className="flex max-lg:px-3.25 justify-end items-center px-3.75">
          <span className="text-xs lg:text-sm text-[#656565A6] dark:text-[#FFFFFF66] font-ui leading-tight font-normal">
            {t('Step2outof2')}
          </span>
        </div>
        <div className="flex max-lg:px-3.25  flex-col gap-5 pt-7.25">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PayWithInput
              t={t}
              country={country}
              countryOpen={countryOpen}
              amount={amount}
              onToggleCountry={() => setCountryOpen((v) => !v)}
              onSelectCountry={(c) => {
                setCountry(c);
                setCountryOpen(false);
              }}
              onAmountChange={setAmount}
            />

            <div className="flex flex-col gap-2.5">
              <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-3.5 font-medium text-sm font-ui">
                {t('Youreceive')}
              </label>
              <div className="px-3 lg:px-4.5 h-9 lg:h-11 bg-white dark:bg-[#111111] rounded-full flex gap-3 items-center">
                <span className="text-sm text-[#656565A6] dark:text-[#FFFFFF66] font-ui truncate">
                  {t('Accountbalance')} (USD)
                </span>
                <span className="text-sm text-[#656565A6] dark:text-[#FFFFFF66] font-ui ml-auto shrink-0">
                  {amountNum > 0 ? `${youWillGetDisplay} USD` : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-3.5 font-medium text-sm font-ui">
              {t('PromoCode')}
            </label>
            <div className="px-3 lg:px-4.5 bg-white dark:bg-[#111111] rounded-full flex justify-between py-1.5 items-center relative">
              <div className="flex w-full gap-2.5 lg:gap-3 items-center">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-[#323234] dark:bg-[#1E1E20] rounded-full flex items-center justify-center shrink-0">
                  <Image width={16} height={16} src="/assets/Gift--Streamline-Core.png" alt="" />
                </div>
                <input
                  type="text"
                  placeholder={t('Enter Code')}
                  className="dark:placeholder:text-[#FFFFFF66] w-full text-black dark:text-white placeholder:text-[#656565A6] outline-none bg-transparent border-none text-sm font-ui"
                />
              </div>
              <h2 className="text-sm text-[#656565] dark:text-white font-medium font-ui cursor-pointer">
                {t('Apply')}
              </h2>
            </div>
          </div>
        </div>

        <div className="pt-10  pb-6.25">
          <div className="flex flex-col gap-17.75">
            <div>
              <div className="grid max-lg:px-3.25  grid-cols-2 max-lg:gap-7 lg:flex lg:pl-3.5  justify-between lg:max-w-165.75 w-full">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFF66]">
                    {t('Method')}
                  </span>
                  <h2 className="text-sm font-ui font-medium text-[#656565] dark:text-white">{t('CardPayment')}</h2>
                </div>
                <div className="flex  flex-col gap-1">
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFF66]">
                    {t('Provider')}
                  </span>
                  <h2 className="text-sm font-ui font-medium text-[#656565] dark:text-white">{PROVIDER_LABEL}</h2>
                </div>
                <div className=" hidden lg:flex flex-col  gap-1">
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFF66]">
                    {t('Total')}
                  </span>
                  <h2 className="text-sm font-ui font-medium text-[#656565] dark:text-white">{amountDisplay} USD</h2>
                </div>
              </div>
              <div className="my-7 h-px bg-[#393939] w-full"></div>
              <div className=" grid grid-cols-2 max-lg:px-3.25  max-lg:gap-7 lg:flex lg:pl-3.5 justify-between max-w-98 w-full">
                <div className="  lg:hidden flex flex-col  gap-1">
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFF66]">
                    {t('Total')}
                  </span>
                  <h2 className="text-sm font-ui font-medium text-[#656565] dark:text-white">{amountDisplay} USD</h2>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFF66]">
                    {t('ProviderFee')}
                  </span>
                  <h2 className="text-sm font-ui font-medium text-[#656565] dark:text-white">
                    {amountNum > 0 ? `${providerFeeDisplay} USD` : '0'}
                  </h2>
                </div>
                <div className="hidden lg:flex  flex-col gap-1">
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFF66]">
                    {t('YouWillGet')}
                  </span>
                  <h2 className="text-sm font-ui font-medium text-[#656565] dark:text-white">
                    {amountNum > 0 ? `~${youWillGetDisplay} USD` : '—'}
                  </h2>
                </div>
              </div>
              <div className="my-7 lg:hidden h-px bg-[#393939] w-full"></div>
              <div className=" lg:hidden max-lg:px-3.25  flex  flex-col gap-1">
                <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFF66]">
                  {t('YouWillGet')}
                </span>
                <h2 className="text-sm font-ui font-medium text-[#656565] dark:text-white">
                  {amountNum > 0 ? `~${youWillGetDisplay} USD` : '—'}
                </h2>
              </div>
            </div>
            <p className="text-center hidden lg:block text-[#656565A6] dark:text-[#FFFFFF66] text-sm font-normal font-ui">
              {t('HaveCrypto')}{' '}
              <span
                role="button"
                tabIndex={0}
                className="underline cursor-pointer text-[#6B63DF] dark:text-[#F5FF1E] font-bold hover:opacity-90"
                onClick={() => onSwitchToCrypto?.()}
                onKeyDown={(e) => e.key === 'Enter' && onSwitchToCrypto?.()}
              >
                {t('DepositviaCrypto')}
              </span>
            </p>
          </div>
        </div>

        <div className="grid max-lg:px-3.25  grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setShowStep1(true);
            }}
            className="h-9 lg:h-11 max-sm:order-2 bg-[#0000001A] text-[#656565] dark:text-white dark:bg-[#FFFFFF1A] border border-[#FFFFFF4D] rounded-full flex items-center justify-center text-sm font-ui font-normal"
          >
            {t('PreviousStep')}
          </button>
          <button
            type="button"
            className="h-9 lg:h-11 relative overflow-hidden rounded-full flex items-center justify-center w-full font-normal font-ui text-sm text-[#656565] hover:brightness-110 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:text-[#656565]"
            style={{
              background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
            }}
            onClick={handleComplete}
            disabled={loading}
          >
            <Image
              width={1000}
              height={1000}
              src="/assets/Frame 15.svg"
              className="absolute z-0 w-full h-full top-0 left-0"
              alt=""
            />
            <span className="relative text-black font-normal font-ui text-sm">{t('Complete')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
