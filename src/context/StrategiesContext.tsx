'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getStrategies, type Strategy } from '@/lib/api';

type StrategiesContextType = {
  strategies: Strategy[];
  loading: boolean;
  error: Error | null;
  getStrategyById: (id: string) => Strategy | null;
};

const StrategiesContext = createContext<StrategiesContextType | null>(null);

export function StrategiesProvider({ children }: { children: React.ReactNode }) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    getStrategies()
      .then((data) => {
        if (mounted) setStrategies(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to load strategies'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getStrategyById = useCallback(
    (id: string) => strategies.find((s) => s.strategyId === id) ?? null,
    [strategies]
  );

  const value = useMemo<StrategiesContextType>(
    () => ({
      strategies,
      loading,
      error,
      getStrategyById,
    }),
    [strategies, loading, error, getStrategyById]
  );

  return (
    <StrategiesContext.Provider value={value}>
      {children}
    </StrategiesContext.Provider>
  );
}

export function useStrategies(): StrategiesContextType {
  const ctx = useContext(StrategiesContext);
  if (!ctx) {
    throw new Error('useStrategies must be used within a StrategiesProvider');
  }
  return ctx;
}
