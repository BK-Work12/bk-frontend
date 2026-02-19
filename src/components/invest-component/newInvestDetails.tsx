'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChartData } from './chartData';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import type { CreateInvestResponse, Strategy as ApiStrategy } from '@/lib/api';
import PlacedOrderModal from '../ui/placedOrderModal';
import { useTranslation } from 'react-i18next';
import { buildPayoutSchedule, getFrequency, interestForPeriod, fmtUSD, type PayoutSchedule } from '@/lib/bondInterest';
import OrderDetailsModal from '../ui/order-details-popup';

type Strategy = ApiStrategy & { id: string; raised: number };

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
  },
];

const DefaultAmount = [250, 500, 1000, 2500];

/** Parse strategy min/max investment string (e.g. "$25,000") to number */
function parseInvestment(s: string): number {
  const cleaned = String(s).replace(/[$,]/g, '').trim();
  const n = parseInt(cleaned, 10);
  return Number.isNaN(n) ? 0 : n;
}

const defaultCurrency = {
  label: 'Ethereum',
  muteLabel: 'ETH',
  icon: '/assets/Group.svg',
  bgColor: '#272727',
};

/** Format a date as "17 February 2026" style. */
function formatPayoutDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Short date for the schedule table: "17/02/2026". */
function formatPayoutDateShort(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
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

export const NewInvestDetails = ({
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
  const [open3, setOpen3] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);

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
    setAmount((prev) => {
      if (prev === 0) return 0; // keep empty if user hasn't entered anything
      const clamped = Math.min(maxAmount, Math.max(minAmount, prev));
      setAmountInput(clamped.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      return clamped;
    });
  }, [minAmount, maxAmount]);

  // ── Payout schedule (simple interest, non-compounded) ──
  const schedule: PayoutSchedule = useMemo(() => {
    const apy = (strategy.apy || 0) / 100;
    const frequency = getFrequency(strategy.payoutFrequency);
    return buildPayoutSchedule({
      principal: amount,
      apy,
      startDate: new Date(),
      termMonths: strategy.termMonths,
      frequency,
    });
  }, [amount, strategy.apy, strategy.payoutFrequency, strategy.termMonths]);

  // ── Investment scenario (derived from strategy + amount) ──
  const scenario = useMemo(() => {
    const apy = strategy.apy ?? 0;
    const apyDecimal = apy / 100;
    const termMonths = strategy.termMonths ?? 12;
    const frequency = getFrequency(strategy.payoutFrequency ?? '');
    const dailyIncome = (amount * apyDecimal) / 365;
    const periodIncome = interestForPeriod(amount, apyDecimal, frequency);
    const monthlyIncome = (amount * apyDecimal) / 12;
    const annualProfit = amount * apyDecimal;
    const totalProfit = schedule.totalInterest;
    const finalBalance = amount + totalProfit;
    const periodLabel = frequency === 'weekly' ? 'Weekly' : frequency === 'quarterly' ? 'Quarterly' : 'Monthly';
    return {
      termMonths,
      apy,
      dailyIncome,
      monthlyIncome,
      periodIncome,
      periodLabel,
      annualProfit,
      totalProfit,
      finalBalance,
    };
  }, [amount, strategy.apy, strategy.payoutFrequency, strategy.termMonths, schedule.totalInterest]);

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
          <div className="rounded-[18px] pt-4 lg:pt-6 px-2.5 lg:px-2.75 pb-2.5 lg:pb-2.75 bg-[#F1F1FE] dark:bg-transparent border-[#65656526] dark:border-[#FFFFFF1F] border">
            <div className="flex flex-col pb-3 lg:pb-4.75 pl-3 gap-1">
              <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white text-center lg:text-left">
                {t('youcanearn')}
              </h2>
              <p
                style={{ letterSpacing: '-4%' }}
                className="font-ui text-sm lg:text-base font-normal text-[#656565] dark:text-[#FFFFFFA6] text-center lg:text-left"
              >
                Explore your earning potential with our fixed-income crypto yields.
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
                  className="bg-[#FFFFFF] dark:bg-[#111111] rounded-md pl-4.5 pr-3 lg:pr-5 pt-2.5 pb-2 flex items-center justify-between w-full cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-all"
                >
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="w-9 h-9 lg:w-10.75 lg:h-10.75 rounded-md flex items-center justify-center bg-[#F1F1FE] dark:bg-[#272727] shrink-0">
                      <Image
                        width={15}
                        height={15}
                        priority
                        quality={80}
                        src="/assets/teenyicons_certificate-outline.svg"
                        alt=""
                        className="brightness-0 dark:brightness-100"
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
                          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#F1F1FE] dark:bg-[#333] shrink-0">
                            <Image
                              width={12}
                              height={12}
                              src="/assets/teenyicons_certificate-outline.svg"
                              alt=""
                              className="brightness-0 dark:brightness-100"
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
                <div className="bg-[#FFFFFF] dark:bg-[#111111] rounded-md pl-4.5 pr-9 pt-2.5 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-10.75 h-10.75 bg-[#F1F1FE] dark:bg-[#272727] rounded-md flex items-center justify-center  ">
                      <Image
                        width={20}
                        height={20}
                        priority
                        quality={'80'}
                        src="/assets/bx_purchase-tag.svg"
                        className="brightness-0 dark:brightness-100"
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
                <div className="bg-[#FFFFFF] dark:bg-[#111111] rounded-md pl-4.5 pr-9 pt-2.5 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-10.75 h-10.75 bg-[#F1F1FE] dark:bg-[#272727] rounded-md flex items-center justify-center  ">
                      <Image
                        width={13}
                        height={13}
                        priority
                        quality={'80'}
                        className="brightness-0 dark:brightness-100"
                        src="/assets/Group (2).svg"
                        alt=""
                      />
                    </div>
<span className="text-sm font-normal font-ui text-[#656565] dark:text-white">
                    {t(strategy.payoutFrequency)}
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
                <div className="bg-[#FFFFFF] dark:bg-[#111111] rounded-md pl-4.5 pr-9 pt-2.5 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-10.75 h-10.75 bg-[#F1F1FE] dark:bg-[#272727] shrink-0 rounded-md flex items-center justify-center  ">
                      <Image
                        width={20}
                        height={20}
                        priority
                        quality={'80'}
                        src="/assets/lsicon_amount-dollar-outline.svg"
                        className="brightness-0 dark:brightness-100"
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
                {/* <div className="bg-[#FFFFFF] dark:bg-[#1E1E20] rounded-md pt-7.25 pb-4 pl-6.25 pr-5.5 flex items-center justify-between">
                  <CurrencySlider strategy={strategy} value={amount} onChange={handleAmountChange} />
                </div> */}
              </div>
            </div>

            <button
              onClick={() => {
                setIsDetailsModalOpen(true);
              }}
              className="
                  h-9 my-4 lg:my-5.75 rounded-full w-full
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
              {t('Subscribe')}
            </button>

            <div className="bg-[#F1F1FE] border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] rounded-[20px] pt-5.25 px-3 pb-3">
              <div className="flex pb-3.75 flex-col lg:flex-row justify-between lg:items-center px-3 lg:px-5">
<h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white text-center lg:text-left">
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
                {/* Next Payout Date */}
                <div className="py-4 px-4.5 w-full dark:bg-[#32323452] border border-[#65656526] dark:border-transparent rounded-[9px] flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Image width={20} height={20} src="/assets/hugeicons_date-time.png" className="hidden dark:block shrink-0" alt="" />
                    <Image width={20} height={20} src="/assets/hugeicons_date-time (1).png" className="dark:hidden shrink-0" alt="" />
                    <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">
                      {t('Date')}
                    </span>
                    <div className="px-2.5 py-1.5 leading-tight bg-[#6B63DF26] rounded-sm text-xs font-normal font-ui text-[#6B63DF] dark:text-[#6B63DF]">
                      {t(strategy.payoutFrequency)}
                    </div>
                  </div>
                  <h2 className="font-ui text-sm font-normal text-[#656565] dark:text-white leading-tight">
                    {schedule.next ? formatPayoutDate(schedule.next.date) : '—'}
                  </h2>
                </div>
                {/* Next Payout Interest Amount */}
                <div className="py-4 px-4.5 w-full dark:bg-[#32323452] border border-[#65656526] dark:border-transparent rounded-[9px] flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Image width={18} height={18} src="/assets/lsicon_amount-dollar-outline.png" className="hidden dark:block shrink-0" alt="" />
                    <Image width={18} height={18} src="/assets/Vector (8).png" className="dark:hidden shrink-0" alt="" />
                    <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">
                      {t('Amount')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <h2 className="font-ui text-sm font-normal text-[#656565] dark:text-white leading-tight">
                      {schedule.next ? fmtUSD.format(schedule.next.interest) : '$0.00'}
                    </h2>
                    <span className="bg-[#8EDD231F] h-7 px-3 rounded-full flex items-center justify-center leading-tight text-xs font-normal font-ui text-[#70AE1C]">
                      {strategy.apy}% {t('APY')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Payout Schedule Table */}
              {schedule.rows.length > 0 && (
                <div className="flex pt-3 flex-col gap-1.25">
                  <div className="pl-5.25 pr-5 lg:pr-11 py-2.5  border border-[#65656526] dark:border-transparent dark:bg-[#32323433] rounded-[9px] grid grid-cols-3 items-center">
                    <span className="text-sm font-normal font-ui text-[#656565] dark:text-white text-left">{t('Date')}</span>
                    <span className="text-sm font-normal font-ui text-[#656565] dark:text-white text-center">{t('Amount')}</span>
                    <span className="text-sm font-normal font-ui text-[#656565] dark:text-white text-right">{t('Product')}</span>
                  </div>
                  <div className="px-3 3xl:pl-5.25 3xl:pr-11 pt-3 pb-5  border border-[#65656526] dark:border-transparent dark:bg-[#32323433] rounded-[9px] flex flex-col gap-3 max-h-80 overflow-y-auto no-scrollbar">
                    {schedule.rows.map((row, i) => (
                      <div key={i} className="grid grid-cols-3 items-center py-1">
                        <span className="text-[#65656580] dark:text-[#FFFFFF52] text-sm font-normal font-ui">
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
        <div className="flex flex-col gap-2.75 w-full">
          <div className="bg-[#F1F1FE] dark:bg-[#1E1E2080] border dark:border-transparent  rounded-[20px] pb-3 dark:pb-8.5 pt-4.75 px-3">
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
              className="  dark:pt-0 pb-5 dark:pb-0   dark:bg-transparent rounded-xl dark:pr-3 text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFA6]"
            >
              {t('AnyvaluesEstimatesFigures')}
            </p>
          </div>
          <div className="bg-[#F1F1FE] dark:bg-[#1E1E2080] py-4.5 pl-2.75 pr-4.75 border   dark:border-transparent  rounded-[20px]">
            <div className="py-2 mx-auto lg:ml-2.5 lg:mr-0 leading-tight text-[#656565] dark:text-white max-w-max px-4 rounded-[58px] bg-[#6565650A] dark:bg-[#FFFFFF0A] text-sm font-normal font-ui">
              {t('Investment Scenario')}
            </div>
            <div className="pt-3.5 pb-2 gap-2 grid grid-cols-1 lg:grid-cols-2">
              <div className="w-full dark:bg-[#32323452] border border-[#65656526] dark:border-transparent rounded-[9px] py-4 px-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <Image
                    width={18}
                    height={18}
                    alt=""
                    className="hidden dark:block shrink-0"
                    src={'/assets/Timer-Clock-Stopwatch Streamline Plump-Remix.svg'}
                  />
                  <Image
                    width={18}
                    height={18}
                    alt=""
                    className="dark:hidden shrink-0"
                    src={'/assets/Timer-Clock-Stopwatch Streamline Plump-Remix (2).svg'}
                  />
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] leading-tight">
                    {t('Amount')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-normal font-ui leading-tight dark:text-white text-[#656565]">
                    {scenario.termMonths} {scenario.termMonths === 1 ? t('Month') : t('Months')}
                  </h2>
                  <span className="bg-[#8EDD231F] dark:bg-[#70AE1C33] rounded-full px-3 h-7 flex items-center justify-center font-normal font-ui text-xs text-[#8EDD23] dark:text-[#70AE1C] whitespace-nowrap shrink-0">
                    {scenario.apy}% {t('APY')}
                  </span>
                </div>
              </div>
              <div className="w-full dark:bg-[#32323452] border border-[#65656526] dark:border-transparent rounded-[9px] py-4 px-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <Image
                    width={18}
                    height={18}
                    src="/assets/lsicon_amount-dollar-outline.png"
                    className="hidden dark:block shrink-0"
                    alt=""
                  />
                  <Image width={18} height={18} src="/assets/dollarGrey.svg" className="dark:hidden shrink-0" alt="" />
                  <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] leading-tight">
                    {t('Investment')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-normal font-ui flex items-center gap-2 leading-tight dark:text-white text-[#656565]">
                    {fmtUSD.format(amount)}
                  </h2>
                  <div className="relative flex items-center shrink-0">
                    <Image src={'/assets/usdt (6) 1.svg'} className="w-6 h-6" width={24} height={24} alt="" />
                    <div className="w-7 h-7 rounded-full bg-[#3E73C4] border-2 flex items-center justify-center border-[#0F0F0F] -ml-1.5">
                      <Image width={14} height={15} src={'/assets/usdcWhite.svg'} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid pb-2 grid-cols-3 gap-1.5">
              {[
                {
                  iconDark: '/assets/Timer-Clock-Stopwatch Streamline Plump-Remix.svg',
                  iconLight: '/assets/Timer-Clock-Stopwatch Streamline Plump-Remix (2).svg',
                  label: t('Daily Income'),
                  value: fmtUSD.format(scenario.dailyIncome),
                  sub: t('Automatically to your balance'),
                },
                {
                  iconDark: '/assets/hugeicons_date-time.svg',
                  iconLight: '/assets/hugeicons_date-time (1).svg',
                  label: `${scenario.periodLabel} ${t('Income')}`,
                  value: fmtUSD.format(scenario.periodIncome),
                  sub: `${t('Steady cash flow every')} ${scenario.periodLabel.toLowerCase().replace('ly', '')}`,
                },
                {
                  iconDark: '/assets/Report Streamline Carbon.svg',
                  iconLight: '/assets/Report Streamline Carbon (1).svg',
                  label: t('Annual Profit'),
                  value: fmtUSD.format(scenario.annualProfit),
                  sub: t('One full year return'),
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="dark:bg-[#32323452] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent rounded-[9px] p-3 grid grid-rows-[24px_24px_1fr] justify-items-center text-center gap-y-1"
                >
                  <div className="flex gap-1.5 items-center justify-center self-center">
                    <Image width={14} height={14} alt="" className="hidden dark:block shrink-0" src={card.iconDark} />
                    <Image width={14} height={14} alt="" className="dark:hidden shrink-0" src={card.iconLight} />
                    <span className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] leading-none whitespace-nowrap">
                      {card.label}
                    </span>
                  </div>
                  <span className="text-sm font-normal font-ui dark:text-white text-[#656565] self-center leading-none">
                    {card.value}
                  </span>
                  <span className="text-[#656565A6] dark:text-[#FFFFFFA6] text-[11px] font-normal font-ui leading-tight self-start pt-0.5">
                    {card.sub}
                  </span>
                </div>
              ))}
            </div>
            <div className="border border-[#65656526] dark:border-transparent dark:bg-[#32323452] rounded-[9px]">
              <h2 className="pt-4 pb-3 text-sm leading-tight font-normal font-ui text-[#656565] dark:text-white pl-5.75 border-b border-[#65656526] dark:border-[#FFFFFF0A]">
                {t('Strategy')} – {t('Withdraw Profits')}{' '}
                {strategy.payoutFrequency ? `${t(strategy.payoutFrequency)}` : ''}
              </h2>
              <div className="pt-3 px-5.75 pb-4 flex flex-col gap-3 w-full">
                <div className="flex items-center w-full justify-between">
                  <span className="text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] leading-[100%]">
                    {scenario.termMonths >= 24 ? t('2Year') : scenario.termMonths >= 12 ? t('1Year') : scenario.termMonths >= 6 ? t('6Month') : t('Term')}{' '}{t('TotalProfit')}
                  </span>
                  <span className="text-sm font-ui dark:text-white text-[#656565] font-bold leading-[100%]">
                    {fmtUSD.format(scenario.totalProfit)}
                  </span>
                </div>
                <div className="flex items-center w-full justify-between">
                  <span className="text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] leading-[100%]">
                    {t('Final Balance')}
                  </span>
                  <span className="text-sm font-ui dark:text-white text-[#656565] font-bold leading-[100%]">
                    {fmtUSD.format(scenario.finalBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
      />
      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        strategy={strategy}
        amount={amount}
      />
    </>
  );
};
