// components/RotatedProgress.tsx
import React from 'react';

interface RotatedProgressProps {
  value: number; // 0–100
  label: string;
}

const SIZE = 37.33467163059929;

export default function RotatedProgress({ value, label }: RotatedProgressProps) {
  const strokeWidth = 4;
  const radius = (SIZE - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative"
      style={{
        width: SIZE,
        height: SIZE,
      }}
    >
      <div className="relative rotate-12">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Background ring */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} stroke="#8EDD23" strokeWidth={strokeWidth} fill="none" />

          {/* Progress ring */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            stroke="#ffff"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>

        {/* Center text */}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12px] font-normal font-ui text-white">{label}</span>
      </div>
    </div>
  );
}
