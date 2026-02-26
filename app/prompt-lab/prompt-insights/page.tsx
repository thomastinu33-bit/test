"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/Evertune";
import { getBrandInsights, type TopicData, type CategoryData, type SubtopicData } from "./data";
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
        className="w-full flex items-center justify-between bg-white border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-600"
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

const PROMPTS_PAGE_SIZE = 3;

function TopicAccordion({ topic, prompts, subtopics, popularity, userIntent, selected, onToggleSelect, brand, open, onOpen }: { topic: string; prompts: string[]; subtopics?: SubtopicData[]; popularity: "high" | "medium" | "low"; userIntent: string; selected: boolean; onToggleSelect: () => void; brand: string; open: boolean; onOpen: () => void }) {
  const [visiblePrompts, setVisiblePrompts] = useState(PROMPTS_PAGE_SIZE);
  const [saveModal, setSaveModal] = useState<{ prompts: SavedPrompt[]; defaultName?: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!open) {
      onOpen();
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 220);
    } else {
      onOpen(); // closes by toggling in parent
    }
  };

  return (
    <>
    <div ref={containerRef} className="border border-border rounded-lg overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => e.key === "Enter" && handleToggle()}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors cursor-pointer ${open ? "bg-surface" : "bg-white hover:bg-surface"}`}
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
          <span className="text-sm font-semibold text-foreground">{topic}</span>
          <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 uppercase tracking-wide ${
            popularity === "high"
              ? "bg-[#DCFCE7] text-[#16A34A]"
              : popularity === "medium"
              ? "bg-[#FFF8E1] text-[#F59E0B]"
              : "bg-[#FEE2E2] text-[#DC2626]"
          }`}>
            {popularity === "high" ? "High Popularity" : popularity === "medium" ? "Medium Popularity" : "Low Popularity"}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted">
            {subtopics ? subtopics.reduce((acc, st) => acc + st.prompts.length, 0) : prompts.length} prompts
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSaveModal({ prompts: prompts.map((p) => ({ text: p, topic, brand })), defaultName: topic }); }}
            className="flex items-center gap-1 text-xs text-primary-600 font-medium px-2 py-1 rounded-md hover:bg-primary-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add to Library
          </button>
          <ChevronDownIcon className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

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
            {subtopics && subtopics.length > 0 ? (
              subtopics.map((st) => (
                <div key={st.name}>
                  <div className="flex items-center justify-between px-5 py-2 bg-surface border-b border-border">
                    <p className="text-xs font-semibold text-foreground">{st.name}</p>
                    <button
                      type="button"
                      onClick={() => setSaveModal({ prompts: st.prompts.map((p) => ({ text: p, topic, brand })), defaultName: st.name })}
                      className="text-xs text-primary-600 font-medium hover:underline transition-colors"
                    >
                      Add all
                    </button>
                  </div>
                  {st.prompts.map((prompt, i) => (
                    <div key={i} className="group flex items-center justify-between px-5 py-2.5 border-b border-background last:border-b-0 hover:bg-surface">
                      <p className="text-[13px] text-foreground">{prompt}</p>
                      <button
                        type="button"
                        onClick={() => setSaveModal({ prompts: [{ text: prompt, topic, brand }] })}
                        className="shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary-600 font-medium hover:underline"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              prompts.map((prompt, i) => (
                <div key={i} className="group flex items-center justify-between px-5 py-2.5 border-b border-background last:border-b-0 hover:bg-surface">
                  <p className="text-[13px] text-foreground">{prompt}</p>
                  <button
                    type="button"
                    onClick={() => setSaveModal({ prompts: [{ text: prompt, topic, brand }] })}
                    className="shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary-600 font-medium hover:underline"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
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

const TOPICS_PAGE_SIZE = 5;

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
  const [brand, setBrand] = useState<string>("");
  const [location, setLocation] = useState<string>("United States");
  const [language, setLanguage] = useState<string>("English");
  const [includeBrand, setIncludeBrand] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<"brand" | "location" | "language" | null>(null);
  const [results, setResults] = useState<TopicData[] | null>(null);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shownCategoryNames, setShownCategoryNames] = useState<Set<string>>(new Set());
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [catDropdownSearch, setCatDropdownSearch] = useState("");
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [visibleTopicsCount, setVisibleTopicsCount] = useState(TOPICS_PAGE_SIZE);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"your-brand" | "competitor" | "non-branded">("non-branded");
  const trackerBarRef = useRef<HTMLDivElement>(null);

  // Restore session after mount to avoid SSR/client mismatch
  useEffect(() => {
    const session = loadSession();
    if (!session) return;
    if (session.brand) setBrand(session.brand);
    if (session.location) setLocation(session.location);
    if (session.language) setLanguage(session.language);
    if (session.includeBrand !== undefined) setIncludeBrand(session.includeBrand);
    if (session.results) setResults(session.results);
  }, []);

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

  useEffect(() => {
    if (selectedTopics.size === 1) {
      setTimeout(() => {
        trackerBarRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [selectedTopics.size]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseVol = useCallback((v: string) => parseFloat(v.replace("M", "")) * 1_000_000, []);

  const handleGenerate = () => {
    if (!brand) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const data = getBrandInsights(brand);
      if (data) {
        setResults(data.topics);
        setCompetitors(data.competitors ?? []);
        const cats = data.categories ?? [];
        setCategories(cats);
        const parseVol = (v: string) => parseFloat(v.replace("M", "")) * 1_000_000;
        const top5 = [...cats].sort((a, b) => parseVol(b.volume) - parseVol(a.volume)).slice(0, 5).map((c) => c.name);
        setShownCategoryNames(new Set(top5));
        setSelectedCategory(top5[0] ?? null);
        setVisibleTopicsCount(TOPICS_PAGE_SIZE);
        setOpenTopic(null);
      }
    }, 2000);
  };

  return (
    <div className="w-full font-sans">
      <h2 className="text-2xl font-semibold text-foreground mb-1">Prompt Insights</h2>
      <p className="text-sm text-muted mb-5">
        Type in any brand and see categories and prompt themes related to the brand.{" "}
        <a href="#" className="text-primary-600 hover:underline font-medium">Learn More</a>
      </p>

      <div className="bg-white rounded-lg">
        {/* Brand + Location + Language + Generate */}
        <div className="flex gap-5 pb-4 items-end border border-border rounded-lg p-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1.5">Select Brand</p>
            <SearchDropdown
              value={brand}
              options={BRANDS.map((b) => b.name)}
              placeholder="Search brands..."
              open={openDropdown === "brand"}
              onOpenChange={(o) => setOpenDropdown(o ? "brand" : null)}
              onChange={(v) => { setBrand(v); setResults(null); }}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1.5">
              <LocationIcon />
              <p className="text-sm font-medium text-foreground">Location</p>
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
            <div className="flex items-center gap-1 mb-1.5">
              <TranslateIcon />
              <p className="text-sm font-medium text-foreground">Language</p>
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

          <div className="shrink-0 self-end">
            <Button variant="secondary" className="rounded-lg" onClick={handleGenerate} disabled={!brand || loading || !!results}>
              {loading && (
                <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative bg-primary-50 rounded-lg pl-5 pr-4 py-3 flex flex-col gap-0.5 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ background: "linear-gradient(180deg, var(--primary-gradient-start) 0%, var(--primary) 50%, var(--primary-gradient-end) 100%)" }} />
              <p className="text-base font-semibold text-foreground">Key Insights</p>
              <p className="text-[13px] text-foreground leading-relaxed">
                Users primarily search for pricing &amp; deals, specific product/model lookup and purchase sources, and brand identity, manufacturing and authenticity information.
              </p>
            </div>
            <div className="border border-border rounded-lg px-4 py-3 flex flex-col gap-2">
              <p className="text-base font-semibold text-foreground">Competitors Discovered</p>
              <div className="flex flex-wrap gap-2">
                {competitors.map((competitor) => (
                  <span key={competitor} className="text-xs font-medium text-foreground bg-white border border-border rounded-full px-3 py-1">
                    {competitor}
                  </span>
                ))}
              </div>
            </div>

            <h4 className="text-base font-semibold text-foreground">Prompt Themes</h4>

            {/* Category picker */}
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {[...categories]
                  .sort((a, b) => parseVol(b.volume) - parseVol(a.volume))
                  .filter((c) => shownCategoryNames.has(c.name))
                  .map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => { setSelectedCategory(cat.name); setVisibleTopicsCount(TOPICS_PAGE_SIZE); setSelectedTab("non-branded"); }}
                        className={`flex flex-col items-start px-4 py-3 rounded-lg border transition-colors text-left ${
                          isSelected ? "border-primary-600 bg-primary-50" : "border-border bg-white hover:bg-surface"
                        }`}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? "text-primary-600" : "text-foreground"}`}>{cat.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted">{cat.volume} prompts/mo</span>
                          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                            cat.changePositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                          }`}>
                            {cat.changePositive
                              ? <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor"><polygon points="4,0 8,8 0,8" /></svg>
                              : <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor"><polygon points="0,0 8,0 4,8" /></svg>
                            }
                            {cat.change.replace(/^[+-]/, "")}
                          </span>
                        </div>
                      </button>
                    );
                  })}

              {/* More categories */}
              <div ref={moreDropdownRef} className="relative justify-self-start">
                <button
                  type="button"
                  onClick={() => { setMoreDropdownOpen((v) => !v); setCatDropdownSearch(""); }}
                  className={`flex items-center justify-center rounded-lg border transition-colors h-full min-h-[68px] w-[50px] ${
                    moreDropdownOpen ? "border-primary-600 bg-primary-50 text-primary-600" : "border-border bg-white hover:bg-surface text-muted"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border rounded-lg shadow-lg w-64 max-h-72 overflow-y-auto">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide">Categories</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                      <SearchIcon />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search..."
                        value={catDropdownSearch}
                        onChange={(e) => setCatDropdownSearch(e.target.value)}
                        className="flex-1 text-sm text-foreground placeholder-muted outline-none ring-0 bg-transparent"
                      />
                      {catDropdownSearch && (
                        <button type="button" onClick={() => setCatDropdownSearch("")} className="text-muted hover:text-foreground">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        </button>
                      )}
                    </div>
                    {[...categories]
                      .sort((a, b) => parseVol(b.volume) - parseVol(a.volume))
                      .filter((c) => c.name.toLowerCase().includes(catDropdownSearch.toLowerCase()))
                      .map((cat) => {
                        const isShown = shownCategoryNames.has(cat.name);
                        return (
                          <label
                            key={cat.name}
                            className="flex items-center justify-between px-3 py-1 hover:bg-surface cursor-pointer gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                isShown ? "bg-primary-600 border-primary-600" : "bg-white border-muted"
                              }`}>
                                {isShown && (
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </span>
                              <span className="text-sm text-foreground truncate">{cat.name}</span>
                            </div>
                            <span className="text-xs text-muted shrink-0">{cat.volume}/mo</span>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={isShown}
                              onChange={() => {
                                setShownCategoryNames((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(cat.name)) {
                                    next.delete(cat.name);
                                    if (selectedCategory === cat.name) {
                                      const first = [...next][0] ?? null;
                                      setSelectedCategory(first);
                                    }
                                  } else {
                                    next.add(cat.name);
                                  }
                                  return next;
                                });
                              }}
                            />
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {selectedCategory && (
              <nav className="border-b border-[#e5e5e5] mt-2">
                <div className="flex gap-6">
                  {(["your-brand", "competitor", "non-branded"] as const).map((tab) => {
                    const label = tab === "your-brand" ? "Your Brand" : tab === "competitor" ? "Competitor" : "Non Branded";
                    const isActive = selectedTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSelectedTab(tab)}
                        className={`relative pb-4 pt-1 px-3 -mx-3 text-xs tracking-wide uppercase transition-colors duration-150 rounded-t-md ${
                          isActive
                            ? "font-bold text-[var(--primary)]"
                            : "font-semibold text-[#404040] hover:text-[var(--primary)] hover:bg-[#f6f6f6]"
                        }`}
                      >
                        {label}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>
            )}

            {(() => {
              const tabFiltered = [...results]
                .filter((item) => {
                  const categoryMatch = !selectedCategory || item.category === selectedCategory;
                  const tabMatch =
                    selectedTab === "your-brand" ? item.tab === "your-brand" :
                    selectedTab === "competitor" ? item.tab === "competitor" :
                    (item.tab === "non-branded" || !item.tab);
                  return categoryMatch && tabMatch;
                })
                .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.popularity] - { high: 0, medium: 1, low: 2 }[b.popularity]))
                .slice(0, visibleTopicsCount);

              if (tabFiltered.length === 0) {
                return <p className="text-sm text-muted py-6 text-center">No data available for this view yet.</p>;
              }

              return (
                <div className="flex flex-col gap-3">
                  {tabFiltered.map((item) => (
                    <TopicAccordion
                      key={item.topic}
                      topic={item.topic}
                      prompts={item.prompts}
                      subtopics={item.subtopics}
                      popularity={item.popularity}
                      userIntent={item.userIntent}
                      selected={selectedTopics.has(item.topic)}
                      onToggleSelect={() => toggleTopic(item.topic)}
                      brand={brand}
                      open={openTopic === item.topic}
                      onOpen={() => setOpenTopic(openTopic === item.topic ? null : item.topic)}
                    />
                  ))}
                </div>
              );
            })()}

            {selectedTopics.size > 0 && (
              <div ref={trackerBarRef} className="flex items-center justify-between pt-4 border-t border-border">
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
