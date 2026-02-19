'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { getToken } from '@/lib/auth';
import { createSubscription, saveSubscriptionPDF } from '@/lib/api';
import { interestForPeriod, getFrequency } from '@/lib/bondInterest';
import Timeline from './PayoutTimeline';
import { Loader } from './Loader';

/** Minimal strategy shape for order details (from invest page). */
export type OrderDetailsStrategy = {
  strategyId?: string;
  name?: string;
  type?: string;
  termMonths?: number;
  apy?: number;
  payoutFrequency?: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  strategy?: OrderDetailsStrategy | null;
  amount?: number;
};

function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
}

function formatDateTime(d: Date): string {
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

/** Order details / subscription success modal. When strategy and amount are passed, shows real data. */
export default function OrderDetailsModal({ isOpen, onClose, strategy, amount = 0 }: ModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const termMonths = strategy?.termMonths ?? 6;
  const apy = strategy?.apy ?? 5.8;
  const typeLabel = (strategy?.type ?? 'fixed').charAt(0).toUpperCase() + (strategy?.type ?? 'fixed').slice(1);
  const productType = `${termMonths} months ${typeLabel}`;
  const startDate = new Date();
  const maturityDate = addMonths(startDate, termMonths);
  const totalInterest = amount > 0 && strategy ? amount * (apy / 100) * (termMonths / 12) : 0;
  const frequency = strategy?.payoutFrequency ?? 'Weekly';
  const freqKey = getFrequency(frequency);
  const nextPayoutAmount = amount > 0 && strategy ? interestForPeriod(amount, apy / 100, freqKey) : 0;
  const nextPayoutDate = (() => {
    const d = new Date(startDate);
    if (freqKey === 'weekly') d.setDate(d.getDate() + 7);
    else if (freqKey === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (freqKey === 'quarterly') d.setMonth(d.getMonth() + 3);
    return d;
  })();

  useEffect(() => {
    if (isOpen) {
      setConfirm(false);
      setAgreedToTerms(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    const strategyId = strategy?.strategyId ?? (strategy as { strategyId?: string } | undefined)?.strategyId;
    if (!strategyId) {
      toast.error('Invalid strategy.');
      return;
    }
    if (!(amount > 0)) {
      toast.error('Please enter a valid amount.');
      return;
    }
    const token = getToken();
    if (!token) {
      toast.error('Please log in to subscribe.');
      return;
    }
    setSubmitting(true);
    try {
      await createSubscription(token, {
        strategyId,
        amount,
        strategy: {
          name: strategy?.name,
          type: strategy?.type,
          termMonths: strategy?.termMonths,
          apy: strategy?.apy,
          payoutFrequency: strategy?.payoutFrequency,
        },
      });

      await saveSubscriptionPDF(token, {
        strategyId,
        amount,
        strategy: { title: strategy?.name ?? '' },
        investorName: user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Investor'
          : 'Valued Investor',
        accountId: user?.id ?? '',
      });
      toast.success('Subscription created and confirmation saved to Documents');

      setConfirm(true);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Failed to create subscription';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center">
        <div className="absolute inset-0 h-full bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative w-full h-full lg:h-auto max-w-full lg:max-w-[480px] rounded-none lg:rounded-[18px] border bg-[#F1F1FE] dark:bg-[#111113] border-[#65656526] dark:border-[#FFFFFF14] glass-shadow3 animate-fadeIn flex flex-col justify-center lg:block">
          {confirm ? (
            <div className="relative dottedBlack rounded-[14px]">
              <button
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center bg-[#FFFFFF1A] close z-10 rounded-full absolute right-4 top-4"
              >
                <Image width={10} height={10} src="/assets/Group 1597884961.png" alt="" />
              </button>
              <Image
                src={'/assets/Group 1597887210.png'}
                width={1000}
                height={1000}
                className="max-w-full absolute left-0 top-0 z-0 h-auto w-full"
                alt=""
              />
              <div className="h-14 border-b border-[#FFFFFF14] flex items-center justify-center"></div>
              <div className="h-40 flex justify-center items-end relative border-b border-[#FFFFFF14]">
                <Image
                  width={32}
                  height={32}
                  className="absolute z-1 left-1/2 top-1/2 -translate-1/2"
                  src={'/assets/Check-Double-Thick Streamline Core.png'}
                  alt=""
                />
                <span className="text-base font-bold pb-6 font-ui relative z-1 text-[#FFFFFFA6]">
                  Subscription done Successfully
                </span>
              </div>
              <div className="pt-3 pb-4">
                <h2 className="text-base pb-2.5 text-[#FFFFFFA6] pl-5 font-bold font-ui leading-[100%]">
                  Subscription Details
                </h2>
                <div className="pl-5 pr-6">
                  <div className="flex flex-col pb-6 border-b border-[#FFFFFF14] gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#FFFFFFB8] text-sm font-ui leading-[100%] font-normal">
                        Subscription Amount
                      </span>
                      <span className="text-[#8EDD23] text-sm font-ui leading-[100%] font-medium">
                        {amount > 0
                          ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '—'}{' '}
                        USD
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#FFFFFFB8] text-sm font-ui leading-[100%] font-normal">Product Type</span>
                      <span className="text-[#FFFFFFB8] text-sm font-ui leading-[100%] font-normal">
                        {productType}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#FFFFFFB8] text-sm font-ui leading-[100%] font-normal">
                        Maturity Date
                      </span>
                      <span className="text-[#FFFFFFB8] text-sm font-ui leading-[100%] font-normal">
                        {formatDate(maturityDate)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#FFFFFFB8] text-sm font-ui leading-[100%] font-normal">APY</span>
                      <span className="text-[#8EDD23] text-sm font-ui leading-[100%] font-medium">{apy}% APY</span>
                    </div>
                  </div>
                </div>
                <div className="pl-5 pr-6 pt-4 pb-4">
                  <Timeline
                    items={[
                      { label: 'Subscription Time', value: formatDateTime(startDate) },
                      { label: 'Interest Accrual Time', value: formatDateTime(startDate) },
                    ]}
                  />
                </div>
                <div className="grid pl-4 pr-4 grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push('/assets');
                    }}
                    className="
                                    flex items-center justify-center
                                    h-11 rounded-xl w-full
                                    font-semibold font-ui text-base
                                    text-white bg-[#FFFFFF1A]
                                    border border-[#40404059]
                                    hover:brightness-110
                                    hover:shadow-lg
                                    transition-all duration-200
                                    disabled:opacity-60
                                  "
                  >
                    View Positions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirm(false);
                      onClose();
                    }}
                    className="
                                    flex items-center justify-center
                                    h-11 rounded-xl w-full
                                    font-semibold font-ui text-base
                                    text-black
                                    hover:brightness-110
                                    hover:shadow-lg
                                    transition-all duration-200
                                    disabled:opacity-60
                                  "
                    style={{
                      background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
                    }}
                  >
                    New Subscription
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-[#0a0a0a] rounded-[18px] overflow-hidden">
              <button
                onClick={handleClose}
                className="w-6.25 h-6.25 flex items-center justify-center bg-[#FFFFFF1A] close z-10 rounded-full absolute right-4 top-4"
              >
                <Image width={12} height={12} src="/assets/Group 1597884961.png" alt="" />
              </button>
              <div className="h-12 border-b border-[#FFFFFF14] flex items-center justify-center">
                <h2 className="text-sm font-normal font-ui leading-tight">Order Details</h2>
              </div>
              <div className="pt-3 pb-3 px-4">
                {/* Term + Amount row */}
                <div className="flex gap-3 pb-3 items-stretch">
                  <div className="flex-1 flex flex-col">
                    <span className="text-[#FFFFFFA6] font-normal text-xs font-ui leading-tight mb-1.5">Term</span>
                    <div className="flex-1 flex gap-1 flex-col justify-center p-3 rounded-[9px] bg-[#FFFFFF0A] border border-[#FFFFFF0A]">
                      <span className="text-xs font-ui font-normal leading-tight text-[#FFFFFFA3]">{typeLabel}</span>
                      <h2 className="font-normal text-sm font-ui leading-tight">{apy}% APY</h2>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[#FFFFFFA6] font-normal text-xs font-ui leading-tight mb-1.5">Amount</span>
                    <div className="flex-1 flex bg-[#FFFFFF0A] border border-[#FFFFFF0A] rounded-[9px] px-3 justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <div className="w-7 h-7 bg-[#272727] rounded-md flex items-center justify-center shrink-0">
                          <Image width={14} height={14} src="/assets/wallet-remove-subtract--wallet-remove-subtract-close-minus-money-payment-finance.svg" alt="" />
                        </div>
                        <span className="text-[#FFFFFFB8] text-sm font-normal font-ui leading-tight">
                          {amount > 0 ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                        </span>
                      </div>
                      <span className="text-xs font-normal font-ui leading-tight text-[#FFFFFFB8]">USD</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs text-[#FFFFFFB8] font-ui font-normal">
                  Available Spot Balance: <span className="text-white">0 USD</span>
                </span>

                <div className="w-full h-px mt-2.5 bg-[#FFFFFF14]"></div>

                {/* Interest summary */}
                <div className="py-2.5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-normal text-sm font-ui leading-tight text-[#FFFFFFB8]">Total Interest</span>
                    <span className="font-normal font-ui text-sm leading-tight text-[#FFFFFFB8]">
                      {amount > 0 && strategy ? `$${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'} USD
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-normal text-sm font-ui leading-tight text-[#FFFFFFB8]">{typeLabel} APY</span>
                    <span className="py-0.5 rounded-[3px] bg-[#FFFFFF14] px-2 text-sm font-normal font-ui">{apy}%</span>
                  </div>
                </div>

                <div className="w-full h-px bg-[#FFFFFF14]"></div>

                {/* Order details timeline */}
                <div className="pt-2.5">
                  <span className="text-white font-normal text-sm font-ui leading-tight">Order Details</span>
                  <div className="flex pt-2 pb-2 flex-col items-center gap-2">
                    <Timeline
                      items={[
                        { label: 'Interest accrues on', value: formatDate(startDate) },
                        { label: 'Payout frequency', value: frequency },
                        { label: 'Next payout', value: amount > 0 && strategy ? `$${nextPayoutAmount.toFixed(2)}` : '—' },
                        { label: 'Payout date', value: formatDate(nextPayoutDate) },
                      ]}
                    />
                  </div>

                  {/* Agreement + Confirm */}
                  <div className="flex gap-3 flex-col">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="order-details-agree-terms"
                        className="custom-checkbox2 shrink-0 mt-0.5 w-4 h-4"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                      />
                      <label htmlFor="order-details-agree-terms" className="cursor-pointer">
                        <span className="font-medium text-[11px] font-ui leading-[140%] text-[#FFFFFFA3]">
                          I have read and agree with the{' '}
                          <span className="underline text-white font-bold">Earn Service Agreement</span>
                        </span>
                      </label>
                    </div>
                    <button
                      type="button"
                      disabled={!agreedToTerms || submitting}
                      className="flex items-center justify-center h-11 rounded-full w-full font-normal font-ui text-sm text-black hover:brightness-110 hover:shadow-lg transition-all duration-200 disabled:opacity-60"
                      style={{ background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }}
                      onClick={handleConfirm}
                    >
                      {submitting ? (
                        <Loader className="h-5 w-5 text-black" ariaLabel="Creating subscription" />
                      ) : (
                        'Confirm'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
