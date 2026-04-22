"use client";

import { useState } from "react";
import Link from "next/link";
import { Dropdown } from "@/components/Evertune";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14Z" fill="#7F7F7F" />
  </svg>
);

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    Critical: { bg: "bg-red-50", text: "text-red-700" },
    Warning: { bg: "bg-yellow-50", text: "text-yellow-700" },
    Good: { bg: "bg-green-50", text: "text-green-700" },
    Excellent: { bg: "bg-blue-50", text: "text-blue-700" },
  };
  const color = colors[severity];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
      {severity}
    </span>
  );
};

const ProgressBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 bg-[#e0e0e0] rounded-full h-2 max-w-[120px] overflow-hidden">
      <div
        className="bg-[#048BC5] h-full transition-all"
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-sm font-medium text-[#262626] min-w-[35px]">{score}</span>
  </div>
);

const SortIcon = ({ direction }: { direction: "asc" | "desc" | null }) => {
  if (direction === "asc") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5v14M19 12l-7-7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (direction === "desc") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19V5M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
      <path d="M12 5v14M19 12l-7-7-7 7M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};


interface AuditRow {
  url: string;
  severity: "Critical" | "Warning" | "Good" | "Excellent";
  topicRelevance: number;
  sourceShare: number;
  botPermissions: number;
  headingHierarchy: number;
}

const generateMockData = (): AuditRow[] => {
  const severities: ("Critical" | "Warning" | "Good" | "Excellent")[] = [
    "Critical",
    "Warning",
    "Good",
    "Excellent",
  ];
  const baseUrls = [
    "bose.com",
    "bose.com/products",
    "bose.com/products/headphones",
    "bose.com/products/speakers",
    "bose.com/products/earbuds",
    "bose.com/products/soundbars",
    "bose.com/products/car-audio",
    "bose.com/products/wearables",
    "bose.com/support",
    "bose.com/support/contact",
    "bose.com/support/downloads",
    "bose.com/support/troubleshooting",
    "bose.com/about",
    "bose.com/careers",
    "bose.com/blog",
    "bose.com/blog/audio-tips",
    "bose.com/blog/product-releases",
    "bose.com/deals",
    "bose.com/deals/clearance",
    "bose.com/account",
    "bose.com/account/orders",
    "bose.com/account/returns",
    "bose.com/shop",
    "bose.com/shop/filters",
    "bose.com/compare",
    "bose.com/warranty",
    "bose.com/privacy",
    "bose.com/terms",
    "bose.com/sitemap",
    "bose.com/contact",
    "bose.com/press",
    "bose.com/investor",
    "bose.com/legal",
    "bose.com/accessibility",
    "bose.com/search",
    "bose.com/category/home-audio",
    "bose.com/category/portable-audio",
    "bose.com/category/professional",
    "bose.com/category/wearables",
    "bose.com/products/quietcomfort-45",
    "bose.com/products/quietcomfort-ultra",
    "bose.com/products/sport-earbuds",
    "bose.com/products/soundlink-micro",
    "bose.com/products/smart-soundbar-700",
    "bose.com/products/home-speaker-500",
    "bose.com/products/bose-frames",
    "bose.com/learn/how-to-pair",
    "bose.com/learn/noise-cancellation",
    "bose.com/learn/eq-settings",
    "bose.com/learn/app-guide",
    "bose.com/community/forums",
    "bose.com/community/reviews",
    "bose.com/gift-cards",
    "bose.com/business",
    "bose.com/business/solutions",
    "bose.com/business/contact",
    "bose.com/education",
    "bose.com/events",
    "bose.com/sustainability",
    "bose.com/trade-in",
    "bose.com/financing",
    "bose.com/shipping-info",
    "bose.com/video-gallery",
    "bose.com/testimonials",
    "bose.com/setup-guides",
    "bose.com/firmware-updates",
    "bose.com/software-updates",
    "bose.com/api-docs",
    "bose.com/developer",
    "bose.com/status",
  ];

  return baseUrls.map((url) => ({
    url,
    severity: severities[Math.floor(Math.random() * severities.length)],
    topicRelevance: Math.floor(Math.random() * 40) + 60,
    sourceShare: Math.floor(Math.random() * 50) + 15,
    botPermissions: Math.floor(Math.random() * 30) + 70,
    headingHierarchy: Math.floor(Math.random() * 35) + 65,
  }));
};

const MOCK_DATA = generateMockData();

type SortColumn = "url" | "severity" | "topicRelevance" | "sourceShare" | "botPermissions" | "headingHierarchy" | null;
type SortDirection = "asc" | "desc";

export default function AuditedPagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [issueType, setIssueType] = useState("All Issues");
  const [severity, setSeverity] = useState("All Severities");
  const [trackerTopic, setTrackerTopic] = useState("All Topics");
  const [siteSection, setSiteSection] = useState("All Sections");
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const activeTab = "audited-pages";

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortedData = () => {
    if (!sortColumn) return MOCK_DATA;

    const sorted = [...MOCK_DATA].sort((a, b) => {
      let aVal: string | number = a[sortColumn];
      let bVal: string | number = b[sortColumn];

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return sorted;
  };

  return (
    <div className="bg-[#f6f6f6] min-h-screen flex flex-col px-5 py-5">
      {/* Tabs */}
      <div className="bg-[#f6f6f6] pt-5 w-full">
        <div className="flex gap-0 px-8">
          <Link
            href="/site-audit/overview"
            className="px-6 py-3 font-medium text-base transition-colors bg-[#E1EBF8] text-[#262626] opacity-70 rounded-tr-lg hover:opacity-100"
          >
            Overview
          </Link>
          <button
            type="button"
            className="px-6 py-3 font-medium text-base transition-colors bg-[#048BC5] text-white rounded-tl-lg"
          >
            Audited pages
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white font-sans pt-8 pb-8 w-full flex-1">
        {activeTab === "overview" && (
          <div className="space-y-8 px-8 max-w-6xl">
            <div>
              <h2 className="text-2xl font-bold text-[#262626] mb-2">Site Audit Overview</h2>
              <p className="text-base text-[#7f7f7f]">
                Monitor and analyze your website's health and performance metrics.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Pages", value: "0", color: "bg-blue-50" },
                { label: "Issues Found", value: "0", color: "bg-red-50" },
                { label: "Passed Checks", value: "0", color: "bg-green-50" },
                { label: "Last Audit", value: "Never", color: "bg-gray-50" },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} p-6 rounded-lg`}>
                  <p className="text-sm text-[#7f7f7f] mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#262626]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "audited-pages" && (
          <div className="space-y-8 px-8">
            <div>
              <h2 className="text-2xl font-bold text-[#262626] mb-2">Audited Pages</h2>
              <p className="text-base text-[#7f7f7f]">
                View detailed audit results for each page on your site.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 items-end flex-wrap">
              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-[#f6f6f6] px-4 py-2 rounded-lg">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search pages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 text-sm text-[#262626] placeholder-[#7f7f7f] outline-none"
                />
              </div>

              {/* Filters */}
              <div className="w-40">
                <Dropdown
                  label="Issue Type"
                  options={["All Issues", "Broken Links", "Performance", "SEO", "Accessibility"]}
                  value={issueType}
                  onChange={setIssueType}
                />
              </div>
              <div className="w-40">
                <Dropdown
                  label="Severity"
                  options={["All Severities", "Critical", "High", "Medium", "Low"]}
                  value={severity}
                  onChange={setSeverity}
                />
              </div>
              <div className="w-40">
                <Dropdown
                  label="Tracker Topics"
                  options={["All Topics", "Performance", "Security", "User Experience", "Mobile"]}
                  value={trackerTopic}
                  onChange={setTrackerTopic}
                />
              </div>
              <div className="w-40">
                <Dropdown
                  label="Site Section"
                  options={["All Sections", "Homepage", "Product Pages", "Blog", "Support"]}
                  value={siteSection}
                  onChange={setSiteSection}
                />
              </div>
            </div>

            {/* Table */}
            <div className="border border-[#eee] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f6f6f6] border-b border-[#eee]">
                      <th
                        className="sticky left-0 bg-[#f6f6f6] px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap z-10 cursor-pointer hover:bg-[#efefef] transition-colors"
                        onClick={() => handleSort("url")}
                      >
                        <div className="flex items-center gap-2">
                          URL
                          <div className="text-[#262626]">
                            <SortIcon direction={sortColumn === "url" ? sortDirection : null} />
                          </div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap cursor-pointer hover:bg-[#efefef] transition-colors"
                        onClick={() => handleSort("severity")}
                      >
                        <div className="flex items-center gap-2">
                          Severity
                          <div className="text-[#262626]">
                            <SortIcon direction={sortColumn === "severity" ? sortDirection : null} />
                          </div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap cursor-pointer hover:bg-[#efefef] transition-colors"
                        onClick={() => handleSort("topicRelevance")}
                      >
                        <div className="flex items-center gap-2">
                          Topic Relevance
                          <div className="text-[#262626]">
                            <SortIcon direction={sortColumn === "topicRelevance" ? sortDirection : null} />
                          </div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap cursor-pointer hover:bg-[#efefef] transition-colors"
                        onClick={() => handleSort("sourceShare")}
                      >
                        <div className="flex items-center gap-2">
                          Source Share
                          <div className="text-[#262626]">
                            <SortIcon direction={sortColumn === "sourceShare" ? sortDirection : null} />
                          </div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap cursor-pointer hover:bg-[#efefef] transition-colors"
                        onClick={() => handleSort("botPermissions")}
                      >
                        <div className="flex items-center gap-2">
                          Bot Permissions
                          <div className="text-[#262626]">
                            <SortIcon direction={sortColumn === "botPermissions" ? sortDirection : null} />
                          </div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap cursor-pointer hover:bg-[#efefef] transition-colors"
                        onClick={() => handleSort("headingHierarchy")}
                      >
                        <div className="flex items-center gap-2">
                          Heading Hierarchy
                          <div className="text-[#262626]">
                            <SortIcon direction={sortColumn === "headingHierarchy" ? sortDirection : null} />
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedData().map((row) => (
                      <tr key={row.url} className="border-b border-[#eee] hover:bg-[#f6f6f6] transition-colors">
                        <td className="sticky left-0 bg-white hover:bg-[#f6f6f6] px-4 py-3 text-sm font-medium z-10 shadow-[4px_0_8px_rgba(0,0,0,0.1)]">
                          <Link
                            href={`/site-audit/${encodeURIComponent(row.url)}`}
                            className="text-[#048BC5] hover:underline"
                          >
                            {row.url}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <SeverityBadge severity={row.severity} />
                        </td>
                        <td className="px-4 py-3">
                          <ProgressBar score={row.topicRelevance} />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[#262626]">
                          {row.sourceShare}%
                        </td>
                        <td className="px-4 py-3">
                          <ProgressBar score={row.botPermissions} />
                        </td>
                        <td className="px-4 py-3">
                          <ProgressBar score={row.headingHierarchy} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
