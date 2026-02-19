import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
const whyUsData = [
  {
    iconBg: '#53A7FF24',
    icon: '/assets/icon1.svg',
    title: 'Predictable Fixed Income',
    desc: 'Fixed rates with defined terms',
    barBg: '#53A7FF',
    barClass: 'right-[70px] w-[35px]',
    width: 14.776347160339355, // new
    height: 23.023693084716797, // new
  },
  {
    iconBg: '#70AE1C29',
    icon: '/assets/blueBall.svg',
    title: 'Professional Support',
    desc: 'Dedicated investor assistance',
    barBg: '#70AE1C',
    barClass: 'left-[47px] w-[34px]',
    width: 20,
    height: 20,
  },
  {
    iconBg: '#6B63DF2B',
    icon: '/assets/icon3Blue.svg',
    title: 'Global Accessibility',
    desc: 'Built for international investors',
    barBg: '#6B63DF',
    barClass: 'right-[131px] w-[62px]',
    width: 20,
    height: 20,
  },
  {
    iconBg: '#53A7FF24',
    icon: '/assets/icon4Blue.svg',
    title: 'Competitive Returns',
    desc: 'Attractive fixed stablecoin yields',
    barBg: '#53A7FF',
    barClass: 'left-[38px] w-[62px]',
    width: 18,
    height: 20,
  },
  {
    iconBg: '#70AE1C29',
    icon: '/assets/icon5Blue.svg',
    title: 'Robust Framework',
    desc: 'Disciplined treasury operations',
    barBg: '#70AE1C',
    barClass: 'right-2.5 w-[70px]',
    width: 20,
    height: 20,
  },
  {
    iconBg: '#6B63DF2B',
    icon: '/assets/icon6Blue.svg',
    title: 'Efficient Liquidity',
    desc: 'Clear payouts and redemptions',
    barBg: '#6B63DF',
    barClass: 'left-12.75 w-[23px]',
    width: 28,
    height: 20,
  },
];

export const WhyUs = () => {
  return (
    <div className="pt-6 lg:pt-25.75  pb-13 xl:pb-17 px-6">
      <div className="max-w-353.5 pb-7.5 lg:pb-22 mx-auto w-full">
        <div className="flex flex-col max-xl:gap-11.5 xl:flex-row justify-center  items-center xl:items-start">
          <div className="flex flex-col gap-8">
            <h2 className=" font-medium max-lg:text-center leading-[100%]  text-[32px] text-[#000]  lg:text-black ">
              Why choose Varntix?
            </h2>
            {/* <Link href={'/sign-up'} className=" hidden lg:block max-w-65 w-full">
              <button
                className="rounded-md h-15.5 px-5 flex items-center justify-center  w-full font-bold font-ui text-base transition-all duration-300 hover:brightness-110"
                style={{
                  background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                }}
              >
                Sign Up
              </button>
            </Link> */}
          </div>
          {/* <div className="">
            <p className="max-w-152 max-lg:text-center pb-7.75 lg:pb-11.25 w-full text-lg font-ui text-[#656565]">
              Varntix is built for investors seeking consistency rather than speculation, combining fixed returns,
              defined terms, and disciplined treasury management within a transparent digital framework. <br /> <br />
              Through the Varntix platform, investors can earn stablecoin yields with a simple, streamlined process.
              Supported by robust infrastructure and dedicated client support, Varntix enables investors to navigate
              digital markets with clarity and confidence.
            </p>
            <button
              className=" flex max-lg:mx-auto  items-center gap-5.5 align-middle
  text-[#53A7FF] hover:text-[#1E40AF] transition-colors duration-200"
            >
              <span className="text-base font-normal font-ui">Read more</span>

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
          </div> */}
        </div>
      </div>
      <div className="max-w-[1320px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4.25 gap-y-11">
          {whyUsData.map((item, index) => (
            <div key={index}>
              <div className="flex pb-11.25 lg:pb-13 flex-col gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  
                >
                  <Image width={item.width} height={item.height} src={item.icon} alt="" />
                </div>

                <h2 className="text-[21px] font-semibold leading-[90%]  text-[#181B21]">{item.title}</h2>

                <p className="text-[#656565] text-[16px] font-normal font-ui leading-[100%]">{item.desc}</p>
              </div>

              <div className="relative max-w-98 hidden lg:block w-full h-0.5 max-xl:mx-auto bg-[#DDDDDD]"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
