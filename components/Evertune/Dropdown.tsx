"use client";

import { useState } from "react";

export interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9l6 6 6-6" stroke="#7F7F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Dropdown({ label, options, value, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full px-4 py-2 border border-[#EEE] rounded-lg flex items-center justify-between text-sm text-[#4F4F4F] bg-white hover:bg-[#F9F9F9] transition-colors"
      >
        <span>{value}</span>
        <ChevronDownIcon />
      </button>

      {/* Floating Label */}
      <div className="absolute bg-white flex items-center justify-center left-2.5 top-[-8px] overflow-clip">
        <span className="text-[10px] font-medium text-[#4F4F4F]">{label}</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EEE] rounded-lg shadow-lg z-10">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-sm text-left text-[#262626] hover:bg-[#F9F9F9] transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
