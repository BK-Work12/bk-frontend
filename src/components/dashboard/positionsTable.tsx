"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import VectorIcon from "../icons/vectorIcon";
import { getToken } from "@/lib/auth";
import { getInvestments, type InvestmentListItem } from "@/lib/api";
import { getCached, setCache } from "@/lib/cache";
import { formatDateTime, formatDateShort } from "@/lib/formatUtils";
import { shortenId } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type StatusFilter = "All" | "OPEN" | "CLOSING";

function formatMaturityDate(isoOrYmd: string): string {
  return formatDateShort(isoOrYmd);
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const PERIOD_STYLES: Record<string, string> = {
  "6 months": "text-[#6B63DF] bg-[#4A458F3D]",
  "12 months": "text-[#D49352] bg-[#D493523D]",
  "24 months": "text-[#F5FF1E] bg-[#F5FF1E3D]",
  "18 Months": "text-[#6B63DF] bg-[#4A458F3D]",
  "36 Months": "text-[#D49352] bg-[#D493523D]",
};

function periodStyle(period: string): string {
  return (
    PERIOD_STYLES[period] ??
    "text-[#656565] dark:text-[#FFFFFFA6] bg-[#65656526]"
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const SKELETON_ROWS = 4;

function SkeletonCell({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-4 rounded bg-[#65656526] dark:bg-[#121213] animate-pulse ${className}`}
      aria-hidden
    />
  );
}

function PositionsTableSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
        <tr
          key={index}
          className={`font-ui ${index !== SKELETON_ROWS - 1 ? "border-b border-[#FFFFFF0D]" : ""}`}
        >
          <td className="px-3 py-3">
            <div className="flex justify-center">
              <SkeletonCell className="w-14" />
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="flex justify-center">
              <SkeletonCell className="w-24" />
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="flex justify-center">
              <SkeletonCell className="w-20" />
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="flex justify-center">
              <SkeletonCell className="w-12" />
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="flex justify-center">
              <SkeletonCell className="w-14" />
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="flex justify-center">
              <SkeletonCell className="w-20" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export const PositionsTable = () => {
  const { t } = useTranslation();
  const cachedPositions = getCached<InvestmentListItem[]>('dashboard_positions');
  const [positions, setPositions] = useState<InvestmentListItem[]>(cachedPositions ?? []);
  const [loading, setLoading] = useState(!cachedPositions);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_LIMIT = 5;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getInvestments(token).then((res) => {
      setPositions(res.list);
      setCache('dashboard_positions', res.list);
      setLoading(false);
    });
  }, []);

  const filteredPositions = useMemo(() => {
    return positions.filter((p) => {
      const statusMatch =
        statusFilter === "All" ||
        (statusFilter === "OPEN" && p.status === "OPEN") ||
        (statusFilter === "CLOSING" && p.status === "CLOSING");
      if (!statusMatch) return false;
      const from = dateFrom.trim();
      const to = dateTo.trim();
      if (!from && !to) return true;
      const created = new Date(p.createdAt).toISOString().slice(0, 10);
      if (from && created < from) return false;
      if (to && created > to) return false;
      return true;
    });
  }, [positions, statusFilter, dateFrom, dateTo]);

  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (filterButtonRef.current?.contains(target)) return;
      const popup = document.getElementById("positions-filter-popup");
      if (popup?.contains(target)) return;
      setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  return (
    <div className="w-full bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] rounded-[20px] px-1 pt-4 pb-1 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 px-4.75">
        <h2 className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
          {t("MyPositions")}
        </h2>
        <button
          ref={filterButtonRef}
          type="button"
          onClick={() => setFilterOpen((open) => !open)}
          className="mr-2 lg:mr-8 p-1 rounded text-[#656565] dark:text-white hover:bg-[#65656514] dark:hover:bg-white/10 transition-colors"
          aria-expanded={filterOpen}
          aria-label="Toggle filter"
          aria-haspopup="true"
        >
          <VectorIcon strokeColor="currentColor" />
        </button>
      </div>

      {/* Filter popup */}
      {filterOpen && (
        <div
          id="positions-filter-popup"
          className="absolute right-4 top-14 z-50 min-w-[280px] rounded-xl bg-[#1E1E20] dark:bg-[#111111] border border-[#434343] p-5 shadow-xl"
          role="dialog"
          aria-label="Filter positions"
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-ui font-medium text-[#FFFFFF80]">
                {t("Status")}
              </span>
              <div className="flex flex-wrap gap-2">
                {(["All", "OPEN", "CLOSING"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`px-3 py-2 rounded-lg text-xs font-ui capitalize transition-colors ${
                      statusFilter === value
                        ? "border-2 border-[#8EDD23] text-[#8EDD23] bg-[#8EDD2314]"
                        : "border border-[#434343] text-[#FFFFFF80] bg-transparent hover:bg-[#FFFFFF0A]"
                    }`}
                  >
                    {value === "All" ? "All" : value}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-ui font-medium text-[#FFFFFF80]">
                {t("Daterange")}
              </span>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="positions-date-from"
                    className="text-xs font-ui text-[#FFFFFF60]"
                  >
                    {t("From")}
                  </label>
                  <div className="relative">
                    <input
                      id="positions-date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full rounded-lg border border-[#434343] bg-[#1E1E20] dark:bg-[#0a0a0a] text-white px-3 py-2 pr-9 text-xs font-ui focus:outline-none focus:ring-2 focus:ring-[#8EDD23] [color-scheme:dark]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFFFFF60]">
                      <CalendarIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="positions-date-to"
                    className="text-xs font-ui text-[#FFFFFF60]"
                  >
                    {t("To")}
                  </label>
                  <div className="relative">
                    <input
                      id="positions-date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full rounded-lg border border-[#434343] bg-[#1E1E20] dark:bg-[#0a0a0a] text-white px-3 py-2 pr-9 text-xs font-ui focus:outline-none focus:ring-2 focus:ring-[#8EDD23] [color-scheme:dark]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFFFFF60]">
                      <CalendarIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {(statusFilter !== "All" || dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("All");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-xs font-ui text-[#8EDD23] hover:underline self-start"
              >
                {t("Clearfilters")}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="dark:bg-[#111111] grad2Bg p-1 rounded-xl">
        <div className="w-full 4xl:w-full 5xl:w-full mx-auto pb-1 pt-3 bg-white border border-[#65656526] dark:border-transparent dark:bg-[#070707] no-scrollbar px-3 rounded-[9px] overflow-x-auto 4xl:overflow-x-hidden">
          <table className="w-full 2xl:max-w-[769px] 5xl:max-w-full mx-auto">
            <thead>
              <tr className="bg-[#F1F1FE] dark:bg-[#121213] rounded-[9px]">
                <th className="px-3 relative rounded-l-[9px] py-2 text-center text-xs font-normal font-ui text-[#00000080] dark:text-[#FFFFFF80] whitespace-nowrap">
                  {t("PositionID")}
                  <span className="w-px h-3.5 top-[50%] -translate-y-1/2 bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0"></span>
                </th>
                <th className="px-3 py-2 font-ui relative text-center text-xs font-normal text-[#00000080] dark:text-[#FFFFFF80] whitespace-nowrap">
                  {t("DateTime")}
                  <span className="w-px h-3.5 top-[50%] -translate-y-1/2 bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0"></span>
                </th>
                <th className="px-3 py-2 font-ui relative text-center text-xs font-normal text-[#00000080] dark:text-[#FFFFFF80] whitespace-nowrap">
                  {t("Product")}
                  <span className="w-px h-3.5 top-[50%] -translate-y-1/2 bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0"></span>
                </th>
                <th className="px-3 py-2 font-ui relative text-center text-xs font-normal text-[#00000080] dark:text-[#FFFFFF80] whitespace-nowrap">
                  {t("Status")}
                  <span className="w-px h-3.5 top-[50%] -translate-y-1/2 bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0"></span>
                </th>
                <th className="px-3 py-2 font-ui relative text-center text-xs font-normal text-[#00000080] dark:text-[#FFFFFF80] whitespace-nowrap">
                  {t("Amount")}
                  <span className="w-px h-3.5 top-[50%] -translate-y-1/2 bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0"></span>
                </th>
                <th className="px-3 py-2 font-ui rounded-r-[9px] text-center text-xs font-normal text-[#00000080] dark:text-[#FFFFFF80] whitespace-nowrap">
                  {t("Maturitydate")}
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <PositionsTableSkeleton />
              ) : filteredPositions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm font-ui text-[#65656580] dark:text-[#FFFFFF80]"
                  >
                    {t("Nopositionsyet")}
                  </td>
                </tr>
              ) : (
                (expanded ? filteredPositions : filteredPositions.slice(0, VISIBLE_LIMIT)).map((position, index) => (
                  <tr
                    key={position.id}
                    className={`font-ui transition-colors duration-150 hover:bg-[#FFFFFF06] cursor-default ${
                      index !== (expanded ? filteredPositions.length : Math.min(filteredPositions.length, VISIBLE_LIMIT)) - 1
                        ? "border-b border-[#FFFFFF0D]"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-3 text-center text-sm font-normal text-[#656565] dark:text-[#FFFFFF80] whitespace-nowrap font-ui">
                      {position.subid ?? shortenId(position.id)}
                    </td>

                    <td className="px-3 py-3 text-center text-sm font-normal text-[#656565] dark:text-[#FFFFFF80] whitespace-nowrap font-ui">
                      {formatDateTime(position.createdAt)}
                    </td>

                    <td className="px-3 py-3 text-center text-sm font-normal text-[#656565] dark:text-[#FFFFFF80] whitespace-nowrap font-ui">
                      {position.product}
                    </td>

                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md border font-medium text-[10px] font-ui ${
                          position.status === "OPEN"
                            ? "border-[#8EDD23] text-[#8EDD23]"
                            : position.status === "CLOSED"
                              ? "border-[#656565] text-[#65656580] dark:text-[#FFFFFF80]"
                              : "border-[#FF9800] text-[#FF9800]"
                        }`}
                      >
                        {position.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-center text-sm font-normal text-[#656565] dark:text-[#FFFFFF80] whitespace-nowrap font-ui">
                      {formatAmount(position.amount)}
                    </td>

                    <td className="px-3 py-3 text-center text-sm font-normal text-[#656565] dark:text-[#FFFFFF80] whitespace-nowrap font-ui">
                      {formatMaturityDate(position.maturityDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && filteredPositions.length > VISIBLE_LIMIT && (
            <div className="flex justify-center py-3">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-xs font-ui font-medium text-[#8EDD23] hover:text-[#a5ff2a] transition-colors"
              >
                {expanded ? t("See Less") : `${t("See More")} (${filteredPositions.length - VISIBLE_LIMIT})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
