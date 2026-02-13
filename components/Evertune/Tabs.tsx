"use client";

export interface TabItem {
  id: string;
  label: string;
}

export type TabsVariant = "default" | "large";

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onValueChange: (id: string) => void;
  variant?: TabsVariant;
  className?: string;
}

export function Tabs({ tabs, value, onValueChange, variant = "default", className = "" }: TabsProps) {
  if (tabs.length < 2) {
    throw new Error("Tabs requires at least 2 tabs");
  }

  const isLarge = variant === "large";

  return (
    <div
      className={`flex gap-8 border-b border-[#eeeeee] ${isLarge ? "pt-8" : ""} ${className}`}
      role="tablist"
      aria-label="Tabs"
    >
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onValueChange(tab.id)}
            className={`
              relative pb-3 pt-1 font-medium transition-colors
              ${isLarge ? "text-[20px]" : "text-sm"}
              ${isActive ? "text-[var(--primary)]" : "text-[#262626] hover:text-[var(--primary)]"}
            `}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
