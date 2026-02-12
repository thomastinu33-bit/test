"use client";

import { type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

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
      "bg-[var(--primary)] text-white hover:bg-[#0470a3] focus:ring-[var(--primary)]",
    secondary: "bg-[#434343] text-white hover:bg-[#333] focus:ring-[#434343]",
    outline: "border-2 border-[#434343] text-[#1f1f1f] hover:bg-[#f5f5f5] focus:ring-[#434343]",
    ghost: "text-[#434343] hover:bg-[#f5f5f5] focus:ring-[#434343]",
  };

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
