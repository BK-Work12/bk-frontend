import React from 'react';

export const GradientBorder = ({ children, className }: any) => {
  return <div className={`borderGradient overflow-hidden greyBorder p-px rounded-[20px] ${className}`}>{children}</div>;
};

export const GradientBorderGrey = ({ children, className }: any) => {
  return <div className={` greyBorder p-px rounded-[20px] ${className}`}>{children}</div>;
};

export const GradientBorderGray = ({ children, className }: any) => {
  return <div className={`  gradeintBorder p-px rounded-[20px] ${className}`}>{children}</div>;
};

export const GradientSideBorderGray = ({ children, className }: any) => {
  return <div className={`  lightgrey p-px rounded-[20px] ${className}`}>{children}</div>;
};

export const GradientBorderLight = ({ children, className }: any) => {
  return <div className={`borderGradient overflow-hidden  p-px rounded-[20px] ${className}`}>{children}</div>;
};
