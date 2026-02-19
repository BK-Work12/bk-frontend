'use client';

import React, { useMemo } from 'react';
import ReferralTable from './ReferralTable';
import Image from 'next/image';
import type { LeaderboardEntry } from '@/lib/api';
import { useTranslation } from 'react-i18next';

const INITIAL_DISPLAY_LIMIT = 6;

interface LeaderboardProps {
  entries?: LeaderboardEntry[];
  loading?: boolean;
  displayLimit?: number;
  onShowAll?: () => void;
}

export const Leaderboard = ({
  entries = [],
  loading = false,
  displayLimit = INITIAL_DISPLAY_LIMIT,
  onShowAll,
}: LeaderboardProps) => {
  const { t } = useTranslation();
  const isExpanded = !Number.isFinite(displayLimit);
  const hasMore = entries.length > INITIAL_DISPLAY_LIMIT;
  const displayedEntries: LeaderboardEntry[] = useMemo(() => {
    if (displayLimit != null && Number.isFinite(displayLimit)) {
      return entries.slice(0, displayLimit);
    }
    return entries;
  }, [entries, displayLimit]);

  return (
    <div className="dark:bg-[#32323424] border border-[#65656526] dark:border-transparent rounded-[20px] px-1 pb-5.5 pt-6">
      <div className="flex pb-5 justify-center lg:justify-start gap-6 items-center pl-6 pr-8.75">
        <Image width={15.378745079040527} height={11.499882698059082} src="/assets/Vector (6).png" alt="" />
        <h2 className="text-sm lg:text-base font-medium font-ui text-[#656565] dark:text-white">{t('Leaderboard')}</h2>
      </div>
      <div className="dark:bg-[#32323424] mb-5.75 rounded-[9px] pt-3.5 px-2.75">
        <ReferralTable entries={displayedEntries} loading={loading} />
      </div>
      {(hasMore || !isExpanded) && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onShowAll}
            disabled={entries.length === 0}
            className="
              max-w-87.25 w-full
              bg-[#0000001A] dark:bg-[#FFFFFF1A]
              rounded-[20px] border border-[#FFFFFF4D]
              py-3 text-sm font-normal font-ui
              text-[#656565] dark:text-white
              hover:bg-[#00000033] dark:hover:bg-white/20
              hover:border-white
              hover:text-black dark:hover:text-white
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0000001A] dark:disabled:hover:bg-[#FFFFFF1A] disabled:hover:border-[#FFFFFF4D] disabled:hover:text-[#656565] dark:disabled:hover:text-white
            "
          >
            {isExpanded ? t('ShowLess') : t('SeeLeaderboard')}
          </button>
        </div>
      )}
    </div>
  );
};
