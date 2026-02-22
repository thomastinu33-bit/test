"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/Evertune";

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

const COACH_INSIGHTS: { topic: string; prompts: string[] }[] = [
  {
    topic: "Handbag Discovery & Style Exploration",
    prompts: [
      "What are the best crossbody styles for commuting?",
      "Where can I find a small white tote with short handles?",
      "What are the best structured evening clutches for weddings?",
      "What are the best lightweight travel backpacks for city trips?",
      "Which quilted shoulder bags look elegant?",
      "What are the top handbag trends for spring 2026?",
      "What are the best compact satchels for daily use?",
      "What are the top toiletry pouches for weekend trips?",
      "What are the most stylish messenger bags for cyclists?",
      "What are the best suitcase-style backpacks for business travel?",
      "What are the most chic handbags for office wear?",
      "Which mini backpacks can fit a tablet?",
      "Where can I find soft hobo bags in chocolate brown?",
      "Where can I find a leather satchel with a classic silhouette?",
      "What are the best small handheld bags with stands?",
      "Where can I find white carry-all bags with handles?",
      "What are the best sporty golf carry bags with pockets?",
      "What are the best everyday backpacks with a laptop sleeve?",
    ],
  },
  {
    topic: "Brand Authenticity",
    prompts: [
      "Which maker produces a burgundy top-handle bag with embossing like this?",
      "Can you identify the purse in this photo?",
      "What brand makes an embossed leather double bag with a croc pattern?",
      "Where can I find information on classic top-handle models?",
      "Which labels are known for that style of leather satchel?",
      "What are the details of the top-handle embossed burgundy bag model?",
      "Who manufactures structured bags in brocade fabric?",
      "Is this type of purse considered vintage or current?",
      "What are the hallmarks of a high-quality toiletry pouch?",
      "Which brands offer embossed double-handle designs?",
      "How can I tell which company made a particular purse?",
      "Can you provide information on the \"Pimlico\" style top-handle model?",
      "What distinguishes a designer top-handle bag from similar styles?",
      "Which makers are known for crocodile-embossed leather bags?",
      "Can you tell me the origin of this double-handle bag?",
      "What companies produce durable canvas grocery totes?",
      "Which brands are known for signature toiletry cases?",
      "What are common makers of structured brocade handbags?",
      "How can I identify the maker of a Herschel-style backpack?",
      "Which purse brands are popular for women's everyday bags?",
    ],
  },
  {
    topic: "Handbag Pricing",
    prompts: [
      "What is the average price range for high-end leather handbags?",
      "Are designer purses typically discounted after major holidays?",
      "What are the top-rated makeup bags under $50?",
      "How do luxury handbags rank by resale value?",
      "What have tote bag sales trends looked like over the past year?",
      "What is the typical selling price for structured brocade handbags?",
      "During which seasons are premium handbags most commonly discounted?",
      "What statistics show backpack popularity among commuters?",
      "Which makeup bags receive the highest customer ratings?",
      "Which handbag styles tend to hold their resale value best?",
      "How do messenger bag prices compare across major retailers?",
      "Are handcrafted handbags generally more expensive to repair than mass-produced ones?",
      "What are the top-rated travel toiletry bags according to reviewers?",
      "What is the current market share of luxury versus mid-range handbags?",
      "What defines a \"high-end\" purse, and what are its typical price benchmarks?",
      "How does the price of a suitcase-style backpack compare to a regular backpack?",
      "How do discounts influence handbag purchase decisions?",
      "Which handbag materials are considered the most valuable by cost?",
      "Which handbag categories sell the fastest online?",
      "What data shows seasonal spikes in handbag search trends?",
    ],
  },
];

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
        className="w-full flex items-center justify-between bg-white border border-[#eeeeee] rounded-lg px-4 py-3 text-base text-[#262626] focus:outline-none focus:ring-1 focus:ring-[#048BC5]"
      >
        <span className={value ? "text-[#262626]" : "text-[#9e9e9e]"}>{value || "Select a brand..."}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#eeeeee] rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#eeeeee]">
            <SearchIcon />
            <input
              autoFocus
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-[#262626] placeholder-[#9e9e9e] focus:outline-none"
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
                    ? "bg-[#E0F3FE] text-[#048BC5] font-medium"
                    : "text-[#262626] hover:bg-[#f6f6f6]"
                }`}
              >
                {name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-[#9e9e9e]">No results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TopicAccordion({ topic, prompts }: { topic: string; prompts: string[] }) {
  const [open, setOpen] = useState(false);
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
    <div ref={containerRef} className="border-2 border-[#f6f6f6] rounded-lg shadow-[2px_2px_10px_0px_rgba(0,0,0,0.1)] overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-6 py-3 bg-white hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-[#262626]">{topic}</span>
          <span className="text-xs text-[#9e9e9e] bg-white border border-[#eeeeee] rounded-full px-2 py-0.5">
            {prompts.length} prompts
          </span>
        </div>
        <ChevronDownIcon className={`transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#eeeeee]">
            {prompts.map((prompt, i) => (
              <div key={i} className="px-6 py-3 border-b border-[#f6f6f6] last:border-b-0">
                <p className="text-[13px] text-[#262626]">{prompt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromptInsightsPage() {
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState("United States");
  const [language, setLanguage] = useState("English");
  const [includeBrand, setIncludeBrand] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<"brand" | "location" | "language" | null>(null);
  const [results, setResults] = useState<typeof COACH_INSIGHTS | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    if (!brand) return;
    setResults(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (brand === "Coach") setResults(COACH_INSIGHTS);
    }, 2000);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-[#262626] mb-5">Prompt Insights</h2>

      <div className="bg-white rounded-lg">
        {/* Select Brand */}
        <div className="pb-4">
          <p className="text-base font-medium text-[#262626] mb-2">Select Brand</p>
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
              <p className="text-base font-medium text-[#262626]">Location</p>
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
              <p className="text-base font-medium text-[#262626]">Language</p>
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
              <p className="text-base font-medium text-[#262626]">
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
                      active ? "bg-[#E0F3FE] border-[#BBE9FC]" : "bg-white border-[#eeeeee]"
                    }`}
                  >
                    <span className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      active ? "border-[#048BC5]" : "border-[#9e9e9e]"
                    }`}>
                      {active && <span className="w-2 h-2 rounded-full bg-[#048BC5]" />}
                    </span>
                    <span className="flex-1 text-left text-base font-medium text-[#262626]">{label}</span>
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
          <div className="mt-6 flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-[#262626]">
              Branded Prompts for {brand}
            </h3>
            <div className="bg-[#F0FAFF] rounded-lg p-4 flex flex-col gap-1">
              <p className="text-base font-semibold text-[#262626]">Key Insights</p>
              <p className="text-[13px] text-[#262626]">
                Users primarily search for pricing &amp; deals, specific product/model lookup and purchase sources, and brand identity, manufacturing and authenticity information.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {results.map((item) => (
                <TopicAccordion key={item.topic} topic={item.topic} prompts={item.prompts} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
