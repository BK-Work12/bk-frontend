import Image from 'next/image';
import React from 'react';

export const AddFunds = () => {
  return (
    <div className="relative dotted-bgWhite pt-[100px] pb-10.75 lg:pb-30.75 sm:px-4">
      <Image
        width={1000}
        height={1000}
        priority
        quality={80}
        placeholder="blur"
        blurDataURL="assets/Group 1597884980.png"
        src="/assets/Group 1597884980.png"
        className="max-w-full xl:max-w-200.25  h-auto mx-auto"
        alt=""
      />
      <div className="max-w-330 mx-auto w-full">
        <div className="text-center pb-14.5 lg:pb-29.25">
          <h2 className=" max-w-93.25 text-[48px] lg:max-w-217.75 w-full mx-auto leading-[100%] lg:text-[48px] pb-10.75 font-semibold font-display text-[#181B21] " style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >
            Add funds to Varntix with <span className=" text-[#181B21]">zero friction.</span>
          </h2>
          <div className="flex max-sm:pl-3.75 max-sm:pr-8 flex-col items-center md:flex-row md:justify-center gap-2">
            {/* Gradient Button */}
            <button
              className="lg:max-w-58.75 w-full h-15.5 rounded-xl font-bold text-lg font-ui flex justify-center items-center transition-all duration-300 hover:brightness-110 hover:shadow-lg"
              style={{
                background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
              }}
            >
              Log in
            </button>

            {/* White Button */}
            <button className="lg:max-w-58.75 w-full h-15.5 rounded-xl font-bold text-lg font-ui flex justify-center items-center gap-4 bg-white text-[#656565] transition-all duration-300 hover:bg-gray-100 hover:shadow-md">
              Sign Up
              {/* <Image width={20} height={20} src="/assets/Vector (14).png" alt="" /> */}
            </button>
          </div>
        </div>
        <div className="flex items-center lg:pt-14.5 gap-11.75 xl:gap-0 flex-col xl:flex-row-reverse">
          <div className="max-w-150 w-full">
            <div className="flex flex-col">
              <div className="flex justify-between  max-sm:pl-3.75 max-sm:pr-8 max-xxs:gap-4 items-center  ">
                <h3 className="font-display leading-[100%] font-semibold max-xxs:text-[21px] text-[21px] text-[#181B21]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                  Bank transfers built for digital finance
                </h3>
                <button className="w-11.5 h-11.5 shrink-0  rounded-md bg-[#FFFFFF4D] flex items-center justify-center">
                  <Image width={10} height={10} src="/assets/Vector 93.svg" alt="" />
                </button>
              </div>
              <div className="max-w-126.75   max-sm:px-3.75   w-full pb-11 pt-9.75 ">
                <div className="flex max-lg:justify-between items-center gap-3">
                  <div className="px-3 py-3.75  max-lg:w-full max-lg:truncate leading-[100%] glass-shadow5 h-13.75 items-center justify-center max-xxs:text-[13px] text-base text-[#181B21] font-medium font-ui flex bg-[#FFFFFF4D] border border-[#FFFFFF4D] rounded-md ">
                    Dedicated accounts
                  </div>
                  <Image
                    quality={80}
                    placeholder="blur"
                    blurDataURL="assets/Group 1597884978 (1).png"
                    width={1000}
                    height={1000}
                    src="/assets/Group 1597884978 (1).png"
                    className="max-w-37 hidden lg:block w-full"
                    alt=""
                  />

                  <Image
                    quality={80}
                    placeholder="blur"
                    blurDataURL="assets/Group 6.svg"
                    width={49}
                    height={34}
                    src="/assets/Group 6.svg"
                    className="   lg:hidden "
                    alt=""
                  />
                  <div className="px-3 max-lg:w-full max-lg:truncate py-3.75 leading-[100%] glass-shadow5 h-13.75 items-center justify-center max-xxs:text-[13px] text-base text-[#181B21] font-medium font-ui flex bg-[#FFFFFF4D] border border-[#FFFFFF4D] rounded-md ">
                    Digital finance
                  </div>
                </div>
                <div className="pt-4 max-w-95.75 lg:max-w-85.75 w-full relative mx-auto">
                  <Image
                    width={1000}
                    height={1000}
                    priority
                    src="/assets/Group 1597884979.png"
                    className="max-w-full h-auto w-full"
                    alt=""
                  />
                  <div className="glass-effect7 max-w-max absolute -bottom-2.5 left-[50%] -translate-x-1/2 truncate z-1 py-3.75 px-4  rounded-md bg-[#FFFFFF1A] backdrop-blur-lg   border border-[#FFFFFF4D] text-base font-medium font-ui">
                    Bank holds & approvals
                  </div>
                </div>
              </div>
              <p className="max-w-133.75 w-full  max-sm:pl-3.75 max-sm:pr-6 text-[16px] text-black/50 font-medium font-ui leading-[153%]">
              Use your dedicated USD, EUR, and GBP Varntixaccounts to avoid freezes, delays, or bank-imposed holds on third-party transfers.
              </p>
            </div>
          </div>

          <div className="w-px h-79.5 bg-white ml-19 hidden xl:block mr-25"></div>
          <div className="max-w-133.75 w-full">
            <div className="flex  max-sm:pl-3.75 max-sm:pr-8 flex-col">
              <div className="flex justify-between max-xxs:gap-4 items-center  ">
                <h3 className="font-display font-semibold leading-[100%] max-xxs:text-[21px] text-[21px] text-[#181B21]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                  Effortless crypto <br className="md:hidden" /> deposits
                </h3>
                <button className="w-11.5 h-11.5  rounded-md bg-[#FFFFFF4D] flex items-center justify-center">
                  <Image width={10} height={10} src="/assets/Vector 93.png" alt="" />
                </button>
              </div>
              <div className="pt-7.25 lg:pt-15.25 pb-7.75">
                <div className="px-6 py-3.75 rounded-md max-w-max mb-3 bg-[#FFFFFF1A] text-base font-ui font-medium text-[#181B21] border border-[#FFFFFF4D] glass-effect8">
                  <span className="text-[#4374FA] font-bold">20+</span> supported networks
                </div>
                <div className="flex gap-3 items-start ">
                  <div className="max-w-59.5 w-full">
                    <Image
                      width={1000}
                      height={1000}
                      priority
                      src="/assets/Vector 103.png"
                      className="max-w-26.75 w-full  ml-auto"
                      alt=""
                    />
                  </div>
                  <div className="flex gap-1.75">
                    <div className="w-13.75 h-13.75  rounded-md flex items-center justify-center bg-[#FFFFFF4D] border border-[#FFFFFF4D] glassEffect ">
                      <Image width={28} height={28} src="/assets/cryptocurrency-color_eth.svg" alt="" />
                    </div>
                    <div className="w-13.75 h-13.75  rounded-md flex items-center justify-center bg-[#FFFFFF4D] border border-[#FFFFFF4D] glassEffect ">
                      <Image width={28} height={28} src="/assets/cryptocurrency-color_btc.svg" alt="" />
                    </div>
                    <div className="w-13.75 h-13.75  rounded-md flex items-center justify-center bg-[#FFFFFF4D] border border-[#FFFFFF4D] glassEffect ">
                      <Image width={28} height={28} src="/assets/token-branded_solana.svg" alt="" />
                    </div>

                    <div className="w-13.75 h-13.75  rounded-md flex items-center justify-center bg-[#FFFFFF1A] border border-[#FFFFFF4D] glassEffect ">
                      <Image width={11.431124687194824} height={2.9880001544952393} src="/assets/svg.svg" alt="" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="max-w-133.75 w-full text-[16px] font-medium font-ui leading-[153%] text-black/50">
                Bring in digital assets from exchanges or wallets across 20+ supported networks, including Ethereum, Solana, and Tron.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
