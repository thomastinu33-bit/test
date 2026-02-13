"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface PageNavItem {
  id: string;
  label: string;
}

export interface PageNavProps {
  basePath: string;
  items: PageNavItem[];
  className?: string;
}

export function PageNav({ basePath, items, className = "" }: PageNavProps) {
  const pathname = usePathname();

  if (items.length < 2) {
    throw new Error("PageNav requires at least 2 items");
  }

  return (
    <nav
      className={`border-b border-[#e5e5e5] px-6 pt-5 pb-0 ${className}`}
      aria-label="Page navigation"
    >
      <div className="flex justify-center gap-6">
        {items.map((item) => {
          const href = `${basePath}/${item.id}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.id}
              href={href}
              className={`
                relative pb-4 pt-1 text-sm no-underline transition-colors duration-150
                ${isActive
                  ? "font-semibold text-[var(--primary)]"
                  : "font-medium text-[#404040] hover:text-[var(--primary)]"}
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] rounded-full"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
