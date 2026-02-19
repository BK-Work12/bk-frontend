"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { getCryptoList } from "@/lib/api";
import { DEFAULT_CRYPTO_DATA, type CryptoData } from "@/lib/constants/crypto";
import { Skeleton } from "../ui/skeleton";
import { useTranslation } from "react-i18next";
import { getCached, setCache } from "@/lib/cache";

export type { CryptoData } from "@/lib/constants/crypto";

/** Polling interval in ms for real-time crypto price updates */
const POLL_INTERVAL_MS = 30_000;

/** Normalize asset names (e.g. Tether USDt → Tether USDT). */
function normalizeCryptoList(list: CryptoData[]): CryptoData[] {
  return list.map((item) =>
    item.name === "Tether USDt" ? { ...item, name: "Tether USDT" } : item,
  );
}

interface CryptoPricesTableProps {
  data?: CryptoData[] | null;
  /** Polling interval in ms; set to 0 to disable. Default: 30000 */
  pollIntervalMs?: number;
}

export function CryptoPricesTable({
  data: dataProp,
  pollIntervalMs = POLL_INTERVAL_MS,
}: CryptoPricesTableProps) {
  const { t } = useTranslation();
  const cachedCrypto = dataProp ?? getCached<CryptoData[]>('crypto_prices');
  const [data, setData] = useState<CryptoData[] | null>(cachedCrypto ?? DEFAULT_CRYPTO_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const CRYPTO_TABLE_TITLE = t("LiveCryptoPrices");

  // Initial load and sync with dataProp
  useEffect(() => {
    if (dataProp != null) {
      setData(dataProp);
      setLoading(false);
      return;
    }
    let cancelled = false;
    if (!cachedCrypto) {
      setLoading(true);
      setError(false);
    }
    getCryptoList()
      .then((list) => {
        const normalized = normalizeCryptoList(list);
        if (!cancelled && normalized.length > 0) {
          setData(normalized);
          setCache('crypto_prices', normalized);
        } else if (!cancelled) {
          setData(DEFAULT_CRYPTO_DATA);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          if (!data) setData(DEFAULT_CRYPTO_DATA);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dataProp]);

  // Real-time polling: refresh crypto list on an interval
  useEffect(() => {
    if (pollIntervalMs <= 0) return;

    const refresh = () => {
      getCryptoList()
        .then((list) => {
          if (list.length > 0) setData(normalizeCryptoList(list));
        })
        .catch(() => {
          // Keep previous data on poll error; only set error on initial load
        });
    };

    intervalRef.current = setInterval(refresh, pollIntervalMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pollIntervalMs]);

  const rows = data ?? DEFAULT_CRYPTO_DATA;

  if (loading) {
    return (
      <div className="w-full bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E20] rounded-[20px] px-3 sm:px-4 pt-4 pb-2">
        <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white text-start px-4.75 mb-4">
          {CRYPTO_TABLE_TITLE}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-2 items-center pb-2">
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] rounded-[20px] px-2 sm:px-3 lg:px-4 pt-4 pb-2">
      <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white text-start mb-3 lg:mb-4 px-4.75">
        {CRYPTO_TABLE_TITLE}
      </h2>

      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr>
              <th className="bg-[#F1F1FE] dark:bg-[#070707] px-2 sm:px-3 py-2 sm:py-2.5 rounded text-center text-xs sm:text-sm font-ui font-normal text-[#656565] dark:text-[#FFFFFF80] w-[30%]">
                {t("Asset")}
              </th>
              <th className="bg-[#F1F1FE] dark:bg-[#070707] px-2 sm:px-3 py-2 sm:py-2.5 rounded text-center text-xs sm:text-sm font-ui font-normal text-[#656565] dark:text-[#FFFFFF80] w-[25%]">
                {t("Price")}
              </th>
              <th className="bg-[#F1F1FE] dark:bg-[#070707] px-2 sm:px-3 py-2 sm:py-2.5 rounded text-center text-xs sm:text-sm font-ui font-normal text-[#656565] dark:text-[#FFFFFF80] w-[20%]">
                {t("24h")}
              </th>
              <th className="bg-[#F1F1FE] dark:bg-[#070707] px-2 sm:px-3 py-2 sm:py-2.5 rounded text-center text-xs sm:text-sm font-ui font-normal text-[#656565] dark:text-[#FFFFFF80] w-[25%] whitespace-nowrap">
                {t("MarketCap")}
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((crypto) => {
              const isPositive = crypto.change24h >= 0;

              return (
                <tr
                  key={crypto.id}
                  className="transition-colors duration-150 hover:bg-[#FFFFFF04] rounded-lg"
                >
                  {/* Asset */}
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                    <div className="flex items-center gap-2">
                      {crypto.iconDark ? (
                        <span className="shrink-0 w-5 h-5 sm:w-6 sm:h-6">
                          <Image
                            width={24}
                            height={24}
                            priority
                            quality={"80"}
                            src={crypto.icon}
                            alt=""
                            className="hidden dark:block w-full h-full"
                          />
                          <Image
                            width={24}
                            height={24}
                            priority
                            quality={"80"}
                            src={crypto.iconDark}
                            alt=""
                            className="dark:hidden w-full h-full"
                          />
                        </span>
                      ) : (
                        <Image
                          width={24}
                          height={24}
                          priority
                          quality={"80"}
                          src={crypto.icon}
                          alt=""
                          className="shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                        />
                      )}
                      <span className="dark:text-white text-[#656565] font-normal font-ui text-sm sm:text-base truncate">
                        {crypto.name}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
                    <span className="text-[#656565] dark:text-white text-sm sm:text-base font-normal font-ui">
                      {crypto.price}
                    </span>
                  </td>

                  {/* 24h Change */}
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span>
                        {isPositive ? (
                          <Image
                            width={9}
                            height={9}
                            src="/assets/Polygon 2 (1).png"
                            alt=""
                          />
                        ) : (
                          <Image
                            width={9}
                            height={9}
                            src="/assets/Polygon 4.png"
                            alt=""
                          />
                        )}
                      </span>
                      <span
                        className={`text-sm sm:text-base font-ui font-normal ${
                          isPositive ? "text-[#42DE33]" : "text-[#D45254]"
                        }`}
                      >
                        {Math.abs(crypto.change24h).toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  {/* Market Cap */}
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
                    <span className="text-[#656565] dark:text-white text-sm sm:text-base font-ui font-normal">
                      {crypto.marketCap}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
