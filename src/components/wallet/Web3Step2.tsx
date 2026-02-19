'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect, useWriteContract, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { getToken, updateProfile } from '@/lib/auth';
import { getDepositMinAmount, createWeb3Deposit, confirmWeb3Deposit, type CreateWeb3DepositResponse } from '@/lib/api';
import { ERC20_ABI, wagmiConfig } from '@/lib/web3Config';
import { Loader } from '../ui/Loader';
import PlacedOrderModal from '../ui/placedOrderModal';
import { useAuth } from '@/context/AuthContext';

/** Varntix receiving wallet — all Web3 deposits go here */
const VARNTIX_WALLET: `0x${string}` = '0x16b7af10E34B7760535117d7C4E6De2d39A44a71';

/** Supported ERC-20 tokens on Ethereum mainnet */
const ERC20_ADDRESSES: Record<string, `0x${string}`> = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
};
const ERC20_DECIMALS: Record<string, number> = { USDT: 6, USDC: 6, ETH: 18 };

function toCurrencyKey(label: string): string {
  const c = label.toUpperCase().trim();
  if (c.includes('ETH')) return 'ETH';
  if (c.includes('USDT') || c.includes('TETHER')) return 'USDT';
  if (c.includes('USDC')) return 'USDC';
  return 'ETH';
}

/** Map from deposit currency to NowPayments pay_currency slug */
function toPayCurrency(key: string): string {
  if (key === 'ETH') return 'eth';
  if (key === 'USDT') return 'usdterc20';
  if (key === 'USDC') return 'usdc';
  return 'eth';
}

const depositCurrencyOptions = [
  { key: 'USDT', label: 'USDT (ERC-20)', icon: '/assets/usdt (6) 1.svg' },
  { key: 'USDC', label: 'USDC (ERC-20)', icon: '/assets/usdc (3) 1.svg' },
];

export const Web3Step2 = ({
  setShowStep1,
  kycRequiredAmount = 5000,
}: {
  setShowStep1: (value: boolean) => void;
  kycRequiredAmount?: number;
}) => {
  const { t } = useTranslation();
  const { step3Complete, openAlmostThereModal, refreshUser } = useAuth();

  /* ── WalletConnect AppKit ── */
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  /* ── deposit form state ── */
  const [selectedCurrency, setSelectedCurrency] = useState(depositCurrencyOptions[0]);
  const [amount, setAmount] = useState('');
  const [minAmount, setMinAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [open3, setOpen3] = useState(false);
  const [web3DepositData, setWeb3DepositData] = useState<CreateWeb3DepositResponse | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const confirmingRef = useRef(false);

  /* ── wagmi tx hooks ── */
  const { writeContractAsync } = useWriteContract();
  const { connector: activeConnector } = useAccount();

  const payCurrencySlug = toPayCurrency(selectedCurrency.key);

  /* ── fetch min amount when currency changes ── */
  useEffect(() => {
    getDepositMinAmount(payCurrencySlug)
      .then((min) => setMinAmount(min))
      .catch(() => setMinAmount(1));
  }, [payCurrencySlug]);

  /* ── sync wallet address to profile ── */
  const syncWallet = useCallback(async () => {
    if (!address) return;
    try {
      await updateProfile({ walletAddress: address, preferredNetwork: 'Ethereum' });
      refreshUser?.();
    } catch { /* non-critical */ }
  }, [address, refreshUser]);

  useEffect(() => {
    if (isConnected && address) syncWallet();
  }, [isConnected, address, syncWallet]);

  /* ── open WalletConnect modal ── */
  const handleConnectWallet = async () => {
    try {
      await open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to open wallet modal';
      if (!msg.includes('rejected') && !msg.includes('denied')) {
        toast.error(msg.length > 120 ? 'Wallet connection failed' : msg);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const validValue = rawValue.split('.').slice(0, 2).join('.');
    setAmount(validValue);
  };

  /* ── Wait for on-chain confirmation then call backend confirm ── */
  const waitAndConfirmDeposit = useCallback(async (hash: string) => {
    if (confirmingRef.current) return;
    confirmingRef.current = true;
    try {
      await waitForTransactionReceipt(wagmiConfig, {
        hash: hash as `0x${string}`,
        confirmations: 1,
      });
      const token = getToken();
      if (!token) return;
      const result = await confirmWeb3Deposit(token, { txHash: hash });
      if (result.status === 'finished') {
        setDepositConfirmed(true);
        toast.success('Deposit confirmed! Funds have been credited to your account.');
        refreshUser?.();
      }
    } catch (err) {
      console.error('Deposit confirmation error:', err);
    } finally {
      confirmingRef.current = false;
    }
  }, [refreshUser]);

  /* ── send deposit directly to Varntix wallet ── */
  const handleDeposit = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first.');
      return;
    }

    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num < minAmount) {
      toast.error(`Please enter a valid amount (min $${Math.ceil(minAmount)}).`);
      return;
    }

    if (!step3Complete && num >= kycRequiredAmount) {
      openAlmostThereModal?.();
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Please log in to deposit.');
      return;
    }

    setLoading(true);
    setDepositConfirmed(false);
    try {
      const key = selectedCurrency.key;
      const contractAddr = ERC20_ADDRESSES[key];
      const decimals = ERC20_DECIMALS[key] ?? 6;
      const hash = await writeContractAsync({
        address: contractAddr,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [VARNTIX_WALLET, parseUnits(amount, decimals)],
        gas: BigInt(100000),
      });

      setTxHash(hash);
      toast.success('Transaction sent! Waiting for blockchain confirmation...');

      /* Record the deposit on the backend (status: confirming) */
      const data = await createWeb3Deposit(token, {
        amount: num,
        currency: key,
        txHash: hash,
        fromAddress: address,
      });
      setWeb3DepositData(data);
      setOpen3(true);

      /* Wait for on-chain confirmation in background */
      waitAndConfirmDeposit(hash);
    } catch (e: unknown) {
      console.error('[Varntix Deposit Error]', e);
      const raw = e instanceof Error ? e.message : String(e);
      const msg = raw.toLowerCase();
      if (msg.includes('rejected') || msg.includes('denied') || msg.includes('user refused') || msg.includes('cancelled')) {
        toast.info('Transaction was cancelled in wallet.');
      } else if (msg.includes('connector not connected') || msg.includes('no connector')) {
        toast.error('Wallet disconnected. Please disconnect and reconnect your wallet, then try again.');
      } else if (msg.includes('insufficient funds') || msg.includes('insufficient balance')) {
        toast.error('Insufficient funds in your wallet for this transaction (amount + gas fees).');
      } else if (msg.includes('switch') && msg.includes('chain')) {
        toast.error('Please switch your wallet to Ethereum mainnet and try again.');
      } else {
        const short = raw.length > 200 ? raw.slice(0, 200) + '…' : raw;
        toast.error(`Deposit failed: ${short}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const minDisplay = Math.round(minAmount * 10) / 10;

  return (
    <>
      <div className="py-3 lg:py-18.25 max-w-197.5 w-full mx-auto flex flex-col gap-3 lg:gap-6.5">
        <div className="flex max-lg:px-3.25 justify-end items-center px-3.75">
          <span className="text-xs lg:text-sm text-[#656565A6] dark:text-[#FFFFFF66] font-ui leading-tight font-normal">
            {t('Step2outof3')}
          </span>
        </div>

        <div className="flex max-lg:px-3.25 flex-col gap-3 lg:gap-5 pt-1 lg:pt-7.25">
          {/* ── Wallet Connection ── */}
          <div className="flex items-center justify-between bg-white dark:bg-[#111111] rounded-full px-3 lg:px-4.5 h-11 lg:h-12.5">
            {isConnected && address ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#42DE33] shrink-0" />
                  <span className="text-sm font-ui dark:text-white text-[#656565] truncate max-w-[200px]">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="text-xs text-[#FF6B6B] hover:text-[#FF4444] font-ui font-medium transition-colors ml-2 shrink-0"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectWallet}
                className="flex items-center gap-2.5 w-full justify-center py-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12V7H3V19H21V14M21 12H15C13.3431 12 12 13.3431 12 15V15C12 16.6569 13.3431 18 15 18H21M21 12V14M3 7L11.7 3.13C11.8924 3.04511 12.1076 3.04511 12.3 3.13L21 7" stroke="#D5F821" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="16" cy="15" r="1" fill="#D5F821" />
                </svg>
                <span className="text-sm font-ui font-medium dark:text-[#D5F821] text-[#656565]">
                  Connect Wallet
                </span>
              </button>
            )}
          </div>

          {isConnected && (
            <div className="flex items-center gap-2 px-1 -mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#42DE33]" />
              <span className="text-[11px] text-[#FFFFFF66] font-ui">
                Wallet connected &mdash; select currency and amount, then approve the transaction in your wallet
              </span>
            </div>
          )}

          {/* ── Currency Selector ── */}
          <div className="flex flex-col gap-1.5 lg:gap-2">
            <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
              Deposit Currency
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="w-full px-3 lg:px-4.5 h-9 lg:h-11 bg-white dark:bg-[#111111] rounded-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Image src={selectedCurrency.icon} alt="" width={20} height={20} className="w-5 h-5" />
                  <span className="text-sm font-ui dark:text-white text-[#333]">{selectedCurrency.label}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showCurrencyDropdown && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#FFFFFF1A] shadow-xl overflow-hidden">
                  {depositCurrencyOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency(opt);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-[#FFFFFF0A] transition-colors ${
                        opt.key === selectedCurrency.key ? 'bg-[#D5F82110]' : ''
                      }`}
                    >
                      <Image src={opt.icon} alt="" width={20} height={20} className="w-5 h-5" />
                      <span className="text-sm font-ui dark:text-white text-[#333]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Amount ── */}
          <div className="flex flex-col gap-1.5 lg:gap-2">
            <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
              {t('DepositAmount')}
            </label>
            <div className="px-3 lg:px-4.5 text-sm h-9 lg:h-11 bg-white dark:bg-[#111111] rounded-full flex items-center relative">
              {amount && '$'}
              <input
                type="text"
                inputMode="decimal"
                placeholder={`Minimum $${minDisplay}`}
                value={amount}
                onChange={handleAmountChange}
                className="dark:placeholder:text-[#FFFFFF66] w-full text-black placeholder:text-[#656565A6] dark:text-white outline-none bg-transparent border-none text-sm font-ui"
              />
            </div>
          </div>

          {/* ── Promo Code ── */}
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

        {/* ── Buttons ── */}
        <div className="grid max-lg:px-3.25 grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3 pt-1 lg:pt-3.25">
          <button
            type="button"
            onClick={() => {
              if (isConnected) disconnect();
              setShowStep1(true);
            }}
            className="h-9 lg:h-11 max-sm:order-2 bg-[#0000001A] text-[#656565] dark:text-white dark:bg-[#FFFFFF1A] border border-[#FFFFFF4D] rounded-full flex items-center justify-center text-sm font-ui font-normal"
          >
            {t('PreviousStep')}
          </button>
          <button
            type="button"
            disabled={loading || !isConnected}
            className="h-9 lg:h-11 rounded-full flex items-center justify-center w-full font-normal font-ui text-sm hover:brightness-110 hover:shadow-lg transition-all duration-200 disabled:opacity-70"
            style={{
              background: isConnected
                ? 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)'
                : 'linear-gradient(180deg, #555 0%, #333 100%)',
              color: isConnected ? '#000' : '#aaa',
            }}
            onClick={isConnected ? handleDeposit : handleConnectWallet}
          >
            <span className="flex items-center justify-center gap-2 font-normal font-ui text-sm">
              {loading ? (
                <Loader className="h-6 w-6 text-black" ariaLabel="Processing" />
              ) : !isConnected ? (
                'Connect Wallet to Deposit'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12V7H3V19H21V14M21 12H15C13.3431 12 12 13.3431 12 15V15C12 16.6569 13.3431 18 15 18H21M21 12V14M3 7L11.7 3.13C11.8924 3.04511 12.1076 3.04511 12.3 3.13L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="16" cy="15" r="1" fill="currentColor" />
                  </svg>
                  Send from Wallet
                </>
              )}
            </span>
          </button>
        </div>

        {/* ── Transaction info ── */}
        {txHash && (
          <div className="max-lg:px-3.25 text-center">
            <div className="bg-[#111111] rounded-lg px-4 py-3 flex flex-col gap-1.5 items-center">
              <p className="text-xs text-[#FFFFFF99] font-ui">Transaction sent from wallet</p>
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#D5F821] underline font-ui"
              >
                View on Etherscan
              </a>
            </div>
          </div>
        )}
      </div>

      <PlacedOrderModal
        isOpen={open3}
        onClose={() => {
          setOpen3(false);
          setWeb3DepositData(null);
          setTxHash(null);
          setDepositConfirmed(false);
          setShowStep1(true);
        }}
        amount={parseFloat(amount) || 0}
        initialPaymentData={
          web3DepositData
            ? {
                paymentId: web3DepositData.txHash,
                orderId: web3DepositData.orderId,
                payAddress: VARNTIX_WALLET,
                payAmount: web3DepositData.amount,
                payCurrency: selectedCurrency.key.toLowerCase(),
                currencyNetwork: 'Ethereum',
                currencySymbol: selectedCurrency.key,
                priceAmount: web3DepositData.amount,
                priceCurrency: 'usd',
                status: depositConfirmed ? 'finished' : web3DepositData.status,
                createdAt: new Date().toISOString(),
              }
            : null
        }
        currency={{
          label: selectedCurrency.key,
          muteLabel: selectedCurrency.key,
          icon: selectedCurrency.icon,
        }}
      />
    </>
  );
};
