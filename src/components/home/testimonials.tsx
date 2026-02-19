import Image from "next/image";
import React from "react";

export const Testimonials = () => {
  return (
    <div className="px-4 pt-5.75">
      <div className="py-8.5 max-w-[1320px] mx-auto w-full px-12.5 rounded-xl bg-[#F2F7FF] flex flex-col gap-8">
        <div className="relative overflow-hidden py-8.5 px-13.5 rounded-md h-88.25 flex flex-col gap-8">
          <h2 className="text-[32px] z-1 relative font-medium  leading-[100%]" style={{ fontWeight: 500, fontFamily: 'var(--font-manrope)' }}>
            Serving Clients since 2018
          </h2>
          <p className="text-[16px] z-1 relative font-normal leading-[130%]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
            Individuals, buinesses, and institutions rely on us to help grow
            their <br></br>digital asset portfolios.
          </p>
          <Image
            width={1000}
            height={1000}
            src={"/assets/Group 1597887194.webp"}
            className="max-w-full h-auto w-full absolute left-0 top-0 z-0"
            alt=""
          />
        </div>
        <div className="py-6.25 flex justify-between items-center">
          <div className="flex gap-8 flex-col">
            <span className="text-[36px] font-semibold  text-[#181B21] leading-[90%]" style={{ fontWeight: 600, fontFamily: 'var(--font-manrope)' }}>
              Rudolf G.
            </span>
            <span className="text-lg font-normal text-[#656565] leading-[100%]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
              Entrepreneur
            </span>
          </div>
          <p className="text-[16px] font-normal max-w-181 font-ui text-[#656565]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
            “Even though the crypto world felt unfamiliar at first, I chose to
            trust Varntix. Now, after 6 years as a client, I can confidently say
            Varntix is a reliable and professional company that genuinely cares
            about its customers and helps me grow my investments.”
          </p>
        </div>
        <div className="max-w-26 w-full flex gap-8 items-center bg-white">
          <button>
            <Image width={36} height={36} src={"/assets/Button.svg"} alt="" />
          </button>
          <button>
            <Image
              width={36}
              height={36}
              src={"/assets/Button (1).svg"}
              alt=""
            />
          </button>
        </div>
      </div>
    </div>
  );
};
