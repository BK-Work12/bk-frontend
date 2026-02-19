'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStrategies } from '../../../context/StrategiesContext';
import { getStrategyTotals, type Strategy } from '@/lib/api';
import InvestDetailsClient from './invest-details-client';

function toDetailsStrategy(strategy: Strategy | null, raised: number) {
  if (!strategy) return null;

  return {
    ...strategy,
    id: strategy.strategyId,
    raised,
  };
}

export default function InvestDetailsLoader({ id }: { id: string }) {
  const { strategies, getStrategyById, loading } = useStrategies();
  const [totals, setTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    getStrategyTotals().then((t) => setTotals(t));
  }, []);

  const strategy = getStrategyById(id);
  const detailsStrategy = toDetailsStrategy(strategy, totals[id] ?? 0);

  // Build all strategies in the same group with raised amounts for the dropdown
  const allStrategies = strategies
    .filter((s) => s.type !== 'sold' && strategy && s.groupId === strategy.groupId)
    .map((s) => ({
      ...s,
      id: s.strategyId,
      raised: totals[s.strategyId] ?? 0,
    }));

  // While strategies are still loading, render nothing (or a loader) instead of 404.
  if (loading && !detailsStrategy) {
    return null;
  }

  if (!detailsStrategy) return notFound();

  return <InvestDetailsClient strategy={detailsStrategy} allStrategies={allStrategies} />;
}
