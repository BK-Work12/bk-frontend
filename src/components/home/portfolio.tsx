import Image from 'next/image';
import React from 'react';

const Portfolio = () => {
  return (
    <div className="pt-20.5 pb-4 lg:pb-20.5   sm:px-4 bk-port">
      <div className="max-w-[1320px] w-full mx-auto">
        <div className="max-lg:px-4 text-center">
          <h2 className="bk-heading pb-4 text-[32px] font-medium leading-[100%] text-[#000] font-display w-full mx-auto" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
            Build your portfolio through a single Varntix app
          </h2>
          <p className="text-center text-lg font-normal font-ui text-[#656565] bk-pad">
            Crafted for investors who <span className="text-[#4374FA] font-semibold">think ahead.</span>{' '}
          </p>
        </div>
        <div className="bk-cell grid grid-cols-1 items-center md:grid-cols-2 xl:grid-cols-3 gap-2.75 pt-15.75">
          <div className="relative h-[530px] bg-[#181B21] pt-6.5 pb-13.75 pr-5.5 pl-6.25 overflow-hidden sm:rounded-md">
            <Image
              fill
              priority
              sizes="100vw"
              src="/assets/Group 1597884976 (1).svg"
              className="w-full h-full object-cover absolute  top-0 left-0 "
              alt=""
            />

            <Image
              priority
              width={1000}
              height={1000}
              src="/assets/Rectangle 114.png"
              className="max-w-full h-auto w-full absolute"
              alt=""
            />
            <Image
              priority
              width={1000}
              height={1000}
              src="/assets/Space-Black-home.png"
              className="max-w-full h-auto bottom-0 left-0 w-full absolute"
              alt=""
            />
            <div className="relative">
              <div className="flex pb-4.5 justify-between items-start">
                <span className=" font-normal text-lg font-ui">
                  <span className="text-[#FFFFFF80]">{'[01/'}</span> <span className="text-[#FFFFFF33]">{'03]'}</span>
                </span>
                {/* <button className="">
                  <Image width={48} height={48} priority src="/assets/Frame 11.svg" alt="" />
                </button> */}
              </div>
              <div className="flex flex-col gap-[26px]">
                <h2 className="font-semibold text-[32px] font-display leading-[69%]   " style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>Increase Your Wealth</h2>
                <p className=" max-w-79.75 md:max-w-110.75 mx-auto w-full  text-base font-ui font-normal text-[#FFFFFF80]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                  Grow your capital with Varntix and earn <span className="text-white"> up to 24% yearly </span> on your
                  digital portfolio.
                </p>
              </div>
              {/* <div className="max-w-99.25 pb-18.5 w-full mx-auto flex justify-between items-end">
                <div
                  className="h-27 rounded-md border border-[#FFFFFF4D] glass-dark w-15.5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.001) 100%)',
                  }}
                ></div>
                <div
                  className="h-32.75 rounded-md border border-[#FFFFFF4D] glass-dark w-15.5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.001) 100%)',
                  }}
                ></div>

                <div
                  className="h-38.5 rounded-md border border-[#FFFFFF4D] glass-dark w-15.5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.001) 100%)',
                  }}
                ></div>
                <div
                  className="h-45 rounded-md border border-[#FFFFFF4D] glass-dark w-15.5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.001) 100%)',
                  }}
                ></div>

                <div
                  className="h-49.5 rounded-md   glass-ui w-15.5"
                  style={{
                    background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                  }}
                ></div>
              </div> */}
            </div>
          </div>
          <div
            style={{
              background: 'linear-gradient(180deg, #D5EAFF 35.17%, #4374FA 188.64%)',
            }}
            className="relative  h-[530px]  pt-6.5 pb-13.75 pr-5.5 pl-6.25 overflow-hidden sm:rounded-md"
          >
            <Image
              fill
              priority
              sizes="100vw"
              src="/assets/Group 1597884977.png"
              className="w-full z-0 h-full object-cover absolute  top-0 left-0 "
              alt=""
            />

            <div className="relative">
              <div className="flex pb-3.25 justify-between items-start">
                <span className=" font-normal text-lg font-ui">
                  <span className="text-[#65656580]">{'[02/'}</span> <span className="text-[#65656533]">{'03]'}</span>
                </span>
                {/* <button className="">
                  <Image width={48} height={48} priority src="/assets/Frame 11.svg" alt="" />
                </button> */}
              </div>
              <h2 className="font-semibold text-[32px] text-[#000000] font-display leading-[120%]  pb-23 text-center" style={{ fontWeight: 500, fontFamily: 'var(--font-manrope)' }}>
                Control Your Digital<br /> Holdings
              </h2>

              <div className="max-w-93 mx-auto w-full bg-white rounded-[20px] pb-6.5 pt-4.75 px-8.5 mb-15.75">
                <h2 className="text-center pb-5 text-base font-normal font-alt text-[#656565]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                  Available to borrow
                </h2>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-[21px]  font-bold  leading-[100%] text-center font-display text-black" style={{ fontWeight: 600, fontFamily: 'var(--font-manrope)' }}>$111,295</h2>
                    <p className="text-base font-normal font-alt leading-[100%]  text-[#656565]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                      at <span className="font-bold text-[#53A7FF]">10.8%</span> interest
                    </p>
                  </div>
                  <div className="w-px bg-[#00000033] h-12.25"></div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-[21px] text-center font-bold leading-[100%] font-display text-black" style={{ fontWeight: 600, fontFamily: 'var(--font-manrope)' }}>$21,435</h2>
                    <p className="text-base font-normal font-alt leading-[100%]  text-[#656565]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                      at <span className="font-bold text-[#70AE1C]">2.9% </span> interest
                    </p>
                  </div>
                </div>
              </div>
              <p className="  w-full text-center text-base font-ui font-medium text-black/50" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
Swap between 100+ assets anytime and tap into liquidity through a Varntix-backed Credit Line.              </p>
            </div>
          </div>
          <div className="relative h-[530px] bg-[#F1F1FE] pt-6.5 pb-13.75 lg:pr-5.5 lg:pl-6.25 overflow-hidden sm:rounded-md">
            <Image
              priority
              fill
              sizes="100vw"
              quality={80}
              src="/assets/Group 1 (1).webp"
              className="w-full h-full object-cover absolute  top-0 left-0 "
              alt=""
            />
            <Image
              src={'/assets/Rectangle 135q.png'}
              className="max-w-full h-auto w-full absolute left-0 bottom-0 z-0"
              width={1000}
              height={1000}
              alt=""
            />
            <div className="absolute dottedBlue max-xxs:text-xs text-sm md:text-xs 2xl:text-sm text-[#FFFFFF99] bottom-[30px] left-1/2 pt-[13px] pb-[17px] px-[22px] z-[1] -translate-x-1/2 max-xxs:max-w-80 max-w-93.75 md:max-w-80 2xl:max-w-93.75 w-full rounded-md" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
              Keep your assets invested while you spend earn up to 2% cashback using the Varntix Card. 
            </div>

            <div className="relative h-full flex justify-between flex-col">
              <div className="flex max-lg:pr-5.5 max-lg:pl-6.25 pb-4.5 justify-between items-start">
                <span className=" font-normal text-lg font-ui">
                  <span className="text-[#000000CC]">{'[03/'}</span> <span className="text-[#00000033]">{'03]'}</span>
                </span>
                {/* <button className="">
                  <Image width={48} height={48} priority src="/assets/Frame 11.svg" alt="" />
                </button> */}
              </div>
              <div className="px-1 sm:px-0">
                <div className="max-w-108.25  overflow-hidden mx-auto w-full relative   glass-panel rounded-md ">
                  <Image
                    priority
                    fill
                    sizes="100vw"
                    quality={80}
                    src="/assets/Group 1597884981.png"
                    className="w-full h-full absolute top-0 left-0"
                    alt=""
                  />
                  <div
                    className="h-7.5 px-3 rounded-t-md flex items-center gap-1 w-full"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div
                      className="w-3 h-3 frosted-glass  rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(0, 0, 0, 0.01) 100%)',
                      }}
                    ></div>

                    <div
                      className="w-3 h-3 frosted-glass  rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.08) 100%)',
                      }}
                    ></div>

                    <div
                      className="w-3 h-3 frosted-glass  rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.08) 100%)',
                      }}
                    ></div>
                  </div>

                  <div className="px-6.5 relative z-1 pt-9 pb-15.25">
                    <h2 className="font-semibold text-white font-display text-[32px] leading-[100%]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                      Use Your Funds <br />Everywhere
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
