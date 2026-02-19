"use client";
import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import ArrowUpIcon from "../icons/arrowUpIcon";
import InfoIcon from "../icons/infoIcon";
import { CryptoPricesTable } from "./cryptoTable";
import ArrowRightIcon from "../icons/arrowRight";
import { PositionsTable } from "./positionsTable";
import { MediaCenter } from "./mediaCenter";
import {
  GradientBorder,
  GradientBorderGray,
  GradientBorderLight,
} from "../ui/gradientBorder";
import HowItWorksModal from "../ui/HowItWorksModal";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import { getPortfolio, type PortfolioData } from "@/lib/api";
import { getCached, setCache } from "@/lib/cache";
import { Setup } from "./setup";
import { useTranslation } from "react-i18next";
import OrderDetailsModal from "../ui/order-details-popup";
import HoldingsRing from "./HoldingsRing";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Ensure payout date is DD/MM/YYYY regardless of backend format. */
function formatPayoutDateEU(raw: string | null): string {
  if (!raw) {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
  // If already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [a, b, c] = raw.split('/').map(Number);
    // Check if first part > 12 — it's already DD/MM/YYYY
    if (a > 12) return raw;
    // If second part > 12 — it's MM/DD/YYYY, swap
    if (b > 12) return `${String(b).padStart(2, '0')}/${String(a).padStart(2, '0')}/${c}`;
    // Ambiguous: assume MM/DD/YYYY from backend comment
    return `${String(b).padStart(2, '0')}/${String(a).padStart(2, '0')}/${c}`;
  }
  // Try parsing ISO or other format
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export const DashboardIndex = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);

  useEffect(() => {
    const cached = getCached<PortfolioData>('dashboard_portfolio');
    if (cached) setPortfolio(cached);

    const token = getToken();
    if (!token) return;
    getPortfolio(token).then((data) => {
      setPortfolio(data);
      setCache('dashboard_portfolio', data);
    });
  }, []);

  const availableBalance = portfolio?.availableBalance ?? 0;
  const totalInvestment = portfolio?.totalInvestment ?? 0;
  const interestPaid = portfolio?.interestPaid ?? 0;
  const displayPeriod = portfolio?.displayPeriod ?? "monthly";
  const averageMonthlyApy = portfolio?.averageMonthlyApy ?? 0;
  const displayPeriodDescription = t("monthlyinterestrate");
  const nextPayoutAmount = portfolio?.nextPayoutAmount ?? 0;
  const nextPayoutDate = portfolio?.nextPayoutDate ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-x-2.5 gap-y-2 items-start">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col gap-1">
          <Setup />
          <GradientBorderLight>
            <div className="rounded-[20px] dark:bg-[#FFFFFF03] dark:border dark:border-[#40404059] gradBg pb-1 px-1">
              {/* Available Balance Header + Amount inline */}
              <div className="pt-4 lg:pt-5 pb-2 lg:pb-3 px-5 lg:px-7.5 flex items-center justify-between gap-3">
                <h2 className="flex gap-3 items-center text-start leading-tight text-sm lg:text-base font-medium font-ui dark:text-white text-[#656565]">
                  <Image
                    width={23}
                    height={46}
                    src="/assets/Group 1597885002.svg"
                    className="hidden dark:block"
                    alt=""
                  />
                  <Image
                    width={23}
                    height={46}
                    src="/assets/blir.svg"
                    className="dark:hidden"
                    alt=""
                  />
                  {t("AvailableBalance")}
                </h2>
                <div className="green-shadow flex items-center bg-white dark:bg-[#00000099] border border-[#65656526] dark:border-[#8EDD23] rounded-full px-4 py-1.5">
                  <span className="text-base sm:text-lg lg:text-xl text-[#656565] dark:text-white font-ui font-bold leading-tight">
                    {formatUsd(availableBalance)}
                  </span>
                </div>
              </div>
              {/* My Portfolio - mobile */}
              <h2 className="pt-3 pl-5 lg:hidden text-start pb-2 text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                {t("MyPortfolio")}
              </h2>
              <div className="dark:bg-[#00000099] dotted-bg bg-white rounded-[18px] p-1">
                {/* My Portfolio - desktop */}
                <h2 className="pt-3 hidden lg:block pl-5.5 text-start pb-2 text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                  {t("MyPortfolio")}
                </h2>
                <DashboardCards portfolio={portfolio} />
                <div className="pt-3 lg:py-3 relative px-3 lg:px-4 flex flex-col lg:flex-row items-center justify-between gap-3">
                  <Image
                    width={1000}
                    height={1000}
                    priority
                    src="/assets/Rectangle 113.svg"
                    className="absolute max-w-67.5 w-full right-0 top-50 lg:top-0 z-0"
                    alt=""
                  />

                  <div className="w-full flex flex-col gap-2 max-lg:mb-3">
                    {/* APY / Next Payout / VNX – responsive card grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Average APY Card */}
                      <div className="relative rounded-xl overflow-hidden px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-3.5 lg:py-3 flex flex-col gap-1 min-w-0 bg-[#F1F1FE] dark:bg-[#111111] border border-[#65656514] dark:border-[#FFFFFF14]">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] sm:text-xs font-ui font-normal leading-tight text-[#656565] dark:text-white/80 truncate">
                            {t("AverageAPY")}
                          </span>
                        </div>
                        <span className="text-sm sm:text-base lg:text-xl font-bold leading-tight font-ui text-black dark:text-white truncate">
                          +{averageMonthlyApy.toFixed(2)}%
                        </span>
                        <p className="text-[9px] sm:text-[10px] font-normal font-ui text-[#6F6F7180] dark:text-[#FFFFFF50] leading-tight line-clamp-2">
                          {displayPeriodDescription}
                        </p>
                      </div>

                      {/* Next Payout Card */}
                      <div className="relative rounded-xl overflow-hidden px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-3.5 lg:py-3 flex flex-col gap-1 min-w-0 bg-[#F1F1FE] dark:bg-[#111111] border border-[#65656514] dark:border-[#FFFFFF14]">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] sm:text-xs font-ui font-normal leading-tight text-[#656565] dark:text-white/80 truncate">
                            {t("NextPayout")}
                          </span>
                        </div>
                        <span className="text-sm sm:text-base lg:text-xl font-bold leading-tight font-ui text-black dark:text-white truncate">
                          {formatUsd(nextPayoutAmount)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-ui font-medium px-1 sm:px-1.5 py-0.5 rounded-full bg-[#65656514] dark:bg-white/10 text-[#656565] dark:text-white/80 max-w-max truncate">
                          {t("Date")}: {formatPayoutDateEU(nextPayoutDate)}
                        </span>
                      </div>

                      {/* VNX Card */}
                      <div className="relative rounded-xl overflow-hidden px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-3.5 lg:py-3 flex flex-col gap-1 min-w-0 bg-[#F1F1FE] dark:bg-[#111111] border border-[#65656514] dark:border-[#FFFFFF14]">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] sm:text-xs font-ui font-normal leading-tight text-[#656565] dark:text-white/80 truncate">
                            {t("VNX")}
                          </span>
                        </div>
                        <span className="text-sm sm:text-base lg:text-xl font-bold leading-tight font-ui text-black dark:text-white truncate">
                          $0
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-ui font-medium px-1 sm:px-1.5 py-0.5 rounded-full bg-[#65656514] dark:bg-white/10 text-[#656565] dark:text-white/80 max-w-max truncate">
                          0
                        </span>
                      </div>
                    </div>
                  </div>
                  <HoldingsRing
                    totalInvestment={totalInvestment}
                    interestPaid={interestPaid}
                    unrealizedInterest={portfolio?.unrealizedInterest ?? 0}
                    totalHoldingsLabel={t("TotalHoldings")}
                  />
                </div>
              </div>
            </div>
          </GradientBorderLight>
        </div>
        <PositionsTable />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <CryptoPricesTable />
        <GradientBorderGray>
          <div className="w-full bg-[#F1F1FE] border border-[#65656526] dark:border-transparent flex justify-between items-start dark:bg-[#070707] rounded-[20px] py-4 px-3.75 lg:p-1">
            <div className="flex flex-col lg:flex-row max-lg:w-full gap-4 2xl:gap-8 items-center">
              <Image
                width={1000}
                height={1000}
                priority
                quality={"80"}
                src="/assets/Frame 1597886353.png"
                className="max-w-100 lg:shrink-0 hidden lg:block max-lg:h-35.75 object-cover lg:max-w-35.5 w-full rounded-2xl"
                alt=""
              />
              <Image
                width={1000}
                height={1000}
                priority
                quality={"80"}
                src="/assets/07ab38af0b594bf7b89cef36aed059e994d55bd1.webp"
                className="max-w-full lg:shrink-0 lg:hidden max-lg:h-35.75 object-cover lg:max-w-35.5 w-full rounded-2xl"
                alt=""
              />
              <div className="flex lg:shrink-0 gap-3 max-lg:w-full text-start flex-col">
                <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
                  {t("WatchyourCryptoGrow")}
                </h2>
                <p className="dark:text-[#FFFFFF60] w-full text-[#65656580] font-normal font-ui text-xs whitespace-nowrap">
                  {t("StartearningUSDCevery")} {t("monthwithVarntixYields")}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="lg:mr-4 lg:hidden text-[#656565] dark:text-white bg-[#FFFFFF] dark:bg-transparent hover:bg-[#F5F5F5] dark:hover:bg-white/10 hover:text-black dark:hover:text-white font-ui text-xs font-normal w-auto h-9 border border-[#E9E9E9] dark:border-[#FFFFFF30] hover:border-[#D0D0D0] dark:hover:border-white rounded-full inline-flex justify-center gap-2 items-center px-6 transition-all duration-150 active:scale-[0.97]"
              >
                {t("HowitWorks")}
                <span className="hidden dark:block">
                  <ArrowRightIcon />
                </span>
                <span className="dark:hidden">
                  <ArrowRightIcon color="#656565" />
                </span>
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="2xl:mr-4 lg:mr-4 hidden max-w-40 3xl:max-w-47.5 text-[#656565] dark:text-white bg-[#FFFFFF] dark:bg-transparent hover:bg-[#F5F5F5] dark:hover:bg-white/10 hover:text-black dark:hover:text-white xl:mt-1 2xl:mt-3 font-ui text-xs font-normal w-full h-9 border border-[#E9E9E9] dark:border-[#FFFFFF30] hover:border-[#D0D0D0] dark:hover:border-white rounded-full lg:flex justify-between items-center px-4 transition-all duration-150 active:scale-[0.97]"
            >
              {t("HowitWorks")}
              <span className="hidden dark:block">
                <ArrowRightIcon />
              </span>
              <span className="dark:hidden">
                <ArrowRightIcon color="#656565" />
              </span>
            </button>
          </div>
        </GradientBorderGray>
        <MediaCenter />
      </div>
      <HowItWorksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
