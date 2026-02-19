import React from 'react';

type ProfileIconProps = {
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

const ProfileIcon: React.FC<ProfileIconProps> = ({ theme = 'light', width = 24, height = 24 }) => {
  const { stroke, opacity } = COLORS[theme];

  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.6417 16.8214V20.0357C21.6417 20.4619 21.4723 20.8708 21.171 21.1721C20.8697 21.4735 20.4608 21.6429 20.0346 21.6429H16.8203"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.8203 2.35714H20.0346C20.4608 2.35714 20.8697 2.52647 21.171 2.82786C21.4723 3.12926 21.6417 3.53804 21.6417 3.96428V7.17857"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.35547 7.17857V3.96428C2.35547 3.53804 2.5248 3.12926 2.82618 2.82786C3.12759 2.52647 3.53637 2.35714 3.96261 2.35714H7.1769"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.1769 21.6429H3.96261C3.53637 21.6429 3.12759 21.4735 2.82618 21.1721C2.5248 20.8708 2.35547 20.4619 2.35547 20.0357V16.8214"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9994 11.1964C13.7746 11.1964 15.2137 9.75731 15.2137 7.98212C15.2137 6.20694 13.7746 4.76785 11.9994 4.76785C10.2242 4.76785 8.78516 6.20694 8.78516 7.98212C8.78516 9.75731 10.2242 11.1964 11.9994 11.1964Z"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9995 13.6071C9.00404 13.6071 6.48709 15.6559 5.77344 18.4286H18.2255C17.512 15.6559 14.9949 13.6071 11.9995 13.6071Z"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ProfileIcon;
