import React from 'react';

type ArrowRightIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({ width = 12, height = 14, color = 'white' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.25 7.4967C11.9167 7.1118 11.9167 6.14955 11.25 5.76465L1.5 0.135486C0.833331 -0.249414 -6.51254e-07 0.231712 -6.17605e-07 1.00151L-1.25488e-07 12.2598C-9.18391e-08 13.0296 0.833333 13.5108 1.5 13.1259L11.25 7.4967Z"
        fill={color}
      />
    </svg>
  );
};

export default ArrowRightIcon;
