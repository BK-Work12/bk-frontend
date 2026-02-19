"use client";

import { AssetsTable } from "@/components/assets-page/assetsTable";
import ArrowDown from "@/components/icons/arrowDown";
import { formatDateRangeLabel } from "@/lib/formatUtils";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const INITIAL_DISPLAY_LIMIT = 10;

export default function AssetsContent() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState<number>(
    INITIAL_DISPLAY_LIMIT,
  );
  const [totalFiltered, setTotalFiltered] = useState(0);
  const filterRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const hasOverflow =
    Number.isFinite(displayLimit) && totalFiltered > displayLimit;
  const [open, setOpen] = useState(false);
  const STATUS_OPTIONS = ["All", "completed", "pending"] as const;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (filterRef.current && !filterRef.current.contains(target))
        setFilterOpen(false);
      if (datePickerRef.current && !datePickerRef.current.contains(target))
        setDatePickerOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateRangeLabel = formatDateRangeLabel(dateFrom, dateTo);

  return (
    <div className="pt-16 pb-5">
      <div className="flex justify-between mb-4 lg:mb-0 lg:justify-end items-center px-6.75 ">
        <div ref={filterRef} className="relative shrink-0">
          <Image
            width={24}
            height={24}
            src="/assets/mynaui_filter.png"
            className="hidden dark:block"
            alt=""
          />
          <Image
            width={24}
            height={24}
            src="/assets/mynaui_filter (1).png"
            className=" dark:hidden"
            alt=""
          />
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="absolute inset-0"
            aria-label="Filter assets"
          />
          <div
            className={`absolute left-0 md:right-0 top-full mt-2 z-20 w-56 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-3 px-4 transition-all duration-200 ease-out origin-top ${filterOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
            onClick={(e) => e.stopPropagation()}
          >
                <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">
                  {t("Status")}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        statusFilter === s
                          ? "border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]"
                          : "border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6] hover:border-[#65656566]"
                      }`}
                    >
                      {t(s)}
                    </button>
                  ))}
                </div>

                <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">
                  {t("Daterange")}
                </p>
                <div className="flex flex-col gap-2 mb-3">
                  <label className="text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]">
                    {t("From")}
                    <input
                      type="date"
                      value={dateFrom ?? ""}
                      onChange={(e) => setDateFrom(e.target.value || null)}
                      className="mt-1 w-full px-2 py-1.5 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none"
                    />
                  </label>
                  <label className="text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]">
                    {t("To")}
                    <input
                      type="date"
                      value={dateTo ?? ""}
                      onChange={(e) => setDateTo(e.target.value || null)}
                      className="mt-1 w-full px-2 py-1.5 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none"
                    />
                  </label>
                </div>

                {(statusFilter !== "All" || dateFrom || dateTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("All");
                      setDateFrom(null);
                      setDateTo(null);
                    }}
                    className="mt-3 w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]"
                  >
                    {t("Clearfilters")}
                  </button>
                )}
          </div>
        </div>

        <div ref={datePickerRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDatePickerOpen((o) => !o)}
            className="flex pl-5 ml-5 lg:border-l border-[#FFFFFF33] items-center  gap-4"
            aria-label="Filter by date range"
          >
            <Image
              width={24}
              height={24}
              src="/assets/proicons_calendar.png"
              className="hidden dark:block"
              alt=""
            />
            <Image
              width={24}
              height={24}
              src="/assets/proicons_calendar (1).png"
              className=" dark:hidden"
              alt=""
            />
            <span className="text-sm font-normal font-ui text-[#656565] dark:text-white">
              {dateRangeLabel}
            </span>
            <span className="hidden dark:block">
              <Image
                width={13}
                height={13}
                src={"/assets/Polygon 2.svg"}
                alt=""
              />
            </span>
            <span className=" dark:hidden">
              <ArrowDown color="#65656559" />
            </span>
          </button>

          <div
            className={`absolute right-0 top-full mt-2 z-20 w-64 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-4 px-4 transition-all duration-200 ease-out origin-top ${datePickerOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
            onClick={(e) => e.stopPropagation()}
          >
                <p className="text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3">
                  {t("Daterange")}
                </p>
                <div className="flex flex-col gap-3 mb-3">
                  <label className="text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]">
                    {t("From")}
                    <input
                      type="date"
                      value={dateFrom ?? ""}
                      onChange={(e) => setDateFrom(e.target.value || null)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none"
                    />
                  </label>
                  <label className="text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]">
                    {t("To")}
                    <input
                      type="date"
                      value={dateTo ?? ""}
                      onChange={(e) => setDateTo(e.target.value || null)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none"
                    />
                  </label>
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateFrom(null);
                      setDateTo(null);
                    }}
                    className="w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]"
                  >
                    {t("Cleardates")}
                  </button>
                )}
          </div>
        </div>
      </div>
      <AssetsTable
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        displayLimit={displayLimit}
        onFilteredCount={setTotalFiltered}
        handleClick={() => {
          setOpen(true);
        }}
      />
      {hasOverflow && (
        <button
          type="button"
          onClick={() => setDisplayLimit(Number.POSITIVE_INFINITY)}
          className="
  max-w-87.25 mt-4.5 w-full mx-auto h-12
  flex items-center justify-center
  text-sm font-ui font-normal
  text-[#656565] dark:text-white
  bg-[#0000001A] dark:bg-[#FFFFFF1A]
  border border-[#FFFFFF4D]
  rounded-[20px]
  hover:bg-[#00000033] dark:hover:bg-white/20
  hover:border-white
  hover:text-black dark:hover:text-white
  transition-all duration-200
"
        >
          Load More
        </button>
      )}
    </div>
  );
}
