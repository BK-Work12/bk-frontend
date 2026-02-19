'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import CurrencySlider from './CurrencySlider';
// import { InvestmentTable } from './InvestmentTable';
import { ChartData } from './chartData';
import Modal from '../ui/modal';
import { GradientBorder } from '../ui/gradientBorder';
import Image from 'next/image';
import DislaimerModal from '../ui/disclaimerPopup';
import { useAuth } from '@/context/AuthContext';
import RotatedProgress from '../ui/RotatedProgress';
import { getToken } from '@/lib/auth';
import { createSubscription, saveSubscriptionPDF, type CreateInvestResponse, type Strategy as ApiStrategy } from '@/lib/api';
import { toast } from 'react-toastify';
import PlacedOrderModal from '../ui/placedOrderModal';
import { useTranslation } from 'react-i18next';
import { buildPayoutSchedule, getFrequency, fmtUSD, type PayoutSchedule } from '@/lib/bondInterest';

type Strategy = ApiStrategy & { id: string; raised: number };

const DefaultAmount = [
  250,
  500,
  1000,
  2500
]

const currencyOptions = [
  {
    label: 'Ethereum',
    muteLabel: 'ETH',
    icon: '/assets/ethereum (8) 1.svg',
    bgColor: '#272727',
  },
  {
    label: 'Tron',
    muteLabel: 'ETH',
    icon: '/assets/token-branded_tron.svg',
    bgColor: '#272727',
  },
  {
    label: 'Solana',
    muteLabel: 'ETH',
    icon: '/assets/token-branded_solanaa.svg',
    bgColor: '#272727',
  }
];

const defaultCurrency = {
  label: 'Ethereum',
  muteLabel: 'ETH',
  icon: '/assets/Group.svg',
  bgColor: '#272727',
};

/** Convert fundSize string (e.g. "6 months", "1 year") to short format: "6m", "1y", "1d". */
function formatFundSizeShort(fundSize: string): string {
  const s = (fundSize || '').trim().toLowerCase();
  const day = s.match(/(\d+)\s*day/i);
  if (day) return `${day[1]}d`;
  const month = s.match(/(\d+)\s*month/i);
  if (month) return `${month[1]}m`;
  const year = s.match(/(\d+)\s*year/i);
  if (year) return `${year[1]}y`;
  return fundSize || '—';
}

/** Date of the day after the first sector period from today (e.g. Weekly → +7 days). */
function getNextPayoutDate(sector: string): string {
  const d = new Date();
  const s = (sector || '').toLowerCase();
  if (s.includes('week')) {
    d.setDate(d.getDate() + 7);
  } else if (s.includes('quarter')) {
    d.setMonth(d.getMonth() + 3);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getCurrencyFromProfile(
  preferredNetwork: string | undefined,
  preferredCurrency: string | undefined,
): typeof defaultCurrency {
  if (!preferredCurrency?.trim()) return defaultCurrency;
  const key = preferredCurrency.trim().toUpperCase();
  const option = currencyOptions.find((o) => o.muteLabel?.toUpperCase() === key);
  if (!option) return defaultCurrency;
  return { ...option, muteLabel: preferredCurrency.trim() };
}

function formatPayoutDateShort(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export const InvestDetails = ({
  strategy,
  allStrategies,
  onStrategyChange,
}: {
  strategy: Strategy;
  allStrategies?: Strategy[];
  onStrategyChange?: (s: Strategy) => void;
}) => {
  const { t } = useTranslation();
  const { user, step2Complete, step3Complete, openFinishSetupModal, openAlmostThereModal } = useAuth();
  const [open, setOpen] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [paymentData, setPaymentData] = useState<CreateInvestResponse | null>(null);
  const [currency, setCurrency] = useState(defaultCurrency);

  useEffect(() => {
    const fromProfile = getCurrencyFromProfile(user?.preferredNetwork, user?.preferredCurrency);
    setCurrency(fromProfile);
  }, [user?.preferredCurrency]);

  const minAmount = useMemo(() => Number(strategy.minInvestment) || 0, [strategy.minInvestment]);
  const maxAmount = useMemo(() => Number(strategy.cap) || minAmount, [strategy.cap, minAmount]);
  const [amount, setAmount] = useState(0);
  const [amountInput, setAmountInput] = useState('');

  // Set amount to the minimum when strategy changes (e.g. via dropdown)
  useEffect(() => {
    const min = Number(strategy.minInvestment) || 0;
    setAmount(min);
    setAmountInput(min > 0 ? min.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
  }, [strategy.strategyId || strategy.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isPackageDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-package-dropdown]')) {
        setIsPackageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isPackageDropdownOpen]);

  useEffect(() => {
    setAmount((prev) => Math.min(maxAmount, Math.max(minAmount, prev)));
  }, [minAmount, maxAmount]);


  const schedule: PayoutSchedule = useMemo(() => {
    const apy = (strategy.apy ?? 0) / 100;
    const frequency = getFrequency(strategy.payoutFrequency ?? '');
    const termMonths = strategy.termMonths ?? 12;
    return buildPayoutSchedule({
      principal: amount,
      apy,
      startDate: new Date(),
      termMonths,
      frequency,
    });
  }, [amount, strategy.apy, strategy.payoutFrequency, strategy.termMonths]);

  const handleAmountChange = useCallback(
    (value: number) => {
      const clamped = Math.min(maxAmount, Math.max(minAmount, value));
      setAmount(clamped);
      setAmountInput(clamped.toString());
    },
    [minAmount, maxAmount],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');

    if (raw === '') {
      setAmountInput('');
      return;
    }

    let n = Number(raw);
    if (Number.isNaN(n)) return;

    // 🚫 hard limit
    if (n > maxAmount) {
      n = maxAmount;
    }

    setAmount(n);
    setAmountInput(n.toString());
  };

  const handleDefaultAmountClick = (amount: number) => {
    if (Number.isNaN(amount)) return;

    if (amount < minAmount) {
      amount = minAmount;
    }

    // 🚫 hard limit
    if (amount > maxAmount) {
      amount = maxAmount;
    }

    setAmount(amount);
    setAmountInput(amount.toString());
  };

  const handleInputBlur = () => {
    const clamped = Math.min(maxAmount, Math.max(minAmount, amount));

    setAmount(clamped);
    setAmountInput(
      clamped.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-2">
        <div className="w-full">
          <div className="rounded-[18px] pt-4 lg:pt-6 px-2.5 lg:px-2.75 pb-2.5 lg:pb-2.75 bg-[#F1F1FE] dark:bg-transparent border border-[#40404059]">
            <div className="flex flex-col pb-3 lg:pb-4.75 pl-3 gap-1">
              <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white text-center lg:text-left">
                {t('youcanearn')}
              </h2>
              <p
                style={{ letterSpacing: '-4%' }}
                className="font-ui text-sm font-normal text-[#656565] dark:text-[#FFFFFFA6]"
              >
                {t('potentialearnings')}
              </p>
            </div>
            <div className="flex pb-3 lg:pb-5 flex-col gap-2.5 lg:gap-4.5">
              <span className="pl-3.5 text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                {t('Assets')}
              </span>
              <div className="relative" data-package-dropdown>
                <button
                  type="button"
                  onClick={() => allStrategies && allStrategies.length > 1 && setIsPackageDropdownOpen((v) => !v)}
                  className="bg-[#FFFFFF] dark:bg-[#1E1E20] rounded-md pl-4.5 pr-3 lg:pr-5 pt-2.5 pb-2 flex items-center justify-between w-full cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-all"
                >
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="w-9 h-9 lg:w-10.75 lg:h-10.75 rounded-md flex items-center justify-center bg-[#70AE1C] shrink-0">
                      <Image
                        width={15}
                        height={15}
                        priority
                        quality={80}
                        src="/assets/teenyicons_certificate-outline.svg"
                        alt=""
                      />
                    </div>
                    <span className="text-sm font-normal font-ui text-[#656565] dark:text-white truncate">
                      {strategy.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-[#70AE1C33] rounded-full max-w-max px-3 h-7 flex items-center justify-center font-normal font-ui text-xs text-[#70AE1C] whitespace-nowrap">
                      {strategy.apy}% APY {(strategy.type ?? 'Fixed').charAt(0).toUpperCase() + (strategy.type ?? 'Fixed').slice(1)}
                    </span>
                    {allStrategies && allStrategies.length > 1 && (
                      <svg
                        className={`w-4 h-4 text-[#656565] dark:text-[#FFFFFFA6] transition-transform ${isPackageDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </button>
                {/* Package dropdown */}
                {isPackageDropdownOpen && allStrategies && allStrategies.length > 1 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E20] border border-[#65656526] dark:border-[#FFFFFF14] rounded-md shadow-lg z-40 overflow-hidden">
                    {allStrategies.map((s) => (
                      <button
                        key={s.strategyId || s.id}
                        type="button"
                        onClick={() => {
                          if (onStrategyChange) onStrategyChange(s);
                          setIsPackageDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#F1F1FE] dark:hover:bg-[#272727] transition-colors text-left border-b border-[#65656514] dark:border-[#FFFFFF0A] last:border-b-0 ${
                          (s.strategyId || s.id) === (strategy.strategyId || strategy.id) ? 'bg-[#F1F1FE] dark:bg-[#272727]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#70AE1C] shrink-0">
                            <Image
                              width={12}
                              height={12}
                              src="/assets/teenyicons_certificate-outline.svg"
                              alt=""
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium font-ui text-[#656565] dark:text-white">{s.name}</span>
                            <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">
                              {s.termMonths} {t('Months')} · {t(s.payoutFrequency)}
                            </span>
                          </div>
                        </div>
                        <span className="bg-[#70AE1C33] rounded-[91px] px-2.5 h-6 flex items-center justify-center font-bold font-ui text-xs text-[#70AE1C] shrink-0">
                          {s.apy}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex pb-3 lg:pb-5 flex-col gap-2.5 lg:gap-4.5">
              <span className="pl-3.5 text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                {t('Term')}
              </span>
              <div className="flex flex-col gap-2">
                <div className="bg-[#FFFFFF] dark:bg-[#1E1E20] rounded-md pl-4.5 pr-9 pt-2.5 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div
                      className="w-10.75 h-10.75 rounded-md flex items-center justify-center  "
                      style={{
                        background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                      }}
                    >
                      <Image
                        width={20}
                        height={20}
                        priority
                        quality={'80'}
                        src="/assets/bx_purchase-tag.svg"
                        alt=""
                      />
                    </div>
<span className="text-sm font-normal font-ui text-[#656565] dark:text-white">
                    {strategy.termMonths} {t('months')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex pb-3 lg:pb-5 flex-col gap-2.5 lg:gap-4.5">
              <span className="pl-3.5 text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                {t('PayoutFrequency')}
              </span>
              <div className="flex flex-col gap-2">
                <div className="bg-[#FFFFFF] dark:bg-[#1E1E20] rounded-md pl-4.5 pr-9 pt-2.5 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-10.75 h-10.75 bg-[#70AE1C] rounded-md flex items-center justify-center  ">
                      <Image width={13} height={13} priority quality={'80'} src="/assets/Group (2).svg" alt="" />
                    </div>
<span className="text-sm font-normal font-ui text-[#656565] dark:text-white">
                    {strategy.payoutFrequency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex pb-2 flex-col gap-2.5 lg:gap-4.5">
              <div className="pl-3.5 flex flex-col gap-1.5">
                <span className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                  {t('Amount')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal font-ui text-[#F5FF1E]">
                    {t('Minimum amount to purchase is')}: {fmtUSD.format(minAmount)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-[#FFFFFF] dark:bg-[#1E1E20] rounded-md pl-4.5 pr-9 pt-2.5 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div
                      className="w-10.75 h-10.75 shrink-0 rounded-md flex items-center justify-center  "
                      style={{
                        background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                      }}
                    >
                      <Image
                        width={20}
                        height={20}
                        priority
                        quality={'80'}
                        src="/assets/lsicon_amount-dollar-outline.svg"
                        alt=""
                      />
                    </div>
                    <input
                      type="text"
                      value={amountInput ? `$${amountInput}` : ''}
                      placeholder="$0.00"
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="text-sm font-normal font-ui text-black dark:text-[#FFFFFF80] placeholder:text-[#FFFFFF40] outline-none bg-transparent border-none w-full"
                    />
                  </div>
                </div>
                <div className="bg-[#FFFFFF] dark:bg-[#1E1E20] rounded-md pt-7.25 pb-4 pl-6.25 pr-5.5 flex items-center justify-between">
                  <CurrencySlider strategy={strategy} value={amount} onChange={handleAmountChange} />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setOpen(true);
              }}
              className="
                  h-9 my-3 lg:my-5.75 rounded-full w-full
                  text-sm font-normal font-ui text-black
                  text-[#656565]
                  hover:brightness-110
                  hover:shadow-lg
                  transition-all duration-200
                "
              style={{
                background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
              }}
            >
              {t('BuyNow')}
            </button>

            <p className="pl-6.25 pb-7.5 text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFA6]">
              {t('FixedtermSavings')}
            </p>
            <div className="bg-[#F1F1FE] dark:bg-[#1E1E2080] border border-[#65656526] dark:border-transparent rounded-[9px] mb-3.75 py-6.25 pl-5.5 max-lg:pr-3.5 lg:pl-8">
              <div className="flex flex-col gap-2.75">
                <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                  {t('Thingstoknow')}
                </h2>
                <p className="text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFA6]">
                  {t('cryptoassetmanager')}
                </p>
                <p className="text-sm font-normal font-ui text-[#FFFFFF66]">{t('JoinedApril2025')}</p>
              </div>
              <div className="pt-7.75 lg:pr-14 flex flex-col gap-5">
                <div className="flex items-center lg:items-end gap-4 sm:gap-5">
                  <div
                    className="w-11.5 h-11.5 rounded-xl flex items-center justify-center"
                    style={{
                      flexShrink: '0',
                      background: 'linear-gradient(137.47deg, #7352DD 11.08%, #9274F3 42.04%, #7352DD 95.9%)',
                    }}
                  >
                    <Image width={24} height={24} src="/assets/iconoir_medal.svg" alt="" />
                  </div>
                  <div className=" flex flex-col xl:flex-row pb-4 border-b border-[#65656533] lg:items-center w-full gap-3">
                    <span className="font-medium font-ui text-[#656565CC] dark:text-[#FFFFFFCC] text-sm">
                      {t('1000daytrackrecord')}
                    </span>{' '}
                    {''}
                    <span className="rounded-sm bg-[#9071F11A] h-8 max-w-33 w-full flex items-center justify-center text-[#6B63DF] text-sm font-medium font-ui">
                      {t('46to71APR')}
                    </span>
                    <span className="font-medium hidden 3xl:block font-ui text-[#656565CC] dark:text-[#FFFFFFCC] text-sm">
                      {t('from22to24')}
                    </span>{' '}
                    {''}
                  </div>
                </div>

                <div className="flex items-center lg:items-end gap-4 sm:gap-5">
                  <div
                    style={{
                      flexShrink: '0',
                    }}
                    className="w-11.5 h-11.5 bg-[#8EDD23] rounded-xl flex items-center justify-center"
                  >
                    <Image width={24} height={24} src="/assets/iconoir_medal.svg" alt="" />
                  </div>
                  <div className=" flex flex-wrap 4xl:flex-nowrap pb-4 border-b border-[#65656533] lg:items-center w-full gap-1.5">
                    <span className="font-medium truncate font-ui text-[#656565CC] dark:text-[#FFFFFFCC] text-sm">
                      {t('Historicalwinrates')}
                    </span>{' '}
                    {''}
                    <span className="rounded-sm bg-[#8EDD231F] h-8 px-2.5 max-w-max  flex items-center justify-center text-[#70AE1C] text-sm font-medium font-ui">
                      {t('55%ofdays')}
                    </span>
                    <span className="rounded-sm bg-[#8EDD231F] h-8 px-2.5 max-w-max flex items-center justify-center text-[#70AE1C] text-sm font-medium font-ui">
                      {t('70%ofmonths')}
                    </span>
                    <span className="rounded-sm bg-[#8EDD231F] h-8 px-2.5 max-w-max   flex items-center justify-center text-[#70AE1C] text-sm font-medium font-ui">
                      {t('80%ofquarters')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center lg:items-end gap-4 sm:gap-5">
                  <div
                    style={{
                      flexShrink: '0',

                      background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                    }}
                    className="w-11.5 h-11.5   rounded-xl flex items-center justify-center"
                  >
                    <Image width={24} height={24} src="/assets/iconoir_medal.svg" alt="" />
                  </div>
                  <div className=" flex pb-4  items-center w-full gap-1.5">
                    <span className="font-medium truncate font-ui text-[#656565CC] dark:text-[#FFFFFFCC] break-all max-sm:text-xs text-sm">
                      {t('SharpeRatio')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3.25 bg-[#F1F1FE] dark:bg-[#1E1E2080] border border-[#65656526] dark:border-transparent pl-9.25 rounded-[9px] pr-5 pb-7.5 flex flex-col gap-[11px]">
              <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                {t('Howtheytrade')}
              </h2>
              <p className="text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFA6]">{t('hybridcrypto')}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2.75 w-full">
          <GradientBorder>
            <div className="bg-[#F1F1FE] dark:bg-[#1E1E2080] border dark:border-transparent rounded-[20px] pb-3 dark:pb-8.5 pt-4.75 px-3">
              <ChartData strategy={strategy} amount={amount} />
              <div className="flex pb-[23px] flex-row flex-wrap gap-2.5 px-1">
                <div className="bg-[#FFFFFF] dark:bg-[#00000066] border border-[#65656514] dark:border-[#FFFFFF14] h-10 flex gap-2.5 items-center px-3.5 rounded-full">
                  <div className="h-3.5 w-3.5 rounded-sm bg-[#70AE1C] shrink-0"></div>
<span className="text-sm font-medium font-ui text-[#656565] dark:text-[#FFFFFFA6] whitespace-nowrap">
                  {t('VarntixFlexibleSavings')}
                  </span>
                </div>
                <div className="bg-[#FFFFFF] dark:bg-[#00000066] border border-[#65656514] dark:border-[#FFFFFF14] h-10 flex gap-2.5 items-center px-3.5 rounded-full">
                  <div
                    className="h-3.5 w-3.5 rounded-sm shrink-0"
                    style={{
                      background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                    }}
                  ></div>
<span className="text-sm font-medium font-ui text-[#656565] dark:text-[#FFFFFFA6] whitespace-nowrap">
                  {t('CoinbaseOneRewards')}
                  </span>
                </div>
              </div>
              <p
                style={{ letterSpacing: '-4%' }}
                className="lg:dark:pl-[34px] px-3 lg:px-6 pt-6 dark:pt-0 pb-5 dark:pb-0 2xl:max-w-[666px] bg-[#F1F1FE] dark:bg-transparent rounded-xl dark:pr-3 text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFA6]"
              >
                {t('Anyvaluesestimates')}
              </p>
            </div>
          </GradientBorder>
          <div className="bg-[#F1F1FE] dark:bg-[#1E1E2080] border border-[#65656526] dark:border-transparent rounded-[20px] pt-5.25 px-3 pb-3">
            <div className="flex pb-3.75 flex-col lg:flex-row justify-between lg:items-center px-5">
              <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                {t('Paymentschedule')}
              </h2>
              <p className="text-sm font-normal font-ui text-[#656565] dark:text-white">
                {t('Today')},{' '}
                {new Date().toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.25">
              <div className="py-4 px-4.5 w-full dark:bg-[#32323452] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent rounded-[9px] flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image width={20} height={20} src="/assets/hugeicons_date-time.png" className="hidden dark:block shrink-0" alt="" />
                  <Image width={20} height={20} src="/assets/hugeicons_date-time (1).png" className="dark:hidden shrink-0" alt="" />
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">
                    {t('Date')}
                  </span>
                  <div className="px-2.5 py-1.5 leading-tight bg-[#6B63DF26] rounded-sm text-xs font-normal font-ui text-[#6B63DF]">
                    {strategy.payoutFrequency}
                  </div>
                </div>
                <h2 className="font-ui text-sm font-normal text-[#656565] dark:text-white leading-tight">
                  {getNextPayoutDate(strategy.payoutFrequency)}
                </h2>
              </div>
              <div className="py-4 px-4.5 w-full dark:bg-[#32323452] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent rounded-[9px] flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image width={18} height={18} src="/assets/lsicon_amount-dollar-outline.png" className="hidden dark:block shrink-0" alt="" />
                  <Image width={18} height={18} src="/assets/Vector (8).png" className="dark:hidden shrink-0" alt="" />
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">
                    {t('Amount')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <h2 className="font-ui text-sm font-normal text-[#656565] dark:text-white leading-tight">
                    {amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>
                  <span className="bg-[#8EDD231F] h-7 px-3 rounded-full flex items-center justify-center leading-tight text-xs font-normal font-ui text-[#70AE1C]">
                    {strategy.apy}% APY
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4 hidden dark:block mt-1.25 pb-6.5 pl-4.5 pr-5.25 w-full dark:bg-[#32323452] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent rounded-[9px]">
              <div className="flex pb-5.5 gap-4.5 items-center">
                <Image width={24} height={24} src="/assets/hugeicons_blockchain-02.png" alt="" />
                <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">{t('Currency')}</span>
              </div>
              <div className="w-full cursor-pointer relative rounded-[18px] bg-[#00000099] blackShadow2 pt-2.5 px-2.5 pr-5 pb-2 flex gap-6 items-center justify-between">
                <div className="flex gap-6 items-center">
                  <div
                    className="w-10.75 h-10.75 rounded-xl flex items-center justify-center"
                    style={{ background: currency.bgColor }}
                  >
                    <Image
                      width={currency.icon === '/assets/usdc.svg' ? 24 : 20}
                      height={20}
                      priority
                      quality={80}
                      src={currency.icon}
                      alt=""
                    />
                  </div>
                  <span className="text-sm font-normal font-ui">
                    {user?.preferredNetwork} <span className="text-[#FFFFFF80]"> ({user?.preferredCurrency}) </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Full Payout Schedule Table */}
            {schedule.rows.length > 0 && (
              <div className="flex pt-3 flex-col gap-1.25">
                <div className="pl-5.25 pr-5 lg:pr-11 py-2.5 border border-[#65656526] dark:border-transparent dark:bg-[#32323452] bg-[#F1F1FE] rounded-[9px] grid grid-cols-3 items-center">
                  <span className="text-sm font-normal font-ui text-[#656565] dark:text-white text-left">{t('Date')}</span>
                  <span className="text-sm font-normal font-ui text-[#656565] dark:text-white text-center">{t('Amount')}</span>
                  <span className="text-sm font-normal font-ui text-[#656565] dark:text-white text-right">{t('Product')}</span>
                </div>
                <div className="px-3 3xl:pl-5.25 3xl:pr-11 pt-3 pb-5 dark:bg-[#32323452] bg-[#F1F1FE] rounded-[9px] flex flex-col gap-3 max-h-80 overflow-y-auto no-scrollbar">
                  {schedule.rows.map((row, i) => (
                    <div key={i} className="grid grid-cols-3 items-center py-1">
                      <span className="text-[#65656580] dark:text-[#FFFFFF52] text-sm font-medium font-ui">
                        {formatPayoutDateShort(row.date)}
                      </span>
                      <span className="text-[#65656580] dark:text-[#FFFFFFA6] text-sm font-normal font-ui text-center">
                        {fmtUSD.format(row.interest)}
                      </span>
                      <span className="text-[#65656580] dark:text-[#FFFFFFA6] text-sm font-bold font-ui text-right">
                        {strategy.name}
                      </span>
                    </div>
                  ))}
                  {/* Total row */}
                  <div className="grid grid-cols-3 items-center py-2 border-t border-[#65656526] dark:border-[#FFFFFF14]">
                    <span className="text-[#656565] dark:text-white text-sm font-bold font-ui">
                      {t('Total')} ({schedule.rows.length} payouts)
                    </span>
                    <span className="text-[#70AE1C] text-base font-bold font-ui text-center">
                      {fmtUSD.format(schedule.totalInterest)}
                    </span>
                    <span className="text-sm font-bold font-ui text-right">
                      {' '}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DislaimerModal
        isOpen={open2}
        onClose={() => setOpen2(false)}
        strategy={strategy}
        currency={currency}
        amount={amount}
        onPaymentOrderCreated={(data) => {
          setPaymentData(data);
          setOpen2(false);
          setOpen3(true);
        }}
        paymenModal={() => {
          setOpen2(false);
          setOpen3(true);
        }}
      />
      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setPaymentData(null);
        }}
        strategy={strategy}
        amount={amount}
        discaimerOpen={() => {
          setOpen(false);
          setOpen2(true);
        }}
      />

      <PlacedOrderModal
        isOpen={open3}
        onClose={() => {
          setOpen3(false);
          setPaymentData(null);
        }}
        strategy={strategy}
        currency={currency}
        amount={amount}
        initialPaymentData={paymentData}
        onPaymentReceived={async () => {
          const token = getToken();
          if (!token || !strategy || !user) return;
          const strategyId = strategy.strategyId ?? strategy.id;
          const s = strategy as { name?: string; title?: string; type?: string; termMonths?: number; apy?: number; percen?: number; payoutFrequency?: string; sector?: string };
          const title = strategy.name ?? s.title ?? '';
          await createSubscription(token, {
            strategyId,
            amount,
            strategy: {
              name: title,
              type: s.type,
              termMonths: strategy.termMonths ?? s.termMonths,
              apy: strategy.apy ?? s.apy ?? s.percen,
              payoutFrequency: strategy.payoutFrequency ?? s.payoutFrequency ?? s.sector,
            },
          });
          await saveSubscriptionPDF(token, {
            strategyId,
            amount,
            strategy: { title },
            investorName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Valued Investor',
            accountId: user.id ?? '',
          });
          toast.success('subscription created and confirmation saved to Documents');
        }}
      />
    </>
  );
};
