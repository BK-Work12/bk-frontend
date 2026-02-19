import React from 'react';

type ArrowDownProps = {
  color?: string;
  width?: number;
  height?: number;
  opacity?: number;
};

const ArrowDown: React.FC<ArrowDownProps> = ({ color = 'white', width = 10, height = 9, opacity = 0.35 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.03253 8.25C4.41743 8.91667 5.37968 8.91667 5.76459 8.25L9.6617 1.5C10.0466 0.833333 9.56547 0 8.79567 0H1.00145C0.231645 0 -0.24948 0.833333 0.13542 1.5L4.03253 8.25Z"
        fill={color}
        fillOpacity={opacity}
      />
    </svg>
  );
};

export default ArrowDown;
