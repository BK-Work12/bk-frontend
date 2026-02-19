import React from 'react';

type AssetsIconProps = {
  color?: string;
  width?: number;
  height?: number;
};

const AssetsIcon: React.FC<AssetsIconProps> = ({ color = '#656565', width = 18, height = 18 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.1875 9H14.0625V10.125H13.5C12.8813 10.125 12.375 10.6313 12.375 11.25V12.375C12.375 12.9937 12.8813 13.5 13.5 13.5H15.75V14.625H12.375V15.75H14.0625V16.875H15.1875V15.75H15.75C16.3687 15.75 16.875 15.2437 16.875 14.625V13.5C16.875 12.8813 16.3687 12.375 15.75 12.375H13.5V11.25H16.875V10.125H15.1875V9ZM15.75 4.5H12.375V2.25C12.375 1.63125 11.8687 1.125 11.25 1.125H6.75C6.13125 1.125 5.625 1.63125 5.625 2.25V4.5H2.25C1.63125 4.5 1.125 5.00625 1.125 5.625V13.5C1.125 14.1187 1.63125 14.625 2.25 14.625H10.6875V13.5H2.25V5.625H15.75V7.875H16.875V5.625C16.875 5.00625 16.3687 4.5 15.75 4.5ZM11.25 4.5H6.75V2.25H11.25V4.5Z"
        fill={color}
      />
    </svg>
  );
};

export default AssetsIcon;
