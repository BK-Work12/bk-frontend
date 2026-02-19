import React from 'react';

type LogoutIconProps = {
  color?: string;
  width?: number;
  height?: number;
};

const LogoutIcon: React.FC<LogoutIconProps> = ({ color = 'white', width = 24, height = 24 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.2333 19.2321C19.2333 19.6584 19.0639 20.0672 18.7625 20.3686C18.4612 20.6699 18.0523 20.8393 17.6261 20.8393H3.16183C2.73558 20.8393 2.32681 20.6699 2.02541 20.3686C1.72401 20.0672 1.55469 19.6584 1.55469 19.2321V4.76786C1.55469 4.34161 1.72401 3.93283 2.02541 3.63143C2.32681 3.33004 2.73558 3.16071 3.16183 3.16071H17.6261C18.0523 3.16071 18.4612 3.33004 18.7625 3.63143C19.0639 3.93283 19.2333 4.34161 19.2333 4.76786"
        stroke={color}
        strokeOpacity={0.72}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3945 12H22.4481"
        stroke={color}
        strokeOpacity={0.72}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.2344 8.78571L22.4487 12L19.2344 15.2143"
        stroke={color}
        strokeOpacity={0.72}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LogoutIcon;
