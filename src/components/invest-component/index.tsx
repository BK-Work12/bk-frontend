'use client';
import { useMemo, useState } from 'react';
import HowItWorksModal from '../ui/HowItWorksModal';
import { useTranslation } from 'react-i18next';
import { StrategiesCard } from './strategies-card';
import { useStrategies } from '@/context/StrategiesContext';

export const InvestPageIndex = () => {
  const { strategies } = useStrategies();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const groupedByGroupId = useMemo(() => {
    const byGroup = new Map<number, typeof strategies>();
    for (const s of strategies) {
      const list = byGroup.get(s.groupId) ?? [];
      list.push(s);
      byGroup.set(s.groupId, list);
    }
    return Array.from(byGroup.entries()).map(([groupId, list]) => ({
      id: String(groupId),
      title: list[0]?.groupTitle ?? String(groupId),
      strategies: list,
    }));
  }, [strategies]);

  return (
    <>
      <div className=" max-w-368 w-full mx-auto ">
        <div className=" flex flex-col gap-5">
          {groupedByGroupId.map((group) => (
            <StrategiesCard key={group.id} title={group.title} strategies={group.strategies} />
          ))}
        </div>
      </div>
      <HowItWorksModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
