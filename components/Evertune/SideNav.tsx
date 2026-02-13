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

const AiBrandIndexIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3v16a2 2 0 0 0 2 2h16" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="15" y="5" width="4" height="12" rx="1" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="7" y="8" width="4" height="9" rx="1" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WordAssociationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      stroke="#262626"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
    />
  </svg>
);

const ConsumerPreferencesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8h4" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 21v-9" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8V3" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 16h4" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 12V3" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 21v-5" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 14h4" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 10V3" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 21v-7" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
);

const GaugeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m12 14 4-4" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="8" height="18" x="3" y="3" rx="1" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 3v18" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 7v14" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12A9 3 0 0 0 21 12" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  person: PersonIcon,
  barChart: BarChartIcon,
  aiBrandIndex: AiBrandIndexIcon,
  gauge: GaugeIcon,
  tag: TagIcon,
  wordAssociation: WordAssociationIcon,
  consumerPreferences: ConsumerPreferencesIcon,
  library: LibraryIcon,
  bookOpen: BookOpenIcon,
  database: DatabaseIcon,
  list: ListIcon,
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
  { id: "ai-usage", label: "AI Usage", icon: "gauge" },
  { id: "prompt-volume", label: "Prompt Volume", icon: "database" },
  {
    id: "ducati",
    label: "Ducati",
    children: [],
  },
  {
    id: "ford",
    label: "Ford",
    children: [],
  },
  {
    id: "porsche",
    label: "Porsche",
    children: [
      { id: "porsche-luxury-suvs", label: "Luxury SUVs", icon: "list", href: "/porsche/luxury-suvs" },
      {
        id: "porsche-sports-cars",
        label: "Sports Cars",
        icon: "barChart",
        children: [
          { id: "word-association", label: "Word Association", icon: "wordAssociation" },
          { id: "ai-brand-index", label: "AI Brand Index", icon: "aiBrandIndex" },
          { id: "consumer-preferences", label: "Consumer Preferences", icon: "consumerPreferences" },
        ],
      },
      { id: "common-unbranded", label: "Content Analytics", icon: "bookOpen" },
      { id: "content-analytics", label: "Content Studio", icon: "library" },
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

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["porsche", "porsche-sports-cars"]));

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
    const hasChildren = Array.isArray(item.children);
    const isExpanded = expandedIds.has(item.id);
    const isActive = Boolean(item.href && pathname === item.href);

    const paddingLeft = depth === 0 ? "pl-4" : depth === 1 ? "pl-8" : "pl-12";
    const activeStyles = isActive
      ? "bg-[#E0F3FE] text-[#262626]"
      : "text-[#262626] hover:bg-[#f6f6f6]";

    const content = (
      <>
        {item.icon && (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {renderIcon(item.icon)}
          </span>
        )}
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
      </>
    );

    return (
      <div key={item.id} className="w-full">
        {item.href && !hasChildren ? (
          <Link
            href={item.href}
            className={`w-full flex items-center gap-3 py-2.5 pr-4 ${paddingLeft} text-left text-sm font-normal transition-colors rounded-r-md no-underline ${activeStyles}`}
          >
            {content}
          </Link>
        ) : (
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
            {content}
          </button>
        )}
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
      {/* Header - h-20 to align bottom border with tracker top nav */}
      <div className={`flex items-center h-20 px-4 border-b border-[#eeeeee] flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <img
            src="/evertune.svg"
            alt="Evertune"
            className="h-8 w-auto max-w-[160px] object-contain object-left"
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
            isManageAccountActive ? "bg-[#E0F3FE] text-[#262626]" : "text-[#262626] hover:bg-[#f6f6f6]"
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
