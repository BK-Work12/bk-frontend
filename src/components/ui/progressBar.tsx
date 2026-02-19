interface ProgressBarProps {
  percentage: number;
  label?: string;
  showLabel?: boolean;
}

import { useTranslation } from "react-i18next";

export function ProgressBar({ percentage, label, showLabel = true }: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col gap-3">
      <div className="dark:bg-[#00000099] bg-[#FFFFFF] relative rounded-lg p-[5px]">
        {/* Progress Bar */}
        <div className="relative h-3.5 overflow-hidden rounded-full  ">
          <div
            className="h-full  rounded-full transition-all duration-300"
            style={{
              width: `${clampedPercentage}%`,
              background: 'linear-gradient(263.53deg, #F5FF1E -2.37%, #42DE33 90.71%)',
            }}
          />
        </div>
        {/* Circular Handle at the end of progress */}
        <div
          className="absolute top-1/2 -translate-y-1/2  glow w-[18px] h-[18px] bg-white rounded-full shadow-lg transition-all duration-300"
          style={{
            left: clampedPercentage === 0 ? `calc(${clampedPercentage}% - 2px)` : `calc(${clampedPercentage}% - 12px)`,
          }}
        />
      </div>
      {/* Label below the bar */}
      {showLabel && (
        <div className="max-w-max mx-auto px-4 py-1.5 rounded-[20px] bg-[#FFFFFF1A] text-sm font-medium font-ui border border-[#FFFFFF4D] frosted-glow">
          <span className="gradient-text">{percentage}%</span>{' '}
          <span className="text-xs text-black dark:text-white ">{t('Sold')}</span>
        </div>
      )}
    </div>
  );
}
