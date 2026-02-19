'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ArrowDown from '../icons/arrowDown';
import { useTranslation } from 'react-i18next';

interface Props {
  countryList: string[];
  fieldErrors: { country?: string };
  setFieldErrors: (errors: any) => void;
  /** Controlled: selected country value (e.g. from parent state). */
  value?: string;
  /** Called when user selects a country so parent can update its state. */
  onChange?: (country: string) => void;
}

export function ResidenceDropdown({ countryList, fieldErrors, setFieldErrors, value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typed, setTyped] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value !== undefined ? value : internalSelected;
  const setSelected = (country: string) => {
    if (value === undefined) setInternalSelected(country);
    onChange?.(country);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
        setTyped('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to key presses when dropdown is open
  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.length === 1 && /^[a-zA-Z ]$/.test(e.key)) {
        setTyped((prev) => prev + e.key);
      } else if (e.key === 'Backspace') {
        setTyped((prev) => prev.slice(0, -1));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [open]);

  // Filter countries based on typed letters or search input
  const filteredCountries = useMemo(() => {
    const filterText = typed || search;
    if (!filterText) return countryList;
    return countryList.filter((c) => c.toLowerCase().startsWith(filterText.toLowerCase()));
  }, [typed, search, countryList]);

  return (
    <div className="flex flex-col gap-3 relative" ref={containerRef}>
      <label htmlFor="country" className="text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]">
        {t('CountryofResidence')}
      </label>

      {/* Select box */}
      <div
        role="combobox"
        aria-expanded={open}
        id="country"
        onClick={() => {
          setOpen((prev) => !prev);
          setFieldErrors((e: any) => ({ ...e, country: '' }));
        }}
        className="bg-white border dark:border-transparent border-[#65656526] dark:bg-[#111111] h-9 px-4 rounded-full flex items-center justify-between cursor-pointer text-sm font-ui font-normal"
      >
        <span className="text-[#65656566] dark:text-[#FFFFFFA6]">{selected || t('SelectCountry')}</span>
        <ArrowDown />
      </div>

      {fieldErrors.country && <p className="text-red-400 text-sm font-ui pl-3.5">{fieldErrors.country}</p>}

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-full mt-2 w-full border border-[#65656526] dark:border-transparent dark:text-white text-[#65656566] bg-white dark:bg-[#323234]  rounded-[9px] shadow-lg z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Country list */}
            <div className="max-h-52 overflow-y-auto overflow-x-hidden">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country, index) => (
                  <motion.div
                    key={country}
                    role="option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(country);
                      setOpen(false);
                      setSearch('');
                      setTyped('');
                    }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.4, delay: index * 0.01 }}
                    className="px-4 py-2 text-white hover:bg-[#3f3f42] cursor-pointer"
                  >
                    {country}
                  </motion.div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[#FFFFFF66]">{t('Nocountryfound')}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
