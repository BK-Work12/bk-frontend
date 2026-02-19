import Image from 'next/image';
import React from 'react';

export const Management = () => {
  return (
    <div className="bg-[#181B21] relative overflow-hidden">
      {/* Background image */}
      <Image
        src="/assets/Frame 1597886383.png"
        alt="Background"
        fill
        priority
        sizes="100vw"
        quality={46}
        className="absolute inset-0 object-cover z-0"
      />

      {/* Ellipse decoration */}
      <Image
        src="/assets/Ellipse 36.webp"
        alt="Decorative ellipse"
        width={1000}
        height={1000}
        sizes="(min-width: 1024px) 1000px, 0px"
        className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-35.5 z-0"
      />

      <div className="pl-2.25 pr-1.75 lg:px-4 relative pt-8.75  lg:pt-19.25 z-10">
        <div className="max-w-[1360px] mx-auto w-full">
          <div className="max-lg:pl-5.75 lg:text-center bk-l">
            <div className=" w-full mx-auto">
              <h2 className="bk-text text-[40px] lg:text-[34px] text-center  font-medium leading-[100%]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                Digital wealth management designed for clients at every scale.
              </h2>
              <p className="pt-8.25 lg:pt-4 text-lg font-normal font-ui bk-center">
                Access bespoke services built for those who demand flexibility, discretion, and trust.
              </p>
            </div>
          </div>

          <div className="grid max-xl:max-w-196.5 mx-auto grid-cols-1 xl:grid-cols-2 gap-[31px] max-xl:pb-2.5 lg:gap-5 pt-8.25 lg:pt-20.75">
            {/* Card 1 */}
            <div className="card1 max-lg:h-144.75 max-lg:flex max-lg:justify-between max-lg:flex-col  lg:px-5 pt-7 lg:pt-10 max-lg:rounded-xl lg:rounded-t-xl">
              <div className="pl-5.75 pr-5.25 lg:pr-3 lg:pl-8">
                <div className="flex pb-12.5 lg:pb-12 justify-between max-lg:gap-5 items-start bk-card" style={{ fontWeight: 500, fontFamily: 'var(--font-manrope)' }}>
                  <div className="max-w-108 w-full 2xl:pt-4.5">
                    <h2 className=" text-[32px]   leading-[130%]">
                      Personalised wealth services for individuals
                    </h2>
                  </div>

                  <button className="hidden lg:block">
                    <Image src="/assets/btnArrow.svg" alt="" width={46} height={46} sizes="80px" />
                  </button>
                </div>

                <p className=" max-lg:max-w-86.75  text-[16px] font-normal pb-3.75 max-w-169.25 w-full" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }} >
                  The font can you unbold it and make the font size the same as the rest of the other paragraphs on the site.
                </p>

                {/* <button
                  className="inline-flex items-center gap-5.5 align-middle
  text-[#FFFFFF99] hover:text-white transition-colors duration-200"
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
                </button> */}
              </div>

              <Image
                src="/assets/Group 1597884978.webp"
                alt=""
                width={600}
                height={400}
                sizes="(min-width: 1280px) 600px, 100vw"
                className=" mx-auto "
              />
            </div>

            {/* Card 2 */}
            <div className="card2 max-lg:h-144.75 max-lg:flex max-lg:justify-between max-lg:flex-col  lg:px-5 pt-7 lg:pt-10 max-lg:rounded-xl lg:rounded-t-xl">
              <div className="pl-5.75 pr-5.25 lg:pr-3 lg:pl-8">
                <div className="flex pb-12.5 lg:pb-12 justify-between max-lg:gap-5 items-start bk-card">
                  <div className="max-w-108 w-full 2xl:pt-4.5">
                    <h2 className=" text-[32px]   leading-[130%]" style={{ fontWeight: 500, fontFamily: 'var(--font-manrope)' }}>
                      Build your digital treasury as a company
                    </h2>
                  </div>

                  <button className="hidden lg:block">
                    <Image src="/assets/btnArrow.svg" alt="" width={46} height={46} sizes="80px" />
                  </button>
                </div>

                <p className=" max-lg:max-w-86.75  text-[16px] font-normal pb-3.75 max-w-169.25 w-full" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                Varntix corporate accounts deliver institutional-grade custody, advanced OTC capabilities
                </p>

                {/* <button
                  className="inline-flex items-center gap-5.5 align-middle
  text-[#FFFFFF99] hover:text-white transition-colors duration-200"
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
                </button> */}
              </div>

              <Image
                src="/assets/card2.webp"
                alt=""
                width={600}
                height={400}
                sizes="(min-width: 1280px) 600px, 100vw"
                className="mx-auto absolute bottom-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
