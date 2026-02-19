'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

export const HomeHeader = () => {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* JS-based lg breakpoint detection – Safari fallback */
  const [isDesktopLg, setIsDesktopLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktopLg(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const [hasScrolled, setHasScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setHasScrolled(y > 0);
      setPastHero(y >= window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = ['EN', 'FR', 'DE', 'ES'];

  /* Color logic */
  const textColor = !hasScrolled ? 'text-white' : pastHero ? 'text-black' : 'text-white';

  const dividerColor = !hasScrolled ? 'bg-white/30' : pastHero ? 'bg-black/20' : 'bg-white/30';

  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 z-50 w-full px-2 py-4 xl:pt-3 transition-all duration-300">
        <div
          className={`
            absolute left-0 top-0 z-0 h-10 w-full
            transition-all duration-300
            ${hasScrolled && !pastHero ? 'bg-black/40 backdrop-blur-sm' : ''}
            ${pastHero ? 'bg-white/60 backdrop-blur-sm' : ''}
          `}
        />

        <div
          className={`
            pointer-events-auto relative z-20 rounded-lg w-full px-4 3xl:px-10
            transition-all duration-300
            ${hasScrolled ? 'backdrop-blur-md' : ''}
            ${hasScrolled && !pastHero ? 'bg-black/50' : ''}
            ${pastHero ? 'bg-white/70 border border-[hsla(0,0%,60%,0.08)]' : ' border border-transparent'}
          `}
        >
          <div className="max-w-439 w-full mx-auto flex justify-between items-center">
            <Link href="/" className="flex gap-4 h-17.25 items-center">
              <Image
                width={26.01761817932129}
                height={30.90235710144043}
                src={!hasScrolled || !pastHero ? '/assets/logoSingle.svg' : '/assets/logoSingleBlack.svg'}
                alt=""
                className=" lg:hidden"
              />
              <Image
                width={40}
                height={40}
                src={!hasScrolled || !pastHero ? '/assets/logoSingle.svg' : '/assets/logoSingleBlack.svg'}
                alt=""
                className="hidden lg:block"
              />
              <h2
                className={`text-[37.55px] mb-1 hidden lg:block font-semibold leading-[69%] font-display ${textColor}`}
              >
                Varntix
              </h2>
            </Link>

            {/* Mobile title */}
            <h2 className={`text-[24px] block lg:hidden font-semibold leading-[69%] font-display ${textColor}`} style={isDesktopLg ? { display: 'none' } : undefined}>
              Varntix
            </h2>

            {/* Desktop Nav */}
            <div className="hidden xl:flex items-center" style={{ gap: '69px' }}>
              {['Personal', 'Business', 'Company', 'Markets', 'Contact'].map((item) => (
                <span
                  key={item}
                  className={`cursor-pointer font-website font-normal ${textColor}`}
                  style={{ fontSize: '16px', lineHeight: '22px', opacity: hasScrolled && !pastHero ? 1 : undefined, color: !hasScrolled || !pastHero ? 'rgba(255, 255, 255, 0.5)' : undefined }}
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center" style={{ gap: '19px', ...(isDesktopLg ? { display: 'flex' } : { display: 'none' }) }}>
              <Link
                href="/login"
                className={`font-ui font-medium ${textColor}`}
                style={{ fontSize: '18px', lineHeight: '25px', letterSpacing: '-0.04em' }}
              >
                Log in
              </Link>

              <Link href="/sign-up">
                <button
                  className="flex items-center justify-center font-ui font-bold text-white"
                  style={{
                    width: '151px',
                    height: '43px',
                    background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    lineHeight: '22px',
                    letterSpacing: '-0.04em',
                  }}
                >
                  Sign Up
                </button>
              </Link>

              <div className={`w-px h-10 ${dividerColor}`} />

              {/* Language */}
              <div ref={dropdownRef} className="relative">
                <button onClick={() => setOpen(!open)}>
                  <Image
                    width={24}
                    height={24}
                    src={
                      !hasScrolled || !pastHero
                        ? '/assets/grommet-icons_language.svg'
                        : '/assets/grommet-icons_language-black.svg'
                    }
                    alt="language"
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-28 bg-[#0F172A] border border-[#1E293B] rounded-lg shadow-xl">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#1E293B]"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              style={{
                background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                ...(isDesktopLg ? { display: 'none' } : {}),
              }}
              className={`  w-13 rounded-xl  h-10.75 flex items-center justify-center lg:hidden`}
              onClick={() => setIsOpen(true)}
            >
              <div className="flex flex-col gap-1 w-6">
                <div className="w-full h-[3px] bg-white"></div>
                <div className="w-full h-[3px] bg-white"></div>
                <div className="w-full h-[3px] bg-white"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ================= OVERLAY ================= */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className="fixed overflow-auto top-0 right-0 h-full w-full bg-white pl-9.5 pr-6 z-50"
        style={{
          transition: 'transform 0.3s ease',
          WebkitTransition: '-webkit-transform 0.3s ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          WebkitTransform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="pt-6 flex flex-col">
          <div className="flex pt-4 justify-between items-center">
            <Link href={'/'} className="flex gap-4 h-7.5 items-center">
              <div className="flex flex-col">
                <Image
                  className="max-w-full h-auto w-full"
                  width={1000}
                  height={1000}
                  priority
                  src="/assets/logoSingleBlack.svg"
                  alt=""
                />
              </div>
              <h2 className="text-[29.03px] mb-1.5   font-semibold leading-[69%] font-display text-black">Varntix</h2>
            </Link>
            <div className="flex items-center gap-7.25">
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className={`language flex items-center gap-2 text-white hover:opacity-80`}
                >
                  <Image width={39} height={39} src="/assets/grommet-icons_language-black.svg" alt="language" />

                  {/* <span className="text-sm font-medium">{language}</span> */}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-28 bg-[#0F172A] border border-[#1E293B] rounded-lg shadow-xl overflow-hidden">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#1E293B] transition"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="" onClick={() => setIsOpen(false)}>
                <Image width={46} height={46} src="/assets/mobileClose.svg" className=" " alt="" />
              </button>
            </div>
          </div>

          <nav className="flex pt-12 flex-col gap-6">
            {['Personal', 'Business', 'Company', 'Markets', 'Contact'].map((item) => (
              <span key={item} className="text-[28px] font-website text-black">
                {item}
              </span>
            ))}
          </nav>

          <div className="pt-10 flex flex-col gap-4">
            <Link href={'/login'} className="w-full">
              <button className="rounded-xl bg-black w-full h-15.5 flex items-center justify-between px-5 font-bold text-white">
                Log In
                <Image width={20} height={20} src="/assets/register.svg" alt="" />
              </button>
            </Link>
            <Link href={'/sign-up'} className="w-full">
              <button
                className="rounded-xl h-15.5 w-full flex items-center justify-between px-5 font-bold"
                style={{
                  background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                }}
              >
                Sign Up
                <Image width={20} height={20} src="/assets/register.svg" alt="" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
