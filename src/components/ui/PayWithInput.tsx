'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import ArrowDown from '../icons/arrowDown';
import { AnimatePresence, motion } from 'framer-motion';
import countries from 'world-countries';

export interface CountryOption {
  code: string;
  label: string;
  icon: string;
}

interface PayWithInputProps {
  t: (key: string) => string;

  country: CountryOption;
  countryOpen: boolean;

  amount: string;

  onToggleCountry: () => void;
  onSelectCountry: (c: CountryOption) => void;
  onAmountChange: (value: string) => void;
}

function getFlagUrl(code: string) {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

export function PayWithInput({
  t,
  country,
  countryOpen,
  amount,
  onToggleCountry,
  onSelectCountry,
  onAmountChange,
}: PayWithInputProps) {
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Always generate all countries dynamically
  const allCountryOptions: CountryOption[] = useMemo(() => {
    return countries
      .filter((c) => c.cca2) // remove entries without cca2
      .map((c) => ({
        code: c.cca2,
        label: c.name.common,
        icon: getFlagUrl(c.cca2),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Filter countries by search
  const filteredCountries = useMemo(
    () =>
      allCountryOptions.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()),
      ),
    [allCountryOptions, search],
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        if (countryOpen) onToggleCountry();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [countryOpen, onToggleCountry]);

  function getCurrencyCode(countryCode: string) {
    const c = countries.find((c) => c.cca2 === countryCode);
    if (!c || !c.currencies) return 'USD'; // fallback
    return Object.keys(c.currencies)[0]; // first currency code
  }

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-3.5 font-medium text-sm font-ui">
        {t('Youpaywith')}
      </label>

      <div
        ref={dropdownRef}
        className="px-3 lg:px-4.5 py-1.5 bg-white dark:bg-[#111111] rounded-full flex gap-3 items-center relative"
      >
        <button
          onClick={onToggleCountry}
          className="max-w-16.25 relative w-full h-10.75 flex items-center gap-1.75 justify-center bg-[#323234] dark:bg-[#111111] rounded-md"
        >
          <Image width={24} height={24} src={country.icon} className="w-6 h-6" alt={country.label} />

          <span className="dark:hidden">
            <ArrowDown color="#FFFFFF59" />
          </span>
          <span className="dark:block hidden">
            <ArrowDown />
          </span>
        </button>

        {/* Dropdown with animation */}
        <AnimatePresence>
          {countryOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-1 px-5 pb-4 left-0 bg-white dark:bg-[#111111] rounded-md shadow-lg w-full z-10 max-h-80 overflow-y-auto"
            >
              <input
                type="text"
                placeholder={t('Searchcountry')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 rounded-md placeholder:text-[#656565A6] dark:placeholder:text-[#FFFFFF66] outline-none bg-transparent border-none text-black dark:text-white"
              />

              {filteredCountries.map((option) => (
                <div
                  key={option.code}
                  onClick={() => {
                    onSelectCountry(option);
                    setSearch('');
                  }}
                  className="flex items-center gap-2 p-2 cursor-pointer hover:bg-[#323232] justify-start"
                >
                  <Image width={24} height={24} src={option.icon} alt={option.label} className="w-6 h-6" />
                  <span className="text-black dark:text-white">{option.label}</span>
                </div>
              ))}

              {filteredCountries.length === 0 && (
                <div className="px-4 py-2 text-gray-400 text-sm">{t('Noresultsfound')}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="text"
          inputMode="decimal"
          placeholder={t('Enter amount') + ` (${getCurrencyCode(country.code)})`}
          value={amount}
          onChange={(e) => onAmountChange(e.target.value.replace(/[^0-9.]/g, ''))}
          className="dark:placeholder:text-[#FFFFFF66] dark:text-white text-black placeholder:text-[#656565A6] outline-none bg-transparent border-none text-sm font-ui w-full"
        />
      </div>
    </div>
  );
}
