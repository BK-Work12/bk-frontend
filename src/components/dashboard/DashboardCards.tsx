import Image from 'next/image';
import type { PortfolioData } from '@/lib/api';
import { useTranslation } from 'react-i18next';

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type Props = { portfolio?: PortfolioData | null };

export default function DashboardCards({ portfolio }: Props) {
  const { t } = useTranslation();
  const cardConfig = [
    {
      title: t('TotalInvestment'),
      label: t('Cash'),
      key: 'totalInvestment' as const,
      accentColor: '#8EDD23',
      bgGradient: 'linear-gradient(135deg, #F5FF1E 0%, #42DE33 100%)',
      textColor: 'black',
      extraClasses: 'pt-4.25 relative dotted-whiteBg pb-5.75 pl-3 2xl:pl-5 rounded-xl flex flex-col gap-5 lg:gap-10',
    },
    {
      title: t('InterestPaid'),
      label: t('Activity'),
      key: 'interestPaid' as const,
      accentColor: '#9274F3',
      bgGradient: 'linear-gradient(137.47deg, #7352DD 11.08%, #9274F3 42.04%, #7352DD 95.9%)',
      textColor: 'white',
      extraClasses: 'pt-4.25 pb-5.75 pl-3 2xl:pl-5 shadow3 border border-[#FFFFFF80] rounded-xl flex flex-col gap-5 lg:gap-10',
    },
    {
      title: t('UnrealizedInterest'),
      label: '',
      key: 'unrealizedInterest' as const,
      accentColor: '#53A7FF',
      bgGradient: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
      textColor: 'white',
      extraClasses: 'pt-4.25 pb-5.75 pl-3 2xl:pl-5 rounded-xl flex flex-col gap-5 lg:gap-10',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cardConfig.map((card, index) => {
        const amount = portfolio ? portfolio[card.key] : 0;
        return (
          <div
            key={index}
            className={`${card.extraClasses} min-w-0 overflow-hidden transition-all duration-200 hover:brightness-105`}
            style={{ background: card.bgGradient }}
          >
            {index === 0 && (
              <Image
                width={400}
                height={400}
                priority
                quality={'80'}
                src="/assets/Frame 1597886320.svg"
                className="w-full hidden dark:block h-full absolute top-0 left-0 z-0 opacity-30"
                alt=""
              />
            )}
            <div className="relative flex items-center gap-1.5 min-w-0">
              <span
                className={`text-xs font-ui font-normal leading-tight truncate ${card.textColor === 'white' ? 'text-white/80' : 'text-black/70'}`}
              >
                {card.title}
              </span>
              {card.label ? (
                <span
                  className={`text-[10px] font-ui font-medium px-1.5 py-0.5 rounded-full shrink-0 ${card.textColor === 'white' ? 'bg-white/20 text-white' : 'bg-black/10 text-black/70'}`}
                >
                  {card.label}
                </span>
              ) : null}
            </div>
            <span
              className={`relative text-xl sm:text-2xl lg:text-[32px] 2xl:text-[32px] font-bold leading-[100%] font-display truncate ${card.textColor === 'white' ? 'text-white' : 'text-black'}`}
            >
              {formatUsd(amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
