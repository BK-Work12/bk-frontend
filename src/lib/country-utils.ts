// country-utils.ts
import { CountryCode, getCountries, getCountryCallingCode } from 'libphonenumber-js';

export interface CountryOption {
  code: string;
  label: string;
  dialCode: string;
  icon: string;
}

/**
 * Flag CDN helper
 * Uses PNG for better Next.js compatibility
 */
export function getFlagUrl(code: string) {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

export function buildCountries(): CountryOption[] {
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  return getCountries().map((code) => {
    const upperCode = code.toUpperCase() as CountryCode;

    return {
      code: upperCode,
      label: regionNames.of(upperCode) || upperCode,
      dialCode: `+${getCountryCallingCode(upperCode)}`,
      icon: getFlagUrl(upperCode),
    };
  });
}
