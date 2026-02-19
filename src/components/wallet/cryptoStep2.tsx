'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { getToken } from '@/lib/auth';
import { getDepositMinAmount, createDeposit, type CreateDepositResponse } from '@/lib/api';
import { Dropdown } from '../ui/Dropdown';
import { useTranslation } from 'react-i18next';
import PlacedOrderModal from '../ui/placedOrderModal';
import { Loader } from '../ui/Loader';
import { useAuth } from '@/context/AuthContext';

function toCurrencyKey(currencyLabel: string): string {
  const c = currencyLabel.toUpperCase().trim();
  if (c.includes('BITCOIN') || c === 'BTC') return 'BTC';
  if (c.includes('ETHEREUM') || c === 'ETH') return 'ETH';
  if (c.includes('SOLANA') || c === 'SOL') return 'SOL';
  if (c.includes('XRP')) return 'XRP';
  if (c.includes('USDC')) return 'USDC';
  if (c.includes('USDT') || c.includes('TETHER')) return 'USDT';
  return 'USDT';
}

/** Map currency + network labels to NowPayments pay_currency */
function toPayCurrency(currencyLabel: string, networkLabel: string): string {
  const key = toCurrencyKey(currencyLabel);
  if (key === 'BTC') return 'btc';
  if (key === 'ETH') return 'eth';
  if (key === 'SOL') return 'sol';
  if (key === 'XRP') return 'xrp';
  if (key === 'USDC') return 'usdc';
  if (key === 'USDT') {
    const n = networkLabel.toUpperCase();
    return n.includes('TRON') ? 'usdttrc20' : 'usdterc20';
  }
  return 'usdterc20';
}

/** Networks that support each currency (keys = BTC/ETH/USDT/SOL/USDC/XRP; values match networkOptions[].label) */
const currencyToNetworks: Record<string, string[]> = {
  BTC: ['Bitcoin'],
  ETH: ['Ethereum'],
  USDT: ['Ethereum', 'Tron'],
  SOL: ['Solana'],
  USDC: ['Ethereum', 'Solana'],
  XRP: ['XRP'],
};

function getNetworksForCurrency(currencyLabel: string): { label: string; icon: string }[] {
  const key = toCurrencyKey(currencyLabel);
  const names = currencyToNetworks[key] ?? [];
  return networkOptions.filter((n) => names.includes(n.label));
}
const currencyOptions = [
  { label: 'USDT', icon: '/assets/usdt (6) 1.svg' },
  { label: 'USDC', icon: '/assets/usdc (3) 1.svg' },
  { label: 'ETH', icon: '/assets/ethereum (8) 1.svg' },
  { label: 'BTC', icon: '/assets/bitcoin (7) 1.svg' },
  { label: 'SOL', icon: '/assets/token-branded_solanaa.svg' },
  { label: 'XRP', icon: '/assets/xrp (11) 1.svg' },
];

const networkOptions = [
  { label: 'Bitcoin', icon: '/assets/bitcoin (7) 1.svg' },
  { label: 'Ethereum', icon: '/assets/ethereum (8) 1.svg' },
  { label: 'Tron', icon: '/assets/token-branded_tron.svg' },
  { label: 'Solana', icon: '/assets/token-branded_solanaa.svg' },
  { label: 'XRP', icon: '/assets/xrp (11) 1.svg' },
];

export const CryptoStep2 = ({
  setShowStep1,
  kycRequiredAmount = 5000,
}: {
  setShowStep1: (value: boolean) => void;
  kycRequiredAmount?: number;
}) => {
  const { t } = useTranslation();
  const { step3Complete, openAlmostThereModal } = useAuth();
  const [minAmount, setMinAmount] = useState<number>(1);
  const minAmountDisplay = Math.round(minAmount * 10) / 10;
  const [network, setNetwork] = useState(networkOptions[1]); // Ethereum
  const [currency, setCurrency] = useState(currencyOptions[0]); // USDT
  const [amount, setAmount] = useState('');
  const [open3, setOpen3] = useState(false);
  const [depositPaymentData, setDepositPaymentData] = useState<CreateDepositResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const validValue = rawValue.split('.').slice(0, 2).join('.');
    setAmount(validValue);
  };

  const payCurrencyKey = toPayCurrency(currency.label, network.label);
  useEffect(() => {
    getDepositMinAmount(payCurrencyKey)
      .then((min) => setMinAmount(min))
      .catch(() => setMinAmount(1));
  }, [payCurrencyKey]);

  const handleComplete = async () => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num < minAmount) {
      const msg = `Please enter a valid amount (min ${minAmountDisplay} USD).`;
      toast.error(msg);
      return;
    }
    const token = getToken();
    if (!token) {
      toast.error('Please log in to deposit.');
      return;
    }
    setLoading(true);
    try {
      const data = await createDeposit(token, { amount: num, payCurrency: payCurrencyKey });
      setDepositPaymentData(data);
      setOpen3(true);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Failed to create deposit';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="py-3 lg:py-18.25  max-w-197.5 w-full mx-auto flex flex-col gap-3 lg:gap-6.5">
        <div className="flex max-lg:px-3.25 justify-end items-center px-3.75">
          <span className="text-xs lg:text-sm text-[#656565A6] dark:text-[#FFFFFF66] font-ui leading-tight font-normal">
            {t('Step2outof3')}
          </span>
        </div>
        <div className="flex max-lg:px-3.25  flex-col gap-3 lg:gap-5 pt-1 lg:pt-7.25">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Dropdown
              label={t('ChooseCurrency')}
              selected={currency}
              options={currencyOptions}
              onSelect={(option) => {
                setCurrency(option);
                const allowed = getNetworksForCurrency(option.label);
                setNetwork((prev) => (allowed.some((n) => n.label === prev.label) ? prev : (allowed[0] ?? prev)));
              }}
            />

            <Dropdown
              label={t('ChooseNetwork')}
              selected={network}
              options={getNetworksForCurrency(currency.label)}
              onSelect={(option) => setNetwork(option)}
            />
          </div>

          <div className="flex flex-col gap-1.5 lg:gap-2">
            <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
              {t('DepositAmount')}
            </label>
            <div className="px-3 lg:px-4.5 text-sm h-9 lg:h-11 bg-white dark:bg-[#111111] rounded-full flex items-center relative">
              {amount && '$'}
              <input
                type="text"
                inputMode="decimal"
                placeholder="Minimum $20"
                value={amount}
                onChange={handleAmountChange}
                className="dark:placeholder:text-[#FFFFFF66] w-full text-black placeholder:text-[#656565A6] dark:text-white outline-none bg-transparent border-none text-sm font-ui"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 lg:gap-2">
            <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
              {t('PromoCode')}
            </label>
            <div className="px-3 lg:px-4.5 bg-[#ffff] dark:bg-[#111111] rounded-full flex justify-between py-1.5 items-center relative">
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
        <div className="grid max-lg:px-3.25  grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3 pt-1 lg:pt-3.25">
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
            disabled={loading}
            className="h-9 lg:h-11 relative overflow-hidden rounded-full flex items-center justify-center w-full font-normal font-ui text-sm text-[#656565] hover:brightness-110 hover:shadow-lg transition-all duration-200 disabled:text-[#656565] disabled:opacity-70"
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
            <span className="relative flex items-center justify-center gap-2 text-black font-normal font-ui text-sm">
              {loading ? <Loader className="h-6 w-6 text-black" ariaLabel="Creating deposit" /> : t('Complete')}
            </span>
          </button>
        </div>
      </div>

      <PlacedOrderModal
        isOpen={open3}
        onClose={() => {
          setOpen3(false);
          setDepositPaymentData(null);
          setShowStep1(true);
        }}
        amount={parseFloat(amount) || 0}
        initialPaymentData={depositPaymentData}
        currency={{ label: currency.label, muteLabel: currency.label, icon: currency.icon }}
      />
    </>
  );
};
