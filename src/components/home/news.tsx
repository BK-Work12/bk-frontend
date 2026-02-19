'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface Testimonial {
  id: number;
  title: string;
  shortTitle: string;
  fullTitle: string;
  image: string;
  date: string;
  description: string;
  maxWidth?: string;
  mobileImage?: string;
  mobileHeight?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 282,
    title: 'What can drive Bitcoin’s price into February?',
    shortTitle: 'Dispatch #282:',
    fullTitle: 'Dispatch #282: What can drive Bitcoin’s price into February?',
    image: '/assets/Frame 1597887108.png',
    mobileImage:
      '/assets/adult-man-gray-suit-typing-reading-text-message-cell-phone-while-standing-front-modern-office-building 1.png',
    date: '06/25/2023',
    description: 'BTC derivative markets reset, altcoin ETFs show resilience, labour market data sprint.',
    maxWidth: 'max-w-94.5',
    mobileHeight: 'h-119.25 dotterBlue234',

  },
  {
    id: 281,
    title: 'Bitcoin and macro: A waiting game',
    shortTitle: 'Dispatch #281:',
    fullTitle: 'Dispatch #281: Bitcoin and macro: A waiting game',
    image: '/assets/Frame 1597887107.png',
    mobileImage: '/assets/Group 1597887187.svg',
    date: '06/25/2023',
    description: 'ETH’s hidden all-time high, BTC’s stability, the all-important FOMC',
    maxWidth: 'max-w-90.75',
    mobileHeight: 'h-109.25 dottedBlack',
  },
];

export default function News() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(2);

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile / desktop
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(window.innerWidth < 1024 ? 1 : 2);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - itemsPerView : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1 >= testimonials.length - itemsPerView + 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlay(false);
    setCurrentIndex(index);
  };

  const activeDot = Math.floor(currentIndex / itemsPerView);
  // Only show 1 dot if mobile (stacked)
  const maxDots = itemsPerView === 1 ? 1 : Math.ceil(testimonials.length / itemsPerView);

  const slideWidth = itemsPerView === 1 ? 100 : 50;

  return (
    <main className=" bg-white  pb-2 lg:pb-5.5 px-1 lg:px-4">
      <div className="max-w-[1320px] mx-auto">
        {/* Control Bar */}
        <div className="bg-[#181B21] md:mx-3 text-white rounded-xl px-6 py-6.5 lg:py-2 mb-6 border border-[#FFFFFF1A] flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <span className="text-lg font-light">Varntix news and insights.</span>

          {/* Dots */}
          {/* Dots */}
          <div className="flex gap-2">
            {Array.from({ length: itemsPerView === 1 ? 1 : maxDots }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index * itemsPerView)}
                className={`w-2 h-2 rounded-full transition-all ${index === activeDot ? 'bg-white' : 'bg-gray-600'}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button onClick={handlePrev}>
              <Image width={36} height={36} src="/assets/left.svg" alt="Prev" />
            </button>
            <button onClick={handleNext}>
              <Image width={36} height={36} src="/assets/right.svg" alt="Next" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden w-full pb-10">
          {/* Desktop */}
          <div
            className="md:flex hidden  transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translateX(-${currentIndex * slideWidth}%)`,
            }}
          >
            {testimonials.map((item) => (
              <div key={item.id} className="shrink-0 w-full lg:w-1/2 px-3">
                <div className="bg-white relative rounded-xl overflow-hidden border border-[#65656526] hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative h-80.75 w-full">
                    <div className="relative z-1 pt-18 pl-6.5">
                      <p className="text-2xl pb-2 font-semibold font-display leading-[90%]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>{item.shortTitle}</p>
                      <h2 className={`${item.maxWidth} m-w-[330px] w-full text-[32px] font-display leading-[130%]`} style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                        {item.title}
                      </h2>
                    </div>

                    <Image
                      fill
                      priority
                      sizes="100vw"
                      className="w-full h-full z-0 absolute top-0 left-0"
                      quality={80}
                      src={item.image}
                      alt=""
                    />
                    <button className="w-11.5 h-11.5 absolute top-6.5 right-6 z-1 flex items-center justify-center bg-white rounded-md">
                      <Image width={10} height={10} src={'/assets/Vector 93 (1).svg'} alt="" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="pt-11.75 pb-6 pr-6 pl-11.75 flex flex-col gap-8.25">
                    <div className="flex justify-between items-center">
                      <h2 className="max-w-97.5 w-full leading-[120%] text-[#181B21] text-[21px]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>
                        {item.fullTitle}
                      </h2>
                      <span className="text-lg italic font-light text-[#65656578] leading-[100%]" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}>{item.date}</span>
                    </div>

                    <p className="max-w-125 w-full text-[#656565] text-lg font-normal leading-normal" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}  >
                      {item.description}
                    </p>

                    <button
                      className="flex max-lg:mx-auto text-[19.2px] font-medium items-center gap-2 align-middle
          text-[#4374FA] hover:text-[#4374FA] transition-colors duration-200"
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
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-2 md:hidden">
            {testimonials.map((item) => (
              <div key={item.id} className="shrink-0 w-full">
                <div className="bg-white relative rounded-xl overflow-hidden border border-[#65656526] hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className={`relative rounded-b-xl ${item.mobileHeight} w-full`}>
                    <div className="relative z-1 pt-5.75 px-6.25 pl-6.5">
                      <p className="text-2xl font-semibold font-display leading-[90%] bk-p" style={{ lineHeight: '150%', fontFamily: 'var(--font-manrope)' }}>{item.shortTitle}</p>
                      <h2 className="w-full text-[21px] font-display font-semibold leading-[90%]" style={{ lineHeight: '150%', fontFamily: 'var(--font-manrope)' }} >{item.title}</h2>
                    </div>
                    <Image
                      src={item.mobileImage || item.image}
                      className="max-w-full absolute bottom-0 left-6.25 h-auto w-full"
                      width={1000}
                      height={1000}
                      alt=""
                    />
                  </div>

                  {/* Content */}
                  <div className="pt-5 lg:pt-11.75 pb-6 pr-5.25 lg:pr-6 pl-5.25 lg:pl-13.75 flex flex-col gap-6.25">
                    <div className="flex justify-between flex-col gap-6.25 lg:items-center">
                      <h2 className="max-w-76.5 w-full leading-[90%] text-[#181B21] text-2xl font-display font-semibold">
                        {item.fullTitle}
                      </h2>
                      <span className="text-lg italic font-light text-[#65656578] leading-[100%]">{item.date}</span>
                    </div>

                    <p className="max-w-83.75 w-full text-[#656565] text-lg font-normal font-ui leading-normal">
                      {item.description}
                    </p>

                    <button
                      className="flex text-[19.2px] font-medium items-center gap-2 align-middle
          text-[#4374FA] hover:text-[#4374FA] transition-colors duration-200"
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
