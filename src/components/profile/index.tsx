'use client';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ArrowDown from '../icons/arrowDown';
import { GradientBorderGray } from '../ui/gradientBorder';
import { Skeleton } from '../ui/skeleton';
import { updateProfile } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { PhoneInput } from '../ui/PhoneInput';
import { Loader } from '../ui/Loader';
import { parsePhoneNumber } from 'libphonenumber-js';
import countries from 'world-countries';
import { CountryDropdown } from '../ui/CountryDropdown';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
const countryList = countries.map((c) => c.name.common).sort((a, b) => a.localeCompare(b));

/** Format raw input as DD/MM/YYYY (digits only, max 8). */
function formatDateOfBirthInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Strip country code from E.164 phone for display (national number only). */
function phoneWithoutCountryCode(phone: string): string {
  if (!phone?.trim()) return '';
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed?.nationalNumber ?? phone;
  } catch {
    return phone;
  }
}

/** Normalize stored value (e.g. YYYY-MM-DD or DD/MM/YYYY) to display DD/MM/YYYY. */
function normalizeDateOfBirthDisplay(value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return formatDateOfBirthInput(trimmed);
}

export const ProfilePageIndex = () => {
  const { t } = useTranslation();
  const { user, loading, refreshUser } = useAuth();
  const [saveLoading, setSaveLoading] = useState(false);
  const [walletSaveLoading, setWalletSaveLoading] = useState(false);
  const [residencySaveLoading, setResidencySaveLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [selected, setSelected] = useState('');
  const [networkOpen, setNetworkOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const [network, setNetwork] = useState<{ label: string; icon: string } | string>('Select Network');
  const [currency, setCurrency] = useState<{ label: string; icon: string } | string>('Select Currency');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postCode, setPostCode] = useState('');

  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [residencyErrors, setResidencyErrors] = useState<Record<string, string>>({});
  const [walletErrors, setWalletErrors] = useState<Record<string, string>>({});

  const isWalletUser = (user?.email ?? '').endsWith('@wallet.varntix.com');

  const allNetworks = [
    { label: 'Ethereum', icon: '/assets/ethereum (8) 1.svg' },
    { label: 'Tron', icon: '/assets/token-branded_tron.svg' },
    { label: 'Solana', icon: '/assets/token-branded_solanaa.svg' },
  ];

  const allCurrencies = [
    { label: 'USDT', icon: '/assets/usdt (6) 1.svg' },
    { label: 'USDC', icon: '/assets/usdc (3) 1.svg' },
  ];

  /** Networks that support each currency */
  const currencyToNetworkLabels: Record<string, string[]> = {
    USDT: ['Ethereum', 'Tron', 'Solana'],
    USDC: ['Ethereum', 'Solana'],
  };

  /** Currencies supported on each network */
  const networkToCurrencyLabels: Record<string, string[]> = {
    Ethereum: ['USDT', 'USDC'],
    Tron: ['USDT'],
    Solana: ['USDT', 'USDC'],
  };

  const getNetworksForCurrency = (currencyLabel: string) => {
    const key = (typeof currencyLabel === 'string' ? currencyLabel : (currencyLabel as { label: string }).label)?.trim() ?? '';
    const names = currencyToNetworkLabels[key] ?? [];
    return allNetworks.filter((n) => names.includes(n.label));
  };

  const getCurrenciesForNetwork = (networkLabel: string) => {
    const key = (typeof networkLabel === 'string' ? networkLabel : (networkLabel as { label: string }).label)?.trim() ?? '';
    const names = networkToCurrencyLabels[key] ?? [];
    return allCurrencies.filter((c) => names.includes(c.label));
  };

  const currentNetworkLabel = typeof network === 'object' ? network?.label : network !== 'Select Network' ? network : '';

  const currenciesToShow = currentNetworkLabel ? getCurrenciesForNetwork(currentNetworkLabel) : allCurrencies;

  const networkRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  const [networkUp, setNetworkUp] = useState(false);
  const [currencyUp, setCurrencyUp] = useState(false);

  /** Validate wallet address format for the selected network (TC-E2). */
  function validateWalletByNetwork(address: string, network: string): string | null {
    const trimmed = address.trim();
    if (!trimmed) return 'Wallet address is required';
    switch (network) {
      case 'Ethereum':
        return /^0x[a-fA-F0-9]{40}$/.test(trimmed) ? null : t('Enter a valid address');
      case 'Tron':
        return /^T[a-zA-HJ-NP-Z0-9]{33}$/.test(trimmed)
          ? null
          : t('Enter a valid Tron address (T followed by 33 characters)');
      case 'Solana':
        return trimmed.length >= 32 && trimmed.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)
          ? null
          : t('Enter a valid Solana address (32–44 base58 characters)');
      default:
        return t('Please select a network first');
    }
  }

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setEmail(user.email ?? '');
    setPhone(phoneWithoutCountryCode(user.phone ?? ''));
    setDateOfBirth(normalizeDateOfBirthDisplay(user.dateOfBirth ?? ''));
    setSelected(user.country ?? '');
    setWalletAddress(user.walletAddress ?? '');
    setNetwork(
      user.preferredNetwork
        ? (allNetworks.find((n) => n.label === String(user.preferredNetwork)) ?? String(user.preferredNetwork))
        : 'Select Network',
    );
    setCurrency(
      user.preferredCurrency
        ? (allCurrencies.find((c) => c.label === String(user.preferredCurrency)) ?? String(user.preferredCurrency))
        : 'Select Currency',
    );
    setAddressLine1(user.addressLine1 ?? '');
    setAddressLine2(user.addressLine2 ?? '');
    setCity(user.city ?? '');
    setProvince(user.province ?? '');
    setPostCode(user.postCode ?? '');
  }, [user]);

  const handleSavePersonal = async () => {
    const err: Record<string, string> = {};
    if (!dateOfBirth?.trim()) err.dateOfBirth = 'Date of birth is required';
    if (isWalletUser && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      err.email = 'Please enter a valid email address';
    }
    setPersonalErrors(err);
    if (Object.keys(err).length > 0) {
      toast.error(t('Please fill in all required fields'));
      return;
    }
    setSaveLoading(true);
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        country: selected.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
      };
      if (isWalletUser && email.trim() && !email.trim().endsWith('@wallet.varntix.com')) {
        payload.email = email.trim();
      }
      const updated = await updateProfile(payload);
      if (updated.country) setSelected(updated.country);
      await refreshUser();
      setPersonalErrors({});
      toast.success('Profile saved.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save';
      toast.error(msg);
    } finally {
      setSaveLoading(false);
    }
  };
  const handleSaveWallet = async () => {
    const err: Record<string, string> = {};

    if (!walletAddress?.trim()) err.walletAddress = t('Wallet address is required');
    if (network === 'Select Network') err.network = t('Please select a network');
    if (currency === 'Select Currency') err.currency = t('Please select a currency');

    if (walletAddress?.trim() && network !== 'Select Network') {
      const networkLabel = typeof network === 'string' ? network : network.label;
      const formatError = validateWalletByNetwork(walletAddress.trim(), networkLabel);
      if (formatError) err.walletAddress = formatError;
    }

    setWalletErrors(err);
    if (Object.keys(err).length > 0) {
      toast.error(t('Please complete wallet details and ensure address matches the selected network'));
      return;
    }

    setWalletSaveLoading(true);

    try {
      await updateProfile({
        walletAddress: walletAddress.trim() || undefined,
        preferredNetwork:
          network !== 'Select Network' ? (typeof network === 'string' ? network : network.label) : undefined,
        preferredCurrency:
          currency !== 'Select Currency' ? (typeof currency === 'string' ? currency : currency.label) : undefined,
      });

      await refreshUser();
      setWalletErrors({});
      toast.success('Wallet saved.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save';
      toast.error(msg);
    } finally {
      setWalletSaveLoading(false);
    }
  };

  const handleSaveResidency = async () => {
    const err: Record<string, string> = {};
    if (!addressLine1?.trim()) err.addressLine1 = 'Address line 1 is required';
    if (!city?.trim()) err.city = 'City is required';
    if (!postCode?.trim()) err.postCode = 'Post/Zip code is required';
    setResidencyErrors(err);
    if (Object.keys(err).length > 0) {
      toast.error(t('Please fill in all required address fields'));
      return;
    }
    setResidencySaveLoading(true);
    try {
      await updateProfile({
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        postCode: postCode.trim() || undefined,
        country: selected.trim() || undefined,
      });
      await refreshUser();
      setResidencyErrors({});
      toast.success('Residency saved.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save';
      toast.error(msg);
    } finally {
      setResidencySaveLoading(false);
    }
  };

  const handleCopy = () => {
    const text = walletAddress || '0x';
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t('Wallet Address copied'));

    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (!networkOpen || !networkRef.current) return;
    const rect = networkRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setNetworkUp(spaceBelow < 200);
  }, [networkOpen]);

  useEffect(() => {
    if (!currencyOpen || !currencyRef.current) return;
    const rect = currencyRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setCurrencyUp(spaceBelow < 200);
  }, [currencyOpen]);

  if (loading) {
    return (
      <div className="flex flex-col xl:flex-row gap-2 max-w-6xl">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="dark:bg-[#FFFFFF05] bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059] rounded-xl p-3 lg:p-4">
            <h2 className="text-sm font-normal font-ui text-[#656565] dark:text-white leading-tight mb-3">
              {t('PersonalDetails')}
            </h2>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('FirstName')}</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('LastName')}</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('DateofBirth')}</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('Telephone')}</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('EmailAddress')}</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <button type="button" disabled className="h-8 text-xs font-normal font-ui rounded-full px-8 text-black disabled:opacity-60 cursor-not-allowed" style={{ background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }}>
                {t('SaveChanges')}
              </button>
            </div>
          </div>

          <div className="dark:bg-[#FFFFFF05] bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059] rounded-xl p-3 lg:p-4">
            <h2 className="text-sm font-normal font-ui text-[#656565] dark:text-white leading-tight mb-3">
              {t('ReceivingWallet')}
            </h2>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('WalletAddress')}</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('Network')}</label>
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('Currency')}</label>
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <button type="button" disabled className="h-8 text-xs font-normal font-ui rounded-full px-8 text-black disabled:opacity-60 cursor-not-allowed" style={{ background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }}>
                {t('SaveChanges')}
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="dark:bg-[#FFFFFF05] bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059] rounded-xl p-3 lg:p-4">
            <h2 className="text-sm font-normal font-ui text-[#656565] dark:text-white leading-tight mb-3">
              {t('ResidencyInformation')}
            </h2>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('AddressLine')} 1 *</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('AddressLine')} 2</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('City')} *</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('Province')}</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('Country')} *</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1">{t('Post/ZipCode')} *</label>
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <button type="button" disabled className="h-8 text-xs font-normal font-ui rounded-full px-8 text-black disabled:opacity-60 cursor-not-allowed" style={{ background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }}>
                {t('SaveChanges')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = "bg-white dark:bg-[#1E1E2080] border border-[#65656526] dark:border-transparent h-9 rounded-full px-3 text-sm font-ui font-normal outline-none text-black dark:text-white placeholder:text-[#656565A6] dark:placeholder:text-[#FFFFFF66] w-full";
  const labelCls = "text-xs font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6] pl-1";

  return (
    <div className="flex flex-col xl:flex-row gap-2 max-w-6xl">
      {/* Left column: Personal Details + Wallet */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Personal Details */}
        <div className="dark:bg-[#FFFFFF05] bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059] rounded-xl p-3 lg:p-4">
          <h2 className="text-sm leading-tight font-normal font-ui text-[#656565] dark:text-white mb-3">
            {t('PersonalDetails')}
          </h2>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="profile-first-name" className={labelCls}>{t('FirstName')}</label>
              <input id="profile-first-name" type="text" placeholder={t('EnterFirstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="profile-last-name" className={labelCls}>{t('LastName')}</label>
              <input id="profile-last-name" type="text" placeholder={t('EnterLastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="profile-dob" className={labelCls}>{t('DateofBirth')}</label>
              <input id="profile-dob" type="text" inputMode="numeric" autoComplete="bday" placeholder="DD/MM/YYYY" maxLength={10} value={dateOfBirth} onChange={(e) => { const formatted = formatDateOfBirthInput(e.target.value); setDateOfBirth(formatted); if (personalErrors.dateOfBirth) setPersonalErrors((p) => ({ ...p, dateOfBirth: '' })); }} className={`${inputCls} ${personalErrors.dateOfBirth ? 'ring-2 ring-red-500' : ''}`} />
              {personalErrors.dateOfBirth && <p className="text-xs text-red-500 font-ui pl-1">{personalErrors.dateOfBirth}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <PhoneInput value={phone} onChange={setPhone} userCountry={user?.country} />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label htmlFor="profile-email" className={labelCls}>{t('EmailAddress')}{isWalletUser && ' *'}</label>
              {isWalletUser ? (
                <>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (personalErrors.email) setPersonalErrors((p) => ({ ...p, email: '' })); }}
                    placeholder="Enter your email address"
                    className={`${inputCls} ${personalErrors.email ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {personalErrors.email && <p className="text-xs text-red-500 font-ui pl-1">{personalErrors.email}</p>}
                  {email.endsWith('@wallet.varntix.com') && (
                    <p className="text-xs text-[#53A7FF] font-ui pl-1">{t('Please update to your real email address')}</p>
                  )}
                </>
              ) : (
                <input id="profile-email" type="text" value={email} readOnly className={`${inputCls} text-[#656565A6] dark:text-[#FFFFFFA6]`} />
              )}
            </div>
          </div>
          <div className="flex justify-center mt-3">
            <button type="button" onClick={handleSavePersonal} disabled={saveLoading} className="h-8 text-xs font-normal font-ui rounded-full px-8 text-black hover:brightness-110 transition-all disabled:opacity-60" style={{ background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }}>
              {saveLoading ? <Loader className="h-4 w-4 text-white" ariaLabel="Saving profile" /> : t('SaveChanges')}
            </button>
          </div>
        </div>

        {/* Receiving Wallet */}
        <div className="dark:bg-[#FFFFFF05] bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059] rounded-xl p-3 lg:p-4">
          <h2 className="text-sm leading-tight font-normal font-ui text-[#656565] dark:text-white mb-3">
            {t('ReceivingWallet')}
          </h2>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="profile-wallet" className={labelCls}>{t('WalletAddress')}</label>
              <div className={`flex items-center gap-2 bg-white dark:bg-[#1E1E2080] border border-[#65656526] dark:border-transparent h-9 rounded-full px-3 ${walletErrors.walletAddress ? 'ring-2 ring-red-500' : ''}`}>
                <input id="profile-wallet" type="text" placeholder="Enter wallet address" value={walletAddress} onChange={(e) => { setWalletAddress(e.target.value); if (walletErrors.walletAddress) setWalletErrors((w) => ({ ...w, walletAddress: '' })); }} className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-ui text-black dark:text-white placeholder:text-[#656565A6] dark:placeholder:text-[#FFFFFF66] truncate" />
                <button type="button" onClick={async () => { try { const text = await navigator.clipboard.readText(); setWalletAddress(text); } catch (err) { console.error('Failed to read clipboard: ', err); } }} className="px-3 h-6 flex gap-1.5 items-center shrink-0 border border-[#65656526] dark:border-[#FFFFFF4D] rounded-full bg-[#6565651A] dark:bg-[#FFFFFF1A] text-xs font-ui text-[#656565] dark:text-white hover:bg-[#FFFFFF33] transition-all">
                  {t('Paste')}
                  <Image width={12} height={12} priority className="dark:block hidden" src="/assets/solar_copy-outline.svg" alt="" />
                  <Image width={12} height={12} priority className="dark:hidden" src="/assets/solar_copy-outline_light.svg" alt="" />
                </button>
              </div>
              {walletErrors.walletAddress && <p className="text-xs text-red-500 font-ui pl-1">{walletErrors.walletAddress}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Network */}
              <div className="flex flex-col gap-1 relative">
                <label className={labelCls}>{t('Network')}</label>
                <div onClick={() => { setNetworkOpen(!networkOpen); if (walletErrors.network) setWalletErrors((w) => ({ ...w, network: '' })); }} className={`flex cursor-pointer h-9 items-center justify-between bg-white dark:bg-[#1E1E2080] border border-[#65656526] dark:border-transparent rounded-full px-3 text-sm font-ui text-[#656565A6] dark:text-white ${walletErrors.network ? 'ring-2 ring-red-500' : ''}`}>
                  <div className="flex gap-2 items-center">
                    {network !== 'Select Network' && (
                      <Image width={18} height={18} src={typeof network === 'object' ? network.icon : (allNetworks.find((n) => n.label === network)?.icon ?? '')} className="w-4.5 h-4.5 rounded-sm" alt="" />
                    )}
                    <span className="truncate">{typeof network === 'string' ? network : network.label}</span>
                  </div>
                  <ArrowDown color="#FFFFFF59" />
                </div>
                <AnimatePresence>
                  {networkOpen && (
                    <motion.div key="network-dropdown" ref={networkRef} initial={{ opacity: 0, scaleY: 0.95 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0.95 }} transition={{ duration: 0.15 }} style={{ transformOrigin: networkUp ? 'bottom' : 'top' }} className={`absolute w-full bg-white dark:bg-[#272727] rounded-lg overflow-hidden z-10 shadow-lg ${networkUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                      {allNetworks.map((item) => (
                        <div key={item.label} onClick={() => { setNetwork(item); setNetworkOpen(false); setWalletErrors((w) => ({ ...w, walletAddress: '' })); const validCurrencies = getCurrenciesForNetwork(item.label); const currentCur = typeof currency === 'object' ? currency?.label : currency; if (currentCur !== 'Select Currency' && currentCur && !validCurrencies.some((c) => c.label === currentCur)) { setCurrency(validCurrencies[0] ?? 'Select Currency'); } }} className="px-3 py-2 flex gap-2 items-center text-sm font-ui text-[#656565] dark:text-white hover:bg-[#F1F1FE] dark:hover:bg-[#1E1E20] cursor-pointer">
                          <Image width={18} height={18} src={item.icon} className="w-4.5 h-4.5" alt={item.label} />
                          {item.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {walletErrors.network && <p className="text-xs text-red-500 font-ui pl-1">{walletErrors.network}</p>}
              </div>
              {/* Currency */}
              <div className="flex flex-col gap-1 relative">
                <label className={labelCls}>{t('PayoutCurrency')}</label>
                <div onClick={() => { setCurrencyOpen(!currencyOpen); if (walletErrors.currency) setWalletErrors((w) => ({ ...w, currency: '' })); }} className={`flex cursor-pointer h-9 items-center justify-between bg-white dark:bg-[#1E1E2080] border border-[#65656526] dark:border-transparent rounded-full px-3 text-sm font-ui text-[#656565A6] dark:text-white ${walletErrors.currency ? 'ring-2 ring-red-500' : ''}`}>
                  <div className="flex gap-2 items-center">
                    {currency !== 'Select Currency' && (
                      <Image width={18} height={18} src={typeof currency === 'object' ? currency.icon : (allCurrencies.find((c) => c.label === currency)?.icon ?? '')} className="w-4.5 h-4.5 rounded-sm" alt="" />
                    )}
                    <span className="truncate">{typeof currency === 'string' ? currency : currency.label}</span>
                  </div>
                  <ArrowDown color="#FFFFFF59" />
                </div>
                <AnimatePresence>
                  {currencyOpen && (
                    <motion.div key="currency-dropdown" ref={currencyRef} initial={{ opacity: 0, scaleY: 0.95 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0.95 }} transition={{ duration: 0.15 }} style={{ transformOrigin: currencyUp ? 'bottom' : 'top' }} className={`absolute w-full bg-white dark:bg-[#272727] rounded-lg overflow-hidden z-10 shadow-lg ${currencyUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                      {currenciesToShow.map((item) => (
                        <div key={item.label} onClick={() => { setCurrency(item); setCurrencyOpen(false); const validNetworks = getNetworksForCurrency(item.label); const currentNet = typeof network === 'object' ? network?.label : network; if (currentNet !== 'Select Network' && currentNet && !validNetworks.some((n) => n.label === currentNet)) { setNetwork(validNetworks[0] ?? 'Select Network'); } }} className="px-3 py-2 flex gap-2 items-center text-sm font-ui text-[#656565] dark:text-white hover:bg-[#F1F1FE] dark:hover:bg-[#1E1E20] cursor-pointer">
                          <Image width={18} height={18} src={item.icon} className="w-4.5 h-4.5" alt={item.label} />
                          {item.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {walletErrors.currency && <p className="text-xs text-red-500 font-ui pl-1">{walletErrors.currency}</p>}
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            <button type="button" onClick={handleSaveWallet} disabled={walletSaveLoading} className="h-8 text-xs font-normal font-ui rounded-full px-8 text-black hover:brightness-110 transition-all disabled:opacity-60" style={{ background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }}>
              {walletSaveLoading ? <Loader className="h-4 w-4 text-white" ariaLabel="Saving wallet" /> : t('SaveChanges')}
            </button>
          </div>
        </div>
      </div>

      {/* Right column: Residency */}
      <div className="flex-1 min-w-0">
        <div className="dark:bg-[#FFFFFF05] bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059] rounded-xl p-3 lg:p-4">
          <h2 className="text-sm leading-tight font-normal font-ui text-[#656565] dark:text-white mb-3">
            {t('ResidencyInformation')}
          </h2>
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <div className="col-span-2 flex flex-col gap-1">
                <label htmlFor="profile-address1" className={labelCls}>{t('AddressLine')} 1 *</label>
                <input id="profile-address1" type="text" value={addressLine1} onChange={(e) => { setAddressLine1(e.target.value); if (residencyErrors.addressLine1) setResidencyErrors((r) => ({ ...r, addressLine1: '' })); }} className={`${inputCls} ${residencyErrors.addressLine1 ? 'ring-2 ring-red-500' : ''}`} placeholder={t('Enter Address Line 1')} />
                {residencyErrors.addressLine1 && <p className="text-xs text-red-500 font-ui pl-1">{residencyErrors.addressLine1}</p>}
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label htmlFor="profile-address2" className={labelCls}>{t('AddressLine')} 2</label>
                <input id="profile-address2" type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={inputCls} placeholder={t('Enter Address Line 2')} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-city" className={labelCls}>{t('City')} *</label>
                <input id="profile-city" type="text" value={city} onChange={(e) => { setCity(e.target.value); if (residencyErrors.city) setResidencyErrors((r) => ({ ...r, city: '' })); }} className={`${inputCls} ${residencyErrors.city ? 'ring-2 ring-red-500' : ''}`} placeholder={t('EnterCity')} />
                {residencyErrors.city && <p className="text-xs text-red-500 font-ui pl-1">{residencyErrors.city}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-province" className={labelCls}>{t('Province')}</label>
                <input id="profile-province" type="text" value={province} onChange={(e) => { setProvince(e.target.value); if (residencyErrors.province) setResidencyErrors((r) => ({ ...r, province: '' })); }} className={`${inputCls} ${residencyErrors.province ? 'ring-2 ring-red-500' : ''}`} placeholder={t('EnterProvince')} />
              </div>
              <div className="flex flex-col gap-1">
                <CountryDropdown profile={true} countryList={countryList} value={selected} onChange={setSelected} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-postcode" className={labelCls}>{t('Post/ZipCode')} *</label>
                <input id="profile-postcode" type="text" value={postCode} onChange={(e) => { setPostCode(e.target.value); if (residencyErrors.postCode) setResidencyErrors((r) => ({ ...r, postCode: '' })); }} className={`${inputCls} ${residencyErrors.postCode ? 'ring-2 ring-red-500' : ''}`} placeholder={t('EnterPostZipCode')} />
                {residencyErrors.postCode && <p className="text-xs text-red-500 font-ui pl-1">{residencyErrors.postCode}</p>}
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            <button type="button" onClick={handleSaveResidency} disabled={residencySaveLoading} className="h-8 text-xs font-normal font-ui rounded-full px-8 text-black hover:brightness-110 transition-all disabled:opacity-60" style={{ background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' }}>
              {residencySaveLoading ? <Loader className="h-4 w-4 text-white" ariaLabel="Saving residency" /> : t('SaveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
