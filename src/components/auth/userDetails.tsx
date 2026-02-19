'use client';
import React, { useMemo, useState } from 'react';
import { GradientBorderGray, GradientBorderGrey } from '../ui/gradientBorder';
import Image from 'next/image';
import ArrowDown from '../icons/arrowDown';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { completeSignup, setToken } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '../ui/Loader';
import countries from 'world-countries';
import { ResidenceDropdown } from '../ui/Residence';
import { useTranslation } from 'react-i18next';
import GenericInput from '../ui/GenericInput';

const countryList = countries.map((c) => c.name.common).sort((a, b) => a.localeCompare(b));

type FinalStepProps = {
  signupToken: string;
  refCode?: string;
};

export const FinalStep = ({ signupToken, refCode }: FinalStepProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    selected !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '';

  const handleClick = async () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = t('Firstnamerequired');
    if (!lastName.trim()) errors.lastName = t('Lastnamerequired');
    if (!selected) errors.country = t('Countryresidencerequired');
    if (!password) errors.password = t('Passwordrequired');
    else if (password.length < 8) errors.password = t('Passwordleast8');
    if (!confirmPassword) errors.confirmPassword = t('confirmpassword');
    else if (password !== confirmPassword) errors.confirmPassword = t('Passwordsnotmatch');
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (errors.confirmPassword) toast.error(t('Passwordsnotmatch'));
      else toast.error(t('fillallrequiredfields'));
      return;
    }

    setLoading(true);
    try {
      const data = await completeSignup({
        signupToken,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: selected,
        password,
        ref: refCode,
      });
      setToken(data.token);
      await refreshUser();
      router.push('/dashboard?signup=success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('Accountcreationfailed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    return countryList.filter((country) => country.toLowerCase().includes(search.toLowerCase()));
  }, [countryList, search]);
  return (
    <div className="max-w-sm max-lg:px-6 mx-auto w-full pb-12 lg:py-12">
      <div className="">
        {/* Header */}

        <div className="flex bg-[#F1F1FE] rounded-[9px] border border-[#65656526] dark:border-transparent px-2 dark:px-0 py-6 dark:py-0 dark:bg-transparent flex-col gap-4.75">
          <div className="dark:hidden pl-3.5 text-[#656565] font-normal text-sm font-ui">Final Step</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 dark:lg:grid-cols-1  gap-2.5">
            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="signup-first-name"
                className="text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]"
              >
                {t('FirstName')}
              </label>

              <GenericInput
                type="text"
                placeholder={t('EnterFirstName')}
                id="signup-first-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFieldErrors((e) => ({ ...e, firstName: '' }));
                }}
                required
              />

              {fieldErrors.firstName && <p className="text-red-400 text-sm font-ui pl-3.5">{fieldErrors.firstName}</p>}
            </div>
            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="signup-last-name"
                className="text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]"
              >
                {t('LastName')}
              </label>
              <GenericInput
                type="text"
                placeholder={t('EnterLastName')}
                id="signup-last-name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setFieldErrors((e) => ({ ...e, lastName: '' }));
                }}
                required
              />

              {fieldErrors.lastName && <p className="text-red-400 text-sm font-ui pl-3.5">{fieldErrors.lastName}</p>}
            </div>
          </div>
          <ResidenceDropdown
            countryList={countryList}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            value={selected}
            onChange={setSelected}
          />
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor="signup-password"
              className="text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]"
            >
              {t('Password')}
            </label>
            <GenericInput
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((e) => ({ ...e, password: '' }));
              }}
              autoComplete="new-password"
              required
            />

            {fieldErrors.password && <p className="text-red-400 text-sm font-ui pl-3.5">{fieldErrors.password}</p>}
          </div>
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor="signup-confirm-password"
              className="text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]"
            >
              {t('ConfirmPassword')}
            </label>
            <GenericInput
              type={showConfirmPassword ? 'text' : 'password'}
              id="signup-confirm-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((e) => ({ ...e, confirmPassword: '' }));
              }}
              autoComplete="new-password"
              required
            />

            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-sm font-ui pl-3.5">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          <button
            type="button"
            disabled={!isFormValid || loading}
            onClick={handleClick}
            className="h-9 rounded-full flex items-center justify-center w-auto mx-auto px-10 font-normal font-ui text-sm transition-all duration-200 enabled:text-black enabled:hover:brightness-110 enabled:hover:shadow-lg disabled:bg-[#0000001A] dark:disabled:bg-[#FFFFFF1A] disabled:border disabled:border-[#FFFFFF1A] disabled:text-[#656565] dark:disabled:text-[#ffff] disabled:cursor-not-allowed"
            style={isFormValid && !loading ? { background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' } : {}}
          >
            {loading ? <Loader className="h-6 w-6 text-[#FFFFFF80]" ariaLabel="Creating account" /> : t('Continue')}
          </button>{' '}
          <p className="text-center pt-3 max-w-112 text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80] w-full mx-auto">
            {t('signingorcreating')} <br className="hidden lg:block" />
            <span className="text-[#8EDD23]">{t('TermsConditions')}</span> {t('and')}{' '}
            <span className="text-[#8EDD23]">{t('PrivacyPolicy')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
