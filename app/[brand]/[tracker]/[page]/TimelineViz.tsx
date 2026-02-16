"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

export type TimelineMetric = "AI Brand Score" | "Visibility Score" | "Average Position";

const METRIC_CONFIG: Record<
  TimelineMetric,
  { label: string; max: number }
> = {
  "AI Brand Score": { label: "AI Brand Index", max: 100 },
  "Visibility Score": { label: "Visibility", max: 100 },
  "Average Position": { label: "Avg. Position", max: 25 },
};

interface ModelOption {
  id: string;
  label: string;
}

interface TimelineSeriesPoint {
  date: string;
  value: number;
}

interface TimelineSeries {
  brand: string;
  data: TimelineSeriesPoint[];
}

const AVERAGE_ACROSS_ALL = "__average__";

const MAIN_BRAND = "PORSCHE";
const COMPETITOR_LIST = ["PORSCHE", "BMW", "BENZ", "VOLVOCARS", "AUDI", "LEXUS"] as const;
const COMPETITOR_SET = new Set(COMPETITOR_LIST.map((c) => c.toUpperCase()));

function sortBrandsWithMainFirst(brands: string[]): string[] {
  const main = brands.find((b) => b.toUpperCase() === MAIN_BRAND);
  const rest = brands.filter((b) => b.toUpperCase() !== MAIN_BRAND);
  return main ? [main, ...rest] : rest;
}

type TimelineTopicId = "overall" | "topOfMind" | "perception" | "media" | "process" | "product" | "price";

const TOPIC_OPTIONS: { id: TimelineTopicId; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "topOfMind", label: "Top of Mind" },
  { id: "perception", label: "Perception" },
  { id: "media", label: "Media" },
  { id: "process", label: "Process" },
  { id: "product", label: "Product" },
  { id: "price", label: "Price" },
];

type ChartView = "timeline" | "bar";

const CHART_COLORS = [
  "var(--viz-1)",
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
  "var(--viz-5)",
  "var(--viz-6)",
  "var(--viz-7)",
  "var(--viz-8)",
];

const CHART_GRADIENTS = [
  "linear-gradient(180deg, var(--viz-1-gradient-start) 0%, var(--viz-1) 50%, var(--viz-1-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-2-gradient-start) 0%, var(--viz-2) 50%, var(--viz-2-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-3-gradient-start) 0%, var(--viz-3) 50%, var(--viz-3-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-4-gradient-start) 0%, var(--viz-4) 50%, var(--viz-4-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-5-gradient-start) 0%, var(--viz-5) 50%, var(--viz-5-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-6-gradient-start) 0%, var(--viz-6) 50%, var(--viz-6-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-7-gradient-start) 0%, var(--viz-7) 50%, var(--viz-7-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-8-gradient-start) 0%, var(--viz-8) 50%, var(--viz-8-gradient-end) 100%)",
];

function getChartColor(colors: readonly string[], index: number): string {
  const i = index % colors.length;
  const base = colors[i]!;
  return index < colors.length ? base : `color-mix(in oklch, ${base} 62%, white)`;
}

function getChartGradient(gradients: readonly string[], index: number): string {
  const i = index % gradients.length;
  return gradients[i]!;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

export interface TimelineVizProps {
  metric?: TimelineMetric;
  setMetric?: (m: TimelineMetric) => void;
  selectedBrands?: Set<string>;
  setSelectedBrands?: (s: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedModel?: string;
  setSelectedModel?: (s: string) => void;
  brandsList?: string[];
  modelsList?: ModelOption[];
  top10Brands?: string[];
}

export function TimelineViz(props?: TimelineVizProps) {
  const [internalMetric, setInternalMetric] = useState<TimelineMetric>("AI Brand Score");
  const [internalBrandsList, setInternalBrandsList] = useState<string[]>([]);
  const [internalModelsList, setInternalModelsList] = useState<ModelOption[]>([]);
  const [internalTop10, setInternalTop10] = useState<string[]>([]);
  const [internalSelectedBrands, setInternalSelectedBrands] = useState<Set<string>>(new Set());
  const [internalSelectedModel, setInternalSelectedModel] = useState<string>(AVERAGE_ACROSS_ALL);
  const isControlled =
    props?.setMetric != null && props?.setSelectedBrands != null && props?.setSelectedModel != null;
  const metric = isControlled ? (props!.metric ?? internalMetric) : internalMetric;
  const setMetric = isControlled ? props!.setMetric! : setInternalMetric;
  const selectedBrands = isControlled ? (props!.selectedBrands ?? internalSelectedBrands) : internalSelectedBrands;
  const setSelectedBrands = isControlled ? props!.setSelectedBrands! : setInternalSelectedBrands;
  const selectedModel = isControlled ? (props!.selectedModel ?? internalSelectedModel) : internalSelectedModel;
  const setSelectedModel = isControlled ? props!.setSelectedModel! : setInternalSelectedModel;
  const brandsList = isControlled ? (props!.brandsList ?? internalBrandsList) : internalBrandsList;
  const modelsList = isControlled ? (props!.modelsList ?? internalModelsList) : internalModelsList;
  const top10Brands = isControlled ? (props!.top10Brands ?? internalTop10) : internalTop10;

  const [dates, setDates] = useState<string[]>([]);
  const [series, setSeries] = useState<TimelineSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TimelineTopicId>("overall");
  const cardRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartWidth, setChartWidth] = useState(600);
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);
  const [hiddenBrandsInLegend, setHiddenBrandsInLegend] = useState<Set<string>>(new Set());
  const [chartView, setChartView] = useState<ChartView>("timeline");

  const fetchMeta = useCallback(() => {
    fetch("/api/porsche-timeline")
      .then((res) => res.json())
      .then((data: { brands: string[]; models: ModelOption[]; top10Brands: string[] }) => {
        const brands = data.brands ?? [];
        setInternalBrandsList(brands);
        setInternalModelsList(data.models ?? []);
        setInternalTop10(data.top10Brands ?? []);
        const defaultBrands = brands.filter((b) => COMPETITOR_SET.has(b.toUpperCase()));
        setInternalSelectedBrands(new Set(defaultBrands.length ? defaultBrands : (data.top10Brands ?? [])));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isControlled) fetchMeta();
  }, [isControlled, fetchMeta]);

  useEffect(() => {
    if (!isControlled && brandsList.length > 0 && internalSelectedBrands.size === 0) {
      const defaultBrands = brandsList.filter((b) => COMPETITOR_SET.has(b.toUpperCase()));
      setInternalSelectedBrands(new Set(defaultBrands.length ? defaultBrands : top10Brands));
    }
  }, [isControlled, brandsList.length, top10Brands, internalSelectedBrands.size]);

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const w = el.getBoundingClientRect().width;
      if (Number.isFinite(w) && w > 0) {
        setChartWidth(Math.max(200, w));
      }
    };
    const ro = new ResizeObserver(() => {
      if (el.isConnected) updateWidth();
    });
    ro.observe(el);
    requestAnimationFrame(updateWidth);
    return () => ro.disconnect();
  }, []);

  const modelIdsForRequest =
    selectedModel === AVERAGE_ACROSS_ALL
      ? modelsList.map((m) => m.id)
      : selectedModel
        ? [selectedModel]
        : [];

  useEffect(() => {
    const brands = sortBrandsWithMainFirst(Array.from(selectedBrands));
    if (brands.length === 0 || modelIdsForRequest.length === 0) {
      setDates([]);
      setSeries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      metric,
      brands: brands.join(","),
      models: modelIdsForRequest.join(","),
      topic: selectedTopic,
    });
    fetch(`/api/porsche-timeline?${params}`)
      .then((res) => res.json())
      .then((data: { dates: string[]; series: TimelineSeries[] }) => {
        setDates(data.dates ?? []);
        setSeries(data.series ?? []);
      })
      .catch(() => {
        setDates([]);
        setSeries([]);
      })
      .finally(() => setLoading(false));
  }, [metric, selectedBrands, selectedModel, selectedTopic, modelIdsForRequest.join(",")]);

  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  };

  const selectModel = (id: string) => {
    setSelectedModel(id);
    setModelDropdownOpen(false);
  };

  const competitorOrder = new Map<string, number>(COMPETITOR_LIST.map((c, i) => [c, i]));
  const competitorBrands = brandsList
    .filter((b) => COMPETITOR_SET.has(b.toUpperCase()))
    .sort((a, b) => (competitorOrder.get(a.toUpperCase()) ?? 999) - (competitorOrder.get(b.toUpperCase()) ?? 999));
  const otherBrands = brandsList.filter((b) => !COMPETITOR_SET.has(b.toUpperCase()));

  const q = brandSearchQuery.trim().toLowerCase();
  const matchesSearch = (b: string) => !q || b.toLowerCase().includes(q);
  const filteredCompetitor = competitorBrands.filter(matchesSearch);
  const filteredOther = otherBrands.filter(matchesSearch);
  const hasAnyFiltered = filteredCompetitor.length > 0 || filteredOther.length > 0;

  const brandsDisplayLabel =
    selectedBrands.size === 0
      ? "None selected"
      : selectedBrands.size === 1
        ? Array.from(selectedBrands)[0]
        : `${selectedBrands.size} selected`;

  const modelDisplayLabel =
    selectedModel === AVERAGE_ACROSS_ALL
      ? "Avg Across All"
      : modelsList.find((m) => m.id === selectedModel)?.label ?? "Model";

  const topicDisplayLabel = TOPIC_OPTIONS.find((t) => t.id === selectedTopic)?.label ?? "Overall";

  const selectTopic = (id: TimelineTopicId) => {
    setSelectedTopic(id);
    setTopicDropdownOpen(false);
  };

  const config = METRIC_CONFIG[metric];
  const isPosition = metric === "Average Position";
  const chartHeight = 280;
  const chartPadding = { top: 16, right: 16, bottom: 32, left: 44 };

  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const dataMin = allValues.length ? Math.min(...allValues) : 0;
  const dataMax = allValues.length ? Math.max(...allValues) : config.max;
  const dataRange = Math.max(dataMax - dataMin, 1);
  const padding = Math.max(dataRange * 0.08, 2);
  const yMin = Math.max(0, dataMin - padding);
  const yMax = Math.min(config.max, dataMax + padding);
  const yRange = Math.max(0.001, yMax - yMin);

  const width = chartWidth;
  const plotWidth = Math.max(0, width - chartPadding.left - chartPadding.right);
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  const xScale = (i: number) =>
    chartPadding.left + (dates.length > 1 ? (i / (dates.length - 1)) * plotWidth : 0);
  const yScale = (v: number) =>
    chartPadding.top + plotHeight - ((v - yMin) / yRange) * plotHeight;

  const TOOLTIP_MAX_WIDTH = 224; // 14rem – used to clamp so tooltip stays in bounds
  const TOOLTIP_GAP = 12;

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || dates.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const plotLeft = chartPadding.left;
    const plotRight = width - chartPadding.right;
    if (x < plotLeft || x > plotRight) {
      setHoveredDateIndex(null);
      return;
    }
    const fraction = (x - plotLeft) / (plotRight - plotLeft);
    const index = Math.max(0, Math.min(Math.round(fraction * (dates.length - 1)), dates.length - 1));
    setHoveredDateIndex(index);
  };

  const handleChartMouseLeave = () => setHoveredDateIndex(null);

  const formatScore = (v: number) =>
    isPosition ? v.toFixed(1) : Math.round(v).toString();

  const visibleSeries = series.filter((s) => !hiddenBrandsInLegend.has(s.brand));
  const latestDate = dates.length > 0 ? dates[dates.length - 1]! : null;
  const latestScores =
    latestDate != null
      ? visibleSeries.map((s) => {
          const latestPoint = s.data.find((p) => p.date === latestDate)?.value ?? 0;
          const last7 = s.data.slice(-7).map((p) => p.value);
          const avg7d =
            last7.length > 0
              ? Math.round((last7.reduce((a, b) => a + b, 0) / last7.length) * 10) / 10
              : null;
          const idx = series.findIndex((ss) => ss.brand === s.brand);
          return {
            brand: s.brand,
            value: latestPoint,
            avg7d,
            color: getChartColor(CHART_COLORS, idx),
            gradient: getChartGradient(CHART_GRADIENTS, idx),
          };
        })
      : [];

  const toggleBrandInLegend = (brand: string) => {
    setHiddenBrandsInLegend((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  const handleCapture = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = "score-over-time.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // ignore
    }
  };

  return (
    <div ref={cardRef} className="w-full rounded-xl border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 sm:px-6 border-b border-[#e5e5e5]">
        <h2 className="text-[20px] font-semibold text-[#262626] leading-tight">
          Brand Scores for Luxury SUVs
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-lg border border-[#e5e5e5] p-0.5 bg-[#f6f6f6]">
            {(Object.keys(METRIC_CONFIG) as TimelineMetric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  metric === m
                    ? "bg-white text-[#262626] shadow-sm"
                    : "text-[#7F7F7F] hover:text-[#262626]"
                }`}
              >
                {METRIC_CONFIG[m].label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[10rem]">
            <button
              type="button"
              onClick={() => { setBrandDropdownOpen((o) => !o); setModelDropdownOpen(false); setBrandSearchQuery(""); }}
              className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
              aria-label="Select brands"
              aria-expanded={brandDropdownOpen}
            >
              <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
                Select Brands
              </span>
              <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{brandsDisplayLabel}</span>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {brandDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => { setBrandDropdownOpen(false); setBrandSearchQuery(""); }} />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-[#e5e5e5] bg-[#fafafa]">
                    <input
                      type="search"
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      placeholder="Search brands…"
                      className="w-full rounded-md border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-sm text-[#262626] placeholder:text-[#7F7F7F] focus:outline-none focus:ring-2 focus:ring-[#262626]/20"
                      autoFocus
                      aria-label="Search brands"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-64 overflow-auto py-1">
                    {!hasAnyFiltered ? (
                      <p className="px-3 py-2 text-sm text-[#7F7F7F]">No brands match</p>
                    ) : (
                      <>
                        <div className="px-3 pt-2 pb-1">
                          <p className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">
                            Competitor &amp; Keywords list
                          </p>
                        </div>
                        {filteredCompetitor.map((b) => (
                          <label key={b} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={selectedBrands.has(b)}
                              onChange={() => toggleBrand(b)}
                              className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="truncate">{b}</span>
                          </label>
                        ))}
                        <div className="px-3 pt-3 pb-1 border-t border-[#e5e5e5] mt-1">
                          <p className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">
                            All Other Brands &amp; Keywords
                          </p>
                        </div>
                        {filteredOther.map((b) => (
                          <label key={b} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={selectedBrands.has(b)}
                              onChange={() => toggleBrand(b)}
                              className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="truncate">{b}</span>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative min-w-[10rem]">
            <button
              type="button"
              onClick={() => { setModelDropdownOpen((o) => !o); setBrandDropdownOpen(false); }}
              className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
              aria-label="Select model"
              aria-expanded={modelDropdownOpen}
            >
              <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
                Select Model
              </span>
              <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{modelDisplayLabel}</span>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {modelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setModelDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 max-h-64 overflow-auto rounded-lg border border-[#e5e5e5] bg-white shadow-lg py-1">
                  <button
                    type="button"
                    onClick={() => selectModel(AVERAGE_ACROSS_ALL)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                      selectedModel === AVERAGE_ACROSS_ALL ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                      {selectedModel === AVERAGE_ACROSS_ALL && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                    </span>
                    Avg Across All
                  </button>
                  <div className="border-t border-[#e5e5e5] my-1" />
                  {modelsList.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => selectModel(m.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                        selectedModel === m.id ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                        {selectedModel === m.id && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </span>
                      <span className="truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative min-w-[10rem]">
            <button
              type="button"
              onClick={() => { setTopicDropdownOpen((o) => !o); setBrandDropdownOpen(false); setModelDropdownOpen(false); }}
              className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
              aria-label="Select topic"
              aria-expanded={topicDropdownOpen}
            >
              <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
                Select a Topic
              </span>
              <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{topicDisplayLabel}</span>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {topicDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setTopicDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 max-h-64 overflow-auto rounded-lg border border-[#e5e5e5] bg-white shadow-lg py-1">
                  {TOPIC_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectTopic(t.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                        selectedTopic === t.id ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                        {selectedTopic === t.id && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleCapture}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5] hover:text-[#262626] transition-colors"
            aria-label="Download screenshot of Brand Scores for Luxury SUVs"
            title="Download screenshot"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        <div ref={chartContainerRef} className="w-full min-w-0">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
              Loading…
            </div>
          ) : dates.length === 0 || series.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
              Select at least one brand and one model to see the timeline.
            </div>
          ) : chartView === "timeline" ? (
            <div className="relative">
            <svg
              ref={svgRef}
              width={width}
              height={chartHeight}
              className="block cursor-crosshair"
              aria-hidden
              onMouseMove={handleChartMouseMove}
              onMouseLeave={handleChartMouseLeave}
            >
              {/* Y axis labels */}
              {[yMin, yMin + yRange * 0.25, yMin + yRange * 0.5, yMin + yRange * 0.75, yMax].map((v, i) => {
                const y = yScale(v);
                const label = isPosition ? v.toFixed(1) : Math.round(v).toString();
                return (
                  <text
                    key={i}
                    x={chartPadding.left - 8}
                    y={y}
                    textAnchor="end"
                    className="fill-[#525252] text-[11px]"
                  >
                    {label}
                  </text>
                );
              })}
              {/* X axis labels */}
              {dates.map((d, i) => (
                <text
                  key={d}
                  x={xScale(i)}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="fill-[#525252] text-[10px]"
                >
                  {formatDateLabel(d)}
                </text>
              ))}
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <line
                  key={i}
                  x1={chartPadding.left}
                  x2={width - chartPadding.right}
                  y1={yScale(yMin + yRange * pct)}
                  y2={yScale(yMin + yRange * pct)}
                  stroke="#e5e5e5"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                />
              ))}
              {/* Hover vertical line */}
              {hoveredDateIndex !== null && (
                <line
                  x1={xScale(hoveredDateIndex)}
                  x2={xScale(hoveredDateIndex)}
                  y1={chartPadding.top}
                  y2={chartHeight - chartPadding.bottom}
                  stroke="#999"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  pointerEvents="none"
                />
              )}
              {/* Lines */}
              {visibleSeries.map((s) => {
                const idx = series.findIndex((ss) => ss.brand === s.brand);
                const color = getChartColor(CHART_COLORS, idx);
                const points = s.data
                  .map((p) => {
                    const dateIdx = dates.indexOf(p.date);
                    if (dateIdx === -1) return null;
                    return `${xScale(dateIdx)},${yScale(p.value)}`;
                  })
                  .filter(Boolean) as string[];
                const d = points.length >= 2 ? `M ${points.join(" L ")}` : "";
                return (
                  <g key={s.brand}>
                    <path
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {hoveredDateIndex !== null && (() => {
                      const point = s.data.find((p) => dates.indexOf(p.date) === hoveredDateIndex);
                      if (!point) return null;
                      return (
                        <circle
                          key={`${s.brand}-hover`}
                          cx={xScale(hoveredDateIndex)}
                          cy={yScale(point.value)}
                          r={4}
                          fill={color}
                          stroke="white"
                          strokeWidth={2}
                          pointerEvents="none"
                        />
                      );
                    })()}
                  </g>
                );
              })}
            </svg>
            {/* Tooltip inside card, on top of chart */}
            {hoveredDateIndex !== null && dates[hoveredDateIndex] && (
              <div
                className="absolute z-10 pointer-events-none rounded-lg border border-[#e5e5e5] bg-white shadow-lg py-2 px-3 min-w-[10rem] max-w-[14rem] will-change-[left]"
                style={{
                  left: Math.max(0, Math.min(xScale(hoveredDateIndex) + TOOLTIP_GAP, width - TOOLTIP_MAX_WIDTH)),
                  top: 8 + TOOLTIP_GAP,
                  transition: "left 0.15s ease-out, top 0.15s ease-out",
                }}
              >
                <p className="text-xs font-semibold text-[#262626] mb-2 border-b border-[#e5e5e5] pb-1.5 text-left">
                  {formatDateLabel(dates[hoveredDateIndex]!)}
                </p>
                <div className="space-y-1">
                    {visibleSeries.map((s) => {
                      const idx = series.findIndex((ss) => ss.brand === s.brand);
                    const point = s.data.find((p) => dates.indexOf(p.date) === hoveredDateIndex);
                    const value = point?.value ?? 0;
                    const prevDate = hoveredDateIndex > 0 ? dates[hoveredDateIndex - 1] : null;
                    const prevPoint = prevDate ? s.data.find((p) => p.date === prevDate) : null;
                    const prevValue = prevPoint?.value;
                    const change =
                      prevValue != null && Number.isFinite(prevValue)
                        ? Math.round((value - prevValue) * 10) / 10
                        : null;
                    const hasChange = change != null;
                    const changePositive = hasChange && change > 0;
                    const changeNegative = hasChange && change < 0;
                    const changeGood =
                      hasChange && (isPosition ? change < 0 : change > 0);
                    const changeBad = hasChange && (isPosition ? change > 0 : change < 0);
                    const changeText =
                      hasChange && change !== 0
                        ? `${change > 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}`
                        : hasChange
                          ? "0"
                          : "—";
                    const changePillClass =
                      changeGood
                        ? "bg-emerald-50 text-emerald-700"
                        : changeBad
                          ? "bg-red-50 text-red-600"
                          : hasChange
                            ? "bg-[#f0f0f0] text-[#525252]"
                            : "bg-[#f0f0f0] text-[#999]";
                    return (
                      <div key={s.brand} className="flex items-center justify-between gap-4 text-xs w-full">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: getChartGradient(CHART_GRADIENTS, idx) }}
                          />
                          <span className="text-[#525252] truncate">{s.brand}</span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="font-medium tabular-nums text-[#262626]">
                            {formatScore(value)}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold tabular-nums uppercase tracking-wide ${changePillClass}`}
                          >
                            {changeText}
                            {hasChange && change !== 0 && " pts"}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          ) : (
            <div className="min-h-[280px]">
              {latestDate && (
                <p className="text-xs text-[#7F7F7F] mb-3">
                  Latest scores as of {formatDateLabel(latestDate)}
                </p>
              )}
              <div className="space-y-2">
                {latestScores.map(({ brand, value, avg7d, color, gradient }) => {
                  const pct = config.max > 0 ? Math.min(1, Math.max(0, value / config.max)) : 0;
                  const avg7dPct =
                    avg7d != null && config.max > 0
                      ? Math.min(1, Math.max(0, avg7d / config.max))
                      : null;
                  return (
                    <div key={brand} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: gradient }}
                        />
                        <span className="text-xs text-[#525252] truncate">{brand}</span>
                      </span>
                      <div className="flex-1 min-w-0 h-6 rounded bg-[#f0f0f0] overflow-hidden relative">
                        <div
                          className="h-full rounded transition-all duration-300"
                          style={{
                            width: `${pct * 100}%`,
                            background: gradient,
                            opacity: 0.9,
                          }}
                        />
                        {avg7dPct != null && (
                          <>
                            <span
                              className="absolute top-0 bottom-0 w-0.5 rounded-full bg-[#525252]"
                              style={{
                                left: `${avg7dPct * 100}%`,
                                transform: "translateX(-50%)",
                                boxShadow: "0 0 0 0.5px rgba(255,255,255,0.9)",
                              }}
                            />
                            <span
                              className="absolute top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#525252] whitespace-nowrap"
                              style={{ left: `calc(${avg7dPct * 100}% + 6px)` }}
                            >
                              7D Avg:{formatScore(avg7d!)}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-[#262626]">
                        {formatScore(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {series.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-[#e5e5e5] pt-3">
            {series.map((s, idx) => {
              const isHidden = hiddenBrandsInLegend.has(s.brand);
              return (
                <button
                  key={s.brand}
                  type="button"
                  onClick={() => toggleBrandInLegend(s.brand)}
                  className={`flex items-center gap-2 rounded-md px-1.5 py-1 -m-1 text-left transition-colors hover:bg-[#f0f0f0] ${
                    isHidden ? "opacity-50" : ""
                  }`}
                >
                  <span
                    className="w-3 h-0.5 rounded-full shrink-0"
                    style={{ background: getChartGradient(CHART_GRADIENTS, idx) }}
                  />
                  <span className={`text-xs ${isHidden ? "text-[#999] line-through" : "text-[#525252]"}`}>
                    {s.brand}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isPosition && series.length > 0 && (
          <p className="mt-2 text-xs text-[#7F7F7F]">
            Lower is better for Average Position.
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-[#e5e5e5] flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setChartView("timeline")}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              chartView === "timeline"
                ? "border-[var(--primary)] bg-[#f0fafa] text-[var(--primary)]"
                : "border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5]"
            }`}
            aria-label="Timeline view"
            title="Timeline view"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setChartView("bar")}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              chartView === "bar"
                ? "border-[var(--primary)] bg-[#f0fafa] text-[var(--primary)]"
                : "border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5]"
            }`}
            aria-label="Bar chart view"
            title="Latest scores (bar chart)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
