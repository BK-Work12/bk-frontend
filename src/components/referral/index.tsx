'use client';
import React, { useState, useEffect } from 'react';
import { Leaderboard } from './leaderboard';
import { GradientBorder } from '../ui/gradientBorder';
import Link from 'next/link';
import Image from 'next/image';
import {
  getReferralDetails,
  getLeaderboard,
  getReferralFeesOverTime,
  type ReferralDetails as ApiReferralDetails,
  type ReferralDetailsPeriod,
  type LeaderboardEntry,
  type ReferralFeesOverTimePoint,
  type ReferralFeesOverTimePeriod,
} from '@/lib/api';
import { getToken } from '@/lib/auth';
import { getCached, setCache } from '@/lib/cache';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';

const BOND_ICON = { icon: '/assets/logoSingle.svg', iconWidth: 18.928001403808594, iconHeight: 14 };
const YIELDS_EARNED_ICON = { icon: '/assets/Vector (5).png', iconWidth: 13, iconHeight: 20 };
const BONDS_VISIBLE_DEFAULT = 5;

export const ReferralPageIndex = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const cachedRef = getCached<{ details: ApiReferralDetails | null; leaderboard: LeaderboardEntry[] }>('referral_data');
  const [referralDetails, setReferralDetails] = useState<ApiReferralDetails | null>(cachedRef?.details ?? null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(cachedRef?.leaderboard ?? []);
  const [loading, setLoading] = useState(!cachedRef);
  const [leaderboardDisplayLimit, setLeaderboardDisplayLimit] = useState(6);
  const [bondsExpanded, setBondsExpanded] = useState(false);
  const cachedFees = getCached<ReferralFeesOverTimePoint[]>('referral_fees_1m');
  const [feesOverTime, setFeesOverTime] = useState<ReferralFeesOverTimePoint[]>(cachedFees ?? []);
  const [feesOverTimeLoading, setFeesOverTimeLoading] = useState(!cachedFees);
  const [activityPeriod, setActivityPeriod] = useState<ReferralDetailsPeriod>('1m');
  const cachedPeriodStats = getCached<Pick<ApiReferralDetails, 'refereesCount' | 'value' | 'totalFeesGenerated' | 'ranking'> | null>('referral_period_1m');
  const [periodStats, setPeriodStats] = useState<Pick<
    ApiReferralDetails,
    'refereesCount' | 'value' | 'totalFeesGenerated' | 'ranking'
  > | null>(cachedPeriodStats ?? null);
  const [periodStatsLoading, setPeriodStatsLoading] = useState(!cachedPeriodStats);

  const statIcons = [
    { icon: '/assets/fluent_people-community-20-regular.png', label: t('No of referees') },
    { icon: '/assets/mdi-light_currency-usd (1).png', label: t('Value') },
    { icon: '/assets/iconoir_percentage.png', label: t('Total fees generated') },
    { icon: '/assets/qlementine-icons_sort-ranking-desc-24.png', label: t('Ranking') },
  ];

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([getReferralDetails(token), getLeaderboard(token, 100)])
      .then(([details, entries]) => {
        if (!cancelled) {
          setReferralDetails(details ?? null);
          setLeaderboard(entries ?? []);
          setCache('referral_data', { details: details ?? null, leaderboard: entries ?? [] });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [activeTab, setActiveTab] = useState<ReferralFeesOverTimePeriod>('1m');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setFeesOverTime([]);
      return;
    }
    let cancelled = false;
    setFeesOverTimeLoading(true);
    getReferralFeesOverTime(token, activeTab)
      .then((data) => {
        if (!cancelled) {
          setFeesOverTime(data ?? []);
          setCache(`referral_fees_${activeTab}`, data ?? []);
        }
      })
      .finally(() => {
        if (!cancelled) setFeesOverTimeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setPeriodStats(null);
      return;
    }
    let cancelled = false;
    setPeriodStatsLoading(true);
    getReferralDetails(token, activityPeriod)
      .then((data) => {
        if (!cancelled && data) {
          const stats = {
            refereesCount: data.refereesCount,
            value: data.value,
            totalFeesGenerated: data.totalFeesGenerated,
            ranking: data.ranking,
          };
          setPeriodStats(stats);
          setCache(`referral_period_${activityPeriod}`, stats);
        } else if (!cancelled) setPeriodStats(null);
      })
      .finally(() => {
        if (!cancelled) setPeriodStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activityPeriod]);

  const referralCode = referralDetails?.referralCode ?? '-';
  const textToCopy = referralDetails?.referralLink ?? '';

  const handleCopy = () => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleCopyCode = () => {
    if (referralCode && referralCode !== '-') {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const shareMessage = `Join Varntix and start earning passive income on your crypto! Use my referral link: ${textToCopy}`;
  const encodedLink = encodeURIComponent(textToCopy);
  const encodedMessage = encodeURIComponent(shareMessage);

  const handleInvite = () => {
    if (navigator.share && textToCopy) {
      navigator.share({
        title: 'Join Varntix',
        text: 'Join Varntix and start earning passive income on your crypto!',
        url: textToCopy,
      }).catch(() => { /* user cancelled share */ });
    } else {
      handleCopy();
    }
  };

  const handleShareFacebook = () => {
    if (!textToCopy) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleShareTwitter = () => {
    if (!textToCopy) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Join Varntix and start earning passive income on your crypto!')}&url=${encodedLink}`, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleShareLinkedIn = () => {
    if (!textToCopy) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    if (!textToCopy) return;
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    if (!textToCopy) return;
    window.location.href = `mailto:?subject=${encodeURIComponent('Join Varntix - Earn Passive Income on Crypto')}&body=${encodedMessage}`;
  };

  const handleShareQR = () => {
    handleCopy();
  };

  const stats = referralDetails
    ? [
        { ...statIcons[0], value: String(referralDetails.refereesCount) },
        { ...statIcons[1], value: referralDetails.value },
        { ...statIcons[2], value: referralDetails.totalFeesGenerated },
        { ...statIcons[3], value: referralDetails.ranking != null ? `#${referralDetails.ranking}` : '-' },
      ]
    : statIcons.map((s) => ({ ...s, value: '-' }));

  const statsByPeriod =
    periodStats != null
      ? [
          { ...statIcons[0], value: String(periodStats.refereesCount) },
          { ...statIcons[1], value: periodStats.value },
          { ...statIcons[2], value: periodStats.totalFeesGenerated },
          { ...statIcons[3], value: periodStats.ranking != null ? `#${periodStats.ranking}` : '-' },
        ]
      : stats;

  const yieldsByBond = referralDetails?.yieldsByBond ?? [];
  const bondsToShow = bondsExpanded ? yieldsByBond : yieldsByBond.slice(0, BONDS_VISIBLE_DEFAULT);
  const hasMoreBonds = yieldsByBond.length > BONDS_VISIBLE_DEFAULT;

  const tabs = [
    { label: '1m', value: '1m' },
    { label: '1y', value: '1y' },
    { label: t('All Time'), value: 'all' },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3.25">
      <div className="flex flex-col gap-2 w-full">
        <div className="dark:bg-[#32323424] gradBg border-transparent   shadow4 rounded-[9px] px-1 pb-1 pt-4 lg:pt-6">
          <div className="flex pb-3 lg:pb-5  justify-center lg:justify-between items-center pl-6 pr-8.75">
            <h2 className="text-sm lg:text-base font-medium font-ui text-[#656565] dark:text-white leading-tight">{t('ReferEarn')}</h2>
            <button onClick={handleInvite} className="hidden lg:block" aria-label="Share referral link">
              <Image
                width={18}
                height={20}
                priority
                src="/assets/shareWhite.svg"
                className="hidden dark:block"
                alt=""
              />
              <Image width={18} height={20} priority src="/assets/shareDark.png" className=" dark:hidden" alt="" />
            </button>
          </div>
          <div className="dark:bg-[#32323424] dotted-bg bg-[#FFFFFF] border border-[#65656526] dark:border-transparent relative rounded-[18px] pl-[27px] pr-3 2xl:px-11.25 pb-4 lg:pb-6 pt-6 lg:pt-12.25 flex flex-col gap-5 lg:gap-11.5">
            {/* <Image
                width={1000}
                height={1000}
                priority
                src="/assets/Frame 1597886320.png"
                className="w-full hidden dark:block h-full absolute z-0 top-0 left-0"
                alt=""
              />
              <Image
                width={1000}
                height={1000}
                priority
                src="/assets/Group 1597884978.svg"
                className="mx-auto lg:dark:block hidden max-w-150   w-full h-auto relative"
                alt=""
              />
              <Image
                width={1000}
                height={1000}
                priority
                src="/assets/Group 1597884979.svg"
                className="mx-auto hidden lg:block lg:dark:hidden  max-w-150 w-full h-auto relative"
                alt=""
              /> */}
            <div className="hidden xl:flex max-w-175 mx-auto justify-between w-full">
              {/* STEP 1 */}
              <div className=" flex flex-col items-center text-center gap-11.5">
                {/* Number + line */}
                <div className="relative flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center
                   text-base font-extrabold text-[#656565] font-ui z-10"
                    style={{
                      background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
                    }}
                  >
                    1
                  </div>

                  {/* Line */}
                  <div
                    className="absolute left-full  ml-5 4xl:ml-7 top-1/2 -translate-y-1/2
                   h-px  4xl:w-39.75 w-30"
                    style={{
                      background: 'linear-gradient(270deg, #42DE33 14.95%, #FDE938 87.63%)',
                    }}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <h2 className=" text-sm lg:text-base font-ui font-medium text-[#656565] dark:text-white max-w-41.25 leading-tight">
                    {t('InvitefriendsFamily')}
                  </h2>
                  <p className=" text-xs lg:text-sm font-normal font-ui text-[#8EDD23] leading-tight">
                    {t('totheVarntixPlatform')}
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="hidden lg:flex flex-col items-center text-center gap-11.5">
                <div className="relative flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center
                   text-base font-extrabold font-ui z-10"
                    style={{
                      background: 'linear-gradient(137.47deg, #7352DD 11.08%, #9274F3 42.04%, #7352DD 95.9%)',
                    }}
                  >
                    2
                  </div>

                  <div
                    className="absolute left-full  ml-5 4xl:ml-7 top-1/2 -translate-y-1/2
                   h-px  4xl:w-39.75 w-30"
                    style={{
                      background: 'linear-gradient(270deg, #42DE33 14.95%, #FDE938 87.63%)',
                    }}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <h2 className=" text-sm lg:text-base font-ui font-medium text-[#656565] dark:text-white max-w-51.75 leading-tight">
                    {t('Getpaidwhentheyinvest')}
                  </h2>
                  <p className=" text-xs lg:text-sm font-normal font-ui text-[#6B63DF] leading-tight">
                    {t('Withanyoneyouinvite')}
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col items-center text-center gap-11.5">
                <div className="relative flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center
                   text-base font-extrabold font-ui"
                    style={{
                      background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                    }}
                  >
                    3
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h2 className=" text-sm lg:text-base font-ui font-medium text-[#656565] dark:text-white max-w-39 mx-auto leading-tight">
                    {t('Earncommissions')}
                  </h2>
                  <p className=" text-xs lg:text-sm font-normal font-ui text-[#53A7FF] leading-tight">
                    {t('onyourefereesactivity')}
                  </p>
                </div>
              </div>
            </div>

            <div className="xl:hidden  relative  flex flex-col gap-4 items-center   ">
              <div className="flex flex-col gap-2 items-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center text-sm font-extrabold text-[#656565] font-ui leading-[100%] justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
                  }}
                >
                  1
                </div>
                <div className="flex flex-col text-center">
                  <h2 className="text-sm font-medium font-ui dark:text-white text-[#656565]">
                    {t('InvitefriendsFamily')}
                  </h2>
                  <p className="text-[#70AE1C] text-xs font-normal font-ui leading-tight">
                    {t('totheVarntixPlatform')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center text-sm font-extrabold font-ui leading-[100%] justify-center"
                  style={{
                    background: 'linear-gradient(137.47deg, #7352DD 11.08%, #9274F3 42.04%, #7352DD 95.9%)',
                  }}
                >
                  2
                </div>
                <div className="flex flex-col text-center">
                  <h2 className="text-sm font-medium font-ui dark:text-white text-[#656565]">
                    {t('Getpaidwhentheyinvest')}
                  </h2>
                  <p className="text-[#6B63DF] text-xs font-normal font-ui leading-tight">
                    {t('Withanyoneyouinvite')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center text-sm font-extrabold font-ui leading-[100%] justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                  }}
                >
                  3
                </div>
                <div className="flex flex-col text-center">
                  <h2 className="text-sm font-medium font-ui dark:text-white text-[#656565]">
                    {t('Earncommissions')}
                  </h2>
                  <p className="text-[#53A7FF] text-xs font-normal font-ui leading-tight">
                    {t('onyourefereesactivity')}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex flex-wrap justify-center gap-3 items-center">
              {/* Invite Button */}
              <button
                onClick={handleInvite}
                className="
      h-9 px-8
      inline-flex justify-center items-center
      rounded-full text-sm font-normal font-ui dark:text-white
      hover:brightness-110
      transition-all duration-200
    "
                style={{
                  background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                }}
              >
                + {t('Invite')}
              </button>

              {/* Learn More Button */}
              <Link href={'/referral'}>
                <button
                  className="
      h-9 px-8
      border rounded-full text-sm font-normal font-ui
      border-[#65656526] text-[#40404059] dark:text-white
      dark:border-[#40404080] dark:bg-[#FFFFFF1A]
      hover:bg-[#F0F4FF] dark:hover:bg-white/10
      hover:border-[#4374FA] dark:hover:border-white
      hover:text-[#4374FA] dark:hover:text-white
      transition-all duration-200
    "
                >
                  {t('Learn More')}
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="dark:bg-[#32323424] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent rounded-[9px] px-1 pb-1 pt-4 lg:pt-6">
          <div className="flex pb-3 lg:pb-5 justify-center lg:justify-between items-center pl-6 pr-8.75">
            <h2 className="text-sm lg:text-base font-medium font-ui text-start text-[#656565] dark:text-white leading-tight">
              {t('Feesgeneratedbyreferees')}
            </h2>
          </div>
          <div className="dark:bg-[#070707] border border-[#65656526] dark:border-transparent bg-[#F1F1FE] rounded-[9px] min-h-40 lg:min-h-91 pt-2.75 px-2 pb-4">
            <div className="max-w-75 w-full bg-[#FFFFFF] dark:bg-[#32323424] rounded-[10px] p-[4px] flex items-center mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as ReferralFeesOverTimePeriod)}
                  className={`flex-1 text-sm font-ui py-2 rounded-[7px] transition-all
            ${
              activeTab === tab.value
                ? 'bg-[#F1F1FE] dark:bg-[#32323424] text-[#656565] dark:text-white'
                : 'text-[#656565] dark:text-[#A1A1A1] '
            }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {feesOverTimeLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full max-w-[280px] rounded-[10px]" />
              </div>
            ) : feesOverTime.length === 0 ? (
              <div className="flex items-center justify-center h-48 rounded-[10px] bg-[#FFFFFF] dark:bg-transparent">
                <p className="text-[#65656580] dark:text-[#FFFFFF80] font-ui text-sm">{t('No fees generated')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pl-3 pr-[14px] lg:pl-9 lg:pr-11.5">
                {feesOverTime.map((point, idx) => {
                  return (
                    <div key={`${point.referralId}-${idx}`} className="flex justify-between items-center gap-2 w-full">
                      <span
                        className="font-ui text-[#656565CC] dark:text-white text-sm font-normal truncate leading-tight"
                        title={point.referralId}
                      >
                        {point.userName || point.referralId.slice(-6) || '—'}
                      </span>
                      <span className="text-[#656565] dark:text-white font-normal font-ui text-sm text-right shrink-0">
                        ${point.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Leaderboard
          entries={leaderboard}
          loading={loading}
          displayLimit={leaderboardDisplayLimit}
          onShowAll={() =>
            setLeaderboardDisplayLimit((prev) =>
              Number.isFinite(prev) ? Number.POSITIVE_INFINITY : 6
            )
          }
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="bg-[#FFFFFF] border border-[#65656526] dark:border-transparent dark:bg-[#32323424] rounded-[9px] pt-5.25 pb-8.25 px-4.5">
          <h2 className="px-3 font-medium font-ui text-sm lg:text-base text-start text-[#656565] dark:text-white leading-tight mb-4 lg:mb-10">
            {t('Referraldetails')}
          </h2>
          <div className="flex pb-4 lg:pb-10 flex-col gap-2 lg:gap-3">
            <p className="text-sm max-lg:text-center font-normal text-[#656565A6] dark:text-[#FFFFFFA6] font-ui">
              {t('ChooseyourVarntix')}
            </p>
            <div
              onClick={handleCopyCode}
              className="bg-[#F1F1FE] dark:bg-[#3232343D] px-4.5 h-11.5 rounded-[9px] flex items-center justify-between cursor-pointer hover:bg-[#E8E8F8] dark:hover:bg-[#3232345D] transition-colors text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]"
            >
              <span>{referralCode}</span>
              <span className="text-xs text-[#656565] dark:text-[#FFFFFF80] font-medium font-ui">{copied ? t('Copied') : t('Copy')}</span>
            </div>
          </div>
          <div className="flex pb-3 lg:pb-6.5 flex-col gap-2 lg:gap-3">
            <p className="text-sm max-lg:text-center font-normal text-[#656565A6] dark:text-[#FFFFFFA6] font-ui">
              {t('Yourreferrallink')}
            </p>
            {loading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-11.5 flex-1 rounded-[9px]" />
                <Skeleton className="h-8.5 w-20 rounded-lg shrink-0" />
              </div>
            ) : (
              <div className="bg-[#F1F1FE] dark:bg-[#3232343D] px-4.5 h-11.5 justify-between rounded-[9px] flex items-center text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">
                {textToCopy}
                <button
                  onClick={handleCopy}
                  className="
                  px-5 h-8.5 flex gap-3.5 items-center
                  border border-[#FFFFFF4D] rounded-lg
                  bg-[#6565651A] dark:bg-[#FFFFFF1A]
                  text-sm font-ui font-normal text-[#656565] dark:text-white
                  hover:bg-[#FFFFFF33] dark:hover:bg-white/20
                  hover:border-white
                  transition-all duration-200
                "
                >
                  {copied ? t('Copied') : t('Copy')}
                  <Image
                    width={16}
                    height={16}
                    priority
                    className="dark:block hidden"
                    src="/assets/solar_copy-outline.svg"
                    alt="Copy Icon"
                  />
                  <Image
                    width={16}
                    height={16}
                    priority
                    className="dark:hidden "
                    src="/assets/solar_copy-outline_light.svg"
                    alt="Copy Icon"
                  />
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-[7px] lg:gap-3.25">
            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              aria-label="Share on Facebook"
              className="w-11 h-11 lg:w-15 lg:h-15 bg-[#F1F1FE] dark:bg-[#00000099] rounded-xl lg:rounded-[18px] blackShadow flex items-center justify-center
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(24,119,242,0.45)]"
            >
              <Image width={24} height={24} priority src="/assets/jam_facebook.svg" alt="Facebook" />
            </button>

            {/* Twitter / X */}
            <button
              onClick={handleShareTwitter}
              aria-label="Share on X (Twitter)"
              className="w-11 h-11 lg:w-15 lg:h-15 bg-[#F1F1FE] dark:bg-[#00000099] rounded-xl lg:rounded-[18px] blackShadow flex items-center justify-center
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(29,161,242,0.45)]"
            >
              <Image
                width={14}
                height={14}
                priority
                src="/assets/prime_twitter.svg"
                className="hidden dark:block"
                alt="X"
              />
              <Image
                width={14}
                height={14}
                priority
                src="/assets/prime_twitter_light.svg"
                className="dark:hidden"
                alt="X"
              />
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleShareLinkedIn}
              aria-label="Share on LinkedIn"
              className="w-11 h-11 lg:w-15 lg:h-15 bg-[#F1F1FE] dark:bg-[#00000099] rounded-xl lg:rounded-[18px] blackShadow flex items-center justify-center
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(10,102,194,0.45)]"
            >
              <Image width={24} height={24} priority src="/assets/ri_linkedin-fill.svg" alt="LinkedIn" />
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              aria-label="Share on WhatsApp"
              className="w-11 h-11 lg:w-15 lg:h-15 bg-[#F1F1FE] dark:bg-[#00000099] rounded-xl lg:rounded-[18px] blackShadow flex items-center justify-center
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(37,211,102,0.45)]"
            >
              <Image width={24} height={24} priority src="/assets/mdi_whatsapp.svg" alt="WhatsApp" />
            </button>

            {/* Mail */}
            <button
              onClick={handleShareEmail}
              aria-label="Share via Email"
              className="w-11 h-11 lg:w-15 lg:h-15 bg-[#F1F1FE] dark:bg-[#00000099] rounded-xl lg:rounded-[18px] blackShadow flex items-center justify-center
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(234,67,53,0.45)]"
            >
              <Image width={24} height={24} priority src="/assets/material-symbols_mail-outline.svg" alt="Email" />
            </button>

            {/* QR / Copy Link */}
            <button
              onClick={handleShareQR}
              aria-label="Copy referral link"
              className="w-11 h-11 lg:w-15 lg:h-15 bg-[#F1F1FE] dark:bg-[#00000099] rounded-xl lg:rounded-[18px] blackShadow flex items-center justify-center
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(120,120,120,0.45)]"
            >
              <Image width={24} height={24} priority src="/assets/gg_qr.svg" className="hidden dark:block" alt="Copy" />
              <Image width={24} height={24} priority src="/assets/gg_qr_light.svg" className="dark:hidden" alt="Copy" />
            </button>
          </div>
        </div>
        <div className="dark:bg-[#32323424] border border-[#65656526] dark:border-transparent rounded-[9px] pt-5 px-2.5 pb-2.5">
          <div className="flex pb-4 lg:pb-8.5 justify-between items-center pl-5 pr-7 lg:pr-8.75">
            <div className="lg:hidden"></div>
            <h2 className="text-sm lg:text-base font-medium font-ui text-[#656565] dark:text-white leading-tight">{t('Activity summary')}</h2>
            <button onClick={handleInvite} aria-label="Share referral link">
              <Image width={18} height={20} priority src="/assets/shareWhite.svg" alt="" />
            </button>
          </div>

          <div className="max-w-[300px] max-md:mx-auto mb-4 w-full bg-[#F1F1FE] dark:bg-[#FFFFFF0D] rounded-[10px] p-[4px] flex items-center">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActivityPeriod(tab.value as ReferralDetailsPeriod)}
                className={`flex-1 text-sm font-ui py-2 rounded-[7px] transition-all
            ${
              activityPeriod === tab.value
                ? 'bg-[#FFFFFF] dark:bg-[#323234] text-[#656565] dark:text-white'
                : 'text-[#656565] dark:text-[#A1A1A1]'
            }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-[#F1F1FE] dark:bg-[#32323424] mb-3 lg:mb-4 rounded-[9px] pt-2.5 lg:pt-3.5 pb-3 lg:pb-5.25 pl-3 pr-[14px]  lg:pl-9 lg:pr-11.5">
            <div className="flex flex-col gap-2.5 lg:gap-[17px]">
              {loading || periodStatsLoading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3 lg:gap-6">
                        <Skeleton className="h-9 w-9 lg:h-11.5 lg:w-11.5 rounded-[9px] shrink-0" />
                        <Skeleton className="h-5 w-24 rounded" />
                      </div>
                      <Skeleton className="h-8 w-16 rounded" />
                    </div>
                  ))
                : statsByPeriod.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-3 lg:gap-6">
                        <div className="h-9 w-9 lg:h-11.5 lg:w-11.5 rounded-[9px] bg-[#FFFFFF] dark:bg-[#323234] flex items-center justify-center">
                          <Image
                            width={20}
                            height={20}
                            priority
                            src={item.icon}
                            alt={item.label}
                            className="gray-icon"
                          />
                        </div>
                        <span className="text-sm text-[#65656580] dark:text-[#FFFFFF80] font-normal font-ui">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-normal font-ui text-[#656565] dark:text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="dark:bg-[#32323424] border border-[#65656526] dark:border-transparent rounded-[9px] pt-2.5 lg:pt-3.5 pb-3 lg:pb-5.25 mb-2.5 lg:pl-9 pl-3 pr-[14px] lg:pr-11.5">
            <div className="flex flex-col gap-2.5 lg:gap-[17px]">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-11.5 w-11.5 rounded-[9px] shrink-0" />
                      <Skeleton className="h-5 w-28 rounded" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded" />
                  </div>
                ))
              ) : (
                <>
                  {/* Total Yields Earned */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 lg:gap-6">
                      <div className="h-9 w-9 lg:h-11.5 lg:w-11.5 rounded-[9px] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent dark:bg-[#1E1E20] flex items-center justify-center">
                        <Image
                          height={YIELDS_EARNED_ICON.iconHeight}
                          width={YIELDS_EARNED_ICON.iconWidth}
                          src={YIELDS_EARNED_ICON.icon}
                          alt="Total Yields Earned"
                          className="gray-icon"
                        />
                      </div>
                      <span className="text-sm text-[#65656580] dark:text-[#FFFFFF80] font-normal font-ui">
                        {t('TotalYieldsEarned')}
                      </span>
                    </div>
                    <span className="text-sm font-normal font-ui text-[#8EDD23]">
                      {referralDetails?.totalYieldsEarned ?? '$0.00'}
                    </span>
                  </div>
                  {/* Bond breakdown */}
                  {bondsToShow.map((bond, index) => (
                    <div key={bond.bondName} className="flex justify-between items-center">
                      <div className="flex items-center gap-3 lg:gap-6">
                        <div className="h-9 w-9 lg:h-11.5 lg:w-11.5 rounded-[9px] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent dark:bg-[#1E1E20] flex items-center justify-center">
                          <Image
                            height={BOND_ICON.iconHeight}
                            width={BOND_ICON.iconWidth}
                            src={BOND_ICON.icon}
                            alt={bond.bondName}
                            className="gray-icon"
                          />
                        </div>
                        <span className="text-sm text-[#65656580] dark:text-[#FFFFFF80] font-normal font-ui">
                          {bond.bondName}
                        </span>
                      </div>
                      <span className="text-sm font-normal font-ui text-[#656565] dark:text-white">
                        {bond.amount}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {hasMoreBonds ? (
              <button
                type="button"
                onClick={() => setBondsExpanded((e) => !e)}
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
                "
              >
                {bondsExpanded ? t('Viewless') : t('Viewmore')}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="
                  max-w-87.25 w-full
                  bg-[#0000001A] dark:bg-[#FFFFFF1A]
                  rounded-[20px] border border-[#FFFFFF4D]
                  py-3 text-sm font-normal font-ui
                  text-[#656565] dark:text-white
                  opacity-50 cursor-not-allowed
                "
              >
                {yieldsByBond.length === 0 ? t('No yields yet') : t('Viewmore')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
