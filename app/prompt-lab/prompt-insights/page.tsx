"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/Evertune";
import { getBrandInsights, type TopicData, type CategoryData, type SubtopicData, type CompetitorData } from "./data";
import { SaveToListModal } from "../SaveToListModal";
import { AddToTrackerModal } from "../AddToTrackerModal";
import { useTrackerDrawer } from "../TrackerDrawerContext";
import type { SavedPrompt } from "../usePromptLists";

const DragHandle = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#c0c0c0]">
    <circle cx="4.5" cy="3" r="1.2" fill="currentColor" />
    <circle cx="9.5" cy="3" r="1.2" fill="currentColor" />
    <circle cx="4.5" cy="7" r="1.2" fill="currentColor" />
    <circle cx="9.5" cy="7" r="1.2" fill="currentColor" />
    <circle cx="4.5" cy="11" r="1.2" fill="currentColor" />
    <circle cx="9.5" cy="11" r="1.2" fill="currentColor" />
  </svg>
);

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

function TopicAccordion({ topic, prompts, subtopics, popularity, userIntent, brand, open, onOpen }: { topic: string; prompts: string[]; subtopics?: SubtopicData[]; popularity: "high" | "medium" | "low"; userIntent: string; brand: string; open: boolean; onOpen: () => void }) {
  const [visiblePrompts, setVisiblePrompts] = useState(PROMPTS_PAGE_SIZE);
  const [saveModal, setSaveModal] = useState<{ prompts: SavedPrompt[]; defaultName?: string } | null>(null);
  const [trackerModal, setTrackerModal] = useState<{ prompts: SavedPrompt[]; defaultName?: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen: isTrackerOpen } = useTrackerDrawer();

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
    <div
      ref={containerRef}
      className="border border-border rounded-lg overflow-hidden"
      draggable
      onDragStart={(e) => {
        const allPrompts = subtopics && subtopics.length > 0
          ? subtopics.flatMap((st) => st.prompts.map((p) => ({ text: p, topic: st.name, brand })))
          : prompts.map((p) => ({ text: p, topic, brand }));
        e.dataTransfer.setData("application/tracker-prompts", JSON.stringify(allPrompts));
        e.dataTransfer.effectAllowed = "copy";
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => e.key === "Enter" && handleToggle()}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors cursor-pointer ${open ? "bg-surface" : "bg-white hover:bg-surface"}`}
      >
        <div className="flex items-center gap-3">
          {isTrackerOpen && <DragHandle />}
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
            onClick={(e) => {
              e.stopPropagation();
              const allPrompts = subtopics && subtopics.length > 0
                ? subtopics.flatMap((st) => st.prompts.map((p) => ({ text: p, topic: st.name, brand })))
                : prompts.map((p) => ({ text: p, topic, brand }));
              setTrackerModal({ prompts: allPrompts, defaultName: topic });
            }}
            className="flex items-center gap-1 text-xs text-primary-600 font-medium px-2 py-1 rounded-md hover:bg-primary-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add to Tracker
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
                  <div
                    className="flex items-center justify-between px-5 py-2 bg-surface border-b border-border cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.setData("application/tracker-prompts", JSON.stringify(st.prompts.map((p) => ({ text: p, topic: st.name, brand }))));
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isTrackerOpen && <DragHandle />}
                      <p className="text-xs font-semibold text-foreground">{st.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSaveModal({ prompts: st.prompts.map((p) => ({ text: p, topic, brand })), defaultName: st.name })}
                      className="text-xs text-primary-600 font-medium hover:underline transition-colors"
                    >
                      Add all
                    </button>
                  </div>
                  {st.prompts.map((prompt, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData("application/tracker-prompts", JSON.stringify([{ text: prompt, topic: st.name, brand }]));
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      className="group flex items-center gap-2 px-5 py-2.5 border-b border-background last:border-b-0 hover:bg-surface cursor-grab active:cursor-grabbing"
                    >
                      {isTrackerOpen && <DragHandle />}
                      <p className="flex-1 text-[13px] text-foreground">{prompt}</p>
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
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData("application/tracker-prompts", JSON.stringify([{ text: prompt, topic, brand }]));
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  className="group flex items-center gap-2 px-5 py-2.5 border-b border-background last:border-b-0 hover:bg-surface cursor-grab active:cursor-grabbing"
                >
                  {isTrackerOpen && <DragHandle />}
                  <p className="flex-1 text-[13px] text-foreground">{prompt}</p>
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
    {trackerModal && (
      <AddToTrackerModal prompts={trackerModal.prompts} defaultName={trackerModal.defaultName} onClose={() => setTrackerModal(null)} />
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
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [visibleTopicsCount, setVisibleTopicsCount] = useState(TOPICS_PAGE_SIZE);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"your-brand" | "competitor" | "non-branded">("non-branded");
  const [competitorPage, setCompetitorPage] = useState(0);
  const [categoryTablePage, setCategoryTablePage] = useState(0);
  const COMPETITORS_PAGE_SIZE = 10;
  const CATEGORY_TABLE_PAGE_SIZE = 10;

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


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
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
        const top1 = [...cats].sort((a, b) => parseVol(b.volume) - parseVol(a.volume))[0]?.name ?? null;
        setSelectedCategory(top1);
        setVisibleTopicsCount(TOPICS_PAGE_SIZE);
        setOpenTopic(null);
      }
    }, 2000);
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-8 font-sans">
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

        {/* No brand selected — show Prompt Volume bottom section */}
        {!results && (
          <div className="mt-6 flex flex-col gap-5">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-foreground">
                Did you know{" "}
                <span className="font-semibold text-primary-600">over 80% of prompts are unique</span>
                {" "}— i.e. never seen again. That&apos;s because prompts are long.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">Prompt Word Count</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-surface border-b border-border">
                  <div className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Model</div>
                  <div className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide border-l border-border">Avg. Word Count</div>
                  <div className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide border-l border-border">Median Word Count</div>
                </div>
                {[
                  { model: "ChatGPT", avg: 96, median: 19 },
                  { model: "Gemini", avg: 143, median: 18 },
                  { model: "Perplexity", avg: 45, median: 14 },
                  { model: "Copilot", avg: 44, median: 15 },
                ].map((row) => (
                  <div key={row.model} className="grid grid-cols-3 border-b border-border last:border-b-0 bg-white hover:bg-surface transition-colors">
                    <div className="px-4 py-3 text-sm font-medium text-foreground">{row.model}</div>
                    <div className="px-4 py-3 text-sm text-foreground border-l border-border">{row.avg}</div>
                    <div className="px-4 py-3 text-sm text-foreground border-l border-border">{row.median}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted">
              Just like no two conversations with a person are ever exactly the same, the way people prompt AI can vary a lot. That&apos;s why it&apos;s more helpful to focus on topics and themes, rather than trying to match exact prompts.
            </p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="mt-6 flex flex-col gap-4">
            {/* Key Insights */}
            <div className="relative bg-primary-50 rounded-lg pl-5 pr-4 py-3 flex flex-col gap-0.5 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ background: "linear-gradient(180deg, var(--primary-gradient-start) 0%, var(--primary) 50%, var(--primary-gradient-end) 100%)" }} />
              <p className="text-base font-semibold text-foreground">Key Insights</p>
              <p className="text-[13px] text-foreground leading-relaxed">
                Users primarily search for pricing &amp; deals, specific product/model lookup and purchase sources, and brand identity, manufacturing and authenticity information.
              </p>
            </div>

            {/* Competitors + Categories side by side */}
            <div className="flex gap-4 items-stretch">
              {(() => {
                const totalPages = Math.ceil(competitors.length / COMPETITORS_PAGE_SIZE);
                const pageItems = competitors.slice(competitorPage * COMPETITORS_PAGE_SIZE, (competitorPage + 1) * COMPETITORS_PAGE_SIZE);
                return (
                  <div className="border border-border rounded-lg overflow-hidden flex-1">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-base font-semibold text-foreground">Competitors Discovered</p>
                      <p className="text-xs text-muted mt-0.5">{competitors.length} brands · ranked by prompt volume</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface border-b border-border">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide w-10">#</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">Name</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">Monthly Prompts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pageItems.map((competitor, i) => (
                          <tr key={competitor.name} className="hover:bg-surface transition-colors">
                            <td className="px-4 py-2.5 text-xs text-muted tabular-nums">{competitorPage * COMPETITORS_PAGE_SIZE + i + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-foreground">{competitor.name}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                              <span>{competitor.volume}</span>
                              <span className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${competitor.changePositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                {competitor.changePositive
                                  ? <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><polygon points="4,0 8,8 0,8" /></svg>
                                  : <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><polygon points="0,0 8,0 4,8" /></svg>
                                }
                                {competitor.change.replace(/^[+-]/, "")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface">
                        <p className="text-xs text-muted">
                          {competitorPage * COMPETITORS_PAGE_SIZE + 1}–{Math.min((competitorPage + 1) * COMPETITORS_PAGE_SIZE, competitors.length)} of {competitors.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <button type="button" disabled={competitorPage === 0} onClick={() => setCompetitorPage((p) => p - 1)} className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                          <span className="text-xs text-muted px-1">{competitorPage + 1} / {totalPages}</span>
                          <button type="button" disabled={competitorPage === totalPages - 1} onClick={() => setCompetitorPage((p) => p + 1)} className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {(() => {
                const sortedCats = [...categories].sort((a, b) => parseVol(b.volume) - parseVol(a.volume));
                const totalPages = Math.ceil(sortedCats.length / CATEGORY_TABLE_PAGE_SIZE);
                const pageItems = sortedCats.slice(categoryTablePage * CATEGORY_TABLE_PAGE_SIZE, (categoryTablePage + 1) * CATEGORY_TABLE_PAGE_SIZE);
return (
                  <div className="border border-border rounded-lg overflow-hidden flex-1">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-base font-semibold text-foreground">Product Categories & Topics</p>
                      <p className="text-xs text-muted mt-0.5">{categories.length} categories discovered</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface border-b border-border">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">Name</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide">Monthly Prompts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pageItems.map((cat) => (
                          <tr key={cat.name} className="hover:bg-surface transition-colors">
                            <td className="px-4 py-2.5 font-medium text-foreground">{cat.name}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                              <span>{cat.volume}</span>
                              <span className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${cat.changePositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                {cat.changePositive
                                  ? <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><polygon points="4,0 8,8 0,8" /></svg>
                                  : <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><polygon points="0,0 8,0 4,8" /></svg>
                                }
                                {cat.change.replace(/^[+-]/, "")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface">
                        <p className="text-xs text-muted">
                          {categoryTablePage * CATEGORY_TABLE_PAGE_SIZE + 1}–{Math.min((categoryTablePage + 1) * CATEGORY_TABLE_PAGE_SIZE, sortedCats.length)} of {sortedCats.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <button type="button" disabled={categoryTablePage === 0} onClick={() => setCategoryTablePage((p) => p - 1)} className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                          <span className="text-xs text-muted px-1">{categoryTablePage + 1} / {totalPages}</span>
                          <button type="button" disabled={categoryTablePage === totalPages - 1} onClick={() => setCategoryTablePage((p) => p + 1)} className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <div>
                <h4 className="text-xl font-semibold text-foreground">Prompt Themes</h4>
                <p className="text-sm text-slate-500 mt-1">Browse the topics and individual prompts driving AI search activity in your category.</p>
              </div>

              {/* Category dropdown — TrackerShell style */}
              <div className="relative w-64" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => { setCategoryDropdownOpen((v) => !v); setCategorySearch(""); }}
                  className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left"
                >
                  <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
                    Category
                  </span>
                  <span className="flex-1 min-w-0 text-sm truncate text-[#262626]">
                    {selectedCategory ?? "All"}
                  </span>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
                    <ChevronDownIcon />
                  </span>
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-[#e5e5e5] rounded-lg shadow-lg w-72 max-h-72 overflow-y-auto">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e5e5e5] sticky top-0 bg-white">
                      <SearchIcon />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="flex-1 text-sm text-[#262626] placeholder-[#9e9e9e] outline-none bg-transparent"
                      />
                      {categorySearch && (
                        <button type="button" onClick={() => setCategorySearch("")} className="text-[#9e9e9e] hover:text-[#262626]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory(null); setVisibleTopicsCount(TOPICS_PAGE_SIZE); setCategoryDropdownOpen(false); setCategorySearch(""); }}
                        className={`w-full flex items-center px-4 py-2 text-left transition-colors ${selectedCategory === null ? "bg-primary-50 text-primary-600" : "text-[#262626] hover:bg-[#f6f6f6]"}`}
                      >
                        <span className={`text-sm ${selectedCategory === null ? "font-semibold" : "font-medium"}`}>All</span>
                      </button>
                      {[...categories]
                        .sort((a, b) => parseVol(b.volume) - parseVol(a.volume))
                        .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                        .map((cat) => {
                          const isSelected = selectedCategory === cat.name;
                          return (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => { setSelectedCategory(cat.name); setVisibleTopicsCount(TOPICS_PAGE_SIZE); setSelectedTab("non-branded"); setCategoryDropdownOpen(false); setCategorySearch(""); }}
                              className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${isSelected ? "bg-primary-50 text-primary-600" : "text-[#262626] hover:bg-[#f6f6f6]"}`}
                            >
                              <span className={`text-sm truncate ${isSelected ? "font-semibold" : "font-medium"}`}>{cat.name}</span>
                              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                <span className="text-xs text-[#7F7F7F] tabular-nums">{cat.volume}</span>
                                <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${cat.changePositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                  {cat.changePositive
                                    ? <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><polygon points="4,0 8,8 0,8" /></svg>
                                    : <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><polygon points="0,0 8,0 4,8" /></svg>
                                  }
                                  {cat.change.replace(/^[+-]/, "")}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
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
                      brand={brand}
                      open={openTopic === item.topic}
                      onOpen={() => setOpenTopic(openTopic === item.topic ? null : item.topic)}
                    />
                  ))}
                </div>
              );
            })()}

          </div>
        )}
      </div>
    </div>

  );
}
