'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Marquee from 'react-fast-marquee';

const logos = [
  { src: '/assets/image 1.png', maxW: 'w-[190px] 4xl:w-[235px]', mobileW: 120 },
  { src: '/assets/918798638709670f00d9fceae68206a181013fdd.png', maxW: 'w-[138px] 3xl:w-[138px]', mobileW: 100 },
  { src: '/assets/6b3f48713bcf29197327f191845b8feb2871a60c.png', maxW: 'w-[184px]', mobileW: 110 },
  { src: '/assets/cloudflare.png', maxW: 'w-[180px] 3xl:w-[203px] h-[74px]', mobileW: 120 },
  { src: '/assets/image 5.svg', maxW: 'w-[190px] 3xl:w-[254px] scale-[96%]', mobileW: 130 },
  { src: '/assets/baaeff3e20e95f6cf7b06bbe0b1d3314b7072138.png', maxW: 'w-[190px] 3xl:w-[209px]', mobileW: 120 },
];

// 5 FIXED DESKTOP SLOTS (YOUR EXACT POSITIONS)
const desktopSlots = [
  { className: 'left-[3%] 2xl:left-[4%]', opacity: 0.3, z: 10 },
  { className: 'left-[25%]', opacity: 1, z: 20 },
  { className: 'left-[50%] -translate-x-1/2', opacity: 1, z: 30 },
  { className: 'right-[25%]', opacity: 1, z: 20 },
  { className: 'right-[2%] 2xl:right-[4%]', opacity: 0.3, z: 10 },
];

const getDesktopPosition = (logoSrc: string, slotIndex: number, fallbackClass: string) => {
  const fileName = logoSrc.split('/').pop();
  if (fileName === '918798638709670f00d9fceae68206a181013fdd.png' && slotIndex === 0) {
    return 'left-[6%] 2xl:left-[8%] 4xl:left-[10%]';
  }

  if (fileName === '918798638709670f00d9fceae68206a181013fdd.png' && slotIndex === 4) {
    return 'right-[5%]';
  }

  if (fileName === '6b3f48713bcf29197327f191845b8feb2871a60c.png' && slotIndex === 3) {
    return 'right-[23%] 2xl:right-[25%]';
  }
  if (fileName === '6b3f48713bcf29197327f191845b8feb2871a60c.png' && slotIndex === 1) {
    return 'left-[23%] 2xl:left-[25%]';
  }
  if (fileName === '918798638709670f00d9fceae68206a181013fdd.png' && slotIndex === 3) {
    return ' right-[25%] 2xl:right-[26%] 5xl:right-[27%]';
  }

  if (fileName === '918798638709670f00d9fceae68206a181013fdd.png' && slotIndex === 1) {
    return 'left-[25%] 3xl:left-[27%]';
  }

  if (fileName === 'baaeff3e20e95f6cf7b06bbe0b1d3314b7072138.png' && slotIndex === 1) {
    return 'max-2xl:left-[23%] left-[25%] 5xl:left-[26%]';
  }

  if (fileName === 'baaeff3e20e95f6cf7b06bbe0b1d3314b7072138.png' && slotIndex === 3) {
    return 'right-[22%] 2xl:right-[24%]';
  }

  if (fileName === 'cloudflare.png' && slotIndex === 1) {
    return 'left-[23%] 2xl:left-[25%]';
  }

  if (fileName === 'image 1.png' && slotIndex === 1) {
    return 'max-2xl:left-[23%] left-[24%]';
  }
  if (fileName === 'image 5.svg' && slotIndex === 3) {
    return '3xl:right-[23%] 5xl:right-[25%] right-[23%]';
  }

  if (fileName === 'image 1.png' && slotIndex === 3) {
    return '3xl:right-[24%] 5xl:right-[25%] right-[22%]';
  }
  if (fileName === 'image 5.svg' && slotIndex === 1) {
    return ' left-[23%]';
  }
  // Default slot position
  return fallbackClass;
};

const logoHeights = [30, 45, 60, 50, 85, 40];

const Awards = () => {
  const [index, setIndex] = useState(0);

  // Auto carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % logos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Map logos to fixed slots
  const visibleLogos = desktopSlots.map((slot, i) => {
    const logoIndex = (index + i - 2 + logos.length) % logos.length;
    return { ...logos[logoIndex], slot };
  });

  return (
    <div className="pt-4.75 lg:pt-23.5 overflow-hidden pb-25.25 lg:pb-25.25 relative">
      <div className="text-center ">
        <h2 className="text-[32px] font-medium font-display text-[#181B21] leading-[100%]" style={{ fontWeight: 500, fontFamily: 'var(--font-manrope)' }}>Powered by robust infrastructure.</h2>
      </div>

      <div className="relative flex xl:h-45.75 w-full">
        {/* ================= DESKTOP ================= */}
     {/* ================= DESKTOP ================= */}
<div className="hidden pt-10 xl:block w-full">
  <Marquee
    speed={40}
    gradient={true}
    gradientColor="#ffffff"
    pauseOnHover={true}
  >
    {logos.map((logo, i) => (
      <div
        key={i}
        className={`mx-16 flex items-center ${logo.maxW}`}
      >
        <Image
          src={logo.src}
          alt="award"
          width={1000}
          height={1000}
          className="w-full h-auto object-contain"
        />
      </div>
    ))}
  </Marquee>
</div>


        {/* ================= MOBILE ================= */}
        <div className="flex items-center gap-3 xl:hidden w-full overflow-hidden">
          <Marquee speed={40} gradient={false}>
            {logos.map((logo, i) => (
              <div key={i} className="mx-5 flex items-center" style={{ height: `${logoHeights[i]}px` }}>
                <Image
                  src={logo.src}
                  alt="award"
                  width={logo.mobileW}
                  height={logoHeights[i]}
                  className="w-auto h-full object-contain"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default Awards;
