'use client';
import { GradientBorderGray } from '../ui/gradientBorder';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export const StrategiesCard = ({ strategies, title }: any) => {
  const pathname = usePathname() ?? '';
  const basePath = pathname.startsWith('/bonds') ? '/bonds' : '/invest';
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl lg:text-[28px] font-bold font-ui dark:text-white text-black text-center lg:text-left">{t(title)}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6.25">
        {strategies.map((strategy: any, index: any) => {
          const capNum = typeof strategy.cap === 'number' ? strategy.cap : Number(strategy.cap) || 0;
          const filledNum = strategy.type === 'sold' ? capNum : (typeof strategy.filled === 'number' ? strategy.filled : 0);
          const progressPct = capNum > 0 ? Math.min(100, (100 * filledNum) / capNum) : 0;
          const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          return (
            <GradientBorderGray key={strategy.strategyId ?? strategy.id ?? index} className="rounded-xl">
              <div className="bg-[#F1F1FE] dark:bg-[#111111] rounded-xl overflow-hidden p-2.5 lg:p-3 relative glassShadowDark transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
                {(strategy.type === 'sold') && (
                  <div className="absolute z-30 pointer-events-none backdrop-blur-[2px] w-full h-full top-0 left-0" />
                )}
                <div className="flex justify-between pb-2 items-center">
                  <div className="relative flex items-center">
                    <Image src={'/assets/usdt (6) 1.svg'} className="w-6 h-6 lg:w-8 lg:h-8" width={32} height={32} alt="" />
                    <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-[#3E73C4] border-2 flex items-center justify-center border-[#0F0F0F] -ml-2">
                      <Image width={16} height={17} src={'/assets/usdcWhite.svg'} alt="" />
                    </div>
                  </div>
                  <div
                    className={`py-1.5 px-3 ${strategy.type === 'flexible' ? 'bg-[#F5FF1E]  dark:bg-[#F5FF1E1F] text-[#595D07] dark:text-[#F5FF1E]' : 'bg-[#8EDD231F] dark:bg-[#8EDD231F] text-[#8EDD23] dark:text-[#8EDD23]'}  rounded-[91px] text-xs font-bold leading-[100%] uppercase font-ui `}
                  >
                    {t(strategy.type)}
                  </div>
                </div>
                {/* SOLD OUT BADGE */}
                {(strategy.type === 'sold') && (
                  <span
                    style={{
                      background: 'linear-gradient(180deg, #D45254 0%, #AD0003 100%)',
                    }}
                    className="absolute top-[140px] lg:top-[160px] uppercase font-ui w-40 lg:w-48.25 text-center left-1/2 -translate-x-1/2 text-white px-3 py-1.5 h-8 lg:h-10 rounded-[63px] text-sm font-bold z-30 flex items-center justify-center tracking-wide"
                  >
                    {t('SOLDOUT')}
                  </span>
                )}
                <div
                  style={{ background: strategy.bg ? strategy.bg : '' }}
                  className={`rounded-md mb-4 lg:mb-6 relative z-1 shrink-0 flex justify-center items-center bg-[#FFFFFF] dark:bg-[#e4e0ef] h-24 lg:h-33.25`}
                >
                  <Image
                    width={1000}
                    height={1000}
                    priority
                    quality={80}
                    src={strategy.logo ? strategy.logo : '/assets/Logo.svg'}
                    className="absolute max-w-[70px] lg:max-w-[98.91px] h-auto w-full top-3 lg:top-5 left-4 lg:left-6"
                    alt=""
                  />
                  <h2
                    className={`text-2xl lg:text-[42px] font-ui ${strategy.sold ? 'text-black' : 'text-white'} font-bold leading-[100%]`}
                  >
                    {strategy.apy}% {t('APY')}
                  </h2>
                </div>
                <div className="flex flex-col pb-4 lg:pb-6 gap-2">
                  <div className="relative h-1 bg-white dark:bg-[#FFFFFF1F] progress">
                    <div
                      className="absolute h-full left-0 top-0 bg-[#D0F822]"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="text-sm lg:text-base font-normal text-[#656565] dark:text-[#FFFFFFA3] leading-[100%] font-ui">
                    ${fmt(filledNum)} /{' '}
                    <span className="text-sm lg:text-base font-bold leading-[100%] font-ui text-[#656565] dark:text-white">
                      ${fmt(capNum)}
                    </span>
                  </div>
                </div>
                <div className="flex pb-4 lg:pb-6 flex-col gap-2.5 lg:gap-3">
                  <div className="flex justify-between">
                    <span className=" dark:text-[#FFFFFFA3] text-[#656565A3] text-sm lg:text-base font-normal font-ui leading-[100%]">
                      {t('Term')}:
                    </span>
                    <span className="dark:text-[#FFFFFF] text-[#656565] text-sm lg:text-base font-bold font-ui leading-[100%]">
                      {strategy.termMonths} {t('Months')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className=" dark:text-[#FFFFFFA3] text-[#656565A3] text-sm lg:text-base font-normal font-ui leading-[100%]">
                      {t('Min')}:
                    </span>
                    <span className="dark:text-[#FFFFFF] text-[#656565] text-sm lg:text-base font-bold font-ui leading-[100%]">
                      {typeof strategy.minInvestment === 'number'
                        ? `$${strategy.minInvestment.toLocaleString()}`
                        : `$${String(strategy.minInvestment).replace(/[$,]/g, '')}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className=" dark:text-[#FFFFFFA3] text-[#656565A3] text-sm lg:text-base font-normal font-ui leading-[100%]">
                      {t('PayoutFrequency')}:
                    </span>
                    <span className="dark:text-[#FFFFFF] text-[#656565] text-sm lg:text-base font-bold font-ui leading-[100%]">
                      {t(strategy.payoutFrequency)}
                    </span>
                  </div>
                </div>
                <Link href={`${basePath}/${strategy.strategyId ?? strategy.id}`}>
                  <button
                    disabled={strategy.type === 'sold'}
                    className="
                  h-11 lg:h-13 my-2 lg:my-4 rounded-md w-full
                  font-semibold text-black font-ui text-base lg:text-lg
                  text-[#656565]
                  hover:brightness-110
                  hover:shadow-lg
                  active:scale-[0.97] active:brightness-95
                  transition-all duration-150
                "
                    style={{
                      background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)',
                    }}
                  >
                    {t('Subscribe')}
                  </button>
                </Link>
              </div>
            </GradientBorderGray>
          );
        })}
      </div>
    </div>
  );
};
