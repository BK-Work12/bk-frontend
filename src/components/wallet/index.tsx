'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Deposit } from './deposit';
import { Withdraw } from './withdraw';
import WithdrawModal from '../ui/withdrawModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type Tab = 'deposit' | 'withdraw';

export const WalletIndex: React.FC = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(() =>
    searchParams.get('tab') === 'withdraw' ? 'withdraw' : 'deposit'
  );

  useEffect(() => {
    if (searchParams.get('tab') === 'withdraw') setActiveTab('withdraw');
  }, [searchParams]);
  const [open, setOpen] = useState(false);

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="relative min-h-[80vh] 5xl:min-h-screen">
      <WithdrawModal isOpen={open} onClose={() => setOpen(false)} title="Example Modal" />

      {/* Tabs */}
      <div className="grid grid-cols-2">
        <button
          className={`text-center h-10 lg:h-12 pb-2 border-b-2 flex items-center justify-center font-medium font-ui text-sm lg:text-base transition-all duration-150 ${
            activeTab === 'deposit'
              ? 'text-[#6B63DF] dark:text-[#D5F821] border-[#6B63DF] dark:border-[#D5F821]'
              : 'text-[#656565]  dark:text-[#FFFFFF] border-[#65656526] dark:border-[#FFFFFF0F] hover:text-[#656565CC] dark:hover:text-[#FFFFFFCC] hover:border-[#65656540] dark:hover:border-[#FFFFFF30]'
          }`}
          onClick={() => setActiveTab('deposit')}
        >
          {t('Deposit')}
        </button>

        <button
          className={`text-center h-10 lg:h-12 pb-2 border-b-2 flex items-center justify-center font-medium font-ui text-sm lg:text-base transition-all duration-150 ${
            activeTab === 'withdraw'
              ? 'text-[#6B63DF] dark:text-[#D5F821] border-[#6B63DF] dark:border-[#D5F821]'
              : 'text-[#656565]  dark:text-[#FFFFFF] border-[#65656526] dark:border-[#FFFFFF0F] hover:text-[#656565CC] dark:hover:text-[#FFFFFFCC] hover:border-[#65656540] dark:hover:border-[#FFFFFF30]'
          }`}
          onClick={() => setActiveTab('withdraw')}
        >
          {t('Withdraw')}
        </button>
      </div>

      {/* Animated Tab Content */}
      <div className="mt-2 lg:mt-6 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'deposit' && (
            <motion.div
              key="deposit"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Deposit />
            </motion.div>
          )}
          {activeTab === 'withdraw' && (
            <motion.div
              key="withdraw"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Withdraw handleOpen={() => setOpen(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
