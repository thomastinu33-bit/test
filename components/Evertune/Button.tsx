"use client";

import { type ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "primaryOutline"
  | "include"
  | "askAI";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "text-white focus:ring-[var(--primary)] [background:linear-gradient(180deg,var(--primary-gradient-start)_0%,var(--primary)_50%,var(--primary-gradient-end)_100%)] hover:opacity-95",
    secondary: "bg-[#475569] text-white hover:bg-[#374151] focus:ring-[#475569]",
    outline: "border-2 border-[#434343] text-[#1f1f1f] hover:bg-[#f5f5f5] focus:ring-[#434343]",
    ghost: "text-[#434343] hover:bg-[#f5f5f5] focus:ring-[#434343]",
    primaryOutline:
      "bg-white border border-[#E0F3FE] text-[var(--primary)] hover:bg-[#f0f9ff] focus:ring-[var(--primary)] rounded-full",
    include:
      "bg-[#A5A5A5] text-white hover:bg-[#8c8c8c] focus:ring-[#A5A5A5] rounded-full",
    askAI:
      "rounded-lg bg-white text-slate-500 hover:opacity-90 focus:ring-[#7C9BFF]",
  };

  if (variant === "askAI") {
    return (
      <span
        className="group inline-flex rounded-lg transition-opacity hover:opacity-90 focus-within:ring-2 focus-within:ring-[#7C9BFF] focus-within:ring-offset-2"
        style={{
          background: "linear-gradient(135deg, #F7594E 0%, #7C9BFF 50%, #00DEE6 100%)",
        }}
      >
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-2 rounded-[7px] m-[1px] px-4 py-2 text-sm font-normal bg-white text-slate-500 transition-colors disabled:opacity-50 disabled:pointer-events-none focus:ring-0 focus:outline-none ${className}`}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>
      </span>
    );
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
