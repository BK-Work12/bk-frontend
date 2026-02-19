'use client';

import Image from 'next/image';
import React, { useMemo } from 'react';

const STEP = 50;

/** Snap a value to the nearest $50 increment, respecting the min. */
function snapToStep(value: number, min: number, step: number): number {
  return Math.max(min, Math.round(value / step) * step);
}

type CurrencySliderProps = {
  strategy: { minInvestment: number; cap?: number };
  value: number;
  onChange: (value: number) => void;
};

const CurrencySlider = ({ strategy, value, onChange }: CurrencySliderProps) => {
  const min = useMemo(() => Number(strategy.minInvestment) || 0, [strategy.minInvestment]);
  const max = useMemo(() => Number(strategy.cap ?? strategy.minInvestment) || min, [strategy.cap, strategy.minInvestment, min]);

  const percentage = useMemo(() => {
    if (max <= min) return 0;
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const snapped = snapToStep(raw, min, STEP);
    onChange(Math.min(max, snapped));
  };

  // Offset the thumb so it stays within the track bounds
  // At 0% the center should be at the left edge of the track,
  // at 100% the center should be at the right edge.
  // Range input thumbs naturally follow this with a built-in offset.
  const thumbLeft = `calc(${percentage}% + ${20 - (percentage / 100) * 40}px)`;

  return (
    <div className="w-full">
      <div className="relative w-full flex items-center h-10">
        {/* Custom Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={STEP}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-3 rounded-full appearance-none cursor-pointer accent-transparent"
          style={{
            background: `linear-gradient(to right, #53A7FF ${percentage}%, #3a3a3c ${percentage}%)`,
          }}
        />

        {/* Custom Thumb Overlay (The Blue Box with < >) */}
        <div
          className="absolute pointer-events-none flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#53A7FF] to-[#4374FA] shadow-lg -translate-x-1/2"
          style={{
            left: thumbLeft,
          }}
        >
          <div className="flex gap-[6.5px]">
            <Image width={7.5} height={15} src="/assets/Vector 19.png" alt="" />
            <Image width={7.5} height={15} src="/assets/Vector 20.png" alt="" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between pt-2 text-[#656565] dark:text-[#FFFFFFA6] font-medium text-base">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>

      {/* Tailwind Custom CSS required for the thumb to be invisible */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 40px;
          height: 40px;
          background: transparent;
          cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-runnable-track {
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
};

export default CurrencySlider;
