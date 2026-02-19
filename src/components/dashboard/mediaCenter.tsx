import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';

const articles = [
  {
    id: 1,
    title: 'Why Crypto Investors Are Switching Focus To Passive Income',
    excerpt:
      'The crypto market of 2026 feels very different from the one investors entered just a few years ago. While volatility and speculation still exist, the industry is steadily evolving...',
    image: '/assets/mc-thumb-1.png',
    url: 'https://varntix.com/insights/why-crypto-investors-switching-passive-income/',
    date: 'Feb 10, 2026',
    tag: 'Insights',
  },
  {
    id: 2,
    title: 'Staking vs Treasury Yield: What\u2019s the Difference?',
    excerpt:
      'As crypto markets mature, investors are increasingly exploring ways to generate passive income rather than relying solely on price appreciation...',
    image: '/assets/mc-thumb-2.png',
    url: 'https://varntix.com/insights/staking-vs-treasury-yield/',
    date: 'Feb 8, 2026',
    tag: 'Research',
  },
  {
    id: 3,
    title: 'How to Build a Passive Income Crypto Portfolio in 2026',
    excerpt:
      'Crypto investing has evolved significantly over the past few years. Today\u2019s environment is encouraging investors to think more about portfolio construction...',
    image: '/assets/mc-thumb-3.png',
    url: 'https://varntix.com/insights/build-passive-income-crypto-portfolio-2026/',
    date: 'Feb 5, 2026',
    tag: 'Guide',
  },
];

export const MediaCenter = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] rounded-[20px] px-1 pt-5 pb-1 max-sm:mb-5 lg:py-5">
      {/* Header */}
      <div className="text-start mb-3 lg:mb-4 px-4.75">
        <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
          {t('MediaCenter')}
        </h2>
      </div>
      <div className="flex flex-col gap-1">
        {articles.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-row items-center gap-3 lg:gap-4 rounded-xl px-2 py-2 hover:bg-[#F1F1FE] hover:dark:bg-[#FFFFFF06] transition-all duration-150 active:scale-[0.995] active:opacity-80"
          >
            {/* Fixed-size thumbnail */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F1F1FE] dark:bg-[#272727] shrink-0">
              <Image
                width={200}
                height={200}
                priority
                quality={80}
                src={article.image}
                className="w-full h-full object-cover"
                alt={article.title}
              />
            </div>
            {/* Content */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="font-medium text-sm font-ui dark:text-white text-[#656565] leading-tight line-clamp-1">
                  {article.title}
                </h2>
                <span className="text-[10px] font-ui font-medium px-1.5 py-0.5 rounded-full bg-[#65656514] dark:bg-white/10 text-[#656565] dark:text-white/60 shrink-0">{article.tag}</span>
              </div>
              <p className="dark:text-[#FFFFFF60] text-[#65656580] text-xs font-normal font-ui mb-1 line-clamp-2">
                {article.excerpt}
              </p>
              <span className="font-normal text-start font-ui text-[#656565A6] dark:text-[#FFFFFFA6] text-[11px]">
                {t('ReadMore')}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
