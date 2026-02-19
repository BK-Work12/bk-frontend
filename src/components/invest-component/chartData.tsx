import { useState, useMemo, useEffect } from 'react';
import GrowthChart from '../ui/GrowthChart';
import MobileChart from '../ui/MobileGrowthChart';
import { valueAtMonth, getFrequency } from '@/lib/bondInterest';
import { useTranslation } from 'react-i18next';

interface Strategy {
  termMonths: number;
  payoutFrequency: string;
  minInvestment: number;
  cap: number;
  redemption: string;
  raised: number;
  apy: number;
  type: string;
}

interface ChartDataProps {
  strategy: Strategy;
  amount: number;
}

const COMPARISON_APR = 4.5;

const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Coinbase compound interest: principal × (1 + apr)^(months/12) - principal */
function coinbaseInterestAtMonth(principal: number, apr: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  return principal * (Math.pow(1 + apr / 100, months / 12) - 1);
}

export const ChartData = ({ strategy, amount }: ChartDataProps) => {
  const { t } = useTranslation();
  const apy = useMemo(() => strategy.apy / 100, [strategy.apy]);
  const frequency = useMemo(() => getFrequency(strategy.payoutFrequency), [strategy.payoutFrequency]);
  const interestRate = useMemo(() => apy * 100, [apy]);
  const termMonths = strategy.termMonths;

  const [selectedX, setSelectedX] = useState(0);

  useEffect(() => {
    setSelectedX(termMonths); // default to full term
  }, [termMonths]);

  // Varntix: simple interest only (no principal)
  const varntixInterest = useMemo(
    () => valueAtMonth(amount, apy, frequency, selectedX) - amount,
    [amount, apy, frequency, selectedX],
  );

  // Coinbase: compound interest at 4.5% for same period (no principal)
  const coinbaseInterest = useMemo(
    () => coinbaseInterestAtMonth(amount, COMPARISON_APR, selectedX),
    [amount, selectedX],
  );

  // Match chart hint exactly: weekly uses month boundary like GrowthChart (show "1 Month" vs "4 Weeks")
  const periodSubtitle = useMemo(() => {
    if (selectedX <= 0) return t('Today');
    if (frequency === 'weekly') {
      const isOnMonthBoundary = Math.abs(selectedX - Math.round(selectedX)) < 0.08;
      if (isOnMonthBoundary) {
        const hintMonth = Math.round(selectedX);
        if (hintMonth === 0) return t('Today');
        return `${hintMonth} ${hintMonth === 1 ? t('Month') : t('Months')}`;
      }
      const weeks = Math.round(selectedX * 52 / 12);
      if (weeks <= 0) return t('Today');
      return `${weeks} ${weeks === 1 ? t('Week') : t('Weeks')}`;
    }
    const months = Math.round(selectedX);
    return `${months} ${months === 1 ? t('Month') : t('Months')}`;
  }, [selectedX, frequency, t]);

  return (
    <div className="bg-[#FFFFFF] border border-[#65656526] dark:border-transparent dark:bg-[#00000099] mb-3.5 rounded-[18px] blackShadow2 3xl:h-127.25 relative">
      <div className="max-lg:pl-4.75 max-lg:pr-7.5 pt-5">
        <div className="flex flex-col gap-2 lg:absolute lg:max-w-[256px] w-full top-7.5 left-6.75 max-lg:px-1">
          {/* Varntix interest earned (simple interest) */}
          <div
            className="w-full pl-3.5 pr-3 py-2.5 flex flex-col justify-center gap-1 rounded-md"
            style={{
              background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
            }}
          >
            <h2 className="font-ui leading-tight text-base lg:text-lg text-black font-bold">
              {fmtUSD.format(varntixInterest)}
            </h2>
            <p className="text-black text-xs font-normal font-ui leading-tight">
              {t('in interest at')} {interestRate.toFixed(1)}%
            </p>
          </div>

          {/* Total balance (principal + interest) at package rate */}
          <div
            className="w-full pl-3.5 pr-3 py-2.5 flex flex-col justify-center gap-1 rounded-md"
            style={{
              background: 'linear-gradient(180deg, #6B63DF 0%, #7352DD 100%)',
            }}
          >
            <h2 className="font-ui leading-tight text-base lg:text-lg text-white font-bold">
              {fmtUSD.format(amount + varntixInterest)}
            </h2>
            <p className="text-white text-xs font-normal font-ui leading-tight">
              {t('Total balance over')} {termMonths} {termMonths === 1 ? t('Month') : t('Months')}
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:block">
        <GrowthChart
          strategy={strategy}
          investedAmount={amount}
          interestRate={interestRate}
          comparisonApr={COMPARISON_APR}
          onPointSelect={setSelectedX}
        />
      </div>
      <div className="lg:hidden ">
        <MobileChart
          strategy={strategy}
          investedAmount={amount}
          interestRate={interestRate}
          comparisonApr={COMPARISON_APR}
          onPointSelect={setSelectedX}
        />
      </div>
    </div>
  );
};
