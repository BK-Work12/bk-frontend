import Image from "next/image";
import Link from "next/link";
import React from "react";

export const WEBSITE_VERSION = '1.0.0';

export const Footer = () => {
  return (
    <div className="pt-11 pb-6 px-4 lg:px-6">
      <div className="max-w-[1320px] w-full mx-auto">
        <div className="flex flex-col items-center pb-10 lg:hidden">
          <Link href={"/"} className="flex gap-4 items-center">
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
            <h2 className="text-[37.55px] mb-1.5  font-semibold leading-[69%] font-display text-black">
              Varntix
            </h2>
          </Link>
        </div>
        <div className="grid max-lg:px-8.5 md:max-w-87.5 lg:max-w-310.5 w-full mx-auto grid-cols-2 lg:grid-cols-12 gap-6 items-start mb-10  ">
          {/* Logo */}
          <div className="hidden relative -top-2 lg:flex lg:col-span-2">
            <Link href="/" className="flex gap-4 items-center relative left-2">
              <Image
                className="max-w-full h-auto w-full"
                width={1000}
                height={1000}
                priority
                src="/assets/logoSingleBlack.svg"
                alt=""
              />
              <h2 className="text-[37.55px] mb-1.5 font-semibold leading-[69%] font-display text-black">
                Varntix
              </h2>
            </Link>
          </div>

          {/* Company */}
          <div className="col-span-1 lg:pl-10 lg:col-span-2">
            <div className="text-[15.1px] mb-5 font-medium text-[#0A0D11] leading-6" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >
              Company
            </div>
            <div className="flex flex-col gap-3 text-gray-600">
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}  style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >About</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}  style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Security</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}  style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Insights</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}  style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Partnerships</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}  style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Ambassadors</span>
            </div>
          </div>

          {/* Personal */}
          <div className="col-span-1 pl-5 lg:pl-5 lg:col-span-2">
            <div className="text-[15.1px] mb-5 font-medium text-[#0A0D11] leading-6" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
              Personal
            </div>
            <div className="flex flex-col gap-3 text-gray-600">
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Fixed Income</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Loyalty Program</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Varntix Core</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Markets</span>
            </div>
          </div>

          {/* Business */}
          <div className="col-span-1  lg:col-span-2">
            <div className="text-[15.1px] mb-5 font-medium text-[#0A0D11] leading-6" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
              Business
            </div>
            <div className="flex flex-col gap-3 text-gray-600">
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Corporate Accounts</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Institutions</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Treasury Solutions</span>
            </div>
          </div>

          {/* Legal */}
          <div className="col-span-1 pl-4 lg:pl-5 lg:col-span-2">
            <div className="text-[15.1px] mb-5 font-medium text-[#0A0D11] leading-6" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
              Legal
            </div>
            <div className="flex flex-col gap-3 text-gray-600">
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Terms of Service</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Privacy Policy</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Cookies Policy</span>
              <span className="text-sm cursor-pointer" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >Disclaimer</span>
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-1 lg:col-span-2">
            <div className="text-[15.1px] mb-4 font-medium text-[#0A0D11] leading-6" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
              Contact Us
            </div>

            <div className="mb-5 space-y-1 text-sm text-gray-600">
              <a
                href="mailto:support@varntix.com"
                className="block hover:underline"
              >
                support@varntix.com
              </a>
              <a href="tel:08000000000" className="block hover:underline">
                0800 000 0000
              </a>
            </div>

            <div className="flex gap-2 items-center">
              <button className="w-11 h-11 shrink-0 rounded-lg bg-[#0A0D11] flex items-center justify-center hover:shadow-[0_0_10px_#1DA1F2] transition">
                <Image
                  width={22}
                  height={22}
                  src="/assets/Twitter Icon.svg"
                  alt="Twitter"
                />
              </button>
              <button className="w-11 h-11 shrink-0 rounded-lg bg-[#0A0D11] flex items-center justify-center hover:shadow-[0_0_10px_#FF0000] transition">
                <Image
                  width={22}
                  height={22}
                  src="/assets/YouTube Icon.svg"
                  alt="YouTube"
                />
              </button>
              <button className="w-11 h-11  shrink-0 rounded-lg bg-[#0A0D11] flex items-center justify-center hover:shadow-[0_0_10px_#F58529] transition">
                <Image
                  width={22}
                  height={22}
                  src="/assets/Instagram Icon.svg"
                  alt="Instagram"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="h-0.5 lg:block hidden bg-[#DDDDDD4D] w-full mt-16.25 mb-14"></div>
        <p className="text-[10px] text-center text-[#65656560] font-normal mb-3">
          v{WEBSITE_VERSION}
        </p>
        <p className="text-xs lg:text-center   text-[#656565] font-normal   ">
          Varntix services and digital assets may not be available in all
          jurisdictions and may be subject to restrictions. Information on this
          website is provided for general informational purposes only and does
          not constitute financial, legal, tax, or investment advice.
          <br className=" lg:hidden" /> <br className=" lg:hidden" /> not
          provide personalised advice or guarantee future results. Digital
          assets are volatile and may increase or decrease in value, and you may
          lose some or all of your investment. You are responsible for your
          investment decisions and should seek independent professional advice
          where appropriate.
        </p>
      </div>
    </div>
  );
};
