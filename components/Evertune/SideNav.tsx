"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./Button";

// Icons
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18l-6-6 6-6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9l6 6 6-6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12h14" stroke="#262626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zM2 12h20M8 22h8" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="#bd1005" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  person: PersonIcon,
  barChart: BarChartIcon,
  tag: TagIcon,
  globe: GlobeIcon,
  monitor: MonitorIcon,
  settings: SettingsIcon,
};

export interface NavItem {
  id: string;
  label: string;
  icon?: keyof typeof iconMap;
  href?: string;
  children?: NavItem[];
}

export interface SideNavProps {
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  onNewTracker?: () => void;
  activeItemId?: string;
  onNavigate?: (id: string) => void;
  onLogOut?: () => void;
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { id: "account-overview", label: "Account Overview", icon: "person" },
  { id: "ai-usage", label: "AI Usage", icon: "barChart" },
  { id: "prompt-volume", label: "Prompt Volume", icon: "tag" },
  {
    id: "ducati",
    label: "Ducati",
    icon: "barChart",
    children: [],
  },
  {
    id: "ford",
    label: "Ford",
    icon: "barChart",
    children: [],
  },
  {
    id: "porsche",
    label: "Porsche",
    icon: "barChart",
    children: [
      {
        id: "porsche-luxury-suvs",
        label: "Luxury SUVs",
        icon: "barChart",
        children: [
          { id: "word-association", label: "Word Association", icon: "tag" },
          { id: "ai-brand-index", label: "AI Brand Index", icon: "barChart" },
          { id: "consumer-preferences", label: "Consumer Preferences", icon: "tag" },
        ],
      },
      { id: "porsche-sports-cars", label: "Sports Cars", icon: "barChart", children: [] },
      { id: "common-unbranded", label: "Common Unbranded", icon: "tag" },
      { id: "content-analytics", label: "Content Analytics", icon: "tag" },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { id: "site-audit", label: "Site Audit", icon: "globe" },
  { id: "bot-analytics", label: "Bot Analytics", icon: "monitor" },
];

export function SideNav({
  collapsed: controlledCollapsed,
  onCollapseToggle,
  onNewTracker,
  activeItemId = "manage-account",
  onNavigate,
  onLogOut,
  className = "",
}: SideNavProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const isManageAccountActive = pathname === "/manage-account";

  const handleCollapseToggle = () => {
    onCollapseToggle?.();
    if (controlledCollapsed === undefined) {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["porsche", "porsche-luxury-suvs"]));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderIcon = (iconKey?: string) => {
    if (!iconKey) return null;
    const IconComponent = iconMap[iconKey] ?? BarChartIcon;
    return <IconComponent />;
  };

  const renderNavItem = (item: NavItem, depth: number = 0, parentId?: string) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const isActive = activeItemId === item.id;

    const paddingLeft = depth === 0 ? "pl-4" : depth === 1 ? "pl-8" : "pl-12";
    const activeStyles = isActive
      ? "bg-[#E0F3FE] text-[#262626]"
      : "text-[#262626] hover:bg-[#f6f6f6]";

    return (
      <div key={item.id} className="w-full">
        <button
          type="button"
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else {
              onNavigate?.(item.id);
            }
          }}
          className={`w-full flex items-center gap-3 py-2.5 pr-4 ${paddingLeft} text-left text-sm font-normal transition-colors rounded-r-md ${activeStyles}`}
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {renderIcon(item.icon)}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {hasChildren && (
                <span className="flex-shrink-0">
                  {isExpanded ? <MinusIcon /> : <ChevronDownIcon />}
                </span>
              )}
            </>
          )}
        </button>
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-0">
            {item.children!.map((child) => renderNavItem(child, depth + 1, item.id))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex flex-col bg-white border-r border-[#eeeeee] transition-all duration-200 ${collapsed ? "w-[72px]" : "w-[280px]"} ${className}`}
    >
      {/* Header - h-16 to align bottom border with top nav */}
      <div className={`flex items-center h-16 px-4 border-b border-[#eeeeee] flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <img
            src="/evertune.svg"
            alt="Evertune"
            className="h-7 w-auto object-contain"
          />
        )}
        <button
          type="button"
          onClick={handleCollapseToggle}
          className={`p-2 rounded-md hover:bg-[#f6f6f6] transition-colors ${collapsed ? "rotate-180" : ""}`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeftIcon />
        </button>
      </div>

      {/* New Tracker Button */}
      <div className="px-4 py-4 flex-shrink-0">
        <Button
          variant="primary"
          className="w-full justify-center gap-2 h-10"
          onClick={onNewTracker}
        >
          <PlusIcon />
          {!collapsed && "New Tracker"}
        </Button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {defaultNavItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Bottom Nav */}
      <div className="py-2 border-t border-[#eeeeee]">
        {bottomNavItems.map((item) => renderNavItem(item))}
      </div>

      {/* Footer */}
      <div className="py-2 border-t border-[#eeeeee] flex-shrink-0">
        <Link
          href="/manage-account"
          onClick={() => onNavigate?.("manage-account")}
          className={`w-full flex items-center gap-3 py-2.5 pl-4 pr-4 text-left text-sm font-normal rounded-r-md transition-colors no-underline ${
            isManageAccountActive || activeItemId === "manage-account"
              ? "bg-[#E0F3FE] text-[#262626]"
              : "text-[#262626] hover:bg-[#f6f6f6]"
          }`}
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <SettingsIcon />
          </span>
          {!collapsed && <span className="flex-1 truncate">Manage Account</span>}
        </Link>
        <button
          type="button"
          onClick={onLogOut}
          className="w-full flex items-center gap-3 py-2.5 pl-4 pr-4 text-left text-sm font-normal text-[#bd1005] hover:bg-[#f6f6f6] rounded-r-md transition-colors"
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <LogOutIcon />
          </span>
          {!collapsed && <span className="flex-1 truncate">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
