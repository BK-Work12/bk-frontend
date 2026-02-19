'use client';
import { AddFunds } from '@/components/home/add-funds';

import Clients from '@/components/home/clients';
import { EraSection } from '@/components/home/era-section';
import { FAQSection } from '@/components/home/faq-section';
import { HeroSection } from '@/components/home/heroSection';
import { Management } from '@/components/home/managment';
import News from '@/components/home/news';
import Portfolio from '@/components/home/portfolio';
import { Testimonials } from '@/components/home/testimonials';
import { WhyUs } from '@/components/home/whyUs';
import { Footer } from '@/components/layout/footer';
import { HomeHeader } from '@/components/layout/home-header';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const Awards = dynamic(() => import('@/components/home/awards'));

const faqItems = [
  {
    id: '1',
    question: 'What is Varntix?',
    answer:
      'Varntix is a digital investment platform offering structured, fixed-term bonds designed to provide predictable income from digital assets.',
  },
  {
    id: '2',
    question: 'How do Varntix bonds generate returns?',
    answer:
      'Returns are paid as fixed interest in stablecoins and are generated through disciplined treasury and yield strategies.',
  },
  {
    id: '3',
    question: 'What investment terms are available?',
    answer: 'Investors can choose from fixed-term bonds with durations of 6, 12, or 24 months.',
  },
  {
    id: '4',
    question: 'How and when is interest paid?',
    answer: 'Interest is paid in USDT or USDC on a regular schedule, depending on the bond selected.',
  },
  {
    id: '5',
    question: 'Can I redeem my investment early?',
    answer: 'Early redemption is available, subject to the bond’s notice period and applicable terms.',
  },
  {
    id: '6',
    question: 'Who can invest with Varntix?',
    answer:
      'Varntix is designed for eligible investors, including individuals and corporate clients, subject to onboarding and verification.',
  },
  {
    id: '7',
    question: 'How do I track my investment?',
    answer:
      'All investments, interest payments, and upcoming payout dates can be viewed directly within your Varntix dashboard.',
  },
  {
    id: '8',
    question: 'Is there a minimum investment amount?',
    answer: 'Minimum investment amounts vary by bond type and are clearly displayed before you invest.',
  },
];
export default function Home() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // change color after small scroll (e.g. 40px)
      setPastHero(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll);
    onScroll(); // run once on mount

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-white relative">
      <button
        className={`
    fixed md:flex z-20 bottom-3.5 right-4 w-16 h-16
    rounded-[20px] hidden items-center justify-center
    backdrop-blur-lg shrink-0
    transition-all duration-300
    ${pastHero ? 'bg-black/50 border-white/20' : 'bg-[#FFFFFF1A] border-[#FFFFFF4D]'}
  `}
      >
        <Image width={35} height={35} src="/assets/chat.svg" alt="" />
      </button>

      <HomeHeader />

      <HeroSection />

      <Portfolio />
      <Management />
    
      <AddFunds />
      <div className="pt-4 main lg:pt-26.5 lg:px-4 ">
       <div className="bk-ex max-w-[1320px]   px-18 w-full mx-auto dottedBlack rounded-md relative overflow-hidden flex items-center max-xl:pt-8.25 max-xl:pb-10.5 xl:h-95.5">
        <div className="max-w-340.5 relative z-1 lg:gap-10 2xl:gap-0 max-3xl:mx-auto  flex flex-col lg:flex-row justify-between  lg:items-center w-full">
          <Image width={131} height={131} src={'/assets/cryptocurrency-colorvarnrix.svg'} className='max-lg:pb-11.25' alt='' />
          <h2 className='text-[32px] font-semibold leading-[120%] max-w-100 max-lg:pb-12.5 2xl:max-w-108 w-full'>
            Experience premium perks with the Varntix Rewards Program.
          </h2>
          <p className="max-w-119 w-full manrope font-normal leading-[130%] text-[16px] max-lg:pb-15.25" style={{ fontWeight: 400, fontFamily: 'var(--font-manrope)' }}
>
            Join Vantix’s Loyalty Program with an account balance above $5,000. Enjoy daily interest earnings, lower borrow rates, crypto cashback on purchases, and many more premium benefits.
          </p>
               <Link href={'/sign-up'} className='lg:hidden'>
                <button
                  className="rounded-xl h-15.5 px-5 flex items-center justify-center lg:max-w-90.25 w-full font-bold font-ui text-base transition-all duration-300 hover:brightness-110 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
                  }}
                >
                  Sign up
                </button>
              </Link>
        </div>

        <Image width={1000} height={1000} className='max-w-full hidden lg:block absolute bottom-0 h-auto w-full ' src={'/assets/Ellipse 36.svg'} alt='' />
        <Image width={1000} height={1000} className='max-w-full  lg:hidden absolute bottom-0 h-auto w-full left-0 ' src={'/assets/Ellipse 36 (1).svg'} alt='' />
       </div>
      </div>
      <WhyUs />
      <div className="hidden lg:block">
        <Testimonials />
      </div>
      <Awards />
      <div className="">
        <News />
      </div>

      <FAQSection items={faqItems} />
      <EraSection />
      <Footer />
    </div>
  );
}
