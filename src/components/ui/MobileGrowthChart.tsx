'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { valueAtMonth, getFrequency, type PayoutFrequency } from '@/lib/bondInterest';

interface Strategy {
  termMonths: number;
  payoutFrequency: string;
  apy: number;
}

interface GrowthChartProps {
  strategy: Strategy;
  investedAmount: number;
  interestRate: number;
  comparisonApr: number;
  onPointSelect?: (month: number) => void;
}

const MobileChart: React.FC<GrowthChartProps> = ({
  strategy,
  investedAmount,
  interestRate,
  comparisonApr,
  onPointSelect,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 400 });

  const termMonths = strategy.termMonths;
  const apy = useMemo(() => interestRate / 100, [interestRate]);
  const frequency = useMemo(() => getFrequency(strategy.payoutFrequency), [strategy.payoutFrequency]);

  const isWeekly = frequency === 'weekly';
  const totalWeeks = useMemo(() => Math.round((termMonths * 52) / 12), [termMonths]);
  const xAxisCount = isWeekly ? totalWeeks : termMonths;

  const [selectedIndex, setSelectedIndex] = useState(() => (isWeekly ? totalWeeks : termMonths));

  const greenGradientId = useMemo(() => `greenFill-mobile-${crypto.randomUUID()}`, []);
  const blueGradientId = useMemo(() => `blueFill-mobile-${crypto.randomUUID()}`, []);

  useEffect(() => {
    setSelectedIndex(xAxisCount); // default to full term
  }, [xAxisCount]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width, height } = entries[0].contentRect;
      setSize({ width, height: Math.max(height, 400) });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const monthFromIndex = (i: number) => (isWeekly ? (i * 12) / 52 : i);

  // Varntix: simple interest (paid out, not compounded)
  const greenGrowthAt = (i: number) => valueAtMonth(investedAmount, apy, frequency, monthFromIndex(i)) - investedAmount;

  // Coinbase: compound interest at comparison APR
  const blueGrowthAt = (i: number) => {
    const months = monthFromIndex(i);
    if (months <= 0) return 0;
    return investedAmount * (Math.pow(1 + comparisonApr / 100, months / 12) - 1);
  };

  const maxY = Math.max(greenGrowthAt(xAxisCount), blueGrowthAt(xAxisCount));

  const paddingX = 33;
  const topPadding = 20;
  const bottomPadding = 50;

  const xAxisY = size.height - bottomPadding;
  const labelY = xAxisY + 26;
  const calloutY = xAxisY + 10;

  const scaleX = (i: number) => paddingX + (i / xAxisCount) * (size.width - paddingX * 2);
  const scaleY = (v: number) => xAxisY - (v / maxY) * (xAxisY - topPadding);

  const xPoints = Array.from({ length: xAxisCount + 1 }, (_, i) => i);
  const greenPath = xPoints
    .map((i, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(greenGrowthAt(i))}`)
    .join(' ');
  const bluePath = xPoints
    .map((i, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(blueGrowthAt(i))}`)
    .join(' ');

  /** Map client coords to viewBox X and compute index from chart x-range [paddingX, size.width - paddingX]. */
  const clientToIndex = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): number => {
      const svg = e.currentTarget;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return Math.round(xAxisCount / 2);
      const svgPt = pt.matrixTransform(ctm.inverse());
      const chartWidth = size.width - paddingX * 2;
      if (chartWidth <= 0) return Math.round(xAxisCount / 2);
      const index = ((svgPt.x - paddingX) / chartWidth) * xAxisCount;
      const rounded = Math.round(index);
      return Math.max(0, Math.min(xAxisCount, rounded));
    },
    [xAxisCount, size.width],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const clamped = clientToIndex(e);
      setSelectedIndex(clamped);
      onPointSelect?.(monthFromIndex(clamped));
    },
    [clientToIndex, onPointSelect],
  );

  const tickStep = xAxisCount <= 12 ? 1 : Math.ceil(xAxisCount / 6);

  const activeMonthNum = monthFromIndex(selectedIndex);
  const isOnMonthBoundary = isWeekly && Math.abs(activeMonthNum - Math.round(activeMonthNum)) < 0.08;
  const hintMonth = Math.round(activeMonthNum);
  const hintLabel = isWeekly
    ? isOnMonthBoundary
      ? hintMonth === 0
        ? t('Today')
        : `${hintMonth} ${hintMonth === 1 ? t('Month') : t('Months')}`
      : `${selectedIndex} ${selectedIndex === 1 ? t('Week') : t('Weeks')}`
    : selectedIndex === 0
      ? t('Today')
      : `${selectedIndex} ${selectedIndex === 1 ? t('Month') : t('Months')}`;
  const hintWidth = Math.max(52, Math.min(80, hintLabel.length * 8));

  return (
    <div ref={containerRef} className="w-full h-[400px] relative">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="xMidYMax meet"
        onClick={handleClick}
      >
        <defs>
          <radialGradient
            id={greenGradientId}
            cx="45.72%" // corresponds to CSS at 45.72% horizontal
            cy="27.07%" // corresponds to CSS at 27.07% vertical
            r="72.93%" // size
            fx="45.72%" // focal point x
            fy="27.07%" // focal point y
          >
            <stop offset="0%" stopColor="rgba(142, 221, 35, 0.25)" />
            <stop offset="100%" stopColor="rgba(142, 221, 35, 0)" />
          </radialGradient>
          <linearGradient id={blueGradientId} gradientUnits="userSpaceOnUse" x1="0" y1={topPadding} x2="0" y2={xAxisY}>
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* X-axis */}
        <line x1={paddingX} x2={size.width - paddingX} y1={xAxisY} y2={xAxisY} stroke="#374151" />

        {/* X ticks */}
        {xPoints.map((i) => (
          <line
            key={i}
            x1={scaleX(i)}
            x2={scaleX(i)}
            y1={xAxisY}
            y2={xAxisY + (i % tickStep === 0 ? 8 : 4)}
            stroke="#4b5563"
          />
        ))}

        {/* Filled areas */}
        <path
          d={`${greenPath} L ${scaleX(xAxisCount)} ${xAxisY} L ${scaleX(0)} ${xAxisY} Z`}
          fill={`url(#${greenGradientId})`}
        />
        <path
          d={`${bluePath} L ${scaleX(xAxisCount)} ${xAxisY} L ${scaleX(0)} ${xAxisY} Z`}
          fill={`url(#${blueGradientId})`}
        />

        {/* Lines */}
        <path d={greenPath} fill="none" stroke="#84cc16" strokeWidth={2.5} />
        <path d={bluePath} fill="none" stroke="#3b82f6" strokeWidth={2.5} />

        {/* Marker */}
        <line
          x1={scaleX(selectedIndex)}
          x2={scaleX(selectedIndex)}
          y1={scaleY(greenGrowthAt(selectedIndex))}
          y2={xAxisY}
          stroke="white"
          strokeOpacity={0.6}
        />
        <circle
          cx={scaleX(selectedIndex)}
          cy={scaleY(greenGrowthAt(selectedIndex))}
          r={5}
          fill="#84cc16"
          stroke="white"
          strokeWidth={2}
        />

        {/* End dots at xAxisCount only */}
        <circle
          cx={scaleX(xAxisCount)}
          cy={scaleY(greenGrowthAt(xAxisCount))}
          r={5}
          fill="#84cc16"
          stroke="white"
          strokeWidth={2}
        />
        <circle
          cx={scaleX(xAxisCount)}
          cy={scaleY(blueGrowthAt(xAxisCount))}
          r={5}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
        />

        {/* Axis labels */}
        <text x={paddingX} y={labelY} fill="#656565A6" fontSize="14">
          {t('Today')}
        </text>
        <text x={size.width - paddingX} y={labelY} fill="#656565A6" fontSize="14" textAnchor="end">
          {termMonths} {termMonths === 1 ? t('Month') : t('Months')}
        </text>

        {/* Callout */}
        <g transform={`translate(${scaleX(selectedIndex)}, ${calloutY})`}>
          <rect
            x={-hintWidth / 2}
            y={0}
            width={hintWidth}
            height={24}
            rx={6}
            fill="black"
            stroke="white"
            strokeOpacity={0.6}
          />
          <text x={0} y={16} fill="#FFFFFFA6" fontSize="12" textAnchor="middle">
            {hintLabel}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default MobileChart;
