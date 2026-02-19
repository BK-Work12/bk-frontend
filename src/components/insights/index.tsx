'use client';

import Image from 'next/image';
import React from 'react';
import { Blogs } from './blogs';
import { useTranslation } from 'react-i18next';

export const InsightsIndex = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="pt-6 lg:pt-25  ">
        <div className="flex max-lg:pl-4 px-1.5 pb-13.5 flex-col gap-5 max-w-348 w-full mx-auto">
          <h2 className="text-[60px] font-bold font-ui leading-[100%] text-[#000000]">
            {t('ResearchInsights')} <span className="font-medium">{t('FixedIncomeInDigitalAssets')}</span>
          </h2>
          <p className="text-lg font-normal font-ui text-[#656565]">
            {t('marketstructure')}
          </p>
        </div>
        <div className="px-1.5">
          <div className="max-w-348  glassBackdrop2 w-full mb-20.25 overflow-hidden mx-auto relative pt-10.25 pb-9.25 xl:pt-20 xl:pb-22 bg-[#181B21] pl-5.5 pr-3 rounded-xl xl:pl-21.25">
            <Image
              alt=""
              fill
              priority
              sizes="100vw"
              quality={80}
              placeholder="blur"
              blurDataURL="assets/Group 1597884914.svg"
              src={'/assets/Group 1597884914.svg'}
              className="w-full sm:block hidden h-full object-cover  absolute top-0 left-0"
            />

            <Image
              alt=""
              fill
              priority
              sizes="100vw"
              quality={80}
              placeholder="blur"
              blurDataURL="assets/Group 1597884977Mobile.png"
              src={'/assets/Group 1597884977Mobile.png'}
              className="w-full sm:hidden  h-full object-cover  absolute top-0 left-0"
            />
            <div className="relative">
              <h2 className="text-[48px] pb-3.5 font-semibold font-ui leading-[100%]">
                {t('FixedIncomeinCrypto')}: <br />
                {t('HowDigitalAssetTreasuries')}
              </h2>
              <p className="text-[#FFFFFF80] max-xxs:text-lg text-[20px] font-ui leading-[100%] pb-10">
                {t('AreReshapingInvestmentStrategies')}
              </p>
              <button
                className="rounded-xl h-15.5 px-5 flex items-center justify-between max-w-45.25  w-full font-bold font-ui text-base transition-all duration-300 hover:brightness-110"
                style={{
                  background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                }}
              >
                {t('StartHere')}
                <Image width={22} height={22} src="/assets/signUp.svg" alt="" />
              </button>
            </div>
          </div>
        </div>

        <div className="pl-1.5 flex flex-col gap-7.25">
          <Blogs title={'Fixed Income in Crypto'} />
          <Blogs title={'Digital Asset Treasuries'} />
          <Blogs title={'On-Chain Execution & Transparency'} />
          <Blogs title={'Market Structrue & Investor Behaviour'} />
        </div>
        <div className="px-1.5">
          <div className="max-w-348 glassBackdrop2 w-full mt-22.5 mb-20.25 overflow-hidden mx-auto relative pt-10.25 pb-9.25 xl:pt-20 xl:pb-22 bg-[#181B21] pl-5.5 pr-3 rounded-xl xl:pl-21.25">
            <Image
              alt=""
              fill
              priority
              sizes="100vw"
              quality={80}
              placeholder="blur"
              blurDataURL="assets/Group 1597884977.webp"
              src={'/assets/Group 1597884977.webp'}
              className="w-full h-full hidden sm:block object-cover  absolute top-0 left-0"
            />
            <Image
              alt=""
              fill
              priority
              sizes="100vw"
              quality={80}
              placeholder="blur"
              blurDataURL="assets/Group 1597884978Mobile.png"
              src={'/assets/Group 1597884978Mobile.png'}
              className="w-full h-full  sm:hidden object-cover  absolute top-0 left-0"
            />{' '}
            <div className="relative">
              <h2 className="text-[48px] max-sm:max-w-81.5 w-fit pb-3.5 font-semibold font-ui leading-[100%]">
                {t('Createandgrowyourportfolioeffortlessly')} <br />
                {t('oneappbuilt')}
              </h2>
              <p className="text-[#FFFFFF80] text-[20px] font-ui leading-[100%] pb-31 lg:pb-10">
                {t('Enjoyhigh')}
              </p>
              <button
                className="rounded-xl h-15.5 px-5 flex items-center justify-between max-w-93.75 lg:max-w-45.25  w-full font-bold font-ui text-base transition-all duration-300 hover:brightness-110"
                style={{
                  background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                }}
              >
                {t('StartHere')}
                <Image width={22} height={22} src="/assets/signUp.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
