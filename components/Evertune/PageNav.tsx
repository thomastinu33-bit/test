"use client";

import { useState, useEffect } from "react";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const match = items.find((item) => `${basePath}/${item.id}` === pathname);
    setSelectedId(match ? match.id : null);
  }, [pathname, basePath, items]);

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
          const isActive = item.id === selectedId;
          return (
            <Link
              key={item.id}
              href={href}
              onClick={() => setSelectedId(item.id)}
              className={`
                relative pb-4 pt-1 px-3 -mx-3 text-sm no-underline transition-colors duration-150 rounded-t-md
                ${isActive
                  ? "font-semibold text-[var(--primary)] bg-[#e6f7f7]"
                  : "font-medium text-[#404040] hover:text-[var(--primary)] hover:bg-[#f6f6f6]"}
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
