'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import MoonIcon from './icons/moonIcon';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="
        relative hidden  w-11.5 h-11.5 gap-1.5 text-lg font-medium font-ui
        bg-[#F6F8FA] dark:bg-[#121213]
        border border-[#E9E9E9] dark:border-transparent
        text-[#65656580] dark:text-[#FFFFFF80]
        hover:bg-[#ECEFF3] dark:hover:bg-[#2F2F31]
        hover:text-[#656565] dark:hover:text-white
        rounded-[9px]
         justify-center items-center
        transition-all duration-200
      "
    >
      {resolvedTheme === 'dark' ? <MoonIcon color="#fff" /> : <MoonIcon color="#65656580" />}
    </button>
  );
}
