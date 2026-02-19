'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { GradientBorderGray } from '../ui/gradientBorder';
import Image from 'next/image';
import ArrowDown from '../icons/arrowDown';
import { getToken } from '@/lib/auth';
import { createDeposit, getDepositMinAmount, type CreateDepositResponse } from '@/lib/api';
import { Loader } from '../ui/Loader';
import { useTranslation } from 'react-i18next';

/** Map currency + network labels to NowPayments pay_currency */
function toPayCurrency(currencyLabel: string, networkLabel: string): string {
  const c = currencyLabel.toUpperCase();
  if (c.includes('BITCOIN') || c.includes('BTC')) return 'btc';
  if (c.includes('ETHEREUM') || c.includes('ETH')) return 'eth';
  if (c.includes('SOLANA') || c.includes('SOL')) return 'sol';
  if (c.includes('XRP')) return 'xrp';
  if (c.includes('USDC')) return 'usdc';
  if (c.includes('USDT') || c.includes('TETHER')) {
    const n = networkLabel.toUpperCase();
    if (n.includes('TRON') || n === 'TETHER USDT') return 'usdttrc20';
    return 'usdterc20';
  }
  return 'usdterc20';
}

/** Networks that support each currency (use existing option labels) */
const currencyToNetworks: Record<string, string[]> = {
  'Bitcoin BTC': ['Bitcoin BTC'],
  'Ethereum ETH': ['Ethereum ETH'],
  'Tether USDT': ['Ethereum ETH', 'Tether USDT'],
  'Solana SOL': ['Solana SOL'],
  'USD Coin USDC': ['Ethereum ETH', 'Solana SOL', 'USD Coin USDC'],
  XRP: ['XRP'],
};

function getNetworksForCurrency(currencyLabel: string): { label: string; icon: string }[] {
  const names = currencyToNetworks[currencyLabel] ?? [];
  return networkOptions.filter((n) => names.includes(n.label));
}

const currencyOptions = [
  { label: 'Bitcoin BTC', icon: '/assets/bitcoin (7) 1.svg' },
  { label: 'Ethereum ETH', icon: '/assets/ethereum (8) 1.svg' },
  { label: 'Tether USDT', icon: '/assets/usdt (6) 1.svg' },
  { label: 'Solana SOL', icon: '/assets/token-branded_solana (1).svg' },
  { label: 'USD Coin USDC', icon: '/assets/usdc (3) 1.svg' },
  { label: 'XRP', icon: '/assets/xrp (11) 1.svg' },
];

const networkOptions = [
  { label: 'Bitcoin BTC', icon: '/assets/bitcoin (7) 1.svg' },
  { label: 'Ethereum ETH', icon: '/assets/ethereum (8) 1.svg' },
  { label: 'Tether USDT', icon: '/assets/usdt (6) 1.svg' },
  { label: 'Solana SOL', icon: '/assets/token-branded_solana (1).svg' },
  { label: 'USD Coin USDC', icon: '/assets/usdc (3) 1.svg' },
  { label: 'XRP', icon: '/assets/xrp (11) 1.svg' },
];

export const CryptoStep1 = ({
  setCompleted,
  setShowStep1,
  setDepositResult,
}: {
  setCompleted: (value: boolean) => void;
  setShowStep1: (value: boolean) => void;
  setDepositResult: (value: CreateDepositResponse | null) => void;
}) => {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState(currencyOptions[2]);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [network, setNetwork] = useState(networkOptions[1]);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minAmount, setMinAmount] = useState<number>(1);
  const minAmountDisplay = Math.round(minAmount * 10) / 10;

  React.useEffect(() => {
    const payCurrency = toPayCurrency(currency.label, network.label);
    getDepositMinAmount(payCurrency)
      .then((min) => setMinAmount(min))
      .catch(() => setMinAmount(1));
  }, [currency.label, network.label]);

  const handleComplete = async () => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num < minAmount) {
      const msg = `Please enter a valid amount (min ${minAmountDisplay} USD).`;
      setError(msg);
      toast.error(msg);
      return;
    }
    const token = getToken();
    if (!token) {
      const msg = 'Please log in to deposit.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payCurrency = toPayCurrency(currency.label, network.label);
      const data = await createDeposit(token, { amount: num, payCurrency });
      setDepositResult(data);
      setCompleted(true);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Failed to create deposit';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBorderGray className="mt-12.25 max-w-202.75 mx-auto">
      <div className="py-6 lg:px-2.5 flex flex-col   rounded-[20px] border border-[#65656526] dark:border-transparent dark:bg-[#272727]">
        <div className="flex max-lg:px-3.25 justify-between items-center px-3.75">
          <span className="text-xs lg:text-sm text-[#656565A6] dark:text-[#FFFFFF66] font-ui leading-tight font-normal">
            {t('Step2outof3')}
          </span>
        </div>
        <div className="flex max-lg:px-3.25  flex-col gap-5 pt-7.25">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Currency Dropdown */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-3.5 font-medium text-sm font-ui">
                {t('ChooseCurrency')}
              </label>
              <div className="px-3 lg:px-4.5 py-1.5 bg-[#F1F1FE] dark:bg-[#1E1E20] rounded-full flex gap-3 items-center relative">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="relative max-w-16.25 w-full h-10.75 flex items-center gap-1.75 justify-center bg-white dark:bg-[#272727] rounded-md"
                >
                  <Image width={24} height={24} src={currency.icon} className="w-6 h-6" alt="" />
                  <span className="dark:hidden ">
                    <ArrowDown color="#65656559" />
                  </span>
                  <span className="dark:block hidden ">
                    <ArrowDown />
                  </span>
                  {currencyOpen && (
                    <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#272727] rounded-md shadow-lg w-full z-10">
                      {currencyOptions.map((option) => (
                        <div
                          key={option.label}
                          onClick={() => {
                            setCurrency(option);
                            const allowed = getNetworksForCurrency(option.label);
                            setNetwork((prev) =>
                              allowed.some((n) => n.label === prev.label) ? prev : (allowed[0] ?? prev),
                            );
                            setCurrencyOpen(false);
                          }}
                          className="flex items-center gap-2 p-2  cursor-pointer rounded-md justify-center"
                        >
                          <Image width={24} height={24} src={option.icon} className="w-6 h-6" alt={option.label} />
                        </div>
                      ))}
                    </div>
                  )}
                </button>
                <span className="text-[#656565A6] dark:text-[#FFFFFF66] text-sm font-normal font-ui">
                  {currency.label}
                </span>
              </div>
            </div>

            {/* Network Dropdown */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-3.5 font-medium text-sm font-ui">
                {t('ChooseNetwork')}
              </label>
              <div className="px-3 lg:px-4.5 py-1.5 bg-[#F1F1FE] dark:bg-[#1E1E20] rounded-full flex gap-3 items-center relative">
                <button
                  onClick={() => setNetworkOpen(!networkOpen)}
                  className="relative max-w-16.25 w-full h-10.75 flex items-center gap-1.75 justify-center bg-white dark:bg-[#272727] rounded-md"
                >
                  <Image width={24} height={24} src={network.icon} className="w-6 h-6" alt="" />
                  <span className="dark:hidden ">
                    <ArrowDown color="#65656559" />
                  </span>
                  <span className="dark:block hidden ">
                    <ArrowDown />
                  </span>
                  {networkOpen && (
                    <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#272727] rounded-md shadow-lg w-full z-10">
                      {getNetworksForCurrency(currency.label).map((option) => (
                        <div
                          key={option.label}
                          onClick={() => {
                            setNetwork(option);
                            setNetworkOpen(false);
                          }}
                          className="flex items-center gap-2 p-2  cursor-pointer rounded-md justify-center"
                        >
                          <Image width={24} height={24} src={option.icon} className="w-6 h-6" alt={option.label} />
                        </div>
                      ))}
                    </div>
                  )}
                </button>
                <span className="text-[#656565A6] dark:text-[#FFFFFF66] text-sm font-normal font-ui">
                  {network.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-3.5 font-medium text-sm font-ui">
              {t('DepositAmount')}
            </label>
            <div className="px-3 lg:px-4.5 h-9 lg:h-11 bg-[#F1F1FE] dark:bg-[#1E1E20] rounded-full flex gap-3 items-center relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Minimum $20"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="dark:placeholder:text-[#FFFFFF66] w-full text-black placeholder:text-[#656565A6] dark:text-white outline-none bg-transparent border-none text-sm font-ui"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-3.5 font-medium text-sm font-ui">
              {t('PromoCode')}
            </label>
            <div className="px-3 lg:px-4.5 bg-[#F1F1FE] dark:bg-[#1E1E20] rounded-full flex justify-between py-1.5 items-center relative">
              <div className="flex w-full gap-2.5 lg:gap-3 items-center">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white dark:bg-[#272727] rounded-full flex items-center justify-center shrink-0">
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

        <p className="text-center max-lg:px-3.25  py-7.25 text-[#656565A6] dark:text-[#FFFFFF66] text-sm font-normal font-ui">
          <span className="hidden lg:block">{t('AllWeb3deposits')}</span>
        </p>

        <div className="grid max-lg:px-3.25  grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setShowStep1(true);
              setCompleted(false);
              setDepositResult(null);
            }}
            className="h-9 lg:h-11 max-sm:order-2 bg-[#0000001A] text-[#656565] dark:text-white dark:bg-[#FFFFFF1A] border border-[#FFFFFF4D] rounded-full flex items-center justify-center text-sm font-normal font-ui"
          >
            {t('PreviousStep')}
          </button>
          <button
            type="button"
            disabled={loading || !amount.trim()}
            className="h-9 lg:h-11 relative overflow-hidden rounded-full flex items-center justify-center w-full font-normal font-ui text-sm text-[#656565] hover:brightness-110 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:text-[#656565]"
            style={{
              background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
            }}
            onClick={handleComplete}
          >
            <Image
              width={1000}
              height={1000}
              src="/assets/Frame 15.svg"
              className="absolute z-0 w-full h-full top-0 left-0"
              alt=""
            />
            {loading ? <Loader className="h-6 w-6 text-white" ariaLabel="Creating deposit" /> : 'Complete'}
          </button>
        </div>
      </div>
    </GradientBorderGray>
  );
};
