'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/mainLayout';
import { NewInvestDetails } from '@/components/invest-component/newInvestDetails';

export default function InvestDetailsClient({ strategy, allStrategies }: any) {
  const [selectedStrategy, setSelectedStrategy] = useState(strategy);

  const handleStrategyChange = (newStrategy: any) => {
    setSelectedStrategy(newStrategy);
    // Update URL without full navigation
    window.history.replaceState(null, '', `/invest/${newStrategy.id || newStrategy.strategyId}`);
  };

  return (
    <MainLayout>
      <div className="pt-4 lg:pt-10">
        <NewInvestDetails
          strategy={selectedStrategy}
          allStrategies={allStrategies}
          onStrategyChange={handleStrategyChange}
        />
      </div>
    </MainLayout>
  );
}
