"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";



export const HeroSection = () => {
  return (
    
    <div className="overflow-hidden relative z-1 heroBg" style={{ height: '100svh' }}>
      <Image
        fill
        priority
        sizes="100vw"
        quality={80}
        placeholder="blur"
        blurDataURL="assets/Background-Image.png"
        src="/assets/Background-Image.png"
        className="w-full object-cover xl:block hidden absolute left-0 h-full z-0"
        alt=""
      />
      <Image
        fill
        priority
        sizes="100vw"
        quality={80}
        placeholder="blur"
        blurDataURL="assets/Background-Image.png"
        src="/assets/Background-Image.png"
        className="w-full object-cover xl:hidden object-[27%_50%] absolute left-0 h-full z-0"
        alt=""
      />

  

      {/* Content container */}
      <div className="c-container relative z-20 h-full">
            {/* iPhone mockup – Figma-exact viewport-relative positioning */}
      <div
        className="hidden xl:block absolute z-10"
        style={{
          right: '1.4%',
          top: 'calc(100vh - 528px)', // 528px is the distance from the top of the viewport to the bottom of the iPhone in Figma
          width: '100%',
          maxWidth: '29%',
        }}
      >
        <Image
          width={1746}
          height={2451}
          src="/assets/Mobile.png"
          className="absolute pointer-events-none"
          style={{
            width: '100%',
            height: 'auto',
            top: '-2.5%',
            
          }}
          alt=""
        />
        {/* <Image
          priority
          quality={80}
          width={1577}
          height={3415}
          src="/assets/99ef4814b35f2315cad0bda2ebeb4891c13cdf42.png"
          className="relative z-10 h-auto"
          style={{
            width: '90.08%',
            margin: '0 auto',
            borderRadius: 'clamp(30px, 2.7vw, 53px) clamp(30px, 2.7vw, 53px) 0 0',
          }}
          alt=""
        /> */}
      </div>
        <div className="relative flex flex-col justify-between h-full">
          {/* Main text block – Figma: left 300px on 1920px */}
          <div className="pt-[296px] lg:pt-[296px] md:pt-[196px] sm:pt-[150px] xs:pt-[120px] bk-head  max-w-[584px]">
            <h2
              className="font-website font-medium text-white"
              style={{ fontSize: 'clamp(42px, 2.5vw, 48px)', lineHeight: '110%' }}
            >
              Digital asset investing,{" "}
              <br className="hidden lg:block" />
              built for long-term wealth.
            </h2>

            <p
              className="font-website font-normal mt-6 lg:mt-8 max-w-[475px]"
              style={{ fontSize: '16px', lineHeight: '22px', color: 'rgba(255, 255, 255, 0.5)' }}
            >
              Discover a smarter platform designed to grow your digital wealth.
            </p>

            {/* CTA row – desktop only */}
            <div className="hidden lg:flex items-center gap-3.5 mt-18">
              <Link href="/sign-up">
                <button
                  className="font-ui font-bold text-base text-white flex items-center justify-center transition-all duration-300 hover:brightness-110"
                  style={{
                    width: '134px',
                    height: '54px',
                    background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                    borderRadius: '6px',
                  }}
                >
                  Sign Up
                </button>
              </Link>

              <div
                className="flex items-center gap-2 px-4 lg:px-5"
                style={{
                  width: '340px',
                  height: '53px',
                  background: 'rgba(0, 0, 0, 0.46)',
                  borderRadius: '6px',
                }}
              >
                <p className="font-ui font-normal text-xs leading-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Access premium investment solutions when you invest{" "}
                  <span className="text-white font-bold text-sm">$100,000+</span>{" "}
                  <button className="inline-flex gap-1 items-center text-[#53A7FF] hover:text-[#1E40AF] transition-colors text-xs font-normal font-ui ml-1">
                    Discover Varntix Core
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 16L16 12M16 12L12 8M16 12H8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </p>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="flex lg:hidden flex-col gap-3 mt-8 bk-hero">
              <Link href="/sign-up" className="w-full">
                <button
                  className="w-full h-[54px] rounded-md font-ui font-bold text-base text-white flex items-center justify-center transition-all duration-300 hover:brightness-110"
                  style={{ background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)' }}
                >
                  Sign Up
                </button>
              </Link>
              <div
                className="w-full rounded-md py-3 px-4"
                style={{ background: 'rgba(0, 0, 0, 0.46)' }}
              >
                <p className="font-ui font-normal text-sm leading-5" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Access premium investment solutions when you invest{" "}
                  <span className="text-white font-bold">$100,000+</span>{" "}
                  <button className="inline-flex gap-1 items-center text-[#53A7FF] text-sm font-normal font-ui ml-1">
                    Discover Varntix Core
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 16L16 12M16 12L12 8M16 12H8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom trust bar – Figma: items start at ~left 305px, top ~859px */}
          <div className="relative z-20 pb-16 lg:pb-22 mt-auto">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-0">
              {/* Global */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="#53A7FF" strokeWidth="1.5" />
                    <path d="M3 12H21" stroke="#53A7FF" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21" stroke="#53A7FF" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 3C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 21" stroke="#53A7FF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="font-website font-normal text-base" style={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: '22px', fontFamily: 'var(--font-manrope)' }}>
                    Global
                  </span>
                </div>
                <h3 className="font-website font-bold text-lg text-white" style={{ lineHeight: '150%', fontFamily: 'var(--font-manrope)' }}>
                  Investors Worldwide
                </h3>
              </div>

              {/* Separator – Figma: left 522px, height 65px */}
              <div className="hidden lg:block" style={{ width: '1px', height: '65px', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', margin: '0 56px' }} />

              {/* Support */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 13C4 13 4 8 4 7C4 4.79086 5.79086 3 8 3H16C18.2091 3 20 4.79086 20 7V13" stroke="#53A7FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 15.5C2 14.1193 3.11929 13 4.5 13H5V18H4.5C3.11929 18 2 16.8807 2 15.5Z" stroke="#53A7FF" strokeWidth="1.5" />
                    <path d="M22 15.5C22 14.1193 20.8807 13 19.5 13H19V18H19.5C20.8807 18 22 16.8807 22 15.5Z" stroke="#53A7FF" strokeWidth="1.5" />
                    <path d="M20 18V19C20 20.1046 19.1046 21 18 21H14" stroke="#53A7FF" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="21" r="1" stroke="#53A7FF" strokeWidth="1.5" />
                  </svg>
                  <span className="font-website font-normal text-base" style={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: '22px', fontFamily: 'var(--font-manrope)' }}>
                    Support
                  </span>
                </div>
                <h3 className="font-website font-bold text-lg text-white" style={{ lineHeight: '150%' }}>
                  Get help 24/7
                </h3>
              </div>

              {/* Separator – Figma: left 741px, height 65px */}
              <div className="hidden lg:block" style={{ width: '1px', height: '65px', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', margin: '0 56px' }} />

              {/* Transparent APY */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="#53A7FF" strokeWidth="1.5" />
                    <path d="M15 9L9 15" stroke="#53A7FF" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="9.5" cy="9.5" r="1" fill="#53A7FF" />
                    <circle cx="14.5" cy="14.5" r="1" fill="#53A7FF" />
                  </svg>
                  <span className="font-website font-normal text-base" style={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: '22px' }}>
                    Transparent APY
                  </span>
                </div>
                <h3 className="font-website font-bold text-lg text-white" style={{ lineHeight: '150%' }}>
                  Fully paid in stablecoins
                </h3>
              </div>
              
            </div>
            
          </div>
          <img src="./assets/Mobile.png" alt="" className="bk-image hidden" />
        </div>
      </div>
    </div>
  );
};
