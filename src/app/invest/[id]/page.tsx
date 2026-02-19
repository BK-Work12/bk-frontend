// src/app/bonds/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getStrategies } from '@/lib/api';
import InvestDetailsLoader from './invest-details-loader';

interface Props {
  params: Promise<{ id: string }>;
}

const DEFAULT_INVEST_IDS = ['1', '2', '3'];

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = new Set<string>(DEFAULT_INVEST_IDS);

  try {
    const strategies = await getStrategies();
    strategies.forEach((s) => ids.add(String(s.strategyId)));
  } catch {
    // API failed at build time – fallback to defaults
  }

  return Array.from(ids).map((id) => ({ id }));
}

export default async function BondDetailsPage({ params }: Props) {
  const { id } = await params;
  if (!id) return notFound();

  return <InvestDetailsLoader id={id} />;
}
