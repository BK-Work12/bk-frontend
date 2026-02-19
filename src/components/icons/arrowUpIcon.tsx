import React from 'react';

type ArrowUpIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

const ArrowUpIcon: React.FC<ArrowUpIconProps> = ({ width = 10, height = 10, color = '#6F6F71' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.85358 0.5C9.85358 0.223858 9.62972 0 9.35358 0H4.85358C4.57743 0 4.35358 0.223858 4.35358 0.5C4.35358 0.776142 4.57743 1 4.85358 1H8.85358V5C8.85358 5.27614 9.07743 5.5 9.35358 5.5C9.62972 5.5 9.85358 5.27614 9.85358 5V0.5ZM0.353577 9.5L0.70713 9.85355L9.70713 0.853553L9.35358 0.5L9.00002 0.146447L2.32756e-05 9.14645L0.353577 9.5Z"
        fill={color}
      />
    </svg>
  );
};

export default ArrowUpIcon;
