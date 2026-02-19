import React from 'react';

type WalletIconProps = {
  theme?: 'light' | 'dark';
  width?: number;
  height?: number;
};

const COLORS = {
  light: {
    stroke: '#000000B8',
    opacity: 1,
  },
  dark: {
    stroke: '#FFFFFFB8',
    opacity: 0.72,
  },
};

const WalletsIcon: React.FC<WalletIconProps> = ({ theme = 'light', width = 24, height = 24 }) => {
  const { stroke, opacity } = COLORS[theme];

  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.0368 16.2187V19.2321C20.0368 19.6584 19.8674 20.0672 19.5661 20.3686C19.2648 20.6699 18.8559 20.8393 18.4297 20.8393H3.16183C2.73558 20.8393 2.32681 20.6699 2.02541 20.3686C1.72401 20.0672 1.55469 19.6584 1.55469 19.2321V7.98214C1.55469 5.31935 3.71332 3.16071 6.37612 3.16071H16.8225V6.77678"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.6434 11.3973H16.0184C15.5746 11.3973 15.2148 11.7571 15.2148 12.2009V15.4152C15.2148 15.859 15.5746 16.2188 16.0184 16.2188H21.6434C22.0871 16.2188 22.447 15.859 22.447 15.4152V12.2009C22.447 11.7571 22.0871 11.3973 21.6434 11.3973Z"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.0357 11.3973V8.38393C20.0357 7.95768 19.8663 7.54891 19.565 7.2475C19.2636 6.94612 18.8548 6.77679 18.4286 6.77679H6.375"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.55469 12.1256H5.97433L8.38505 10.1166H11.1975"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.38672 13.808H11.1992"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.55469 15.4905H5.97433L8.38505 17.4995H11.1975"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default WalletsIcon;
