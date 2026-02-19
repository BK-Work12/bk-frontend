'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/mainLayout';
import { InvestDetails } from '@/components/invest-component/investDetails';

export default function InvestDetailsClient({ strategy, allStrategies }: any) {
  const [selectedStrategy, setSelectedStrategy] = useState(strategy);

  const handleStrategyChange = (newStrategy: any) => {
    setSelectedStrategy(newStrategy);
    // Update URL without full navigation
    window.history.replaceState(null, '', `/bonds/${newStrategy.id || newStrategy.strategyId}`);
  };

  return (
    <MainLayout>
      <div className="pt-4 lg:pt-10">
        <InvestDetails
          strategy={selectedStrategy}
          allStrategies={allStrategies}
          onStrategyChange={handleStrategyChange}
        />
      </div>
    </MainLayout>
  );
}
