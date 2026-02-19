'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import i18next from '@/lib/i18n';
import { LanugageConfig } from '@/config/languageConfig';

function getFlagUrl(code: string) {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

const languages = LanugageConfig;

const LanguageDropdown = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState({
    flag: 'gb',
    language: 'en',
    name: 'English',
  });

  const onChangeLanguage = (language: any) => {
    i18next.changeLanguage(language.language);
    setLang(language);
    setOpen(false);
  };

  useEffect(() => {
    const currentLang = languages.find((l) => l.language === i18next.language);
    if (currentLang) setLang(currentLang);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
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
        <Image src="/assets/Polygon 11.png" className="mt-1" alt="" width={13} height={13} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute right-0 z-20 mt-2 w-40 max-h-[70vh] overflow-y-auto bg-white dark:bg-[#070707] border border-[#65656526] dark:border-[#374151] rounded-lg shadow-xl"
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
  );
};

export default LanguageDropdown;
