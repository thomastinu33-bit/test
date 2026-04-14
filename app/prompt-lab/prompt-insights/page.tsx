"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Evertune";

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#262626" />
  </svg>
);

const TranslateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="#262626" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9l6 6 6-6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14Z" fill="#7F7F7F" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" fill="#9e9e9e" />
  </svg>
);

interface TableRow {
  brand: string;
  url: string;
  country: string;
  language: string;
  categories: number;
  subcategories: number;
  prompts: number;
  status: "ready" | "researching" | "failed";
}

const TABLE_DATA: TableRow[] = [
  { brand: "Bose", url: "bose.com", country: "United States", language: "English", categories: 10, subcategories: 250, prompts: 5236, status: "ready" },
  { brand: "Tesla", url: "tesla.com", country: "United States", language: "English", categories: 16, subcategories: 167, prompts: 7892, status: "researching" },
  { brand: "ASUS", url: "asus.com", country: "United States", language: "English", categories: 21, subcategories: 235, prompts: 9012, status: "ready" },
  { brand: "NordicTrack", url: "nordictrack.com", country: "United States", language: "English", categories: 25, subcategories: 112, prompts: 4321, status: "failed" },
  { brand: "BMW", url: "bmw.com/usa", country: "Germany", language: "German", categories: 17, subcategories: 135, prompts: 6789, status: "ready" },
];

export default function PromptInsightsPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<"prompt-research" | "prompt-volume">("prompt-research");
  const [brand, setBrand] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("Country");
  const [language, setLanguage] = useState("Language");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-[#f6f6f6] w-full min-h-screen flex flex-col">
      {/* Tabs */}
      <div className="bg-[#f6f6f6] pt-5 w-full">
        <div className="flex gap-0 px-8">
          {(["prompt-research", "prompt-volume"] as const).map((tab, idx) => {
            const label = tab === "prompt-research" ? "Prompt Research" : "Prompt Volume";
            const isActive = mainTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setMainTab(tab)}
                className={`w-48 py-3 text-center font-medium text-base transition-colors ${
                  isActive
                    ? "bg-[#048BC5] text-white rounded-tl-lg"
                    : "bg-[#E1EBF8] text-[#262626] opacity-70 rounded-tr-lg"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white font-sans pt-8 pb-8 w-full flex-1">
        {mainTab === "prompt-research" ? (
          <div className="space-y-8 px-8">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-[#262626] mb-2">Prompt Research</h2>
              <p className="text-base text-[#7f7f7f]">
                Enter a brand to see what people ask AI about.{" "}
                <a href="#" className="text-[#048BC5] hover:underline">
                  Learn more
                </a>
              </p>
            </div>

            {/* Form */}
            <div className="flex gap-4 items-end">
              {/* Enter Brand */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-medium text-[#262626]">Enter Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Enter Brand"
                  className="w-full px-4 py-3 bg-white border border-[#eee] rounded-lg text-base text-[#7f7f7f] placeholder-[#7f7f7f] focus:outline-none focus:ring-1 focus:ring-[#048BC5]"
                />
              </div>

              {/* Enter URL */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-medium text-[#262626]">Enter URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="w-full px-4 py-3 bg-white border border-[#eee] rounded-lg text-base text-[#7f7f7f] placeholder-[#7f7f7f] focus:outline-none focus:ring-1 focus:ring-[#048BC5]"
                />
              </div>

              {/* Location */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-1 text-sm font-medium text-[#262626]">
                  <LocationIcon />
                  <span>Location</span>
                </div>
                <div className="w-full px-4 py-3 bg-white border border-[#eee] rounded-lg flex items-center justify-between text-base text-[#7f7f7f] cursor-pointer">
                  <span>{location}</span>
                  <ChevronDownIcon />
                </div>
              </div>

              {/* Language */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-1 text-sm font-medium text-[#262626]">
                  <TranslateIcon />
                  <span>Language</span>
                </div>
                <div className="w-full px-4 py-3 bg-white border border-[#eee] rounded-lg flex items-center justify-between text-base text-[#7f7f7f] cursor-pointer">
                  <span>{language}</span>
                  <ChevronDownIcon />
                </div>
              </div>

              {/* Button */}
              <Button variant="primary" className="h-[46px] px-4">
                Discover Prompts
              </Button>
            </div>

            {/* Prompt Library */}
            <div className="space-y-3">
              <h3 className="text-[20px] font-medium text-[#262626]">Prompt Library</h3>

              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-[#f6f6f6] px-4 py-2 rounded-lg w-80">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 text-sm text-[#262626] placeholder-[#7f7f7f] outline-none"
                />
              </div>

              {/* Table */}
              <div className="border border-[#eee] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f6f6f6] border-b border-[#eee]">
                        <th className="sticky left-0 bg-[#f6f6f6] px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap z-10">Brand</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">URL</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">Country</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">Language</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">Categories</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">Subcategories</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">Prompts</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-[#262626] w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {TABLE_DATA.map((row) => (
                        <tr key={row.brand} onClick={() => router.push(`/prompt-lab/prompt-insights/${row.brand}`)} className="border-b border-[#eee] hover:bg-[#f6f6f6] transition-colors cursor-pointer">
                          <td className="sticky left-0 bg-white hover:bg-[#f6f6f6] px-4 py-3 text-sm font-medium text-[#262626] z-10 shadow-[4px_0_8px_rgba(0,0,0,0.1)]">{row.brand}</td>
                          <td className="px-4 py-3 text-sm text-[#048BC5]">{row.url}</td>
                          <td className="px-4 py-3 text-sm text-[#262626]">{row.country}</td>
                          <td className="px-4 py-3 text-sm text-[#262626]">{row.language}</td>
                          <td className="px-4 py-3 text-sm text-[#262626] text-center">{row.categories}</td>
                          <td className="px-4 py-3 text-sm text-[#262626] text-center">{row.subcategories}</td>
                          <td className="px-4 py-3 text-sm text-[#262626] text-center">{row.prompts}</td>
                          <td className="px-4 py-3 text-sm">
                            {row.status === "ready" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F1F8F2] text-[#32693D] rounded-full text-xs font-medium">
                                <span className="inline-block w-1.5 h-1.5 bg-[#32693D] rounded-full"></span>
                                Ready
                              </span>
                            ) : row.status === "researching" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FFF4E5] text-[#D67A02] rounded-full text-xs font-medium">
                                <span className="inline-block w-1.5 h-1.5 bg-[#D67A02] rounded-full"></span>
                                Researching
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FEE2E2] text-[#DC2626] rounded-full text-xs font-medium">
                                <span className="inline-block w-1.5 h-1.5 bg-[#DC2626] rounded-full"></span>
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-[#9e9e9e] hover:text-[#262626] transition-colors p-1">
                              <DeleteIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8">
            <h2 className="text-2xl font-bold text-[#262626] mb-2">Prompt Volume</h2>
            <p className="text-base text-[#7f7f7f]">Content coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
