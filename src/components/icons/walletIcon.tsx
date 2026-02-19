import React from 'react';

type WalletIconProps = {
  color?: string;
  width?: number;
  height?: number;
};

const WalletIcon: React.FC<WalletIconProps> = ({ color = '#707070', width = 20, height = 20 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0)">
        <path
          d="M17.3125 14.875V16C17.3125 16.5967 17.0754 17.169 16.6535 17.591C16.2315 18.0129 15.6592 18.25 15.0625 18.25H3.8125C3.21576 18.25 2.64347 18.0129 2.22151 17.591C1.79955 17.169 1.5625 16.5967 1.5625 16V8.125C1.5625 7.52826 1.79955 6.95597 2.22151 6.53401C2.64347 6.11205 3.21576 5.875 3.8125 5.875H15.0625C15.6592 5.875 16.2315 6.11205 16.6535 6.53401C17.0754 6.95597 17.3125 7.52826 17.3125 8.125V9.25"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.0625 5.87499L13.3158 2.38149C13.2497 2.24929 13.1582 2.1314 13.0466 2.03455C12.935 1.9377 12.8054 1.86381 12.6651 1.81707C12.5249 1.77033 12.3769 1.75168 12.2295 1.76218C12.0821 1.77267 11.9381 1.81212 11.806 1.87824L3.8125 5.87499"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.3125 14.875C17.6109 14.875 17.897 14.7565 18.108 14.5455C18.319 14.3345 18.4375 14.0484 18.4375 13.75V10.375C18.4375 10.0766 18.319 9.79045 18.108 9.57948C17.897 9.3685 17.6109 9.25 17.3125 9.25H14.5C13.7541 9.25 13.0387 9.54632 12.5112 10.0737C11.9838 10.6012 11.6875 11.3166 11.6875 12.0625C11.6875 12.8084 11.9838 13.5238 12.5112 14.0513C13.0387 14.5787 13.7541 14.875 14.5 14.875H17.3125Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 12.3438C14.3447 12.3438 14.2188 12.2178 14.2188 12.0625C14.2188 11.9072 14.3447 11.7812 14.5 11.7812"
          stroke={color}
          strokeWidth={1.5}
        />
        <path
          d="M14.5 12.3438C14.6553 12.3438 14.7812 12.2178 14.7812 12.0625C14.7812 11.9072 14.6553 11.7812 14.5 11.7812"
          stroke={color}
          strokeWidth={1.5}
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default WalletIcon;
