"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import html2canvas from "html2canvas";
import { useTrackerDate } from "../TrackerDateContext";
import { getModelIcon } from "./ModelLogos";
import { getTracker } from "@/app/manage-account/data";
import { ScoreGauge } from "./ScoreGauge";

export type OverviewMetric = "AI Brand Score" | "Visibility Score" | "Average Position";

type OverviewView = "gauge" | "timeline";

interface ModelOption {
  id: string;
  label: string;
}

interface DimensionTimelineSeries {
  dimension: string;
  label: string;
  data: { date: string; value: number }[];
}

interface ModelScore {
  id: string;
  label: string;
  value: number;
  change: number | null;
}

interface OverviewApiResponse {
  models: ModelOption[];
  brands?: string[];
  dimensions: Record<string, number>;
  dimensionKeys?: string[];
  dimensionLabels?: Record<string, string>;
  modelScores?: ModelScore[];
  view?: string;
  timeline?: { dates: string[]; series: DimensionTimelineSeries[] };
}

const METRIC_CONFIG: Record<
  OverviewMetric,
  { label: string; max: number }
> = {
  "AI Brand Score": { label: "AI Brand Score", max: 100 },
  "Visibility Score": { label: "Visibility", max: 100 },
  "Average Position": { label: "Avg. Position", max: 25 },
};

const DIMENSION_GAUGES: { key: string; changeKey: string; label: string }[] = [
  { key: "overall", changeKey: "changeOverall", label: "Overall" },
  { key: "topOfMind", changeKey: "changeTopOfMind", label: "Top of Mind" },
  { key: "perception", changeKey: "changePerception", label: "Perception" },
  { key: "media", changeKey: "changeMedia", label: "Media" },
  { key: "process", changeKey: "changeProcess", label: "Process" },
  { key: "product", changeKey: "changeProduct", label: "Product" },
  { key: "price", changeKey: "changePrice", label: "Price" },
];

const AVERAGE_ACROSS_ALL = "__average__";

const COMPETITOR_LIST_PORSCHE = ["PORSCHE", "BMW", "BENZ", "VOLVOCARS", "AUDI", "LEXUS"] as const;
const COMPETITOR_LIST_CETAPHIL = ["CETAPHIL", "NEUTROGENA", "DRUNK ELEPHANT", "ORDINARY", "SKINCEUTICALS", "ELTAMD"] as const;
const COMPETITOR_LIST_HM_PANTS = ["H&M", "ZARA", "UNIQLO", "FOREVER 21", "MANGO", "PULL & BEAR", "BERSHKA", "COTTON ON", "ARITZIA", "LEVI'S", "ABERCROMBIE & FITCH", "AMERICAN EAGLE", "GAP", "HOLLISTER", "MADEWELL", "OLD NAVY", "PACSUN", "SHEIN"] as const;
const COMPETITOR_LIST_HM_HEATMAP = ["H&M", "ZARA", "UNIQLO", "NIKE", "ADIDAS", "LEVI'S", "LULULEMON", "NORDSTROM"] as const;
const COMPETITOR_LIST_HM_JEANS = ["H&M", "LEVI'S", "ZARA", "MADEWELL", "AMERICAN EAGLE", "GAP", "BANANA REPUBLIC", "HOLLISTER", "UNIQLO", "MANGO", "ABERCROMBIE & FITCH"] as const;

const GAUGE_COLORS = [
  "var(--primary)",
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
  "var(--viz-5)",
  "var(--viz-6)",
  "var(--viz-7)",
  "var(--viz-9)",
  "var(--viz-10)",
];

const GAUGE_GRADIENTS = [
  "linear-gradient(180deg, var(--primary-gradient-start) 0%, var(--primary) 50%, var(--primary-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-2-gradient-start) 0%, var(--viz-2) 50%, var(--viz-2-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-3-gradient-start) 0%, var(--viz-3) 50%, var(--viz-3-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-4-gradient-start) 0%, var(--viz-4) 50%, var(--viz-4-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-5-gradient-start) 0%, var(--viz-5) 50%, var(--viz-5-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-6-gradient-start) 0%, var(--viz-6) 50%, var(--viz-6-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-7-gradient-start) 0%, var(--viz-7) 50%, var(--viz-7-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-9-gradient-start) 0%, var(--viz-9) 50%, var(--viz-9-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-10-gradient-start) 0%, var(--viz-10) 50%, var(--viz-10-gradient-end) 100%)",
];

const GAUGE_ARC_GRADIENT_STARTS = [
  "var(--primary-gauge-start)",
  "var(--viz-2-gauge-start)",
  "var(--viz-3-gauge-start)",
  "var(--viz-4-gauge-start)",
  "var(--viz-5-gauge-start)",
  "var(--viz-6-gauge-start)",
  "var(--viz-7-gauge-start)",
  "var(--viz-9-gauge-start)",
  "var(--viz-10-gauge-start)",
];
const GAUGE_ARC_GRADIENT_ENDS = [
  "var(--primary-gauge-end)",
  "var(--viz-2-gauge-end)",
  "var(--viz-3-gauge-end)",
  "var(--viz-4-gauge-end)",
  "var(--viz-5-gauge-end)",
  "var(--viz-6-gauge-end)",
  "var(--viz-7-gauge-end)",
  "var(--viz-9-gauge-end)",
  "var(--viz-10-gauge-end)",
];

/** Model-specific gauge colors use fixed palette (viz-9, viz-10 for AI Mode / Meta AI). */
const MODEL_GAUGE_OVERRIDES: Record<
  string,
  { color: string; gradientStart: string; gradientEnd: string }
> = {
  "AI Mode": {
    color: "var(--viz-9)",
    gradientStart: "var(--viz-9-gauge-start)",
    gradientEnd: "var(--viz-9-gauge-end)",
  },
  "Meta AI": {
    color: "var(--viz-10)",
    gradientStart: "var(--viz-10-gauge-start)",
    gradientEnd: "var(--viz-10-gauge-end)",
  },
};

function getChartColor(colors: readonly string[], index: number): string {
  const i = index % colors.length;
  return colors[i]!;
}

const MODEL_PALETTE_SIZE = GAUGE_COLORS.length - 1;

function getModelGaugeColors(modelIndex: number): {
  arcColor: string;
  arcGradientStart: string;
  arcGradientEnd: string;
} {
  const gi = 1 + (modelIndex % MODEL_PALETTE_SIZE);
  return {
    arcColor: GAUGE_COLORS[gi]!,
    arcGradientStart: GAUGE_ARC_GRADIENT_STARTS[gi]!,
    arcGradientEnd: GAUGE_ARC_GRADIENT_ENDS[gi]!,
  };
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

const CHART_HEIGHT = 280;
const CHART_PADDING = { top: 16, right: 16, bottom: 32, left: 44 };

const TOOLTIP_MAX_WIDTH = 224;
const TOOLTIP_GAP = 12;

function OverviewTimelineChart({
  dates,
  series,
  maxVal,
  isAvgPosition,
  formatValue,
  width,
  compareToDateLabel,
}: {
  dates: string[];
  series: DimensionTimelineSeries[];
  metric: OverviewMetric;
  maxVal: number;
  isAvgPosition: boolean;
  formatValue: (v: number) => string;
  width: number;
  compareToDateLabel?: string;
}) {
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (dimension: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dimension)) next.delete(dimension);
      else next.add(dimension);
      return next;
    });
  };

  const visibleSeries = series.filter((s) => !hiddenSeries.has(s.dimension));

  const plotWidth = Math.max(0, width - CHART_PADDING.left - CHART_PADDING.right);
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const dataMin = allValues.length ? Math.min(...allValues) : 0;
  const dataMax = allValues.length ? Math.max(...allValues) : maxVal;
  const dataRange = Math.max(dataMax - dataMin, 1);
  const padding = Math.max(dataRange * 0.08, 2);
  const yMin = Math.max(0, dataMin - padding);
  const yMax = Math.min(maxVal, dataMax + padding);
  const yRange = Math.max(0.001, yMax - yMin);

  const xScale = (i: number) =>
    CHART_PADDING.left + (dates.length > 1 ? (i / (dates.length - 1)) * plotWidth : 0);
  const yScale = (v: number) =>
    CHART_PADDING.top + plotHeight - ((v - yMin) / yRange) * plotHeight;

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dates.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const plotLeft = CHART_PADDING.left;
    const plotRight = width - CHART_PADDING.right;
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
    isAvgPosition ? v.toFixed(1) : Math.round(v).toString();

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative">
        <svg
          width={width}
          height={CHART_HEIGHT}
          className="block cursor-crosshair"
          aria-hidden
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleChartMouseLeave}
        >
          {[yMin, yMin + yRange * 0.25, yMin + yRange * 0.5, yMin + yRange * 0.75, yMax].map((v, i) => (
            <text
              key={i}
              x={CHART_PADDING.left - 8}
              y={yScale(v)}
              textAnchor="end"
              className="fill-[#525252] text-[11px]"
            >
              {isAvgPosition ? v.toFixed(1) : Math.round(v).toString()}
            </text>
          ))}
          {dates.map((d, i) => (
            <text
              key={d}
              x={xScale(i)}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              className="fill-[#525252] text-[10px]"
            >
              {formatDateLabel(d)}
            </text>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
            <line
              key={i}
              x1={CHART_PADDING.left}
              x2={width - CHART_PADDING.right}
              y1={yScale(yMin + yRange * pct)}
              y2={yScale(yMin + yRange * pct)}
              stroke="#e5e5e5"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          ))}
          {hoveredDateIndex !== null && (
            <line
              x1={xScale(hoveredDateIndex)}
              x2={xScale(hoveredDateIndex)}
              y1={CHART_PADDING.top}
              y2={CHART_HEIGHT - CHART_PADDING.bottom}
              stroke="#999"
              strokeWidth={1}
              strokeDasharray="4 2"
              pointerEvents="none"
            />
          )}
          {visibleSeries.map((s) => {
            const idx = series.findIndex((ss) => ss.dimension === s.dimension);
            const color = getChartColor(GAUGE_COLORS, 1 + idx);
            const points = s.data
              .map((p) => {
                const dateIdx = dates.indexOf(p.date);
                if (dateIdx === -1) return null;
                return `${xScale(dateIdx)},${yScale(p.value)}`;
              })
              .filter(Boolean) as string[];
            const d = points.length >= 2 ? `M ${points.join(" L ")}` : "";
            return (
              <g key={s.dimension}>
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
                      key={`${s.dimension}-hover`}
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
                const idx = series.findIndex((ss) => ss.dimension === s.dimension);
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
                const changeGood =
                  hasChange && (isAvgPosition ? change < 0 : change > 0);
                const changeBad = hasChange && (isAvgPosition ? change > 0 : change < 0);
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
                  <div key={s.dimension} className="flex items-center justify-between gap-4 text-xs w-full">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: getChartGradient(GAUGE_GRADIENTS, 1 + idx) }}
                      />
                      <span className="text-[#525252] truncate">{s.label}</span>
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
            {compareToDateLabel && (
              <p className="mt-2 pt-2 border-t border-[#e5e5e5] text-xs text-[#7F7F7F] text-left">
                Compare to {compareToDateLabel}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-[#e5e5e5] pt-3">
        {series.map((s, idx) => {
          const isHidden = hiddenSeries.has(s.dimension);
          return (
            <button
              key={s.dimension}
              type="button"
              onClick={() => toggleSeries(s.dimension)}
              className={`flex items-center gap-2 rounded-md px-1.5 py-1 -m-1 text-left transition-colors hover:bg-[#f0f0f0] ${isHidden ? "opacity-50" : ""}`}
            >
              <span
                className="w-3 h-0.5 rounded-full shrink-0"
                style={{ background: getChartGradient(GAUGE_GRADIENTS, 1 + idx) }}
              />
              <span className={`text-xs ${isHidden ? "text-[#999] line-through" : "text-[#525252]"}`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OverviewViz() {
  const params = useParams();
  const brandId = (params?.brand as string) ?? "porsche";
  const trackerId = (params?.tracker as string) ?? "luxury-suvs";
  const tracker = getTracker(brandId, trackerId);
  const mainBrand = brandId === "cetaphil" ? "CETAPHIL" : brandId === "hm" ? "H&M" : "PORSCHE";

  const cardRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [dimensions, setDimensions] = useState<Record<string, number> | null>(null);
  const [dimensionKeys, setDimensionKeys] = useState<string[]>(DIMENSION_GAUGES.map((g) => g.key));
  const [dimensionLabels, setDimensionLabels] = useState<Record<string, string>>(
    Object.fromEntries(DIMENSION_GAUGES.map((g) => [g.key, g.label]))
  );
  const [timelineData, setTimelineData] = useState<{ dates: string[]; series: DimensionTimelineSeries[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<OverviewMetric>("AI Brand Score");
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const [topicId, setTopicId] = useState<string>("overall");
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>(mainBrand);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [modelScores, setModelScores] = useState<ModelScore[] | null>(null);
  const [overviewView, setOverviewView] = useState<OverviewView>("gauge");
  const [chartWidth, setChartWidth] = useState(600);

  const { selectedDateStr, compareToDateStr, compareToDate } = useTrackerDate();
  const changeTooltip = compareToDateStr
    ? `Compared to ${compareToDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`
    : undefined;

  const fetchData = () => {
    setLoading(true);
    const q = new URLSearchParams({ brandId, trackerId, metric, model: AVERAGE_ACROSS_ALL, topic: topicId });
    if (selectedBrand) q.set("brand", selectedBrand);
    if (overviewView === "timeline") q.set("view", "timeline");
    if (selectedDateStr) q.set("date", selectedDateStr);
    if (compareToDateStr) q.set("compareToDate", compareToDateStr);
    fetch(`/api/scores?${q}`)
      .then((res) => res.json())
      .then((json: OverviewApiResponse) => {
        const brandList = json.brands ?? [];
        setModels(json.models ?? []);
        setBrands(brandList);
        setSelectedBrand((prev) => {
          const match = brandList.find((b) => b.toUpperCase() === prev.toUpperCase());
          return match ?? (brandList.length > 0 ? brandList[0]! : prev);
        });
        setDimensions(json.dimensions ?? null);
        setDimensionKeys(json.dimensionKeys ?? DIMENSION_GAUGES.map((g) => g.key));
        setDimensionLabels(json.dimensionLabels ?? Object.fromEntries(DIMENSION_GAUGES.map((g) => [g.key, g.label])));
        setModelScores(json.modelScores ?? null);
        setTimelineData(json.timeline ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [brandId, trackerId, metric, topicId, selectedBrand, overviewView, selectedDateStr, compareToDateStr]);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const updateWidth = () => {
      const w = el.getBoundingClientRect().width;
      if (Number.isFinite(w) && w > 0) setChartWidth(Math.max(200, w));
    };
    const ro = new ResizeObserver(() => { if (el.isConnected) updateWidth(); });
    ro.observe(el);
    requestAnimationFrame(updateWidth);
    return () => ro.disconnect();
  }, [overviewView]);

  const handleCapture = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `brand-score-${brandId}-${trackerId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // ignore
    }
  };

  if (loading && !dimensions) {
    return (
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-8 text-sm text-[#7F7F7F] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        Loading scores…
      </div>
    );
  }

  if (!dimensions) {
    return (
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-8 text-sm text-[#7F7F7F] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        No score data available.
      </div>
    );
  }

  const config = METRIC_CONFIG[metric];
  const maxVal = config.max;
  const isAvgPosition = metric === "Average Position";
  const showTimelineToggle = trackerId !== "luxury-suvs";

  const formatValue = (value: number) =>
    typeof value === "number" && Number.isFinite(value)
      ? value.toFixed(isAvgPosition ? 1 : 0)
      : "—";

  const topicDisplayLabel = dimensionLabels[topicId] ?? topicId;
  const brandDisplayLabel = selectedBrand;

  const activeCompetitorList =
    brandId === "cetaphil"
      ? COMPETITOR_LIST_CETAPHIL
      : brandId === "hm" && trackerId === "heatmap"
        ? COMPETITOR_LIST_HM_HEATMAP
        : brandId === "hm" && trackerId === "jeans"
          ? COMPETITOR_LIST_HM_JEANS
          : brandId === "hm"
            ? COMPETITOR_LIST_HM_PANTS
            : COMPETITOR_LIST_PORSCHE;
  const competitorSet = new Set(activeCompetitorList.map((c) => c.toUpperCase()));
  const competitorOrder = new Map<string, number>(activeCompetitorList.map((c, i) => [c, i]));
  const competitorBrands = brands
    .filter((b) => competitorSet.has(b.toUpperCase()))
    .sort((a, b) => (competitorOrder.get(a.toUpperCase()) ?? 999) - (competitorOrder.get(b.toUpperCase()) ?? 999));
  const otherBrands = brands.filter((b) => !competitorSet.has(b.toUpperCase()));
  const qSearch = brandSearchQuery.trim().toLowerCase();
  const matchesSearch = (b: string) => !qSearch || b.toLowerCase().includes(qSearch);
  const filteredCompetitor = competitorBrands.filter(matchesSearch);
  const filteredOther = otherBrands.filter(matchesSearch);
  const hasAnyFiltered = filteredCompetitor.length > 0 || filteredOther.length > 0;

  const selectTopic = (id: string) => {
    setTopicId(id);
    setTopicDropdownOpen(false);
  };

  const selectBrand = (b: string) => {
    setSelectedBrand(b);
    setBrandDropdownOpen(false);
  };

  return (
    <div ref={cardRef} className="w-full min-w-0 rounded-xl border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex flex-col items-start gap-4 px-4 py-4 sm:px-6 border-b border-[#e5e5e5] md:flex-row md:items-center md:justify-between">
        <h2 className="w-full text-[20px] font-semibold text-[#262626] leading-tight md:w-auto">
          Brand Score in {tracker?.name ?? trackerId}
        </h2>
        <div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMetricDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 h-10 pl-3 pr-3 rounded-lg border border-[#e5e5e5] bg-white text-sm font-medium text-[#262626] hover:bg-[#fafafa] transition-colors"
            >
              {METRIC_CONFIG[metric].label}
              <svg className="w-4 h-4 text-[#7F7F7F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {metricDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMetricDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-1 z-20 w-52 rounded-lg border border-[#e5e5e5] bg-white shadow-lg py-1">
                  {(Object.keys(METRIC_CONFIG) as OverviewMetric[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMetric(m); setMetricDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-[#f5f5f5] ${
                        metric === m ? "text-[var(--primary)] font-medium" : "text-[#262626]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${metric === m ? "bg-[var(--primary)]" : "bg-transparent"}`} />
                      {METRIC_CONFIG[m].label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {brands.length > 0 && (
            <div className="relative min-w-[10rem]">
              <button
                type="button"
                onClick={() => { setBrandDropdownOpen((o) => !o); setTopicDropdownOpen(false); setBrandSearchQuery(""); }}
                className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
                aria-label="Select brand"
                aria-expanded={brandDropdownOpen}
              >
                <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
                  Brand
                </span>
                <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{brandDisplayLabel}</span>
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
                            <button
                              key={b}
                              type="button"
                              onClick={() => selectBrand(b)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                                selectedBrand === b ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                                {selectedBrand === b && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                              </span>
                              <span className="truncate">{b}</span>
                            </button>
                          ))}
                          <div className="px-3 pt-3 pb-1 border-t border-[#e5e5e5] mt-1">
                            <p className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">
                              All Other Brands &amp; Keywords
                            </p>
                          </div>
                          {filteredOther.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => selectBrand(b)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                                selectedBrand === b ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                                {selectedBrand === b && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                              </span>
                              <span className="truncate">{b}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {dimensionKeys.length > 0 && (
            <div className="relative min-w-[10rem]">
              <button
                type="button"
                onClick={() => { setTopicDropdownOpen((o) => !o); setBrandDropdownOpen(false); }}
                className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
                aria-label="Select topic"
                aria-expanded={topicDropdownOpen}
              >
                <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
                  Topic
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
                    {dimensionKeys.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => selectTopic(key)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                          topicId === key ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                          {topicId === key && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                        </span>
                        <span className="truncate">{dimensionLabels[key] ?? key}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={handleCapture}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5] hover:text-[#262626] transition-colors"
            aria-label="Download screenshot of visualization"
            title="Download screenshot"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 pb-6 sm:px-6">
        {overviewView === "gauge" && (
          <>
            {modelScores && modelScores.length > 0 ? (
              <div className="flex w-full flex-wrap justify-between gap-y-2 sm:gap-y-4 lg:gap-y-6 min-w-0">
                {(() => {
                  const n = modelScores.length;
                  const avgValue =
                    n > 0
                      ? Math.round((modelScores.reduce((s, ms) => s + (Number(ms.value) || 0), 0) / n) * 10) / 10
                      : 0;
                  const changes = modelScores
                    .map((ms) => (ms.change != null && Number.isFinite(ms.change) ? (isAvgPosition ? -ms.change : ms.change) : null))
                    .filter((c): c is number => c !== null);
                  const avgChange =
                    changes.length > 0 ? Math.round((changes.reduce((a, b) => a + b, 0) / changes.length) * 10) / 10 : null;
                  return (
                    <>
                      <div key="average" className="flex justify-center min-w-0 w-32 shrink-0">
                        <ScoreGauge
                          label="Average"
                          value={avgValue}
                          max={maxVal}
                          change={avgChange}
                          arcColor="var(--primary-dark)"
                          arcGradientStart="var(--primary-dark)"
                          arcGradientEnd="var(--primary-dark)"
                          valueFormat={(v) => formatValue(v)}
                          inverse={isAvgPosition}
                          changeTooltip={changeTooltip}
                        />
                      </div>
                      {modelScores.map((ms, i) => {
                        const change =
                          ms.change != null && Number.isFinite(ms.change)
                            ? isAvgPosition
                              ? -ms.change
                              : ms.change
                            : null;
                        const override = MODEL_GAUGE_OVERRIDES[ms.label];
                        const gaugeColors = getModelGaugeColors(i);
                        return (
                          <div key={ms.id} className="flex justify-center min-w-0 w-32 shrink-0">
                            <ScoreGauge
                              label={ms.label}
                              value={ms.value}
                              max={maxVal}
                              change={change}
                              arcColor={override?.color ?? gaugeColors.arcColor}
                              arcGradientStart={override?.gradientStart ?? gaugeColors.arcGradientStart}
                              arcGradientEnd={override?.gradientEnd ?? gaugeColors.arcGradientEnd}
                              valueFormat={(v) => formatValue(v)}
                              inverse={isAvgPosition}
                              icon={getModelIcon(ms.label)}
                              changeTooltip={changeTooltip}
                            />
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="flex w-full flex-wrap justify-between gap-y-2 sm:gap-y-4 lg:gap-y-6 min-w-0">
                {dimensionKeys.map((key, i) => {
                  const changeKey = `change${key.charAt(0).toUpperCase()}${key.slice(1)}`;
                  const value = dimensions[key] as number;
                  const changeRaw = dimensions[changeKey] as number;
                  const change =
                    isAvgPosition && changeRaw != null ? -changeRaw : changeRaw;
                  const label = dimensionLabels[key] ?? key;
                  return (
                    <div key={key} className="flex justify-center min-w-0 w-32 shrink-0">
                      <ScoreGauge
                        label={label}
                        value={value}
                        max={maxVal}
                        change={change != null && Number.isFinite(change) ? change : null}
                        arcColor={getChartColor(GAUGE_COLORS, i)}
                        arcGradientStart={GAUGE_ARC_GRADIENT_STARTS[i]}
                        arcGradientEnd={GAUGE_ARC_GRADIENT_ENDS[i]}
                        valueFormat={(v) => formatValue(v)}
                        inverse={isAvgPosition}
                        changeTooltip={changeTooltip}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {false && showTimelineToggle && overviewView === "timeline" && (
          <div ref={chartRef} className="w-full min-w-0">
            {loading && !timelineData ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-[#7F7F7F]">
                Loading…
              </div>
            ) : timelineData && timelineData.dates && timelineData.series && timelineData.dates.length > 0 && timelineData.series.length > 0 ? (
              <OverviewTimelineChart
                dates={timelineData.dates}
                series={timelineData.series}
                metric={metric}
                maxVal={maxVal}
                isAvgPosition={isAvgPosition}
                formatValue={formatValue}
                width={chartWidth}
                compareToDateLabel={compareToDateStr ? compareToDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : undefined}
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-[#7F7F7F]">
                No timeline data for this selection.
              </div>
            )}
          </div>
        )}

        {(isAvgPosition || compareToDateStr) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#7F7F7F]">
            {isAvgPosition && (
              <span>Lower is better (e.g. 2.7 = average position 2.7 in rankings).</span>
            )}
            {compareToDateStr && (
              <span className="ml-auto text-right">
                Compared to {compareToDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
