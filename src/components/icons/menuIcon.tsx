import React from 'react';

type MenuIconProps = {
  color?: string;
  width?: number;
  height?: number;
};

const MenuIcon: React.FC<MenuIconProps> = ({ color = 'white', width = 17, height = 7 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 17 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.75 0.75H15.75M0.75 5.75H13.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MenuIcon;
