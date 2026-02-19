import React, { FC, InputHTMLAttributes } from 'react';

interface GenericInputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}

const GenericInput: FC<GenericInputProps> = ({ placeholder, value, onChange, id, ...props }) => {
  return (
    <div className="flex gap-4 h-9 items-center bg-[#FFFFFF] border border-[#65656526] dark:border-transparent dark:bg-[#111111] text-sm rounded-full font-ui font-normal px-4">
      <input
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFF66] outline-none bg-transparent border-none flex-1 text-[#656565A6] dark:text-[#FFFFFFA6]"
        {...props}
      />
    </div>
  );
};

export default GenericInput;
