'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Strategy {
  termMonths: number;
  payoutFrequency: string;
  apy: number;
}

interface GrowthChartProps {
  strategy: Strategy;
  investedAmount: number;
  interestRate: number; // percent, e.g., 10
  comparisonApr: number; // percent, e.g., 4.5
  onPointSelect?: (month: number) => void;
}

/* ───────── Helpers ───────── */

import { valueAtMonth, getFrequency, type PayoutFrequency } from '@/lib/bondInterest';

const GrowthChart: React.FC<GrowthChartProps> = ({
  strategy,
  investedAmount,
  interestRate,
  comparisonApr,
  onPointSelect,
}) => {
  const { t } = useTranslation();
  const width = 900;
  const height = 600;
  const padding = 60;

  const termMonths = strategy.termMonths;
  const apy = useMemo(() => interestRate / 100, [interestRate]);
  const frequency = useMemo(() => getFrequency(strategy.payoutFrequency), [strategy.payoutFrequency]);

  const isWeekly = frequency === 'weekly';
  const totalWeeks = useMemo(() => Math.round(termMonths * 52 / 12), [termMonths]);
  const xAxisCount = isWeekly ? totalWeeks : termMonths;

  const [selectedIndex, setSelectedIndex] = useState(xAxisCount);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedIndex(xAxisCount); // default to full term
  }, [xAxisCount]);

  /* ───────── Growth Functions ───────── */
  const monthFromIndex = (i: number) => (isWeekly ? (i * 12) / 52 : i);

  // Varntix: simple interest (paid out, not compounded)
  const greenGrowthAt = (i: number) =>
    valueAtMonth(investedAmount, apy, frequency, monthFromIndex(i)) - investedAmount;

  // Coinbase: compound interest at comparison APR
  const blueGrowthAt = (i: number) => {
    const months = monthFromIndex(i);
    if (months <= 0) return 0;
    return investedAmount * (Math.pow(1 + comparisonApr / 100, months / 12) - 1);
  };

  const maxY = Math.max(greenGrowthAt(xAxisCount), blueGrowthAt(xAxisCount));

  /* ───────── Scales ───────── */

  const scaleX = (i: number) => padding + (i / xAxisCount) * (width - padding * 2);
  const scaleY = (v: number) => height - padding - (v / maxY) * (height - padding * 2);

  /* ───────── Points ───────── */

  const xPoints = Array.from({ length: xAxisCount + 1 }, (_, i) => i);

  const greenPath = xPoints.map((i, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(greenGrowthAt(i))}`).join(' ');
  const bluePath = xPoints.map((i, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(blueGrowthAt(i))}`).join(' ');

  /* ───────── Click / Hover Handlers ───────── */
  /** Map client coords to viewBox X and compute index from chart x-range [padding, width-padding]. */
  const clientToIndex = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): number => {
      const svg = e.currentTarget;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return Math.round(xAxisCount / 2);
      const svgPt = pt.matrixTransform(ctm.inverse());
      const chartWidth = width - padding * 2;
      const index = (svgPt.x - padding) / chartWidth * xAxisCount;
      const rounded = Math.round(index);
      return Math.max(0, Math.min(xAxisCount, rounded));
    },
    [xAxisCount],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const clamped = clientToIndex(e);
      setSelectedIndex(clamped);
      onPointSelect?.(monthFromIndex(clamped));
    },
    [clientToIndex, onPointSelect],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const clamped = clientToIndex(e);
      setHoverIndex(clamped);
      onPointSelect?.(monthFromIndex(clamped));
    },
    [clientToIndex],
  );

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeIndex = hoverIndex ?? selectedIndex;
  const tickStep = xAxisCount <= 12 ? 1 : Math.ceil(xAxisCount / 6);

  const activeMonthNum = monthFromIndex(activeIndex);
  const isOnMonthBoundary =
    isWeekly && Math.abs(activeMonthNum - Math.round(activeMonthNum)) < 0.08;
  const hintMonth = Math.round(activeMonthNum);
  const hintLabel = isWeekly
    ? isOnMonthBoundary
      ? hintMonth === 0
        ? t('Today')
        : `${hintMonth} ${hintMonth === 1 ? t('Month') : t('Months')}`
      : `${activeIndex} ${activeIndex === 1 ? t('Week') : t('Weeks')}`
    : activeIndex === 0
      ? t('Today')
      : `${activeIndex} ${activeIndex === 1 ? t('Month') : t('Months')}`;
  const hintWidth = Math.max(60, Math.min(90, hintLabel.length * 9));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full cursor-pointer"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#84cc16" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* X-axis */}
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#374151" />

        {/* X-axis ticks */}
        {xPoints.map((i) => (
          <line
            key={i}
            x1={scaleX(i)}
            x2={scaleX(i)}
            y1={height - padding}
            y2={height - padding + (i % tickStep === 0 ? 10 : 5)}
            stroke="#4b5563"
          />
        ))}

        {/* Filled areas */}
        <path
          d={`${greenPath} L ${scaleX(xAxisCount)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`}
          fill="url(#greenFill)"
        />
        <path
          d={`${bluePath} L ${scaleX(xAxisCount)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`}
          fill="url(#blueFill)"
        />

        {/* Growth lines */}
        <path d={greenPath} fill="none" stroke="#84cc16" strokeWidth={3} />
        <path d={bluePath} fill="none" stroke="#3b82f6" strokeWidth={3} />

        {/* End dots */}
        <circle
          cx={scaleX(xAxisCount)}
          cy={scaleY(greenGrowthAt(xAxisCount))}
          r={6}
          fill="#84cc16"
          stroke="white"
          strokeWidth={2}
        />
        <circle
          cx={scaleX(xAxisCount)}
          cy={scaleY(blueGrowthAt(xAxisCount))}
          r={6}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
        />

        {/* Marker line */}
        <line
          x1={scaleX(activeIndex)}
          x2={scaleX(activeIndex)}
          y1={scaleY(greenGrowthAt(activeIndex))}
          y2={height - padding}
          stroke="white"
          strokeOpacity={0.6}
          style={{ transition: 'all 200ms ease-out' }}
        />

        {/* Marker dot */}
        <circle
          cx={scaleX(activeIndex)}
          cy={scaleY(greenGrowthAt(activeIndex))}
          r={6}
          fill="#84cc16"
          stroke="white"
          strokeWidth={2}
          style={{ transition: 'all 200ms ease-out' }}
        />

        {/* Axis labels */}
        <text x={padding} y={height - 15} fill="#656565A6" fontSize="18">
          {t('Today')}
        </text>
        <text x={width - padding} y={height - 15} fill="#656565A6" fontSize="18" textAnchor="end">
          {termMonths} {termMonths === 1 ? t('Month') : t('Months')}
        </text>

        {/* Marker callout */}
        <g
          transform={`translate(${scaleX(activeIndex)}, ${height - padding + 14})`}
          style={{ transition: 'all 200ms ease-out' }}
        >
          <rect
            x={-hintWidth / 2}
            y={0}
            width={hintWidth}
            height={28}
            rx={6}
            fill="black"
            stroke="white"
            strokeOpacity={0.6}
          />
          <text x={0} y={20} fill="white" fontSize="14" textAnchor="middle">
            {hintLabel}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default GrowthChart;
