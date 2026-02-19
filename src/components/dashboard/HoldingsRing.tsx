'use client';

import React, { useState } from 'react';

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type Segment = {
  label: string;
  sublabel: string;
  value: number;
  color: string;
};

type Props = {
  totalInvestment: number;
  interestPaid: number;
  unrealizedInterest: number;
  totalHoldingsLabel: string;
};

export default function HoldingsRing({
  totalInvestment,
  interestPaid,
  unrealizedInterest,
  totalHoldingsLabel,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  // The active highlight is either the clicked segment or the hovered one
  const active = hovered ?? selected;

  const total = totalInvestment + interestPaid + unrealizedInterest;

  const segments: Segment[] = [
    { label: 'Total Investment', sublabel: 'Cash', value: totalInvestment, color: '#8EDD23' },
    { label: 'Interest Paid', sublabel: 'Activity', value: interestPaid, color: '#9274F3' },
    { label: 'Unrealized Interest', sublabel: 'PNL', value: unrealizedInterest, color: '#53A7FF' },
  ];

  // Single donut ring config
  const size = 240;
  const center = size / 2;
  const radius = 90;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  const gapAngle = 3; // degrees gap between segments
  const gapLength = (gapAngle / 360) * circumference;

  // Build arcs for each segment
  const nonZeroSegments = segments.filter((s) => s.value > 0);
  const activeCount = nonZeroSegments.length;
  const totalGap = activeCount > 1 ? gapLength * activeCount : 0;
  const usableCircumference = circumference - totalGap;

  const arcs: { offset: number; length: number; color: string; index: number }[] = [];
  let cursor = 0;

  segments.forEach((seg, i) => {
    if (total <= 0) {
      // Empty state: equal segments
      const len = circumference / 3;
      arcs.push({ offset: cursor, length: len - 4, color: '#333', index: i });
      cursor += len;
    } else if (seg.value > 0) {
      const fraction = seg.value / total;
      const len = fraction * usableCircumference;
      arcs.push({ offset: cursor, length: len, color: seg.color, index: i });
      cursor += len + (activeCount > 1 ? gapLength : 0);
    }
  });

  const handleLegendClick = (index: number) => {
    if (total <= 0) return;
    setSelected((prev) => (prev === index ? null : index));
  };

  const handleArcClick = (index: number) => {
    if (total <= 0) return;
    setSelected((prev) => (prev === index ? null : index));
  };

  return (
    <div className="shrink-0 mx-auto flex flex-col items-center">
      {/* Legend above the ring */}
      <div className="flex justify-center gap-3 sm:gap-4 mb-2">
        {segments.map((seg, i) => (
          <button
            key={i}
            className={`flex items-center gap-1.5 group px-2 py-1 rounded-full transition-all duration-200 ${
              selected === i
                ? 'bg-[#65656514] dark:bg-white/10 ring-1 ring-[#65656530] dark:ring-white/20'
                : 'hover:bg-[#65656508] dark:hover:bg-white/5'
            }`}
            onClick={() => handleLegendClick(i)}
            onMouseEnter={() => total > 0 && setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span
              className={`text-[10px] sm:text-xs font-ui transition-colors whitespace-nowrap ${
                selected === i || hovered === i
                  ? 'text-black dark:text-white'
                  : 'text-[#656565] dark:text-[#FFFFFF60] group-hover:text-black dark:group-hover:text-white'
              }`}
            >
              {seg.sublabel}
            </span>
          </button>
        ))}
      </div>
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth={strokeWidth}
            onClick={() => setSelected(null)}
            style={{ cursor: 'pointer' }}
          />

          {/* Segment arcs */}
          {arcs.map((arc, idx) => {
            const isActive = active === arc.index;
            const dashLen = arc.length;
            const gapLen = circumference - dashLen;
            // Offset: rotate -90deg to start from top, then add arc offset
            const offset = circumference * 0.25 - arc.offset;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={total <= 0 ? '#333' : arc.color}
                strokeWidth={isActive ? strokeWidth + 6 : strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${dashLen} ${gapLen}`}
                strokeDashoffset={offset}
                style={{
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  opacity: active !== null && !isActive ? 0.25 : 1,
                  cursor: total > 0 ? 'pointer' : 'default',
                  filter: isActive ? `drop-shadow(0 0 8px ${arc.color}80)` : 'none',
                }}
                onMouseEnter={() => total > 0 && setHovered(arc.index)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleArcClick(arc.index)}
              />
            );
          })}

          {/* Invisible wider hit areas */}
          {total > 0 &&
            arcs.map((arc, idx) => {
              const dashLen = arc.length;
              const gapLen = circumference - dashLen;
              const offset = circumference * 0.25 - arc.offset;
              return (
                <circle
                  key={`hit-${idx}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={strokeWidth + 20}
                  strokeLinecap="round"
                  strokeDasharray={`${dashLen} ${gapLen}`}
                  strokeDashoffset={offset}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(arc.index)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleArcClick(arc.index)}
                />
              );
            })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
          {active !== null ? (
            <div className="flex flex-col items-center text-center">
              <div
                className="w-2.5 h-2.5 rounded-full mb-1.5"
                style={{ backgroundColor: segments[active].color }}
              />
              <span className="text-xs sm:text-sm font-medium font-ui text-[#FFFFFF80] leading-tight">
                {segments[active].label}
              </span>
              <span className="text-[10px] sm:text-xs font-normal font-ui text-[#FFFFFF50] leading-tight">
                {segments[active].sublabel}
              </span>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold font-ui text-white leading-tight mt-1">
                {formatUsd(segments[active].value)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <span className="text-xs sm:text-sm font-medium font-ui text-[#FFFFFF80] leading-tight">
                {totalHoldingsLabel}
              </span>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold font-ui text-white leading-tight mt-0.5">
                {formatUsd(total)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
