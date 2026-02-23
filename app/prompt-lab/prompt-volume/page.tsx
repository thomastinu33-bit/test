"use client";

import { useState } from "react";

const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 9l6 6 6-6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#262626" />
  </svg>
);

const TranslateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="#262626" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BRANDS = [
  "Audi", "BMW", "Coach", "Gucci", "Herman Miller",
  "IKEA", "Louis Vuitton", "Mercedes-Benz", "Porsche",
  "Ray-Ban", "Restoration Hardware",
];

const LOCATIONS = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Chinese"];

const WORD_COUNT_DATA = [
  { model: "ChatGPT", avg: 96, median: 19 },
  { model: "Gemini", avg: 143, median: 18 },
  { model: "Perplexity", avg: 45, median: 14 },
  { model: "Copilot", avg: 44, median: 15 },
];

function SearchDropdown({
  value, options, placeholder, open, onOpenChange, onChange,
}: {
  value: string; options: string[]; placeholder: string;
  open: boolean; onOpenChange: (o: boolean) => void; onChange: (v: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase())).sort();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="w-full flex items-center justify-between bg-white border border-border rounded-lg px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary-600"
      >
        <span className={value ? "text-foreground" : "text-muted"}>{value || placeholder}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <SearchIcon />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-foreground placeholder-muted focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => { onChange(name); onOpenChange(false); setSearch(""); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  value === name ? "bg-primary-100 text-primary-600 font-medium" : "text-foreground hover:bg-background"
                }`}
              >
                {name}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-4 py-3 text-sm text-muted">No results found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromptVolumePage() {
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState("United States");
  const [language, setLanguage] = useState("English");
  const [openDropdown, setOpenDropdown] = useState<"brand" | "location" | "language" | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchedBrand, setSearchedBrand] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShowVolume = () => {
    if (!brand) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
      setSearchedBrand(brand);
    }, 1500);
  };

  return (
    <div className="w-full font-sans">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-foreground">Prompt Volume</h2>
        <p className="text-base text-muted mt-1">
          Type in any brand or category to see how often it appears in AI prompts and related topics.{" "}
          <span className="text-primary-600 cursor-pointer hover:underline">Learn more</span>
        </p>
      </div>

      <div className="bg-white rounded-lg">
        {/* Select Brand */}
        <div className="pb-4 border-b border-border">
          <div className="pb-4">
            <p className="text-base font-medium text-foreground mb-2">Select Brand</p>
            <SearchDropdown
              value={brand}
              options={BRANDS}
              placeholder="Pick a Brand"
              open={openDropdown === "brand"}
              onOpenChange={(o) => setOpenDropdown(o ? "brand" : null)}
              onChange={(v) => { setBrand(v); setShowResults(false); }}
            />
          </div>

          {/* Location + Language */}
          <div className="flex gap-5 pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                <LocationIcon />
                <p className="text-base font-medium text-foreground">Location</p>
              </div>
              <SearchDropdown
                value={location}
                options={LOCATIONS}
                placeholder="Select location"
                open={openDropdown === "location"}
                onOpenChange={(o) => setOpenDropdown(o ? "location" : null)}
                onChange={setLocation}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                <TranslateIcon />
                <p className="text-base font-medium text-foreground">Language</p>
              </div>
              <SearchDropdown
                value={language}
                options={LANGUAGES}
                placeholder="Select language"
                open={openDropdown === "language"}
                onOpenChange={(o) => setOpenDropdown(o ? "language" : null)}
                onChange={setLanguage}
              />
            </div>
          </div>

          {/* Show Volume button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleShowVolume}
              disabled={!brand || loading}
              className="flex items-center gap-2 bg-[#475569] text-white text-base font-medium px-4 py-2.5 rounded-lg hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? "Loading..." : "Show Volume"}
            </button>
          </div>
        </div>

        {/* Brand-specific volume results */}
        {showResults && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Prompt Volume for {searchedBrand}</h3>
            <div className="bg-surface border border-border rounded-lg p-4 text-sm text-muted">
              Brand-specific volume data for <span className="font-medium text-foreground">{searchedBrand}</span> would appear here.
            </div>
          </div>
        )}

        {/* Always-visible info + table */}
        <div className="mt-6 flex flex-col gap-5">
          {/* Info banner */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-base text-foreground">
              Did you know{" "}
              <span className="font-semibold text-primary-600">over 80% of prompts are unique</span>
              {" "}— i.e. never seen again. That&apos;s because prompts are long.
            </p>
          </div>

          {/* Prompt Word Count table */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Prompt Word Count</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-background border-b border-border">
                <div className="px-4 py-3.5 font-semibold text-base text-foreground">Model</div>
                <div className="px-4 py-3.5 font-semibold text-base text-foreground border-l border-border">Avg. Word Count</div>
                <div className="px-4 py-3.5 font-semibold text-base text-foreground border-l border-border">Median Word Count</div>
              </div>
              {WORD_COUNT_DATA.map((row) => (
                <div key={row.model} className="grid grid-cols-3 border-b border-border last:border-b-0 bg-white hover:bg-surface transition-colors">
                  <div className="px-4 py-3.5 text-base font-medium text-foreground">{row.model}</div>
                  <div className="px-4 py-3.5 text-base text-foreground border-l border-border">{row.avg}</div>
                  <div className="px-4 py-3.5 text-base text-foreground border-l border-border">{row.median}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-base text-muted">
            Just like no two conversations with a person are ever exactly the same, the way people prompt AI can vary a lot. That&apos;s why it&apos;s more helpful to focus on topics and themes, rather than trying to match exact prompts.
          </p>
        </div>
      </div>
    </div>
  );
}
