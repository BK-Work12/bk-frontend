'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, AsYouType, getExampleNumber } from 'libphonenumber-js';
import type { CountryCode, Examples } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Country {
  code: string;
  country: string;
  dialCode: string;
}

function getFlagUrl(code: string) {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onFullChange?: (fullDigits: string) => void;
  /** User's country from profile (country name or 2-letter code). When set, used instead of IP. */
  userCountry?: string;
  height?: string;
}

/** Get the max national number digit length for a given country code */
function getMaxNationalDigits(cc: string): number {
  try {
    const example = getExampleNumber(cc as CountryCode, examples as unknown as Examples);
    if (example) {
      // Allow 1 extra digit for flexibility (some countries accept variable lengths)
      return example.nationalNumber.length + 1;
    }
  } catch { /* fallback */ }
  // Fallback: generous max
  return 15;
}

function countryNameOrCodeToCode(countries: Country[], userCountry: string): string | null {
  if (!userCountry?.trim()) return null;

  const trimmed = userCountry.trim();

  if (trimmed.length === 2 && /^[A-Za-z]{2}$/.test(trimmed)) {
    const byCode = countries.find((c) => c.code === trimmed.toUpperCase());
    return byCode ? byCode.code : null;
  }

  const byName = countries.find((c) => c.country.toLowerCase() === trimmed.toLowerCase());

  return byName ? byName.code : null;
}

export function PhoneInput({ value, onChange, onFullChange, height, userCountry }: PhoneInputProps) {
  // 🚫 Countries we never want to show
  const BLOCKED_COUNTRIES = ['AC']; // Ascension Island

  const { t } = useTranslation();
  const countries: Country[] = useMemo(() => {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    return getCountries()
      .filter((code) => !BLOCKED_COUNTRIES.includes(code))
      .map((code) => ({
        code,
        country: regionNames.of(code) || code,
        dialCode: `+${getCountryCallingCode(code)}`,
      }));
  }, []);

  const [selectedCountry, setSelectedCountry] = useState<string>('GB');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userPickedCountryRef = useRef(false);

  const country = countries.find((c) => c.code === selectedCountry);
  const dialDigits = (country?.dialCode ?? '').replace(/\D/g, '');

  // Filter countries based on search
  const filteredCountries = useMemo(
    () =>
      countries.filter((c) => c.country.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search)),
    [search, countries],
  );

  /** Initial country: from userCountry if provided, else detect from IP.
   *  Never overwrite after user picks manually.
   */
  useEffect(() => {
    const codeFromUser = countryNameOrCodeToCode(countries, userCountry ?? '');

    if (codeFromUser) {
      setSelectedCountry(codeFromUser);
      return;
    }

    async function detectCountry() {
      try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();

        if (
          data?.success &&
          data?.country_code &&
          !userPickedCountryRef.current &&
          !BLOCKED_COUNTRIES.includes(data.country_code)
        ) {
          setSelectedCountry(data.country_code);
        }
      } catch (e) {
        console.error('IP detection failed', e);
      }
    }

    detectCountry();
  }, [userCountry, countries]);

  /** Emit full E.164 digits */
  useEffect(() => {
    const full = dialDigits + (value || '').replace(/\D/g, '');
    onFullChange?.(full);
  }, [dialDigits, value, onFullChange]);

  /** On paste: if pasted text is a full number (international or national),
   *  set country and national part.
   */
  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = (e.clipboardData.getData('text/plain') || '').trim();

    if (!pasted) return;

    const parsed = parsePhoneNumberFromString(pasted, selectedCountry as CountryCode);

    if (parsed?.country && !BLOCKED_COUNTRIES.includes(parsed.country)) {
      e.preventDefault();
      userPickedCountryRef.current = true;
      setSelectedCountry(parsed.country);
      onChange(parsed.nationalNumber);
    }
  };

  /** Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">
        {t('Telephone')}
      </label>

      <div
        ref={dropdownRef}
        data-phone-container
        className={`flex relative gap-2.5 items-center h-9 bg-white border border-[#65656526] dark:border-transparent ${height ? 'dark:bg-[#1E1E2080]' : 'dark:bg-[#111111]'} text-sm rounded-full font-ui font-normal px-4`}
      >
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex shrink-0 items-center gap-2 focus:outline-none border-none bg-transparent p-0"
        >
          <Image
            width={26}
            height={26}
            src={getFlagUrl(selectedCountry)}
            alt={`${country?.country} flag`}
            className="w-6.5 h-6.5 object-cover rounded-full"
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{
                duration: 0.12,
                ease: 'easeOut',
              }}
              className="absolute top-full shadow-lg left-0 mt-2 w-full bg-white border-[#65656526] border dark:border-transparent dark:bg-[#272727] rounded-md z-50 overflow-hidden"
            >
              <div className="px-2">
                <input
                  type="text"
                  placeholder="Search country"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-2 rounded-md placeholder:text-[#656565A6]   dark:placeholder:text-[#FFFFFF66] outline-none bg-transparent border-none text-[#656565A6] dark:text-[#FFFFFFA6]"
                />
              </div>

              <div className="max-h-80 overflow-y-auto">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      userPickedCountryRef.current = true;
                      setSelectedCountry(c.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F1F1FE] dark:hover:bg-[#323232] transition-colors text-left border-b border-[#65656526] dark:border-[#1E1E20] last:border-b-0"
                  >
                    <Image
                      width={24}
                      height={16}
                      src={getFlagUrl(c.code)}
                      alt={`${c.country} flag`}
                      className="w-6 h-4 object-cover rounded-sm "
                    />
                    <span className="flex-1 text-[#656565A6] dark:text-white">{c.country}</span>
                    <span className="text-[#65656566] dark:text-[#FFFFFF66] text-sm">{c.dialCode}</span>
                  </button>
                ))}

                {filteredCountries.length === 0 && (
                  <div className="px-4 py-2 text-gray-400 text-sm">{t('Noresultsfound')}</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <span className="text-[#656565A6] dark:text-[#FFFFFFA6] whitespace-nowrap text-sm">{country?.dialCode}</span>

        <input
          type="tel"
          inputMode="tel"
          placeholder={t('Enter Telephone')}
          value={value}
          onChange={(e) => {
            // Extract only digits from input
            let digits = e.target.value.replace(/[^0-9]/g, '');

            // Enforce max national number length for the selected country
            const maxLen = getMaxNationalDigits(selectedCountry);
            if (digits.length > maxLen) {
              digits = digits.slice(0, maxLen);
            }

            if (!digits) {
              onChange('');
              return;
            }

            // Format using AsYouType: feed full international number then strip country code
            try {
              const dialCode = country?.dialCode ?? '';
              const formatter = new AsYouType(selectedCountry as CountryCode);
              const formatted = formatter.input(dialCode + digits);
              // Strip the country code prefix and leading space
              let national = formatted;
              if (national.startsWith(dialCode)) {
                national = national.slice(dialCode.length).trim();
              } else if (national.startsWith('+')) {
                // If AsYouType prepended a different code, use raw digits
                national = digits;
              }
              onChange(national || digits);
            } catch {
              onChange(digits);
            }
          }}
          onPaste={handlePhonePaste}
          className="placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFF66] outline-none bg-transparent border-none flex-1 text-[#656565A6] dark:text-[#FFFFFFA6]"
        />
      </div>
    </div>
  );
}
