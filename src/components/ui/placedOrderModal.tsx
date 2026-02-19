import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { type CreateInvestResponse } from '@/lib/api';
import { formatDateShort, shortenAddress } from '@/lib/formatUtils';
import { PaymentSocketClient } from '@/lib/socket';
import { useTranslation } from 'react-i18next';

/** Map payCurrency code to a network icon path */
function getNetworkIcon(payCurrency?: string): string | null {
  if (!payCurrency) return null;
  const c = payCurrency.toLowerCase();
  if (c.includes('btc') || c.includes('bitcoin')) return '/assets/bitcoin (7) 1.svg';
  if (c === 'eth' || c.includes('usdterc20') || c === 'usdc') return '/assets/ethereum (8) 1.svg';
  if (c.includes('sol')) return '/assets/token-branded_solanaa.svg';
  if (c.includes('trx') || c.includes('trc20')) return '/assets/token-branded_tron.svg';
  if (c.includes('xrp')) return '/assets/xrp (11) 1.svg';
  return null;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  waiting: 'Waiting...',
  confirming: 'Confirming',
  confirmed: 'Confirmed',
  sending: 'Sending',
  finished: 'Payment received',
  failed: 'Failed',
  refunded: 'Refunded',
  expired: 'Expired',
};

function getPaymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status.toLowerCase()] ?? status;
}

/** NowPayments payment expiry from creation (24 hours in ms) */
const PAYMENT_EXPIRE_MS = 24 * 60 * 60 * 1000;

function formatExpireCountdown(remainingSeconds: number): string {
  if (remainingSeconds <= 0) return 'Expired';
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h}h ${min}m`;
  }
  return `${m}m. ${s} sec`;
}

export type ModalStrategy = {
  id: string;
  name?: string;
  title?: string;
  termMonths?: number;
  fundSize?: string;
  payoutFrequency?: string;
  sector?: string;
  apy?: number;
  percen?: number;
  minInvestment?: number | string;
  maxInvestment?: number | string;
  redemption?: string;
  rate?: string;
};

/** Currency selected in invest details (label + muteLabel map to NowPayments pay_currency) */
export type ModalCurrency = {
  label: string;
  muteLabel: string;
  icon?: string;
  bgColor?: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  strategy?: ModalStrategy | null;
  currency?: ModalCurrency | null;
  amount?: number;
  /** When set, modal opens directly on the payment screen (e.g. after disclaimer creates the invest). */
  initialPaymentData?: CreateInvestResponse | null;
  discaimerClose?: () => void;
  /** Called when payment is received (e.g. to create subscription and save PDF). */
  onPaymentReceived?: () => void | Promise<void>;
};

/** Map currency label/muteLabel from invest details to NowPayments pay_currency code. Exported for use in disclaimer. */
export function currencyToPayCurrency(currency: ModalCurrency | null | undefined): string {
  if (!currency) return 'usdterc20';
  const m = (currency.muteLabel || '').toUpperCase();
  const l = (currency.label || '').toLowerCase();
  if (m === 'BTC' || l.includes('bitcoin')) return 'btc';
  if (m === 'ETH' || l.includes('ethereum')) return 'eth';
  if (m === 'SOL' || l.includes('solana')) return 'sol';
  if (m === 'USDT' || l.includes('tether')) return 'usdterc20';
  if (m === 'USDC' || l.includes('usd coin')) return 'usdc';
  if (m === 'XRP') return 'xrp';
  if (m === 'LTC') return 'ltc';
  if (m === 'DOGE') return 'doge';
  if (m === 'TRX') return 'trx';
  if (m === 'BNB') return 'bnb';
  if (m === 'MATIC') return 'matic';
  return 'usdterc20';
}

function nextPayoutAmount(amount: number, percen: number, sector: string): number {
  const rate = percen || 0;
  const annual = amount * (rate / 100);
  const s = sector.toLowerCase();
  if (s.includes('week')) return annual / 52;
  if (s.includes('quarter')) return annual / 4;
  return annual / 12;
}

function nextPayoutDate(sector: string): string {
  const d = new Date();
  const s = sector.toLowerCase();
  if (s.includes('week')) {
    d.setDate(d.getDate() + 7);
  } else if (s.includes('quarter')) {
    d.setMonth(d.getMonth() + 3);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return formatDateShort(d);
}

export default function PlacedOrderModal({ isOpen, onClose, amount = 0, initialPaymentData, onPaymentReceived, currency }: ModalProps) {
  const { t } = useTranslation();
  const [expired, setExpired] = useState(false);
  const [paymentData, setPaymentData] = useState<CreateInvestResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('waiting');
  const [expireCountdown, setExpireCountdown] = useState<string>('—');
  const socketClientRef = useRef<PaymentSocketClient | null>(null);

  useEffect(() => {
    if (isOpen && initialPaymentData) {
      setPaymentData(initialPaymentData);
    }
  }, [isOpen, initialPaymentData]);

  useEffect(() => {
    if (paymentData?.status) setPaymentStatus(paymentData.status);
  }, [paymentData?.status]);

  /* Auto-transition to success screen when payment is confirmed */
  useEffect(() => {
    const s = paymentStatus.toLowerCase();
    if (s === 'finished' || s === 'confirmed') {
      const timer = setTimeout(() => setExpired(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  useEffect(() => {
    const createdAt = paymentData?.createdAt;
    if (!createdAt) {
      setExpireCountdown('—');
      return;
    }
    const createdMs = new Date(createdAt).getTime();
    const expireAtMs = createdMs + PAYMENT_EXPIRE_MS;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expireAtMs - Date.now()) / 1000));
      setExpireCountdown(formatExpireCountdown(remaining));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [paymentData?.createdAt]);

  useEffect(() => {
    const paymentId = paymentData?.paymentId;
    if (!paymentId) return;

    const client = new PaymentSocketClient();
    socketClientRef.current = client;
    client.connect();
    client.subscribePayment(paymentId);

    const unsubStatus = client.onPaymentStatus((payload) => {
      setPaymentStatus(payload.status);
    });

    const unsubReceived = client.onPaymentReceived(async () => {
      setPaymentStatus('finished');
      setExpired(true);
      try {
        await onPaymentReceived?.();
      } catch {
        // Caller may toast; avoid unhandled rejection
      }
    });

    return () => {
      unsubStatus();
      unsubReceived();
      client.disconnect();
      socketClientRef.current = null;
    };
  }, [paymentData?.paymentId, onPaymentReceived]);

  const handleClose = () => {
    setExpired(false);
    setPaymentData(null);
    setPaymentStatus('waiting');
    setExpireCountdown('—');
    onClose();
  };

  const orderNo = paymentData?.orderId ?? '—';
  const displayAmount =
    amount > 0
      ? amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      : '$0.00';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('Copied'));
    } catch {
      toast.error(t('Failedtocopy'));
    }
  };

  if (!isOpen && !expired) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 blur-3xl" />

        {/* Modal */}
        <div className="relative w-full h-full lg:h-auto max-w-full lg:max-w-[400px] no-scrollbar max-h-full lg:max-h-[96vh] overflow-y-auto rounded-none lg:rounded-[16px] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent dark:bg-[#111113] modalShadow pt-1.5 px-2 pb-2 animate-fadeIn flex flex-col justify-center lg:block">
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center bg-[#FFFFFF1A] close z-10 rounded-full absolute right-3 top-3"
          >
            <Image width={10} height={10} src="/assets/Group 1597884961.png" alt="" />
          </button>
          {isOpen && !expired && (
            <div>
              <div className="h-44 w-full relative flex items-end justify-end z-1">
                <Image
                  width={1000}
                  height={1000}
                  src="/assets/Group 1597887078.png"
                  className="absolute max-w-full h-full w-full z-0 object-cover"
                  alt=""
                />
                <h2 className="absolute top-[45%] leading-[120%] left-[50%] -translate-1/2 text-sm font-bold font-ui text-center">
                  {t('Your order has been')} <br /> {t('placed')} <span className="text-[#8EDD23]">{t('successfully')}</span>
                </h2>
                <div className="max-w-[320px] flex justify-between items-center relative w-full pb-2.5 mx-auto px-2">
                  <span className="text-xs font-normal font-ui text-[#FFFFFF99]">{t('Order No')}:</span>

                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-normal font-ui truncate max-w-[170px]">{orderNo}</span>

                    <button
                      onClick={() => handleCopy(orderNo)}
                      className="cursor-pointer shrink-0"
                      aria-label="Copy order number"
                    >
                      <Image width={16} height={16} src="/assets/solar_copy-outline (1).svg" alt="Copy" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2 dark:bg-[#323234] bg-white rounded-lg py-2 pr-3 pl-3.5">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="dark:text-[#FFFFFF80] text-[#65656599] text-sm font-ui font-normal">
                        {t('Pleasesend')}:
                      </span>
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-base dark:text-white text-[#656565] font-bold font-ui break-all">
                          {paymentData?.payAmount}
                        </span>
                        {currency?.icon && (
                          <Image width={24} height={24} src={currency.icon} alt={currency.label || ''} className="w-6 h-6 rounded-full" />
                        )}
                        <button
                          onClick={() => {
                            const amount = paymentData?.payAmount;
                            if (amount != null) handleCopy(amount.toString());
                          }}
                          className="cursor-pointer shrink-0"
                          aria-label="Copy payment amount"
                        >
                          <Image width={14} height={14} src="/assets/copy.svg" alt="" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Image width={11} height={11} src="/assets/mingcute_scan-line.svg" alt="" />
                      <span className="text-sm font-normal dark:text-white text-[#00000066] font-ui">
                        {t('ScanTheAddress')}
                      </span>
                    </div>
                  </div>
                  <Image width={90} height={90} src="/assets/image 4.svg" alt="" className="w-[90px] h-[90px] shrink-0" />
                </div>
              </div>
              <div className="py-1.5 max-w-[333px] w-full text-center text-[#65656599] dark:text-[#FFFFFF99] text-[10px] mx-auto flex items-start justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#65656599] dark:text-[#FFFFFF99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>
                  {t('singleTransaction')}
                </span>
              </div>
              <div className="dark:bg-[#323234] bg-white rounded-lg py-3 pl-3.5 pr-3.5 flex flex-col gap-3">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="dark:text-[#FFFFFF80] text-[#65656599] font-ui text-sm">Address</span>
                    <div className="flex flex-row justify-between gap-2 items-center flex-wrap">
                      <span className="text-sm font-normal dark:text-white text-[#656565] truncate max-w-[140px] font-ui break-all">
                        {paymentData?.payAddress ? shortenAddress(paymentData?.payAddress) : '—'}
                      </span>
                      <button
                        onClick={() => paymentData?.payAddress && handleCopy(paymentData.payAddress)}
                        className="cursor-pointer"
                        aria-label="Copy address"
                      >
                        <Image width={14} height={14} src="/assets/copy.svg" alt="" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="dark:text-[#FFFFFF80] text-[#65656599] font-ui text-sm">{t('PaymentAmount')}</span>
                    <div className="flex gap-4 items-center">
                      <span className="text-sm font-normal dark:text-white text-[#656565] font-ui">
                        {displayAmount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex flex-col flex-1 gap-1">
                    <span className="dark:text-[#FFFFFF80] text-[#65656599] font-ui text-sm">{t('Network')}</span>
                    <div className="h-[32px] items-center w-full border border-[#D8D8D880] rounded-[4px] flex justify-center px-2 gap-2">
                      {getNetworkIcon(paymentData?.payCurrency) && (
                        <Image width={16} height={16} src={getNetworkIcon(paymentData?.payCurrency)!} alt="" className="w-4 h-4 rounded-full shrink-0" />
                      )}
                      <span className="text-sm font-normal dark:text-white text-[#656565] leading-[100%] truncate">
                        {paymentData?.currencyNetwork && paymentData?.currencySymbol
                          ? `${paymentData.currencyNetwork} (${paymentData.currencySymbol})`
                          : paymentData?.payCurrency
                            ? `${paymentData.payCurrency.toUpperCase()}`
                            : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col max-w-[120px] w-full gap-1">
                    <span className="dark:text-[#FFFFFF80] text-[#65656599] font-ui text-sm">{t('Status')}</span>
                    <div className="bg-[#FFFFFF1A] rounded-[#40404059] modalShadow2 h-[32px] flex justify-between items-center pl-2 pr-2.5 rounded-sm gap-2">
                      <span className="text-xs font-bold text-[#CACACA] dark:text-[#FFFFFFCC] truncate">
                        {getPaymentStatusLabel(paymentStatus)}
                      </span>
                      {!['finished', 'confirmed', 'failed', 'expired', 'refunded'].includes(
                        paymentStatus.toLowerCase(),
                      ) && (
                          <span
                            className="w-4 h-4 shrink-0 rounded-full animate-spin border-2 border-[#c5c5c5] dark:border-white/30 border-t-[#656565] dark:border-t-white"
                            aria-hidden
                          />
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex mt-1.5 flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setExpired(true)}
                  className="h-10 rounded-xl flex justify-center items-center gap-2 text-sm text-[#1E1E20] font-bold font-ui"
                  style={{
                    background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
                  }}
                >
                  <span className="font-normal"> {t('Expiretime')}:</span> {expireCountdown}
                </button>
                <button
                  onClick={handleClose}
                  className="h-10 rounded-lg dark:bg-[#323234] border border-[#65656526] dark:border-transparent bg-white flex justify-center items-center text-[#40404059] dark:text-[#FFFFFF59] text-sm font-bold font-ui"
                >
                  {t('Close')}
                </button>
              </div>
            </div>
          )}

          {/* ================= EXPIRED SCREEN ================= */}
          {expired && (
            <div>
              <div className="h-44 pt-4 pb-3 pl-5 relative">
                <Image
                  width={1000}
                  height={1000}
                  className="max-w-full absolute top-0 left-0 h-auto w-full"
                  src="/assets/Group 1597884964.svg"
                  alt=""
                />
                <div className="h-full relative flex justify-between flex-col ">
                  <div>
                    <p className="text-base font-bold font-ui leading-[100%]">{t('YourPaymentwas')}</p>
                    <div className=" flex items-end gap-1">
                      <h2 className="text-2xl font-bold underline font-ui leading-[100%] text-[#8EDD23]">
                        {t('successful')}
                      </h2>
                      <div className="w-5.5 h-5.5 flex items-center justify-center relative">
                        <Image
                          width={22}
                          height={22}
                          src={'/assets/Vector.png'}
                          alt=""
                          className="absolute left-0 top-0 z-0"
                        />
                        <Image width={10} height={8} src={'/assets/Vector.svg'} alt="" className="relative" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-col">
                    <h2 className="text-xs font-ui text-[#FFFFFF80] font-normal">{t('Thankyouforusing')}</h2>
                    <Link href={'/'} className="flex max-w-max gap-4 items-center">
                      <div className="flex flex-col">
                        <Image
                          width={22.8}
                          height={45.6}
                          priority
                          src="/assets/logoSingle.svg"
                          placeholder="blur"
                          blurDataURL="/assets/logoSingle-lowres.svg"
                          quality={100}
                          alt=""
                        />
                      </div>
                      <h2 className="text-[24.76px] mb-1.5  font-semibold leading-[69%] font-ui text-white">
                        Varntix
                      </h2>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex flex-col mt-2 gap-2">
                <button
                  onClick={handleClose}
                  className="h-11 rounded-xl flex justify-center items-center gap-2 text-base font-bold font-ui"
                  style={{
                    background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                  }}
                >
                  {t('BuyMore')}
                </button>

                <button
                  onClick={handleClose}
                  className="h-11 rounded-[9px] dark:bg-[#323234] border border-[#65656526] dark:border-transparent bg-white flex justify-center items-center text-[#40404059] dark:text-[#FFFFFF59] text-base font-bold font-ui"
                >
                  {t('Close')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
