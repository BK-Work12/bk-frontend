'use client';

import { TransactionsIndex } from '@/components/transactions';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const INITIAL_DISPLAY_LIMIT = 10;

export default function TransactionsContent() {
  const { t } = useTranslation();
  const [displayLimit, setDisplayLimit] = useState<number>(INITIAL_DISPLAY_LIMIT);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const hasOverflow = Number.isFinite(displayLimit) && totalFiltered > displayLimit;

  return (
    <div className="pt-9">
      <TransactionsIndex
        displayLimit={displayLimit}
        onFilteredCount={setTotalFiltered}
        onLoadMore={hasOverflow ? () => setDisplayLimit(Number.POSITIVE_INFINITY) : undefined}
      />
      {hasOverflow && (
        <button
          type="button"
          onClick={() => setDisplayLimit(Number.POSITIVE_INFINITY)}
          className="
  max-w-[349px] my-5 mx-auto w-full h-12
  text-sm font-ui
  text-[#656565] dark:text-[#656565]
  rounded-xl
  flex items-center justify-center
  bg-[#0000001A] dark:bg-[#0000001A]
  border border-[#FFFFFF80]
  hover:bg-[#00000026]
  dark:hover:bg-[#00000033]
  hover:border-white
  transition-all duration-200
"
        >
          {t('LoadMore')}
        </button>
      )}
    </div>
  );
}
