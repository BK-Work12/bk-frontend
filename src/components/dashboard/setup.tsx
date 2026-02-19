"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export const Setup = () => {
  const { t } = useTranslation();
  const { step2Complete, step3Complete, user } = useAuth();
  const verificationStatus = user?.verificationStatus || "none";
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="pt-2.5 pb-1 px-1 rounded-xl dark:bg-[#FFFFFF03] border border-[#65656526] dark:border-[#40404059]">
      {/* Header row - always visible */}
      <div className="flex pl-5 pr-3 pb-1.75 justify-between items-center">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex gap-3 items-center text-start focus:outline-none group"
        >
          <span className="lg:dark:block hidden">
            <Image
              src="/assets/iconamoon_profile-fill.svg"
              width={20}
              height={20}
              alt=""
            />
          </span>
          <span className="dark:hidden lg:block">
            <Image
              src="/assets/iconamoon_profile-fill_light.svg"
              width={20}
              height={20}
              alt=""
            />
          </span>
          <span className="text-sm lg:text-base leading-tight font-medium font-ui text-[#656565] dark:text-white">
            {t("Finaliseaccountsetup")}
          </span>
          <svg
            className={`w-3.5 h-3.5 text-[#656565] dark:text-white/60 transition-transform duration-200 ${
              collapsed ? "-rotate-90" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {!step2Complete && !collapsed && (
          <Link
            href="/profile"
            className="h-9 text-black dark:text-white px-4 flex items-center gap-2 text-sm font-normal font-ui border border-[#00000066] dark:border-[#FFFFFF66] rounded-full hover:bg-white/10 hover:border-white transition-colors duration-200"
          >
            {t("Addpersonalinformation")}
            <Image
              src="/assets/Vector 97.svg"
              className="hidden lg:block"
              width={14}
              height={14}
              alt=""
            />
          </Link>
        )}
      </div>

      {/* Collapsible content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
        }`}
      >
        <div className="relative dotted-bg bg-[#F1F1FE] dark:bg-[#00000099] green-shadow pl-5 pr-3.5 py-3 gap-2.5 flex flex-col xl:flex-row xl:items-center justify-center rounded-xl">
          <Image
            src="/assets/lets-icons_check-fill.svg"
            width={20}
            height={20}
            alt=""
            className="shrink-0"
          />
          <span className="text-sm font-normal dark:text-white text-[#656565] truncate shrink-0 font-ui">
            {t("Createaccount")}
          </span>
          <div
            className={`w-[97px] xl:w-full h-0.5 ${step2Complete ? "bg-[#42DE33]" : "bg-[#F9AA4B]"}`}
          />
          {step2Complete ? (
            <Image
              src="/assets/lets-icons_check-fill.svg"
              width={20}
              height={20}
              alt=""
              className="shrink-0"
            />
          ) : (
            <span className="w-5 h-5 shrink-0 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full text-xs font-bold font-ui flex items-center justify-center leading-[100%] bg-[#F9AA4B] text-white dark:text-black">
                2
              </span>
            </span>
          )}
          <span className="text-sm font-normal dark:text-white text-[#656565] truncate shrink-0 font-ui">
            {t("PersonalInformation")}
          </span>
          <div
            className={`w-[97px] xl:w-full h-0.5 ${step3Complete ? "bg-[#42DE33]" : step2Complete ? "bg-[#F9AA4B]" : "bg-[#6C6C6C]"}`}
          />
          {step3Complete ? (
            <Image
              src="/assets/lets-icons_check-fill.svg"
              width={20}
              height={20}
              alt=""
              className="shrink-0"
            />
          ) : (
            <span className="w-5 h-5 shrink-0 flex items-center justify-center">
              <span
                className={`w-4 h-4 rounded-full text-xs font-bold font-ui flex items-center justify-center leading-[100%] ${
                  step3Complete
                    ? "bg-[#42DE33] text-white"
                    : verificationStatus === "pending"
                      ? "bg-[#F9AA4B] text-black"
                      : verificationStatus === "failed"
                        ? "bg-red-500 text-white"
                        : "bg-[#FFFFFF24] text-[#FFFFFF80]"
                }`}
              >
                3
              </span>
            </span>
          )}
          <span className="text-sm font-normal dark:text-white text-[#656565] truncate shrink-0 font-ui">
            {t("Accountverification")}
          </span>
        </div>
      </div>
    </div>
  );
};
