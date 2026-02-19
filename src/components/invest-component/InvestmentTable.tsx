import React, { useEffect, useState, useMemo } from 'react';
import { getInvestments, type InvestmentListItem } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { formatDateDdMmYyyy } from '@/lib/formatUtils';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';

type InvestmentTableProps = {
  /** When set, only investments for this bond/strategy are shown. */
  strategyId?: string;
};

export const InvestmentTable = ({ strategyId }: InvestmentTableProps) => {
  const { t } = useTranslation();
  const [allInvestments, setAllInvestments] = useState<InvestmentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      const { list } = await getInvestments(token);
      setAllInvestments(list);
      setLoading(false);
    };
    load();
  }, []);

  const investments = useMemo(() => {
    if (!strategyId?.trim()) return allInvestments;
    return allInvestments.filter((inv) => (inv.strategyId ?? '').trim() === strategyId.trim());
  }, [allInvestments, strategyId]);

  return (
    <div className="flex pt-1.25 flex-col gap-1.25">
      {/* Header */}
      <div className="pl-5.25 pr-5 lg:pr-11 py-2.5 bg-[#65656526] border border-[#65656526] dark:border-transparent dark:bg-[#32323452] rounded-[9px] grid grid-cols-3 items-center">
        <span className="text-base font-normal font-ui text-[#656565] dark:text-white text-left">{t('Date')}</span>
        <span className="text-base font-normal font-ui text-[#656565] dark:text-white text-left">{t('Amount')}</span>
        <span className="text-base font-normal font-ui text-[#656565] dark:text-white text-center">{t('Product')}</span>
      </div>

      {/* Body */}
      <div className="3xl:pl-5.25 px-3 3xl:pr-11 pt-5 pb-8 bg-[#65656526] dark:bg-[#32323452] rounded-[9px] flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28 justify-self-center" />
              </div>
            ))}
          </div>
        ) : investments.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-[#65656580] dark:text-[#FFFFFF80] text-sm font-ui">
              {strategyId ? t('Noinvestmentsforbond') : t('Noinvestmentsyet')}
          </div>
        ) : (
          investments.map((inv) => (
            <div key={inv.id} className="grid grid-cols-3 items-center">
              {/* Date */}
              <span className="text-[#65656580] dark:text-[#FFFFFF80] text-base font-medium font-ui">
                {formatDateDdMmYyyy(inv.createdAt)}
              </span>

              {/* Amount */}
              <span className="text-[#656565] dark:text-white text-lg leading-[100%] font-bold font-ui">
                {inv.amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

              {/* Product / Period */}
              <div className="flex flex-col items-center justify-center text-[#656565] dark:text-white text-center text-base font-ui">
                <span>{inv.product}</span>
                {/* <span className="text-xs text-[#65656580] dark:text-[#FFFFFF80]">{inv.period}</span> */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
