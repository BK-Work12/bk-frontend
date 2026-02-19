'use client';

import { EraSection } from '@/components/home/era-section';
import { InsightsIndex } from '@/components/insights';
import { Footer } from '@/components/layout/footer';
import { HomeHeader } from '@/components/layout/home-header';

const Insights = () => {
  return (
    <div className="bg-white">
      <HomeHeader />
      <InsightsIndex />
      <EraSection />
      <Footer />
    </div>
  );
};

export default Insights;
