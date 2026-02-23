"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/Evertune";
import { getBrandInsights, type TopicData } from "./data";
import { SaveToListModal } from "../SaveToListModal";
import type { SavedPrompt } from "../usePromptLists";

const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 9l6 6 6-6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#262626" />
  </svg>
);

const BRANDS = [
  { name: "BMW", category: "Automobile" },
  { name: "Mercedes-Benz", category: "Automobile" },
  { name: "Porsche", category: "Automobile" },
  { name: "Audi", category: "Automobile" },
  { name: "Coach", category: "Accessory" },
  { name: "Louis Vuitton", category: "Accessory" },
  { name: "Gucci", category: "Accessory" },
  { name: "Ray-Ban", category: "Accessory" },
  { name: "IKEA", category: "Furniture" },
  { name: "Herman Miller", category: "Furniture" },
  { name: "Restoration Hardware", category: "Furniture" },
];

const LOCATIONS = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Chinese"];


const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function SearchDropdown({
  value,
  options,
  placeholder,
  open,
  onOpenChange,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (v: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = options
    .filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    .sort();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="w-full flex items-center justify-between bg-white border border-border rounded-lg px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary-600"
      >
        <span className={value ? "text-foreground" : "text-muted"}>{value || "Select a brand..."}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <SearchIcon />
            <input
              autoFocus
              type="text"
              placeholder={placeholder}
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
                  value === name
                    ? "bg-primary-100 text-primary-600 font-medium"
                    : "text-foreground hover:bg-background"
                }`}
              >
                {name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted">No results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TopicAccordion({ topic, prompts, popularity, userIntent, selected, onToggleSelect, brand }: { topic: string; prompts: string[]; popularity: "high" | "medium"; userIntent: string; selected: boolean; onToggleSelect: () => void; brand: string }) {
  const [open, setOpen] = useState(false);
  const [saveModal, setSaveModal] = useState<{ prompts: SavedPrompt[]; defaultName?: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const opening = !open;
    setOpen(opening);
    if (opening) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 220);
    }
  };

  return (
    <>
    <div ref={containerRef} className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-6 py-3 bg-white hover:bg-surface transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
              selected ? "bg-primary-600 border-primary-600" : "bg-white border-muted"
            }`}
          >
            {selected && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="text-base font-medium text-foreground">{topic}</span>
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
            popularity === "high"
              ? "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]"
              : "bg-[#FFF8E1] text-[#F59E0B] border border-[#FDE68A]"
          }`}>
            {popularity === "high" ? "High Popularity" : "Medium Popularity"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSaveModal({ prompts: prompts.map((p) => ({ text: p, topic, brand })), defaultName: topic }); }}
            className="flex items-center gap-1 text-xs text-primary-600 font-medium px-2 py-1 rounded-md hover:bg-primary-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add to List
          </button>
          <span className="text-xs text-muted bg-white border border-border rounded-full px-2 py-0.5">
            {prompts.length} prompts
          </span>
          <ChevronDownIcon className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border">
            <div className="p-3 border-b border-border">
              <div className="bg-background rounded-lg p-3 flex flex-col gap-0.5">
                <p className="text-[13px] font-semibold text-foreground uppercase tracking-wide">User Intent</p>
                <p className="text-[13px] text-foreground leading-relaxed">{userIntent}</p>
              </div>
            </div>
            {prompts.map((prompt, i) => (
              <div key={i} className="group flex items-center justify-between px-6 py-3 border-b border-background last:border-b-0">
                <p className="text-[13px] text-foreground">{prompt}</p>
                <button
                  type="button"
                  onClick={() => setSaveModal({ prompts: [{ text: prompt, topic, brand }] })}
                  className="shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-primary-600 font-medium px-2 py-1 rounded-md hover:bg-primary-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add to List
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {saveModal && (
      <SaveToListModal prompts={saveModal.prompts} defaultName={saveModal.defaultName} onClose={() => setSaveModal(null)} />
    )}
    </>
  );
}

const SESSION_KEY = "prompt-insights-state";

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function PromptInsightsPage() {
  const session = typeof window !== "undefined" ? loadSession() : null;

  const [brand, setBrand] = useState<string>(session?.brand ?? "");
  const [location, setLocation] = useState<string>(session?.location ?? "United States");
  const [language, setLanguage] = useState<string>(session?.language ?? "English");
  const [includeBrand, setIncludeBrand] = useState<boolean>(session?.includeBrand ?? true);
  const [openDropdown, setOpenDropdown] = useState<"brand" | "location" | "language" | null>(null);
  const [results, setResults] = useState<TopicData[] | null>(session?.results ?? null);
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ brand, location, language, includeBrand, results }));
  }, [brand, location, language, includeBrand, results]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      next.has(topic) ? next.delete(topic) : next.add(topic);
      return next;
    });
  };

  const handleGenerate = () => {
    if (!brand) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const data = getBrandInsights(brand);
      if (data) setResults(data.topics);
    }, 2000);
  };

  return (
    <div className="w-full font-sans">
      <h2 className="text-2xl font-semibold text-foreground mb-5">Prompt Insights</h2>

      <div className="bg-white rounded-lg">
        {/* Select Brand */}
        <div className="pb-4">
          <p className="text-base font-medium text-foreground mb-2">Select Brand</p>
          <SearchDropdown
            value={brand}
            options={BRANDS.map((b) => b.name)}
            placeholder="Search brands..."
            open={openDropdown === "brand"}
            onOpenChange={(o) => setOpenDropdown(o ? "brand" : null)}
            onChange={(v) => { setBrand(v); setResults(null); }}
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
              placeholder="Search locations..."
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
              placeholder="Search languages..."
              open={openDropdown === "language"}
              onOpenChange={(o) => setOpenDropdown(o ? "language" : null)}
              onChange={setLanguage}
            />
          </div>
        </div>

        {/* Include brand toggle */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-base font-medium text-foreground">
                Would you want to include the brand you selected in the prompts?
              </p>
              <InfoIcon />
            </div>
            <div className="flex gap-5">
              {[{ label: "Yes", val: true }, { label: "No", val: false }].map(({ label, val }) => {
                const active = includeBrand === val;
                return (
                  <button
                    key={label}
                    onClick={() => setIncludeBrand(val)}
                    className={`w-[130px] flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
                      active ? "bg-primary-100 border-primary-200" : "bg-white border-border"
                    }`}
                  >
                    <span className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      active ? "border-primary-600" : "border-muted"
                    }`}>
                      {active && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                    </span>
                    <span className="flex-1 text-left text-base font-medium text-foreground">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button variant="secondary" className="self-end" onClick={handleGenerate} disabled={!brand || loading}>
            {loading && (
              <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {loading ? "Generating..." : "Generate Insights"}
          </Button>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-6 pt-6 border-t border-border flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-foreground">
              Branded Prompts for {brand}
            </h3>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex flex-col gap-1">
              <p className="text-base font-semibold text-foreground">Key Insights</p>
              <p className="text-[13px] text-foreground">
                Users primarily search for pricing &amp; deals, specific product/model lookup and purchase sources, and brand identity, manufacturing and authenticity information.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {results.map((item) => (
                <TopicAccordion
                  key={item.topic}
                  topic={item.topic}
                  prompts={item.prompts}
                  popularity={item.popularity}
                  userIntent={item.userIntent}
                  selected={selectedTopics.has(item.topic)}
                  onToggleSelect={() => toggleTopic(item.topic)}
                  brand={brand}
                />
              ))}
            </div>

            {selectedTopics.size > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted">
                  <span className="font-medium text-foreground">{selectedTopics.size}</span> topic{selectedTopics.size > 1 ? "s" : ""} selected
                </p>
                <Button variant="primary" onClick={() => alert(`Running tracker for: ${[...selectedTopics].join(", ")}`)}>
                  Run New Tracker
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
