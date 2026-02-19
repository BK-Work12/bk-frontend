import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDateShort } from '@/lib/formatUtils';
import { useTranslation } from 'react-i18next';

/** Strategy shape for modals – supports new API shape (name, apy, payoutFrequency, termMonths) and legacy (title, sector, percen, fundSize). */
export type ModalStrategy = {
  id: string;
  strategyId?: string;
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
  amount?: number;
  discaimerOpen?: () => void;
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
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function Modal({ discaimerOpen, isOpen, onClose, strategy, amount = 0 }: ModalProps) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirm(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setConfirm(false);
    setExpired(false);
    onClose();
  };

  const displayAmount =
    amount > 0
      ? amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      : '$0.00';
  const percen = strategy?.apy ?? strategy?.percen ?? 0;
  const sector = strategy?.payoutFrequency ?? strategy?.sector ?? '';
  const payoutAmount = strategy && amount > 0 ? nextPayoutAmount(amount, percen, sector) : 0;
  const payoutDate = strategy ? nextPayoutDate(sector) : '--/--/----';

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 blur-3xl" />

        {/* Modal */}
        <div className="relative w-full h-full lg:h-auto max-w-full lg:max-w-105.25 no-scrollbar max-h-full lg:max-h-[96vh] overflow-y-auto rounded-none lg:rounded-[20px] bg-[#F1F1FE] border border-[#111111] dark:border-transparent dark:bg-[#111113] modalShadow pt-2.25 px-2.75 pb-3.75 animate-fadeIn flex flex-col justify-center lg:block">
          <button
            onClick={handleClose}
            className="w-6.25 h-6.25 flex items-center justify-center bg-[#FFFFFF1A] close z-10 rounded-full absolute right-5 top-5"
          >
            <Image width={12} height={12} src="/assets/Group 1597884961.png" alt="" />
          </button>

          {/* ================= CONFIRM SCREEN ================= */}
          {confirm && !expired && (
            <div>
              <div className="h-94.5 flex items-end justify-center w-full relative">
                <Image
                  width={1000}
                  height={1000}
                  src="/assets/Group 1597884985.png"
                  className="w-full h-full absolute top-0 z-0"
                  alt=""
                />
                <Image
                  src={'/assets/modalLogo.png'}
                  width={48.23}
                  height={96.7}
                  alt=""
                  className="absolute left-[50%] top-18 -translate-x-1/2"
                />
                <div className=" relative flex items-center flex-col justify-center  text-center pb-6.25">
                  <h2 className="uppercase text-[60px] font-ui font-bold">{strategy?.title ?? 'Bond'}</h2>
                  <div className="flex pb-9 gap-3 items-center">
                    <span className="bg-[#FFFFFF1A]  rounded-md border border-[#40404080] glassCard text-xs font-ui font-normal flex items-center gap-1 px-2.5 pb-1 pt-0.75">
                      <Image width={14} height={15} src="/assets/mdi-light_clock.svg" alt="" />
                      {strategy?.termMonths ? `${strategy.termMonths} months` : strategy?.fundSize ?? '—'}
                    </span>
                    <span className="flex gap-0.75 items-center text-[#8EDD23] text-xs font-ui font-bold">
                      {strategy?.apy ?? strategy?.percen ?? '—'}%
                      <Image width={7} height={11} src="/assets/Group 1597884960.svg" alt="" />
                    </span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-[#FFFFFF66] text-sm font-normal font-ui leading-[100%]">
                      {t('OrderDetails')}
                    </span>
                    <Image width={8.470588684082031} height={10.588234901428223} src="/assets/Vector 89.svg" alt="" />
                  </div>
                </div>
              </div>

              <div className="my-2 dark:bg-[#323234] bg-white rounded-[9px] w-full pt-5 pb-8.75 px-8.75">
                <div className="flex flex-col gap-[29px]">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="flex flex-col gap-[14px]">
                      <span className="dark:text-[#FFFFFF80] text-[#65656599] text-base font-ui">{t('Amount')}</span>
                      <span className="text-2xl dark:font-bold font-medium text-[#656565] dark:text-white font-ui">
                        {displayAmount}
                      </span>
                    </div>

                    <div className="flex flex-col gap-[14px]">
                      <span className="dark:text-[#FFFFFF80] text-[#65656599] text-base font-ui">{t('APY')}</span>
                      <div className="h-[28px] max-w-[80px] text-2xl text-[#70AE1C] font-bold font-ui bg-[#70AE1C33] rounded-sm flex items-center justify-center">
                        {strategy?.apy ?? strategy?.percen ?? '—'}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="flex flex-col gap-[14px]">
                      <span className="dark:text-[#FFFFFF80] text-[#65656599] text-base font-ui">Term</span>
                      <div className="bg-[#53A7FF6B] rounded-sm min-w-20.5 max-w-[80px] h-[28px] text-xs font-bold text-[#53A7FF] flex items-center justify-center px-2">
                        {strategy?.termMonths ? `${strategy.termMonths} months` : strategy?.fundSize ?? '—'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-[14px]">
                      <span className="dark:text-[#FFFFFF80] text-[#65656599] text-base font-ui">
                        {t('PayoutFrequency')}
                      </span>
                      <div className="bg-[#53A7FF6B] min-w-[60px] max-w-[80px] h-[28px] text-xs font-bold text-[#53A7FF] flex items-center justify-center rounded-sm px-2">
                        {strategy?.payoutFrequency ?? strategy?.sector ?? '—'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="flex flex-col gap-[14px]">
                      <span className="dark:text-[#FFFFFF80] text-[#65656599]">{t('NextPayout')}:</span>
                      <span className="text-2xl dark:font-bold font-medium text-[#656565] dark:text-white font-ui">
                        {payoutAmount > 0
                          ? payoutAmount.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 2,
                            })
                          : '—'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-[14px]">
                      <span className="dark:text-[#FFFFFF80] text-[#65656599]">{t('DateofPayout')}</span>
                      <span className="text-2xl dark:font-bold font-medium text-[#656565] dark:text-white font-ui">
                        {payoutDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {discaimerOpen && (
                  <button
                    onClick={() => {
                      discaimerOpen();
                    }}
                    className="h-14.75 rounded-xl flex justify-center items-center gap-3 text-[22px] font-bold font-ui text-white"
                    style={{
                      background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                    }}
                  >
                    {t('Continue')} <Image width={24} height={24} src="/assets/line-md_confirm-circle.png" alt="" />
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="h-14.75 rounded-[9px] dark:bg-[#323234] border border-[#65656526] dark:border-transparent bg-white flex justify-center items-center text-[#40404059] dark:text-[#FFFFFF59] text-[22px] font-bold font-ui"
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
