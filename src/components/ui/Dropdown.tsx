'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import ArrowDown from '../icons/arrowDown';

interface DropdownOption {
  label: string;
  icon: string;
}

interface DropdownProps {
  label: string;
  selected: DropdownOption;
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  error?: string;
}

export function Dropdown({ label, selected, options, onSelect, error }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 lg:gap-2.5 relative" ref={containerRef}>
      <label className="text-[#656565] dark:text-[#FFFFFFA6] pl-2.5 lg:pl-3.5 font-medium text-sm font-ui">
        {label}
        {error && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* Selected / toggle */}
      <div
        onClick={() => setOpen((v) => !v)}
        className={`px-3 lg:px-4.5 cursor-pointer relative py-1.5 justify-between bg-[#FFFFFF] dark:bg-[#111111] rounded-full flex gap-3 items-center ${
          error ? 'ring-2 ring-red-500' : ''
        }`}
      >
        <div className="flex items-center gap-3 lg:gap-4">
          {selected.icon && (
            <button className="relative w-9 h-9 lg:w-11 lg:h-10.75 flex items-center gap-1.75 justify-center bg-[#323234] dark:bg-[#111111] rounded-md shrink-0">
              <Image width={24} height={24} src={selected.icon} className="w-5 h-5 lg:w-6 lg:h-6" alt={selected.label} />
            </button>
          )}
          <span className="text-[#656565A6] dark:text-[#FFFFFF66] text-sm font-normal font-ui">{selected.label}</span>
        </div>
        <span className="dark:hidden cursor-pointer">
          <ArrowDown color="#65656559" />
        </span>
        <span className="dark:block hidden cursor-pointer">
          <ArrowDown />
        </span>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute top-full mt-1 left-0 bg-white dark:bg-[#111111] rounded-md shadow-lg w-full z-20 overflow-hidden"
          >
            {options.map((option) => (
              <div
                key={option.label}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
                className="flex items-center gap-4 lg:gap-8 py-1.5 lg:py-2 px-3 lg:px-4.5 dark:text-[#FFFFFF66] text-[#65656566] cursor-pointer hover:text-white hover:bg-[#111111] rounded-md"
              >
                {option.icon && (
                  <button className="relative w-9 h-9 lg:max-w-11.5 lg:w-full lg:h-10.75 flex items-center gap-1.75 justify-center bg-[#F1F1FE] dark:bg-[#111111] rounded-md shrink-0">
                    <Image width={24} height={24} src={option.icon} className="w-5 h-5 lg:w-6 lg:h-6" alt={option.label} />
                  </button>
                )}
                <span className="text-sm font-normal font-ui">{option.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="pl-3.5 text-sm text-red-500 font-ui">{error}</p>}
    </div>
  );
}
