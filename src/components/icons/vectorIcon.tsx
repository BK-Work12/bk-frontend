import React from 'react';

type VectorIconProps = {
  width?: number;
  height?: number;
  strokeColor?: string;
};

const VectorIcon: React.FC<VectorIconProps> = ({ width = 17, height = 12, strokeColor = 'white' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.75 0.75H15.75M3.25 5.75H13.25M6.25 10.75H10.25"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default VectorIcon;
