import React from 'react';

type DashboardIconProps = {
  color?: string;
  width?: number;
  height?: number;
};

const DashboardIcon: React.FC<DashboardIconProps> = ({ color = 'white', width = 15, height = 16 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 0.5C7.79907 0.5 8.08689 0.615305 8.30371 0.821289L13.6182 5.86816C13.8968 6.13285 14.1189 6.45155 14.2705 6.80469C14.4221 7.15781 14.5 7.53856 14.5 7.92285V13.5332C14.5 13.8426 14.377 14.1396 14.1582 14.3584C13.9394 14.5771 13.6424 14.7002 13.333 14.7002H1.66699C1.35762 14.7002 1.06058 14.5771 0.841797 14.3584C0.623004 14.1396 0.5 13.8426 0.5 13.5332V7.92285C0.5 7.53856 0.577897 7.15782 0.729492 6.80469C0.843231 6.53975 0.996469 6.29405 1.18359 6.07617L1.38184 5.86816L6.69727 0.821289C6.91399 0.615401 7.20108 0.500107 7.5 0.5Z"
        stroke={color}
      />
    </svg>
  );
};

export default DashboardIcon;
