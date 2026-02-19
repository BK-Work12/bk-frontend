import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export const EraSection = () => {
  return (
    <div className="overflow-hidden relative pb-19 lg:pb-23.5 pt-17 lg:pt-25 ">
      <Image
        fill
        priority
        unoptimized
        quality={80}
        placeholder="blur"
        blurDataURL="/assets/BackGround-bk.png"
        src="/assets/BackGround-bk.png"
        className="absolute hidden lg:block  object-cover top-0 left-0 w-full h-full z-0"
        alt=""
      />
      <Image
        fill
        priority
        unoptimized
        quality={80}
        placeholder="blur"
        blurDataURL="/assets/Frame 1597886410 (1).jpg"
        src="/assets/Frame 1597886410 (1).jpg"
        className="absolute  lg:hidden  object-right top-0 left-0 w-full h-full z-0"
        alt=""
      />

      <div className="  lg:px-4 relative">
        <div className="max-w-[1320px] mx-auto w-full">
          <div className="flex lg:hidden flex-col  max-lg:px-10 pb-14.75 lg:pb-31.75 gap-11 xl:gap-17.5">
            <div className="max-w-181.5 w-full ">
              <h2 className="text-[32px]  pb-6.75 lg:pb-10 font-semibold font-display text-white leading-[100%]">
                Varntix is built for investors looking to grow and manage their digital wealth with confidence.
              </h2>
              <p className="max-xsm:text-[16px] text-[20px] font-ui  max-w-[656px] w-full font-normal">
                Create your account today and get started.
              </p>
            </div>
            {/* <p className="text-[36px] font-display leading-[90%] font-semibold">
              Start your security research journey.
            </p> */}
            <div className="flex flex-col gap-8">
              <Link href={'/sign-up'}>
                <button
                  className="rounded-md h-15.5 px-5 flex items-center justify-center lg:max-w-90.25 w-full font-bold font-ui text-base transition-all duration-300 hover:brightness-110 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                  }}
                >
                  Sign up
                </button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex gap-12 items-start">
            <div className="max-w-181.5 w-full flex items-center">
              <h2 className="text-[32px] max-w-[520px] font-semibold font-display text-white leading-[130%]"style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >
                Varntix is built for investors looking to grow and manage their digital wealth with confidence.
              </h2>
            </div>
            <div className="flex items-stretch"><div className="w-0.5 h-full min-h-[180px] bg-[#DDDDDD4D] mx-8"></div></div>
            <div className="flex flex-col gap-11 max-w-146 w-full justify-center">
              <h2 className=" text-[21px] max-sm:max-w-95.25 w-full leading-[130%] font-semibold font-display max-w-[480px] text-white" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                Get updates, insights, and reports on the latest industry trends.
              </h2>
            </div>
          </div>
          <div className="flex flex-col max-lg:px-10 max-lg:gap-5 lg:flex-row justify-between items-center max-sm:pt-18">
            <div className=" w-full lg:flex gap-12 items-stretch ">
              <div className='flex max-w-146 w-full justify-between items-center gap-5.75 max-lg:gap-0'>
                <p className="text-[16px] font-display leading-[90%] bk-p" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >
                  Create your account today and get started.
                </p>
                <Link href={'/sign-up'} className="hidden lg:flex w-full  max-w-[211px]">
                  <button
                    className="rounded-md h-15.5 px-5 flex items-center justify-center max-w-[211px] w-full font-bold font-ui text-base transition-all duration-300 hover:brightness-110 hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                    }}
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
              <div className="flex items-stretch"><div className="hidden lg:flex w-0.5 h-full min-h-[80px] bg-[#DDDDDD4D] mx-7"></div></div>
              <div className="flex w-full max-lg:gap-8 gap-2.5 flex-col lg:flex-row items-center">
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="w-full bg-[#FFFFFF1A] max-w-[400px]  rounded-md inputSearh px-6.25 pt-5 pb-4.5"
                />

                <button
                  className="rounded-md h-15.5   lg:max-w-55 px-5 flex items-center justify-center lg:justify-center gap-14 w-full font-bold font-ui text-base transition-all duration-300 hover:brightness-110 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
