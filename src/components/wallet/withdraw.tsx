'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { GradientBorderGray } from '../ui/gradientBorder';
import Image from 'next/image';
import { getToken } from '@/lib/auth';
import { getBalance, createWithdraw } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

/** Map currency + network labels to NowPayments pay_currency (same as cryptoStep1) */
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

const currencyOptions = [
  { label: 'USDT', icon: '/assets/usdt (6) 1.svg' },
  { label: 'USDC', icon: '/assets/usdc (3) 1.svg' },
];

// const networkOptions = [
//   { label: 'Bitcoin BTC', icon: '/assets/bitcoin (7) 1.svg' },
//   { label: 'Ethereum ETH', icon: '/assets/ethereum (8) 1.svg' },
//   { label: 'Tether USDT', icon: '/assets/usdt (6) 1.svg' },
//   { label: 'Solana SOL', icon: '/assets/token-branded_solana (1).svg' },
//   { label: 'USD Coin USDC', icon: '/assets/usdc (3) 1.svg' },
//   { label: 'XRP', icon: '/assets/xrp (11) 1.svg' },
// ];
const networkOptions = [
  { label: 'Ethereum', icon: '/assets/ethereum (8) 1.svg' },
  { label: 'Tron', icon: '/assets/token-branded_tron.svg' },
  { label: 'Solana', icon: '/assets/token-branded_solanaa.svg' }
];
const currencyToNetworks: Record<string, string[]> = {
  USDT: ['Ethereum', 'Tron', 'Solana'],
  USDC: ['Ethereum', 'Solana'],
};

function getNetworksForCurrency(currencyLabel: string): { label: string; icon: string }[] {
  const names = currencyToNetworks[currencyLabel] ?? [];
  return networkOptions.filter((n) => names.includes(n.label));
}

/** Format USD with user's locale (e.g. 428.5 → "$428.50" or "428,50 US$" depending on locale). */
function formatUsd(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type CurrencyOption = (typeof currencyOptions)[number];
type NetworkOption = (typeof networkOptions)[number];

function getInitialCurrency(userPreferred?: string): CurrencyOption {
  if (!userPreferred?.trim()) return currencyOptions[1];
  const exact = currencyOptions.find((o) => o.label === userPreferred.trim());
  if (exact) return exact;
  const match = currencyOptions.find((o) => o.label.toUpperCase().includes(userPreferred.trim().toUpperCase()));
  return match ?? currencyOptions[1];
}

function getInitialNetwork(userPreferred?: string): NetworkOption {
  if (!userPreferred?.trim()) return networkOptions[1];
  const match = networkOptions.find((o) => o.label === userPreferred.trim());
  return match ?? networkOptions[1];
}

export const Withdraw = ({ handleOpen }: { handleOpen?: () => void }) => {
  const { t } = useTranslation();
  const { user, step2Complete, step3Complete, openFinishSetupModal, openAlmostThereModal } = useAuth();
  const [currency, setCurrency] = useState<CurrencyOption>(() => getInitialCurrency());
  const [network, setNetwork] = useState<NetworkOption>(() => getInitialNetwork());
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
  const amountDisplay =
    amountNum > 0
      ? amountNum.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : '';

  /** Sync currency, network, and wallet address from user profile when user loads or profile preferences change. */
  useEffect(() => {
    if (user?.preferredCurrency != null || user?.preferredNetwork != null) {
      setCurrency((prev) => {
        const fromProfile = getInitialCurrency(user?.preferredCurrency);
        return prev.label !== fromProfile.label ? fromProfile : prev;
      });
      setNetwork((prev) => {
        const fromProfile = getInitialNetwork(user?.preferredNetwork);
        return prev.label !== fromProfile.label ? fromProfile : prev;
      });
    }
    if (user?.walletAddress != null) {
      setWalletAddress(user.walletAddress);
    }
  }, [user?.preferredCurrency, user?.preferredNetwork, user?.walletAddress]);

  /** Fetch current user's deposited (available) balance in USD from the API. */
  const fetchDepositedBalance = React.useCallback(() => {
    const token = getToken();
    if (!token) {
      setAvailableBalance(0);
      return;
    }
    getBalance(token)
      .then(setAvailableBalance)
      .catch(() => setAvailableBalance(0));
  }, []);

  useEffect(() => {
    fetchDepositedBalance();
  }, [fetchDepositedBalance]);

  const handleCompleteWithdraw = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please log in to withdraw.');
      return;
    }
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (num > availableBalance) {
      toast.error(`Insufficient balance. Available: $${availableBalance.toFixed(2)} USD`);
      return;
    }
    const address = walletAddress.trim();
    if (!address || address.length < 10) {
      toast.error('Please enter a valid wallet address.');
      return;
    }
    setLoading(true);
    try {
      const payCurrency = toPayCurrency(currency.label, network.label);
      await createWithdraw(token, { amount: num, payCurrency, walletAddress: address });
      fetchDepositedBalance();
      setAmount('');
      setWalletAddress('');
      toast.success('Withdrawal submitted.');
      handleOpen?.();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Withdrawal failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="py-3 lg:py-18.25  max-w-197.5 w-full mx-auto">
        <div className="py-2 lg:py-6 px-3.5 lg:px-2.5 flex flex-col  ">
          <div className="flex pb-3 lg:pb-6.75 justify-between items-center px-2 lg:px-4.25">
            <h2 className="text-sm lg:text-base font-medium font-ui leading-tight dark:text-white text-[#656565]">
              {t('Makeawithdrawal')}
            </h2>
          </div>
          <div className="flex pb-4 lg:pb-11 flex-col gap-3 lg:gap-5">
            <div className="flex flex-col gap-1.5 lg:gap-2.5">
              <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
                {t('AvailableBalance')}
              </label>
              <div className="px-3 lg:px-4.5 bg-white dark:bg-[#111111] rounded-full flex gap-3 py-1.5 items-center relative">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-[#111111] rounded-full flex items-center justify-center shrink-0">
                  <Image width={16} height={16} src="/assets/Wallet-Remove-Subtract--Streamline-Core.png" alt="" />
                </div>
                <span className="text-sm text-[#656565A6] dark:text-white font-normal font-ui">
                  {formatUsd(availableBalance)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Currency Dropdown */}
              <div className="flex flex-col gap-1.5 lg:gap-2.5">
                <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
                  {t('PayoutCurrency')}
                </label>
                <div className="px-3 lg:px-4.5 cursor-pointer relative py-1.5 bg-white dark:bg-[#111111] justify-between rounded-full flex gap-3 items-center relative">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <button className="relative w-9 h-9 lg:w-11 lg:h-10.75 flex items-center gap-1.75 justify-center bg-[#272727] dark:bg-[#111111] rounded-md shrink-0">
                      <Image width={24} height={24} src={currency.icon} className="w-5 h-5 lg:w-6 lg:h-6" alt="" />
                    </button>
                    <span className="text-[#656565A6] dark:text-[#FFFFFF66] text-sm font-normal font-ui">
                      {currency.label}
                    </span>
                  </div>
                  {/* <span className="dark:hidden cursor-pointer ">
                    <ArrowDown color="#65656559" />
                  </span>
                  <span className="dark:block hidden  cursor-pointer">
                    <ArrowDown />
                  </span> */}

                  {/* {currencyOpen && (
                    <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#111111] rounded-md shadow-lg w-full z-10">
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
                          className="flex items-center gap-8 py-2  px-4.5 cursor-pointer rounded-md "
                        >
                          <button className="relative max-w-11.5 w-full h-10.75 flex items-center gap-1.75 justify-center bg-white dark:bg-[#272727] rounded-md">
                            <Image width={24} height={24} src={option.icon} className="w-6 h-6" alt={option.label} />
                          </button>
                          <span className="text-[#FFFFFF66] text-lg font-normal font-ui">
                            {option.label === 'Ethereum ETH'
                              ? 'Ethereum'
                              : option.label === 'Bitcoin BTC'
                                ? 'Bitcoin'
                                : option.label === 'Tether USDT'
                                  ? 'USDT'
                                  : option.label === 'USD Coin USDC'
                                    ? 'USDC'
                                    : option.label === 'Solana SOL'
                                      ? 'SOL'
                                      : option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )} */}
                </div>
              </div>

              {/* Network Dropdown */}
              <div className="flex flex-col gap-1.5 lg:gap-2.5">
                <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
                  {t('PayoutNetwork')}
                </label>
                <div className="px-3 lg:px-4.5 cursor-pointer py-1.5 justify-between bg-white dark:bg-[#111111] rounded-full flex gap-3 items-center relative">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <button className="relative w-9 h-9 lg:w-11 lg:h-10.75 flex items-center gap-1.75 justify-center bg-[#272727] dark:bg-[#111111] rounded-md shrink-0">
                      <Image width={24} height={24} src={network.icon} className="w-5 h-5 lg:w-6 lg:h-6" alt="" />
                    </button>
                    <span className="text-[#656565A6] dark:text-[#FFFFFF66] text-sm font-normal font-ui">
                      {network.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 lg:gap-2.5">
              <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
                {t('WalletAddress')}
              </label>
              <div className="px-3 lg:px-4.5 h-9 lg:h-11 bg-white dark:bg-[#111111] rounded-full flex gap-3 items-center relative">
                <input
                  type="text"
                  readOnly={true}
                  placeholder="Put your wallet address here"
                  value={walletAddress}
                  className="dark:placeholder:text-[#FFFFFF66] text-[#656565A6] placeholder:text-[#656565A6] dark:text-white w-full outline-none bg-transparent border-none text-sm font-ui"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 lg:gap-2.5">
              <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
                {t('Amount')}
              </label>
              <div className="px-3 lg:px-4.5 h-9 lg:h-11 bg-white dark:bg-[#111111] rounded-full flex gap-3 items-center relative">
                <input
                  type="text"
                  placeholder="Minimum $20"
                  value={amountFocused ? inputValue : amountDisplay}
                  onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.]/g, ''))}
                  onFocus={() => {
                    setAmountFocused(true);
                    setInputValue(amount);
                  }}
                  onBlur={() => {
                    setAmountFocused(false);
                    const cleaned = inputValue.replace(/[^0-9.]/g, '');
                    setAmount(cleaned);
                  }}
                  className="dark:placeholder:text-[#FFFFFF66] text-[#656565A6] placeholder:text-[#656565A6] dark:text-white w-full outline-none bg-transparent border-none text-sm font-ui"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="h-9 lg:h-11 relative overflow-hidden rounded-full flex items-center justify-center w-full font-normal font-ui text-sm text-[#656565] hover:brightness-110 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:text-[#656565]"
            style={{
              background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
            }}
            onClick={handleCompleteWithdraw}
            disabled={loading}
          >
            <Image
              width={1000}
              height={1000}
              src="/assets/Frame 15.svg"
              className="absolute z-0 w-full h-full top-0 left-0"
              alt=""
            />
            <span className="relative text-black font-normal font-ui text-sm">{t('SubmitWithdrawalRequest')}</span>
          </button>
        </div>
      </div>
    </>
  );
};
