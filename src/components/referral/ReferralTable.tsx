'use client';

import Image from 'next/image';
import type { LeaderboardEntry } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';

interface Referral {
  id: string;
  rank: number | string;
  icon?: 'gold' | 'silver' | 'bronze';
  userName: string;
  referralDate: string;
  referralCount: number;
  earnings: number;
  avatar: string;
  img?: string;
}

function mapEntryToReferral(entry: LeaderboardEntry, index: number): Referral {
  const rank: number | string = entry.icon ?? entry.rank;
  const avatars = [
    '/assets/Ellipse 13.png',
    '/assets/Ellipse 14.png',
    '/assets/Ellipse 13.png',
    '/assets/Ellipse 14.png',
    '/assets/Ellipse 13.png',
  ];
  return {
    id: entry.id,
    rank,
    icon: entry.icon,
    userName: entry.userName,
    referralDate: entry.referralDate,
    referralCount: entry.referralCount,
    earnings: entry.earnings,
    avatar: '',
    img: avatars[index % avatars.length],
  };
}

function RankBadge({ rank }: { rank: number | string }) {
  const containerClass =
    'flex items-center bg-[#323234] justify-center rounded-[9px] w-[46px] h-[46px] bg-[#323234] shrink-0';

  if (rank === 'gold') {
    return (
      <div className={containerClass}>
        <Image src="/assets/gold.svg" alt="" className="w-4 h-4" />
      </div>
    );
  }
  if (rank === 'silver') {
    return (
      <div className={containerClass}>
        <Image src="/assets/silver.svg" alt="" className="w-4 h-4" />
      </div>
    );
  }
  if (rank === 'bronze') {
    return (
      <div className={containerClass}>
        <Image src="/assets/copper.svg" alt="" className="w-4 h-4" />
      </div>
    );
  }
  return <div className={`${containerClass} text-neutral-400 font-normal font-ui text-sm`}>{rank}</div>;
}

interface ReferralTableProps {
  entries?: LeaderboardEntry[];
  loading?: boolean;
}

export default function ReferralTable({ entries = [], loading = false }: ReferralTableProps) {
  const { t } = useTranslation();
  const referrals: Referral[] = entries.length > 0 ? entries.map(mapEntryToReferral) : [];

  return (
    <div className="w-full max-w-5xl mx-auto ">
      <div className="dark:bg-transparent bg-white rounded-lg overflow-hidden">
        {/* Desktop Header (Old Version) - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 rounded-[20px] dark:rounded-[9px] bg-[#F1F1FE] dark:bg-[#070707]">
          <div className="col-span-5 text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]">{t('Referrers')}</div>
          <div className="col-span-3 text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80] text-right">{t('Referees')}</div>
          <div className="col-span-3 text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80] text-right">{t('Value')}</div>
        </div>

        {/* Mobile Header (Pill Style) - Hidden on Desktop */}
        <div className="md:hidden flex justify-between items-center px-6 py-3 mb-4 rounded-full bg-[#F1F1FE] border border-neutral-100 dark:bg-[#323234] dark:rounded-[9px] dark:border-none">
          <span className="text-[#65656580] dark:text-[#FFFFFF80] text-sm font-normal font-ui">{t('Referrers')}</span>
          <span className="text-[#65656580] dark:text-[#FFFFFF80] text-sm font-normal font-ui">{t('Referees')}</span>
        </div>

        {/* Rows */}
        <div className="flex flex-col   pr-5">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="relative flex flex-col md:grid md:grid-cols-12 gap-4 py-5 md:border-none items-center"
              >
                <div className="w-full flex items-start md:items-center gap-4 md:col-span-6">
                  <Skeleton className="w-[46px] h-[46px] rounded-[9px] shrink-0" />
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-[46px] h-[46px] rounded-full shrink-0" />
                    <Skeleton className="h-4 w-10 mt-2 rounded lg:hidden" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-28 rounded" />
                    <Skeleton className="h-4 w-36 rounded" />
                    <div className="md:hidden mt-2">
                      <Skeleton className="h-5 w-20 rounded" />
                    </div>
                  </div>
                  <div className="md:hidden absolute right-0 top-6">
                    <Skeleton className="h-6 w-8 rounded" />
                  </div>
                </div>
                <div className="hidden md:block col-span-2 mr-4 text-right">
                  <Skeleton className="h-5 w-8 rounded ml-auto" />
                </div>
                <div className="hidden md:block col-span-3 text-right">
                  <Skeleton className="h-5 w-20 rounded ml-auto" />
                </div>
              </div>
            ))
          ) : referrals.length === 0 ? (
            <div className="py-8 text-center text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]">{t('Noreferrersyet')}</div>
          ) : (
            referrals.map((referral) => (
              <div
                key={referral.id}
                className="relative flex flex-col md:grid md:grid-cols-12 gap-4 py-5   md:border-none last:border-0 items-center"
              >
                {/* Left Side: Badge + Avatar + User Info */}
                <div className="w-full flex items-start md:items-center gap-4 md:col-span-6">
                  <RankBadge rank={referral.rank} />
                  <div className="flex flex-col items-center">
                    <Image
                      width={46}
                      height={46}
                      src={referral.img || '/assets/default-avatar.png'}
                      className="w-[46px] h-[46px] rounded-full object-cover"
                      alt=""
                    />
                    <span className="text-[#65656580] md:hidden mt-2 dark:text-[#FFFFFF80] text-xs font-normal font-ui">{t('Value')}</span>
                  </div>

                  <div className="min-w-0  flex-1">
                    <p className="text-[#656565CC] dark:text-white text-sm font-normal font-ui truncate leading-tight">
                      {referral.userName}
                    </p>
                    <p className="text-[#65656580] dark:text-[#FFFFFF80] text-xs font-normal font-ui">
                      {t('Referrersince')} {referral.referralDate}
                    </p>

                    {/* MOBILE ONLY: Value Label + Earnings */}
                    <div className="md:hidden mt-2 flex items-center gap-3">
                      <span className="text-[#656565] dark:text-white font-normal font-ui text-sm">
                        ${referral.earnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* MOBILE ONLY: Referees Count (Floating Top Right) */}
                  <div className="md:hidden absolute right-0 top-6">
                    <span className="text-[#8ADE4F] font-normal font-ui text-sm">{referral.referralCount}</span>
                  </div>
                </div>

                {/* DESKTOP ONLY: Referral Count Column */}
                <div className="hidden md:block col-span-2 mr-4 text-right">
                  <span className="text-lime-400 font-normal font-ui text-sm">{referral.referralCount}</span>
                </div>

                {/* DESKTOP ONLY: Earnings Column */}
                <div className="hidden md:block col-span-3 text-right">
                  <span className="text-[#656565] dark:text-white font-normal font-ui text-sm">
                    ${referral.earnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
