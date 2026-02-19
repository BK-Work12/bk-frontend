"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import DashboardIcon from "../icons/dashboardIcon";
import InvestIcon from "../icons/investIcon";
import AssetsIcon from "../icons/assetsIcon";
import ReferralIcon from "../icons/referalIcon";
import DocumentsIcon from "../icons/documentIcon";
import TransactionIcon from "../icons/transactionIcon";
import { usePathname, useRouter } from "next/navigation";
import SettingIcon from "../icons/settingsIcon";
import MenuIcon from "../icons/menuIcon";
import { useSidebar } from "@/context/SidebarContext";
import ThemeToggle from "../ThemeToggle";
import WalletIcon from "../icons/walletIcon";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { GradientSideBorderGray } from "../ui/gradientBorder";
import LogoutIcon from "../icons/logoutIcon";
import { clearToken } from "@/lib/auth";
import { APP_VERSION } from "@/lib/version";

/** Routes that require Step 2 (personal + wallet) and Step 3 (identity verification) complete. */
const RESTRICTED_ROUTES = ["/wallet"];

export const Sidebar = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();
  const { user, step2Complete, refreshUser, openFinishSetupModal } = useAuth();

  /* JS-based lg breakpoint detection – bulletproof for Safari */
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const initials =
    (user?.firstName?.[0] || "") +
    (user?.lastName?.[0] || (!user?.firstName && user?.email?.[0]) || "");
  const displayInitials = initials || "JD";
  const displayName =
    (user && `${user.firstName} ${user.lastName}`.trim()) || user?.email;

  const menuItems = [
    {
      label: t("Dashboard"),
      href: "/dashboard",
      icon: DashboardIcon,
    },
    {
      label: t("Invest"),
      href: "/invest",
      icon: InvestIcon,
    },
    {
      label: t("Wallet"),
      href: "/wallet",
      icon: WalletIcon,
    },
    {
      label: t("Assets"),
      href: "/assets",
      icon: AssetsIcon,
    },
    {
      label: t("Transactions"),
      href: "/transactions",
      icon: TransactionIcon,
    },
    {
      label: t("Referrals"),
      href: "/referral",
      icon: ReferralIcon,
    },
    {
      label: t("Documents"),
      href: "/documents",
      icon: DocumentsIcon,
    },
    ...(user?.role === "admin"
      ? [
          {
            label: "Admin Panel",
            href: "/admin",
            icon: SettingIcon,
          },
        ]
      : []),
  ];

  useEffect(() => {
    const routes = ["/dashboard", "/invest", "/wallet", "/assets", "/transactions", "/referral", "/documents"];
    if (user?.role === "admin") routes.push("/admin");
    routes.forEach((href) => router.prefetch(href));
  }, [router, user?.role]);

  const handleMenuClick = (href: string) => {
    router.push(href);
    if (!isDesktop) {
      setTimeout(() => close(), 50);
    }
  };

  const handlelogout = () => {
    clearToken();
    refreshUser();
    router.push("/login");
  };
  return (
    <>
      <div
        data-sidebar=""
        className={`
    fixed top-0 left-0 h-screen bg-white dark:bg-[#070707]
    flex flex-col ${isOpen ? "pt-7" : "pt-8"}  z-50
  `}
        style={{
          width: isDesktop ? 260 : 280,
          transition: 'transform 0.3s ease',
          WebkitTransition: '-webkit-transform 0.3s ease',
          transform: (isOpen || isDesktop) ? 'translateX(0)' : 'translateX(-100%)',
          WebkitTransform: (isOpen || isDesktop) ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <Link
              href={"/dashboard"}
              className="hidden dark:flex gap-3 pl-10.5 pr-4.75 items-center"
            >
              <div className="flex flex-col max-w-[28px]">
                <Image
                  className="max-w-full h-auto w-full"
                  width={1000}
                  height={1000}
                  priority
                  src="/assets/Group 1597884980.svg"
                  alt=""
                />
              </div>
              <h2 className="text-[26px] mb-0.5 font-semibold leading-[69%] font-ui text-white">
                {t("Varntix")}
              </h2>
            </Link>

            <Link
              href={"/dashboard"}
              className="flex dark:hidden pl-10.5 pr-4.75 gap-3 items-center"
            >
              <div className="flex flex-col max-w-[28px]">
                <Image
                  className="max-w-full h-auto w-full"
                  width={1000}
                  height={1000}
                  priority
                  src="/assets/Group 1597884981.svg"
                  alt=""
                />
              </div>
              <h2 className="text-[26px] mb-0.5 font-semibold leading-[69%] font-ui text-black">
                {t("Varntix")}
              </h2>
            </Link>
            <span className="pl-10.5 text-[10px] font-ui text-[#65656580] dark:text-[#FFFFFF40] mt-0.5">
              v{APP_VERSION}
            </span>
          </div>
          <div className="flex pr-4 lg:hidden gap-4 items-center">
            <ThemeToggle />
            <button
              onClick={handlelogout}
              className="relative w-13 h-11.5 bg-[#F6F8FA] dark:bg-[#121213] border border-[#E9E9E9] dark:border-none hover:bg-[#ECEFF3] dark:hover:bg-[#2F2F31] rounded-[9px] flex justify-center items-center transition-all duration-200"
            >
              <span className="hidden dark:block">
                <LogoutIcon width={24} height={24} />
              </span>
              <span className=" dark:hidden">
                <LogoutIcon color="#000000B8" width={24} height={24} />
              </span>
            </button>

            <button
              onClick={close}
              className="relative w-13 h-11.5 bg-[#F6F8FA] dark:bg-[#121213] border border-[#E9E9E9] dark:border-none hover:bg-[#ECEFF3] dark:hover:bg-[#2F2F31] rounded-[9px] flex justify-center items-center transition-all duration-200"
            >
              <span className="hidden dark:block">
                <Image
                  width={15}
                  height={15}
                  src={"/assets/Group 2.svg"}
                  alt=""
                />
              </span>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto pb-4 no-scrollbar flex-1">
          {/* Scrollable Menu */}
          <div className="flex-1 pl-4 pr-4 py-4 lg:py-12">
            <ul className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));
                const Icon = item.icon;

                return (
                  <li key={item.label}>
                    <button
                      onClick={() => handleMenuClick(item.href)}
                      className={`h-11 flex text-sm font-medium font-ui gap-3.5 items-center pl-4 w-full rounded-xl transition-all duration-150
    ${isActive ? " activeItem dark:bg-[#1E1E2080] text-white" : "text-[#00000080] dark:text-[#FFFFFF80] hover:bg-[#FFFFFF0D] hover:text-white active:bg-[#FFFFFF15] active:scale-[0.97]"}`}
                    >
                      <item.icon color={isActive ? "#FFFFFF" : "#656565"} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex  flex-col gap-4 lg:gap-10">
            {/* <Link
              href={'/profile'}
              className="h-14 flex pl-7.25 pr-4.75  text-lg font-medium text-[#00000080] dark:text-[#FFFFFF80] font-ui gap-5 items-center pl-5.75 w-full rounded-[20px] "
            >
              {' '}
              <SettingIcon color="#656565" /> Settings{' '}
            </Link> */}
            <div className="pl-4">
              <Link
                href={"/profile"}
                onClick={close}
                className={`h-11 flex text-sm font-medium font-ui gap-3.5 items-center pl-4 w-full rounded-xl transition-all duration-150 text-[#00000080] dark:text-[#FFFFFF80] hover:bg-[#FFFFFF0D] hover:text-white active:bg-[#FFFFFF15] active:scale-[0.97]`}
              >
                <SettingIcon color="#656565" />
                {t("Settings")}
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-px hidden lg:block bg-[#00000014] dark:bg-[#00000014]"></div>
              <div className="ml-4">
                <GradientSideBorderGray className="w-full max-w-[220px] shrink-0">
                  <div className="hidden h-18 lg:flex items-center w-full dark:border-transparent bg-[#f7f7f7] dark:bg-[#1E1E2080] rounded-xl glassCardLight px-3">
                    <div className="flex items-center gap-3 w-full relative">
                      {/* avatar */}
                      <div className="flex gap-2 flex-col items-center">
                        <div className="w-9 h-9 shrink-0 rounded-full text-xs text-black border border-[#65656526] dark:border-transparent bg-white flex items-center justify-center">
                          {displayInitials.toUpperCase()}
                        </div>
                        <button className="hidden dark:block">
                          <MenuIcon />
                        </button>
                        <button className="dark:hidden">
                          <MenuIcon color="#000000" />
                        </button>
                      </div>

                      {/* name + menu */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm dark:text-white text-black truncate">
                          {displayName}
                        </h2>
                        <p className="text-xs opacity-60 text-[#00000080] dark:text-[#FFFFFF80]">
                          {t("Personalaccount")}
                        </p>
                      </div>
                    </div>
                  </div>
                </GradientSideBorderGray>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
