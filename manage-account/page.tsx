"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Evertune";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14Z" fill="#7F7F7F" stroke="#7F7F7F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5a2.5 2.5 0 0 0 2.5 2.5H20M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const brands = [
  { id: "adidas", name: "Adidas", trackerCount: 2 },
  { id: "bmw", name: "BMW", trackerCount: 6 },
  { id: "nike", name: "Nike", trackerCount: 12 },
  { id: "porsche", name: "Porsche", trackerCount: 18 },
];

const bmwTrackers = [
  { id: "1", name: "Electric SUVs", location: "USA | English", dictionaryOn: true },
  { id: "2", name: "2026 Elektro SUVs", location: "USA | English", dictionaryOn: false },
  { id: "3", name: "Elektro SUVs", location: "USA | English", dictionaryOn: true },
  { id: "4", name: "Electric cars", location: "USA | English", dictionaryOn: false },
  { id: "5", name: "Luxury Cars", location: "USA | English", dictionaryOn: true },
  { id: "6", name: "Luxury cars, UK", location: "USA | English", dictionaryOn: false },
];

const tabs = ["Account Info", "Teammates", "Prompt Usage", "Dictionaries"];

export default function ManageAccountPage() {
  const [activeTab, setActiveTab] = useState("Dictionaries");
  const [searchQuery, setSearchQuery] = useState("");
  const [innerSearchQuery, setInnerSearchQuery] = useState("");
  const [expandedBrand, setExpandedBrand] = useState<string | null>("bmw");
  const [dictionaryToggles, setDictionaryToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(bmwTrackers.map((t) => [t.id, t.dictionaryOn]))
  );
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const toggleDictionary = (id: string) => {
    setDictionaryToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f6f6f6] flex flex-col">
      {/* Top Nav */}
      <header className="h-16 bg-white border-b border-[#eeeeee] flex items-center justify-between px-8 flex-shrink-0">
        <h1 className="text-xl font-semibold text-[#262626]">Manage Account</h1>
        <Button variant="primary" className="gap-2">
          <PlusIcon />
          New Tracker
        </Button>
      </header>

      {/* Tabs */}
      <div className="px-8 pt-5 flex-shrink-0">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px rounded-t-lg ${
                activeTab === tab
                  ? "text-white bg-[#048BC5] border-[#048BC5]"
                  : "text-[#262626] bg-transparent border-transparent hover:bg-[#eeeeee]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Container with margin */}
      <div className="flex-1 flex flex-col mt-0 mx-5 mb-5 bg-white rounded-lg overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-semibold text-[#262626] mb-6">Dictionaries</h1>

        {/* Global Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7F7F7F]">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md pl-12 pr-4 py-2.5 border border-[#eeeeee] rounded-lg bg-white text-[#262626] placeholder:text-[#7F7F7F] text-sm focus:outline-none focus:ring-2 focus:ring-[#19B5EF] focus:border-transparent"
          />
        </div>

        {/* Brand Sections */}
        <div className="space-y-2">
          {brands.map((brand) => {
            const isExpanded = expandedBrand === brand.id;
            return (
              <div
                key={brand.id}
                className="bg-white border border-[#eeeeee] rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#595959] flex-shrink-0" />
                    <div>
                      <div className="font-medium text-[#262626]">{brand.name}</div>
                      <div className="text-sm text-[#7F7F7F]">
                        {brand.trackerCount} trackers
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedBrand(isExpanded ? null : brand.id)}
                    className="flex items-center gap-1.5 text-[var(--primary)] font-medium hover:underline text-sm"
                  >
                    <BookIcon />
                    View Dictionary
                    {isExpanded ? (
                      <ChevronUpIcon className="text-[var(--primary)]" />
                    ) : (
                      <ChevronDownIcon className="text-[var(--primary)]" />
                    )}
                  </button>
                </div>

                {/* Expanded content - BMW */}
                {isExpanded && brand.id === "bmw" && (
                  <div className="border-t border-[#eeeeee] p-4 bg-[#f6f6f6]">
                    {/* Inner Search */}
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7F7F7F]">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        placeholder="Search"
                        value={innerSearchQuery}
                        onChange={(e) => setInnerSearchQuery(e.target.value)}
                        className="w-full max-w-md pl-12 pr-4 py-2.5 border border-[#eeeeee] rounded-lg bg-white text-[#262626] placeholder:text-[#7F7F7F] text-sm focus:outline-none focus:ring-2 focus:ring-[#19B5EF] focus:border-transparent"
                      />
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-[#eeeeee] rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#f6f6f6] border-b border-[#eeeeee]">
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#262626]">
                              Tracker Name
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#262626]">
                              Location
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#262626]">
                              Brand Level Dictionary
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {bmwTrackers.map((tracker) => (
                            <tr
                              key={tracker.id}
                              className="border-b border-[#eeeeee] hover:bg-[#f6f6f6] last:border-b-0"
                            >
                              <td className="py-3 px-4 text-sm text-[#262626]">
                                {tracker.name}
                              </td>
                              <td className="py-3 px-4 text-sm text-[#262626]">
                                {tracker.location}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleDictionary(tracker.id)}
                                      className={`relative inline-flex h-6 rounded-full transition-colors ${
                                        dictionaryToggles[tracker.id]
                                          ? "w-12 bg-[#19B5EF]"
                                          : "w-12 bg-[#eeeeee]"
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                          dictionaryToggles[tracker.id]
                                            ? "left-7"
                                            : "left-1"
                                        }`}
                                      />
                                    </button>
                                    <span className="text-xs font-medium text-[#7F7F7F] min-w-[24px]">
                                      {dictionaryToggles[tracker.id] ? "ON" : "OFF"}
                                    </span>
                                  </div>
                                  <Link
                                    href="#"
                                    className="text-[var(--primary)] font-medium hover:underline text-sm flex items-center gap-1"
                                  >
                                    <BookIcon />
                                    View Dictionary
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-sm text-[#434343]">
                        <span>Items per page:</span>
                        <button
                          type="button"
                          className="flex items-center gap-1 py-1.5 px-2 border border-[#e5e5e5] rounded bg-white hover:bg-[#f6f6f6]"
                        >
                          10
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-2 rounded text-[#7f7f7f] hover:bg-[#e5e5e5] disabled:opacity-50"
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M15 18l-6-6 6-6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        {[1, 2, 9, 10].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentPage(p)}
                            className={`min-w-[32px] h-8 rounded text-sm font-medium ${
                              currentPage === p
                                ? "bg-[#2563eb] text-white"
                                : "text-[#434343] hover:bg-[#e5e5e5]"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <span className="px-1 text-[#7f7f7f]">...</span>
                        <button
                          type="button"
                          className="p-2 rounded text-[#7f7f7f] hover:bg-[#e5e5e5] disabled:opacity-50"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(totalPages, p + 1)
                            )
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M9 18l6-6-6-6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isExpanded && brand.id !== "bmw" && (
                  <div className="border-t border-[#eeeeee] p-4 bg-[#f6f6f6] text-sm text-[#7F7F7F]">
                    No trackers to display.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
