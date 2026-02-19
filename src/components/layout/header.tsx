"use client";
import React, { useEffect, useRef, useState } from "react";
import ArrowDown from "../icons/arrowDown";
import ThemeToggle from "../ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { clearToken } from "@/lib/auth";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import i18next from "@/lib/i18n";
import { LanugageConfig } from "@/config/languageConfig";
import { useTranslation } from "react-i18next";
import LogoutIcon from "../icons/logoutIcon";
import WalletsIcon from "../icons/walletsIcon";
import ProfileIcon from "../icons/profileIcon";

// Use flagcdn.com CDN for reliable flag rendering
function getFlagUrl(code: string) {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

// Languages list comes from shared config to stay consistent
const languages = LanugageConfig;

const BackButton = () => {
  const router = useRouter();

  return (
    <button onClick={() => router.back()} className=" ">
      <Image
        width={20}
        height={18}
        src="/assets/Vector 631.svg"
        className="hidden lg:dark:block"
        alt=""
      />
      <Image
        width={20}
        height={18}
        src="/assets/Vector 63 (1).svg"
        className="hidden dark:block lg:dark:hidden"
        alt=""
      />
      <Image
        width={20}
        height={18}
        src="/assets/Vector 63 (2).svg"
        className="dark:hidden"
        alt=""
      />
    </button>
  );
};
export const Header = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [opens, setOpen] = useState(false);
  const [lang, setLang] = useState({
    flag: "gb",
    language: "en",
    name: "English",
  });
  const { open } = useSidebar();
  const { user, refreshUser } = useAuth();
  const router = useRouter();

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

  const ref = useRef(null);
  const onChangeLanguage = (language: any) => {
    i18next.changeLanguage(language.language);
    setLang(language);
    setOpen(false);
  };

  // Mapping of page titles
  const pageTitles = {
    "/bonds": t("Bonds"),
    "/invest": t("Invest"),
    "/transactions": t("Transactions"),
    "/referral": t("Referrals"),
    "/documents": t("Documents"),
    "/assets": t("Assets"),
    "/profile": t("User Profile"),
    "/wallet": t("Wallet"),
  };

  useEffect(() => {
    const currentLang = LanugageConfig.filter(
      (lang) => lang.language === i18next.language,
    );
    if (currentLang && currentLang.length) {
      setLang(currentLang[0]);
    }
  }, []);

  const titleKey = Object.keys(pageTitles).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );
  const greeting = user?.firstName
    ? `${t("Hello")} ${user.firstName} 👋`
    : "Hello John Doe 👋";
  const title = titleKey
    ? pageTitles[titleKey as keyof typeof pageTitles]
    : greeting;

  const handlelogout = () => {
    clearToken();
    refreshUser();
    router.push("/login");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="pt-6.5 px-5">
      <div className="flex justify-between items-center">
        {/* Left: Back Button + Title */}
        {titleKey ? (
          <div className="flex gap-4 items-center">
            <div className="md:hidden flex">
              <BackButton />
            </div>
            <div className="hidden md:flex">
              <BackButton />
            </div>
            <h2 className="font-medium text-[#656565] text-sm lg:text-base dark:text-white font-ui leading-tight">
              {title}
            </h2>
          </div>
        ) : (
          <h2 className="font-medium text-[#656565] text-sm lg:text-base dark:text-white font-ui leading-tight">
            {title}
          </h2>
        )}

        {/* Right Section */}
        <div data-header-desktop="" className="hidden lg:flex gap-2 items-center" style={isDesktop ? { display: 'flex' } : { display: 'none' }}>
          {/* Language Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen(!opens)}
              className="
                relative w-20 h-11.5 gap-2 text-lg
                font-medium font-ui
                text-[#65656580] dark:text-[#FFFFFF80]
                bg-[#F6F8FA] dark:bg-[#121213]
                border border-[#E9E9E9] dark:border-transparent
                hover:bg-[#ECEFF3] dark:hover:bg-[#2F2F31]
                hover:text-[#656565] dark:hover:text-white
                rounded-[9px]
                flex justify-center items-center
                transition-all duration-200
              "
            >
              <span className="ml-2">{lang.language.substring(0, 2).toUpperCase()}</span>
              <span className="ml-1">
                <Image
                  src="/assets/Polygon 11.png"
                  className="mt-1"
                  alt=""
                  width={13}
                  height={13}
                />
              </span>
            </button>

            <AnimatePresence>
              {opens && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="absolute right-0 z-10 mt-2 w-50 bg-white dark:bg-[#070707] border border-[#65656526] dark:border-[#374151] rounded-lg shadow-xl overflow-hidden"
                >
                  {languages.map((lang, index) => (
                    <motion.button
                      key={lang.language}
                      onClick={() => onChangeLanguage(lang)}
                      className="w-full px-4 py-2 flex items-center gap-2 text-left text-sm text-[#65656599] dark:text-white hover:text-white hover:bg-[#374151] transition-colors"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                    >
                      <img
                        src={getFlagUrl(lang.flag)}
                        alt={`${lang.name} flag`}
                        className="w-5 h-5 rounded-sm object-cover"
                      />
                      <span>{lang.name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Sign Up Button */}
          <button
            onClick={() => router.push('/profile')}
            className="relative w-13 h-11.5 bg-[#F6F8FA] dark:bg-[#121213] border border-[#E9E9E9] dark:border-none hover:bg-[#ECEFF3] dark:hover:bg-[#2F2F31] rounded-[9px] flex justify-center items-center transition-all duration-200 cursor-pointer"
          >
            <span className="hidden dark:block">
              <ProfileIcon theme="dark" width={24} height={24} />
            </span>
            <span className=" dark:hidden">
              <ProfileIcon theme="light" width={24} height={24} />
            </span>
          </button>
          <button
            onClick={() => router.push('/wallet')}
            className="relative w-13 h-11.5 bg-[#F6F8FA] dark:bg-[#121213] border border-[#E9E9E9] dark:border-none hover:bg-[#ECEFF3] dark:hover:bg-[#2F2F31] rounded-[9px] flex justify-center items-center transition-all duration-200 cursor-pointer"
          >
            <span className="hidden dark:block">
              <WalletsIcon theme="dark" width={24} height={24} />
            </span>
            <span className=" dark:hidden">
              <WalletsIcon theme="light" width={24} height={24} />
            </span>
          </button>
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

          {/* <ThemeToggle /> */}

          {/* Sidebar toggle buttons */}
          {/* <button
            onClick={open}
            className="flex items-center justify-center w-11.5 h-11.5 rounded-[7px] bg-[#F6F8FA] border-[#E9E9E9] dark:bg-[#121213] dark:border-none 2xl:hidden"
          >
            <Image width={24} height={41} src="/assets/Group 1597884924.png" alt="" />
          </button> */}
        </div>

        {/* Mobile Sidebar toggle */}
        <button data-header-mobile="" onClick={open} className="lg:hidden" style={isDesktop ? { display: 'none' } : undefined}>
          <Image width={24} height={41} src="/assets/whiteMenu.svg" alt="" />
        </button>
      </div>
    </div>
  );
};
