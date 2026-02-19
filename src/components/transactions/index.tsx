'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import ArrowDown from '../icons/arrowDown';
import Image from 'next/image';
import { getToken } from '@/lib/auth';
import { getInvestments, getWithdrawals, getPortfolio, getDeposits, type InvestmentListItem, type WithdrawalListItem, type DepositListItem } from '@/lib/api';
import { getCached, setCache } from '@/lib/cache';
import { formatIsoToDisplay, parseDotDate, formatDateRangeLabel } from '@/lib/formatUtils';
import { Loader } from '../ui/Loader';
import { Skeleton } from '../ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type Transaction = {
  id: string;
  /** Subscription id (5-digit style) for investments; undefined for withdrawals/deposits. */
  subid?: string;
  dateTime: string;
  product: string;
  period: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  /** Display text for TX Hash column (e.g. "View" or "—") */
  txHash: string;
  /** When set, TX Hash column renders as a link (transaction link for crypto, payment link for card) */
  linkUrl?: string;
};

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function matchSearch(tx: Transaction, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  const searchable = [tx.id, tx.subid, tx.dateTime, tx.product, tx.period, tx.type, tx.status, tx.amount, tx.currency]
    .join(' ')
    .toLowerCase();
  return searchable.includes(q);
}

type TransactionsIndexProps = {
  displayLimit?: number;
  onFilteredCount?: (total: number) => void;
  onLoadMore?: () => void;
};

export const TransactionsIndex = ({ displayLimit, onFilteredCount, onLoadMore }: TransactionsIndexProps = {}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(t('All'));
  const [typeFilter, setTypeFilter] = useState<string>(t('All'));
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const cachedTx = getCached<{ transactions: Transaction[]; invTotal: number; payoutsTotal: number }>('transactions_data');
  const [transactions, setTransactions] = useState<Transaction[]>(cachedTx?.transactions ?? []);
  const [loading, setLoading] = useState(!cachedTx);
  const [totalCompletedInvestments, setTotalCompletedInvestments] = useState(cachedTx?.invTotal ?? 0);
  const [totalCompletedPayouts, setTotalCompletedPayouts] = useState(cachedTx?.payoutsTotal ?? 0);
  const filterRefDesktop = useRef<HTMLDivElement>(null);
  const filterRefMobile = useRef<HTMLDivElement>(null);
  const datePickerRefDesktop = useRef<HTMLDivElement>(null);
  const datePickerRefMobile = useRef<HTMLDivElement>(null);

  /**
   * Status from investment period and cancellation:
   * - User cancelled subscription → CANCELED
   * - Investment period has ended (maturity date in the past) → COMPLETED
   * - Otherwise → PENDING
   */
  function investmentStatusToDisplay(inv: InvestmentListItem): string {
    const raw = (inv.status ?? '').toLowerCase();
    if (raw === 'cancelled' || raw === 'canceled') return t('CANCELED');
    const maturityYmd = (inv.maturityDate ?? '').trim().slice(0, 10);
    if (maturityYmd) {
      const maturityEnd = new Date(maturityYmd + 'T23:59:59.999');
      if (maturityEnd.getTime() <= Date.now()) return t('COMPLETED');
    }
    return t('PENDING');
  }

  const STATUS_OPTIONS = [t('All'), t('COMPLETED'), t('SUCCESS'), t('PENDING'), t('CANCELED'), t('FAILED')] as const;
  const TYPE_OPTIONS = [t('All'), t('Purchase'), t('Payout'), t('Deposit')] as const;

  function investmentToTransaction(inv: InvestmentListItem): Transaction {
    const linkUrl = inv.transactionLink || inv.paymentLink;
    return {
      id: inv.id ?? '',
      subid: inv.subid != null ? String(inv.subid) : undefined,
      dateTime: formatIsoToDisplay(inv.createdAt ?? new Date().toISOString()),
      product: inv.product ?? '—',
      period: inv.period ?? '—',
      type: t('Purchase'),
      status: investmentStatusToDisplay(inv),
      amount: formatUsd(Number(inv.amount) || 0),
      currency: (inv.payCurrency ?? inv.currency ?? 'USD').toUpperCase(),
      txHash: linkUrl ? t('View') : '—',
      ...(linkUrl ? { linkUrl } : {}),
    };
  }

  function depositToTransaction(dep: DepositListItem): Transaction {
    const linkUrl = dep.transactionLink || dep.paymentLink || undefined;
    const hashDisplay = dep.txHash
      ? `${dep.txHash.slice(0, 6)}...${dep.txHash.slice(-4)}`
      : linkUrl ? t('View') : '—';
    return {
      id: dep.id,
      subid: dep.orderId,
      dateTime: formatIsoToDisplay(dep.createdAt),
      product: dep.method,
      period: '—',
      type: t('Deposit'),
      status: dep.status,
      amount: formatUsd(dep.amount),
      currency: dep.currency,
      txHash: hashDisplay,
      ...(linkUrl || dep.transactionLink ? { linkUrl: dep.transactionLink || linkUrl } : {}),
    };
  }

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      const [investmentsRes, portfolio, depositsRes] = await Promise.all([
        getInvestments(token),
        getPortfolio(token),
        getDeposits(token).catch(() => ({ list: [], totalDeposited: 0 })),
      ]);
      const { list: investments, totalCompletedInvestments: invTotal } = investmentsRes;
      const invTx = investments.map(investmentToTransaction);
      const depTx = depositsRes.list.map(depositToTransaction);
      const orderList: Transaction[] = [...invTx, ...depTx].sort((a, b) => {
        const da = parseDotDate(a.dateTime).getTime();
        const db = parseDotDate(b.dateTime).getTime();
        return db - da;
      });
      setTransactions(orderList);
      setTotalCompletedInvestments(invTotal);
      const payoutsTotal = portfolio?.interestPaid ?? 0;
      setTotalCompletedPayouts(payoutsTotal);
      setCache('transactions_data', { transactions: orderList, invTotal, payoutsTotal });
      setLoading(false);
    };
    load();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!matchSearch(tx, searchQuery)) return false;
      if (statusFilter !== 'All' && tx.status !== statusFilter) return false;
      if (typeFilter !== 'All' && tx.type !== typeFilter) return false;
      const txDate = parseDotDate(tx.dateTime);
      if (dateFrom) {
        const from = new Date(dateFrom + 'T00:00:00');
        if (txDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo + 'T23:59:59.999');
        if (txDate > to) return false;
      }
      return true;
    });
  }, [transactions, searchQuery, statusFilter, typeFilter, dateFrom, dateTo]);

  const displayedTransactions: Transaction[] =
    displayLimit != null && Number.isFinite(displayLimit)
      ? filteredTransactions.slice(0, displayLimit)
      : filteredTransactions;

  useEffect(() => {
    onFilteredCount?.(filteredTransactions.length);
  }, [filteredTransactions.length, onFilteredCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!filterRefDesktop.current?.contains(target) && !filterRefMobile.current?.contains(target))
        setFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideDesktop = !datePickerRefDesktop.current?.contains(target);
      const outsideMobile = !datePickerRefMobile.current?.contains(target);
      if (outsideDesktop && outsideMobile) setDatePickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = [
    statusFilter !== t('All'),
    typeFilter !== t('All'),
    dateFrom !== null,
    dateTo !== null,
  ].filter(Boolean).length;
  const dateRangeLabel = formatDateRangeLabel(dateFrom, dateTo);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        <div className="relative border dark:border-[#40404059] rounded-[20px] flex flex-col gap-3 lg:gap-18 bg-[#F1F1FE] dark:bg-[#FFFFFF0A] py-3 lg:py-5.5 px-4 lg:px-5">
          <Image
            width={1000}
            height={1000}
            priority
            src="/assets/Group 1597884944.png"
            className="max-w-full h-auto absolute left-[50%] -translate-x-1/2 top-0 z-0"
            alt=""
          />
          <div className="flex justify-between items-start">
            <Image
              width={72}
              height={72}
              priority
              src="/assets/Crypto-Transaction-Monitor--Streamline-Ultimate.png"
              className="w-12 h-12 lg:w-[72px] lg:h-[72px]"
              alt=""
            />
            <button className=" dark:block">
              <Image width={18} height={20} priority src="/assets/share.png" alt="" />
            </button>
          </div>
          <div className="flex relative flex-col lg:flex-row justify-between max-lg:gap-1.5 items-start lg:items-end">
            <h2 className="text-sm lg:text-base font-medium font-ui text-[#656565] dark:text-white leading-tight">
              {t('TotalCompletedInvestments')}
            </h2>
            <div className="px-3 lg:px-4.75 dark:bg-[#FFFFFF0A] max-lg:w-full bg-[#FFFFFF] border border-[#65656526] dark:border-transparent flex lg:justify-center items-center border dark:border-[#FFFFFF4D] numberShadow h-12 lg:h-14 font-bold font-ui rounded-xl lg:rounded-[20px]">
              {loading ? (
                <Loader
                  className="h-6 w-6 text-[#656565] dark:text-white"
                  ariaLabel="Loading investments"
                />
              ) : (
                <span className="text-lg sm:text-xl lg:text-2xl text-[#656565] dark:text-white font-bold font-ui leading-none">
                  {formatUsd(totalCompletedInvestments)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="relative border dark:border-[#40404059] rounded-[20px] flex flex-col gap-3 lg:gap-18 bg-[#F1F1FE] dark:bg-[#FFFFFF0A] py-3 lg:py-5.5 px-4 lg:px-5">
          <Image
            width={1000}
            height={1000}
            priority
            src="/assets/Group 1597884945.png"
            className="max-w-full h-auto absolute left-[50%] -translate-x-1/2 top-0 z-0"
            alt=""
          />
          <div className="flex justify-between relative items-start">
            <Image
              width={72}
              height={72}
              priority
              src="/assets/Crypto-Transaction-Phone-Receive--Streamline-Ultimate.png"
              className="w-12 h-12 lg:w-[72px] lg:h-[72px]"
              alt=""
            />
            <button className="">
              <Image width={18} height={20} priority src="/assets/share.png" alt="" />
            </button>
          </div>
          <div className="flex relative flex-col lg:flex-row justify-between max-lg:gap-1.5 items-start lg:items-end">
            <h2 className="text-sm lg:text-base font-medium font-ui text-[#656565] dark:text-white leading-tight">
              {t('TotalCompletedPayouts')}
            </h2>
            <div className="px-3 lg:px-4.75 dark:bg-[#FFFFFF0A] max-lg:w-full bg-[#FFFFFF] border border-[#65656526] dark:border-transparent flex lg:justify-center items-center border dark:border-[#FFFFFF4D] numberShadow h-12 lg:h-14 font-bold font-ui rounded-xl lg:rounded-[20px]">
              {loading ? (
                <Loader
                  className="h-6 w-6 text-[#656565] dark:text-white"
                  ariaLabel="Loading payouts"
                />
              ) : (
                <span className="text-lg sm:text-xl lg:text-2xl text-[#656565] dark:text-white font-bold font-ui leading-none">
                  {formatUsd(totalCompletedPayouts)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl dark:bg-[#FFFFFF0A] bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059]  px-1 pb-1 pt-4.25">
        <div className="flex justify-between px-5 pb-3 items-center">
          <div className="flex shrink-0 items-center gap-2">
            <h2 className="text-sm lg:text-base font-medium font-ui text-[#656565] dark:text-white leading-tight">{t('MyTransactions')}</h2>
            {/* <span className="hidden dark:block">
              <Image width={13} height={13} src="/assets/Polygon 2.svg" alt="" />
            </span>
            <span className=" dark:hidden">
              <ArrowDown color="#65656559" />
            </span> */}
          </div>
          <div className="ml-10 hidden  w-full pl-3.25 pr-5 border-r mr-5 border-l border-[#65656533] dark:border-[#FFFFFF33] lg:flex gap-2.25  items-center">
            <Image
              width={24}
              height={24}
              priority
              src="/assets/material-symbols-light_search.png"
              className="hidden dark:block"
              alt=""
            />
            <Image
              width={24}
              height={24}
              priority
              src="/assets/material-symbols-light_search (2).png"
              className=" dark:hidden"
              alt=""
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dark:placeholder:text-[#FFFFFF80] placeholder:text-[#65656580] text-black dark:text-white outline-none w-full text-base font-normal"
              placeholder={t('Search')}
            />
            <div className="relative shrink-0" ref={filterRefDesktop}>
              <Image
                width={24}
                height={24}
                priority
                src="/assets/mynaui_filter.png"
                className="hidden dark:block"
                alt=""
              />
              <Image
                width={24}
                height={24}
                priority
                src="/assets/mynaui_filter (1).png"
                className=" dark:hidden"
                alt=""
              />
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="absolute inset-0"
                aria-label="Filter transactions"
              />
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 z-20 w-56 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-3 px-4"
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                  >
                    <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">{t('Status')}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${statusFilter === s
                            ? 'border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]'
                            : 'border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6] hover:border-[#65656566]'
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">{t('Type')}</p>
                    <div className="flex flex-wrap gap-2">
                      {TYPE_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTypeFilter(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${typeFilter === t
                            ? 'border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]'
                            : 'border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6] hover:border-[#65656566]'
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {(statusFilter !== t('All') || typeFilter !== t('All') || dateFrom || dateTo) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter(t('All'));
                          setTypeFilter(t('All'));
                          setDateFrom(null);
                          setDateTo(null);
                        }}
                        className="mt-3 w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]"
                      >
                        {t('Clearfilters')}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex lg:hidden items-center">
            <div className="relative" ref={filterRefMobile}>
              <button type="button" onClick={() => setFilterOpen((o) => !o)} className="" aria-label="Filter">
                <Image
                  width={24}
                  height={24}
                  priority
                  src="/assets/mynaui_filter.png"
                  className="hidden dark:block"
                  alt=""
                />
                <Image
                  width={24}
                  height={24}
                  priority
                  src="/assets/mynaui_filter (1).png"
                  className=" dark:hidden"
                  alt=""
                />
              </button>
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 z-20 w-56 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-3 px-4"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                  >
                    <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">{t('Status')}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${statusFilter === s
                            ? 'border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]'
                            : 'border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6]'
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">{t('Type')}</p>
                    <div className="flex flex-wrap gap-2">
                      {TYPE_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTypeFilter(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${typeFilter === t
                            ? 'border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]'
                            : 'border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6]'
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {(statusFilter !== t('All') || typeFilter !== t('All') || dateFrom || dateTo) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter(t('All'));
                          setTypeFilter(t('All'));
                          setDateFrom(null);
                          setDateTo(null);
                        }}
                        className="mt-3 w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]"
                      >
                        {t('Clearfilters')}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div
              ref={datePickerRefMobile}
              className="relative ml-5 pl-[15px] border-l border-[#65656533] dark:border-[#FFFFFF33]"
            >
              <button
                type="button"
                onClick={() => setDatePickerOpen((o) => !o)}
                className="min-h-[40px] py-2 px-2.5 text-left flex items-center"
                aria-label="Filter by date"
              >
                <span className="text-sm font-normal font-ui dark:text-white text-[#656565] truncate max-w-[140px] sm:max-w-[160px]">
                  {dateRangeLabel}
                </span>
              </button>
              {datePickerOpen && (
                <div className="absolute left-0 top-full mt-2 z-20 w-64 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-4 px-4">
                  <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">{t('Daterange')}</p>
                  <div className="flex flex-col gap-3 mb-3">
                    <label className="text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]">
                      {t('From')}
                      <input
                        type="date"
                        value={dateFrom ?? ''}
                        onChange={(e) => setDateFrom(e.target.value || null)}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none"
                      />
                    </label>
                    <label className="text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]">
                      {t('To')}
                      <input
                        type="date"
                        value={dateTo ?? ''}
                        onChange={(e) => setDateTo(e.target.value || null)}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none"
                      />
                    </label>
                  </div>
                  {(dateFrom || dateTo) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDateFrom(null);
                        setDateTo(null);
                      }}
                      className="w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]"
                    >
                      {t('Cleardates')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div ref={datePickerRefDesktop} className="relative hidden lg:block shrink-0">
            <button
              type="button"
              onClick={() => setDatePickerOpen((o) => !o)}
              className="hidden lg:flex items-center gap-2.5 min-h-[44px] py-2 px-3 min-w-[11rem] max-w-[13rem] rounded-lg border border-transparent hover:bg-[#FFFFFF26] dark:hover:bg-[#FFFFFF0D] transition-colors"
              aria-label="Filter by date range"
            >
              <Image
                width={24}
                height={24}
                priority
                src="/assets/proicons_calendar.png"
                className="hidden dark:block shrink-0"
                alt=""
              />
              <Image
                width={24}
                height={24}
                priority
                src="/assets/proicons_calendar (2).png"
                className="dark:hidden shrink-0"
                alt=""
              />
              <span className="text-sm font-normal font-ui text-[#656565] dark:text-white truncate text-left flex-1 min-w-0">
                {dateRangeLabel}
              </span>
              <span className="hidden dark:block shrink-0">
                <Image width={13} height={13} src="/assets/Polygon 2.svg" alt="" />
              </span>
              <span className="hidden lg:block dark:hidden shrink-0">
                <ArrowDown color="#65656559" />
              </span>
            </button>

            <AnimatePresence>
              {datePickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 z-20 w-64 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-4 px-4"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                  <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">{t('Daterange')}</p>
                  <div className="flex flex-col gap-3 mb-3">
                    <label className="text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]">
                      {t('From')}
                      <input
                        type="date"
                        value={dateFrom ?? ''}
                        onChange={(e) => setDateFrom(e.target.value || null)}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none"
                      />
                    </label>
                    <label className="text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]">
                      {t('To')}
                      <input
                        type="date"
                        value={dateTo ?? ''}
                        onChange={(e) => setDateTo(e.target.value || null)}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none"
                      />
                    </label>
                  </div>
                  {(dateFrom || dateTo) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDateFrom(null);
                        setDateTo(null);
                      }}
                      className="w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]"
                    >
                      {t('Cleardates')}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="dark:bg-[#070707] rounded-xl p-1">
          <div className="w-full py-3.5 bg-white border border-[#65656526] dark:border-transparent dark:bg-transparent no-scrollbar px-3 rounded-[9px] overflow-x-auto  ">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F1F1FE] dark:bg-[#121212] rounded-[9px]">
                  {[
                    t('TransactionID'),
                    t('Date / Time'),
                    t('Product'),
                    t('Type'),
                    t('Status'),
                    t('Amount'),
                    t('Currency'),
                    t('TXHash'),
                  ].map((title, i) => (
                    <th
                      key={i}
                      className={`px-2 lg:px-4 py-2.5 text-xs lg:text-sm font-normal font-ui
        text-[#00000080] dark:text-[#FFFFFF80] whitespace-nowrap
        ${i === 0 ? 'rounded-l-xl dark:rounded-l-[9px] text-center' : 'text-center'} 
        ${i === 7 ? 'rounded-r-xl dark:rounded-r-[9px]' : 'relative'}`}
                    >
                      {title}
                      {i !== 7 && (
                        <span
                          className="w-px h-4.25 top-1/2 -translate-y-1/2 
          bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0"
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-[#FFFFFF0D]">
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-20" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-5 w-28 mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-5 w-24 mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-5 w-16 mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-8 w-20 mx-auto rounded-lg" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-5 w-16 mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-5 w-12 mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-5 w-10 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : displayedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[#65656580] dark:text-[#FFFFFF80]">
                      {t('Notransactionsmatch')}
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((tx, index) => (
                    <tr key={`${tx.id}-${index}`} className="border-b border-[#FFFFFF0D] hover:bg-[#FFFFFF06] transition-colors duration-150 cursor-default">
                      <td
                        className="px-2 lg:px-4 py-3 text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFA6] text-center truncate"
                        title={tx.subid ?? ''}
                      >
                        {tx.subid ?? '—'}
                      </td>

                      <td className="px-2 lg:px-4 py-3 text-center truncate text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]">
                        {tx.dateTime}
                      </td>

                      <td className="px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui text-[#656565] dark:text-white">
                        <div className="flex items-center truncate justify-center gap-2">{tx.product}</div>
                      </td>

                      <td
                        className={`px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui ${
                          tx.type === 'Payout' ? 'text-[#8EDD23]'
                          : tx.type === 'Deposit' ? 'text-[#53A7FF]'
                          : 'text-[#65656580] dark:text-[#FFFFFF80]'
                        }`}
                      >
                        {tx.type}
                      </td>

                      <td className="px-2 lg:px-4 py-3 text-center">
                        <span
                          className={`px-4 py-2 rounded-lg border text-xs font-bold ${
                            tx.status === 'COMPLETED' || tx.status === 'SUCCESS'
                              ? 'border-[#8EDD23] text-[#8EDD23]'
                              : tx.status === 'PENDING'
                                ? 'border-[#F4B73F] text-[#F4B73F]'
                                : 'border-[#FF5A5A] text-[#FF5A5A]'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td
                        className={`px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui ${tx.type === 'Payout' ? 'text-[#8EDD23]' : 'text-[#656565] dark:text-[#FFFFFFA6]'}`}
                      >
                        {tx.amount}
                      </td>

                      <td className="px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFFA6]">
                        {tx.currency}
                      </td>

                      <td className="px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui text-[#65656580] dark:text-white">
                        {tx.linkUrl ? (
                          <a
                            href={tx.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#8EDD23] transition-colors cursor-pointer"
                          >
                            {tx.txHash}
                          </a>
                        ) : (
                          <span>{tx.txHash}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* <div className="lg:hidden mt-11 mb-9 overflow-hidden max-w-95.5 w-full mx-auto h-2.25 rounded-[9px] relative bg-[#323234]">
          <div className="absolute left-0 top-0 h-full w-[20%] bg-[#FFFFFF1A]"></div>
        </div> */}
      </div>
    </div>
  );
};
