'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ArrowDown from '../icons/arrowDown';
import { useTranslation } from 'react-i18next';

interface Props {
  countryList: string[];
  profile?: boolean;
  value?: string;
  onChange?: (country: string) => void;
}

export function CountryDropdown({ countryList, profile, value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!search) return countryList;
    return countryList.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  }, [search, countryList]);

  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      <label
        className={`${profile ? 'text-xs font-normal' : 'text-xs font-normal'} text-[#656565A6] dark:text-[#FFFFFFA6] font-ui pl-1`}
      >
        {t('Country')} <span className="text-[#53A7FF]">*</span>
      </label>

      {/* Selected / toggle */}
      <div
        onClick={() => setOpen((v) => !v)}
        className={`bg-white ${profile ? 'dark:bg-[#1E1E2080]' : 'dark:bg-[#111111]'} border border-[#65656526] dark:border-transparent px-3 h-9 rounded-full flex items-center justify-between cursor-pointer text-sm font-ui font-normal`}
      >
        <span className={`${value ? 'text-[#656565] dark:text-white' : 'text-[#656565A6] dark:text-[#FFFFFFA6]'}`}>
          {value || t('SelectCountry')}
        </span>
        <ArrowDown />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 w-full border border-[#65656526] dark:border-transparent dark:text-white text-[#65656566] bg-white dark:bg-[#1E1E20] rounded-[9px] shadow-lg z-10 max-h-60 overflow-hidden flex flex-col"
          >
            {/* Search input */}
            <div className="p-2 border-b border-[#65656514] dark:border-[#FFFFFF14]">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Search country...')}
                className="w-full px-3 py-2 text-sm bg-[#F6F8FA] dark:bg-[#272727] rounded-md outline-none text-[#656565] dark:text-white placeholder:text-[#65656580] dark:placeholder:text-[#FFFFFF66]"
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <div
                    key={country}
                    role="option"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onChange) onChange(country);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`px-4 py-2.5 hover:bg-[#F1F1FE] dark:hover:bg-[#272727] hover:text-[#656565] dark:hover:text-white cursor-pointer text-sm transition-colors ${
                      value === country ? 'bg-[#F1F1FE] dark:bg-[#272727] text-[#656565] dark:text-white font-medium' : ''
                    }`}
                  >
                    {country}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-400 text-sm">{t('Noresultsfound')}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
