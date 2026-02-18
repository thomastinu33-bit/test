"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import html2canvas from "html2canvas";
import { useTrackerDate } from "../TrackerDateContext";
import { GroupedTopicTooltip } from "./GroupedTopicTooltip";

export type TimelineMetric = "AI Brand Score" | "Visibility Score" | "Average Position";

const METRIC_CONFIG: Record<
  TimelineMetric,
  { label: string; max: number }
> = {
  "AI Brand Score": { label: "AI Brand Score", max: 100 },
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

const MAIN_BRAND_PORSCHE = "PORSCHE";
const MAIN_BRAND_CETAPHIL = "CETAPHIL";
const COMPETITOR_LIST_PORSCHE = ["PORSCHE", "BMW", "BENZ", "VOLVOCARS", "AUDI", "LEXUS"] as const;
const COMPETITOR_LIST_CETAPHIL = ["CETAPHIL", "NEUTROGENA", "DRUNK ELEPHANT", "ORDINARY", "SKINCEUTICALS", "ELTAMD"] as const;

function sortBrandsWithMainFirst(brands: string[], mainBrand: string): string[] {
  const main = brands.find((b) => b.toUpperCase() === mainBrand);
  const rest = brands.filter((b) => b.toUpperCase() !== mainBrand);
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

const DEFAULT_TOPIC_COUNT = 10;
const DEFAULT_TOPIC_IDS = TOPIC_OPTIONS.slice(0, DEFAULT_TOPIC_COUNT).map((t) => t.id);

type ChartView = "grouped" | "timeline";

interface TopicModelScores {
  topics: { id: string; label: string }[];
  models: { id: string; label: string; values: number[]; changes?: number[] }[];
  averages: number[];
  averageChanges?: number[];
}

const CHART_COLORS = [
  "var(--viz-1)",
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
  "var(--viz-5)",
  "var(--viz-6)",
  "var(--viz-7)",
  "var(--viz-8)",
  "var(--viz-9)",
  "var(--viz-10)",
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
  "linear-gradient(180deg, var(--viz-9-gradient-start) 0%, var(--viz-9) 50%, var(--viz-9-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-10-gradient-start) 0%, var(--viz-10) 50%, var(--viz-10-gradient-end) 100%)",
];

function getChartColor(colors: readonly string[], index: number): string {
  const i = index % colors.length;
  return colors[i]!;
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

const GROUPED_MODEL_COLOR_OVERRIDES: Record<string, string> = {
  "AI Mode": "var(--viz-9)",
  "Meta AI": "var(--viz-10)",
};

/** Palette: 8 model colors (viz-2..7 + viz-9, viz-10). No lightening, just cycle. */
const GROUPED_MODEL_PALETTE_SIZE = 8;
const GROUPED_MODEL_COLORS = [
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
  "var(--viz-5)",
  "var(--viz-6)",
  "var(--viz-7)",
  "var(--viz-9)",
  "var(--viz-10)",
];

/** Gradient stop at bottom (darker) and top (lighter) for each palette color. */
const GROUPED_BAR_GRADIENT_IDS = [
  "grouped-bar-grad-0",
  "grouped-bar-grad-1",
  "grouped-bar-grad-2",
  "grouped-bar-grad-3",
  "grouped-bar-grad-4",
  "grouped-bar-grad-5",
  "grouped-bar-grad-6",
  "grouped-bar-grad-7",
] as const;

const GROUPED_BAR_GRADIENT_DEFS = [
  { bottom: "var(--viz-2-gradient-end)", top: "var(--viz-2-gradient-start)" },
  { bottom: "var(--viz-3-gradient-end)", top: "var(--viz-3-gradient-start)" },
  { bottom: "var(--viz-4-gradient-end)", top: "var(--viz-4-gradient-start)" },
  { bottom: "var(--viz-5-gradient-end)", top: "var(--viz-5-gradient-start)" },
  { bottom: "var(--viz-6-gradient-end)", top: "var(--viz-6-gradient-start)" },
  { bottom: "var(--viz-7-gradient-end)", top: "var(--viz-7-gradient-start)" },
  { bottom: "var(--viz-9-gradient-end)", top: "var(--viz-9-gradient-start)" },
  { bottom: "var(--viz-10-gradient-end)", top: "var(--viz-10-gradient-start)" },
];

function getModelBarColor(label: string, index: number): string {
  const override = GROUPED_MODEL_COLOR_OVERRIDES[label];
  if (override) return override;
  return GROUPED_MODEL_COLORS[index % GROUPED_MODEL_PALETTE_SIZE]!;
}

function getModelBarGradientUrl(modelIndex: number): string {
  return `url(#${GROUPED_BAR_GRADIENT_IDS[modelIndex % GROUPED_MODEL_PALETTE_SIZE]})`;
}

function GroupedTopicChart({
  data,
  maxVal,
  isPosition,
  width,
  height = 280,
  compareToDateLabel,
}: {
  data: TopicModelScores;
  maxVal: number;
  isPosition: boolean;
  width: number;
  height?: number;
  compareToDateLabel?: string;
}) {
  const [hoveredTopicIndex, setHoveredTopicIndex] = useState<number | null>(null);
  const padding = { top: 24, right: 16, bottom: 40, left: 44 };
  const plotWidth = Math.max(0, width - padding.left - padding.right);
  const plotHeight = Math.max(0, height - padding.top - padding.bottom);
  const { topics, models, averages } = data;
  const numTopics = topics.length;
  const numModels = models.length;
  const yMax = maxVal;
  const yScale = (v: number) =>
    padding.top + plotHeight - (v / yMax) * plotHeight;
  const yTicks = isPosition
    ? [0, 5, 10, 15, 20, 25].filter((v) => v <= yMax)
    : [0, 20, 40, 60, 80, 100].filter((v) => v <= yMax);
  const topicGap = 24; // gap between topic groups on x-axis
  const groupWidth =
    numTopics > 0
      ? (plotWidth - (numTopics - 1) * topicGap) / numTopics
      : 0;
  const barGroupGap = 12;
  const barGap = 2;
  const totalBarsPerGroup = numModels;
  const barWidth =
    totalBarsPerGroup > 0
      ? Math.max(2, (groupWidth - barGroupGap - (totalBarsPerGroup - 1) * barGap) / totalBarsPerGroup)
      : 0;
  const topCornerRadius = Math.min(8, barWidth / 2);
  const xGroupCenter = (topicIndex: number) =>
    padding.left + topicIndex * (groupWidth + topicGap) + groupWidth / 2;
  const xBarCenter = (topicIndex: number, modelIndex: number) =>
    padding.left +
    topicIndex * (groupWidth + topicGap) +
    barGroupGap / 2 +
    barWidth / 2 +
    modelIndex * (barWidth + barGap);
  const plotBottom = padding.top + plotHeight;
  const plotLeft = padding.left;
  const plotRight = width - padding.right;
  const formatScore = (v: number) => (isPosition ? v.toFixed(1) : Math.round(v).toString());
  const TOOLTIP_MAX_WIDTH = 224;
  const TOOLTIP_GAP = 12;

  return (
    <div className="w-full min-w-0 relative">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        <span className="flex items-center gap-2 text-xs text-[#525252]">
          <span className="inline-block w-6 h-0.5 rounded-full bg-[var(--primary-dark)]" />
          Average
        </span>
        {models.map((m, idx) => (
          <span key={m.id} className="flex items-center gap-2 text-xs text-[#525252]">
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: getModelBarColor(m.label, idx) }}
            />
            {m.label}
          </span>
        ))}
      </div>
      <svg width={width} height={height} className="block" aria-hidden>
        <defs>
          {GROUPED_BAR_GRADIENT_DEFS.map((g, i) => (
            <linearGradient
              key={i}
              id={GROUPED_BAR_GRADIENT_IDS[i]}
              x1="0"
              y1="1"
              x2="0"
              y2="0"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor={g.bottom} />
              <stop offset="1" stopColor={g.top} />
            </linearGradient>
          ))}
        </defs>
        {yTicks.map((v) => (
          <text
            key={v}
            x={padding.left - 8}
            y={yScale(v)}
            textAnchor="end"
            className="fill-[#525252] text-[11px]"
          >
            {isPosition ? v.toFixed(0) : v}
          </text>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line
            key={i}
            x1={plotLeft}
            x2={plotRight}
            y1={yScale(pct * yMax)}
            y2={yScale(pct * yMax)}
            stroke="#e5e5e5"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        ))}
        {numTopics > 1 && Array.from({ length: numTopics - 1 }, (_, i) => i + 1).map((ti) => (
          <line
            key={`divider-${ti}`}
            x1={padding.left + ti * (groupWidth + topicGap)}
            x2={padding.left + ti * (groupWidth + topicGap)}
            y1={padding.top}
            y2={plotBottom}
            stroke="#d4d4d4"
            strokeWidth={1}
          />
        ))}
        {topics.map((t, ti) => (
          <text
            key={t.id}
            x={xGroupCenter(ti)}
            y={height - 12}
            textAnchor="middle"
            className="fill-[#525252] text-xs"
          >
            {t.label}
          </text>
        ))}
        {/* Invisible rects for topic hover – expanded to include gaps and full chart height */}
        {topics.map((t, ti) => {
          const hoverPaddingX = topicGap / 2; // extend into gap on each side
          const groupLeft = padding.left + ti * (groupWidth + topicGap);
          const hoverX = Math.max(0, groupLeft - hoverPaddingX);
          const hoverWidth =
            ti === 0
              ? groupWidth + hoverPaddingX
              : ti === numTopics - 1
                ? groupWidth + hoverPaddingX
                : groupWidth + topicGap;
          return (
            <rect
              key={`hover-${t.id}`}
              x={hoverX}
              y={0}
              width={hoverWidth}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoveredTopicIndex(ti)}
              onMouseLeave={() => setHoveredTopicIndex(null)}
              className="cursor-default"
            />
          );
        })}
        {/* Highlight column and bars when a topic is hovered */}
        {hoveredTopicIndex !== null && (
          <rect
            x={padding.left + hoveredTopicIndex * (groupWidth + topicGap)}
            y={padding.top}
            width={groupWidth}
            height={plotHeight}
            fill="var(--primary)"
            fillOpacity={0.08}
            pointerEvents="none"
            style={{ transition: "fill-opacity 0.15s ease-out" }}
          />
        )}
        {topics.map((t, ti) =>
          models.map((m, mi) => {
            const value = m.values[ti] ?? 0;
            const x = xBarCenter(ti, mi);
            const barX = x - barWidth / 2;
            const barY = yScale(value);
            const barBottom = plotBottom;
            const barHeight = Math.max(0, barBottom - barY);
            const r = topCornerRadius;
            const pathD =
              r > 0 && barHeight >= r
                ? `M ${barX} ${barY + r} Q ${barX} ${barY} ${barX + r} ${barY} L ${barX + barWidth - r} ${barY} Q ${barX + barWidth} ${barY} ${barX + barWidth} ${barY + r} L ${barX + barWidth} ${barBottom} L ${barX} ${barBottom} L ${barX} ${barY + r} Z`
                : `M ${barX} ${barY} L ${barX + barWidth} ${barY} L ${barX + barWidth} ${barBottom} L ${barX} ${barBottom} Z`;
            const isHovered = hoveredTopicIndex !== null && hoveredTopicIndex === ti;
            const dimmed = hoveredTopicIndex !== null && hoveredTopicIndex !== ti;
            return (
              <path
                key={`${t.id}-${m.id}`}
                d={pathD}
                fill={getModelBarGradientUrl(mi)}
                opacity={dimmed ? 0.45 : 1}
                stroke={isHovered ? "rgba(0,0,0,0.12)" : "none"}
                strokeWidth={isHovered ? 1 : 0}
                pointerEvents="none"
                style={{ transition: "opacity 0.15s ease-out" }}
              />
            );
          })
        )}
        {averages.length === numTopics && (
          <polyline
            pointerEvents="none"
            points={topics
              .map((_, ti) => `${xGroupCenter(ti)},${yScale(averages[ti]!)}`)
              .join(" ")}
            fill="none"
            stroke="var(--primary-dark)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {averages.map((avg, ti) => (
          <circle
            key={ti}
            cx={xGroupCenter(ti)}
            cy={yScale(avg)}
            r={4}
            fill="var(--primary-dark)"
            stroke="white"
            strokeWidth={2}
            pointerEvents="none"
          />
        ))}
      </svg>
      {/* Tooltip on topic hover: scores across models for this topic */}
      {hoveredTopicIndex !== null && topics[hoveredTopicIndex] && (
        <GroupedTopicTooltip
          topicLabel={topics[hoveredTopicIndex]!.label}
          topicIndex={hoveredTopicIndex}
          models={models}
          averages={averages}
          averageChanges={data.averageChanges}
          isPosition={isPosition}
          formatScore={formatScore}
          getModelBarColor={getModelBarColor}
          compareToDateLabel={compareToDateLabel}
          style={{
            left: Math.max(
              TOOLTIP_GAP,
              Math.min(
                xGroupCenter(hoveredTopicIndex) - 112,
                width - TOOLTIP_MAX_WIDTH - TOOLTIP_GAP
              )
            ),
            top: TOOLTIP_GAP,
            transition: "left 0.15s ease-out, top 0.15s ease-out",
          }}
        />
      )}
    </div>
  );
}

export interface TimelineVizProps {
  metric?: TimelineMetric;
  setMetric?: (m: TimelineMetric) => void;
}

export function TimelineViz(props?: TimelineVizProps) {
  const params = useParams();
  const brandId = (params?.brand as string) ?? "porsche";
  const trackerId = (params?.tracker as string) ?? "luxury-suvs";
  const mainBrand = brandId === "cetaphil" ? MAIN_BRAND_CETAPHIL : MAIN_BRAND_PORSCHE;
  const competitorSet = new Set(
    brandId === "cetaphil"
      ? COMPETITOR_LIST_CETAPHIL.map((c) => c.toUpperCase())
      : COMPETITOR_LIST_PORSCHE.map((c) => c.toUpperCase())
  );

  const [internalMetric, setInternalMetric] = useState<TimelineMetric>("AI Brand Score");
  const [internalBrandsList, setInternalBrandsList] = useState<string[]>([]);
  const [internalModelsList, setInternalModelsList] = useState<ModelOption[]>([]);
  const [internalTop10, setInternalTop10] = useState<string[]>([]);
  const [topicColumns, setTopicColumns] = useState<{ id: string; label: string }[]>(TOPIC_OPTIONS);
  const [selectedBrand, setSelectedBrand] = useState<string>(mainBrand);
  const [internalSelectedModel, setInternalSelectedModel] = useState<string>(AVERAGE_ACROSS_ALL);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    () => new Set(DEFAULT_TOPIC_IDS)
  );
  const [selectedBrandsTimeline, setSelectedBrandsTimeline] = useState<Set<string>>(new Set());
  const [selectedTopicTimeline, setSelectedTopicTimeline] = useState<string>("overall");
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [modelDropdownRect, setModelDropdownRect] = useState<{ top: number; left: number } | null>(null);
  const modelTriggerRef = useRef<HTMLButtonElement>(null);
  const metric = props?.metric ?? internalMetric;
  const setMetric = props?.setMetric ?? setInternalMetric;
  const brandsList = internalBrandsList;
  const modelsList = internalModelsList;
  const top10Brands = internalTop10;
  const selectedModel = internalSelectedModel;

  const [dates, setDates] = useState<string[]>([]);
  const [series, setSeries] = useState<TimelineSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const brandTriggerRef = useRef<HTMLButtonElement>(null);
  const [brandDropdownRect, setBrandDropdownRect] = useState<{ top: number; left: number } | null>(null);
  const topicTriggerRef = useRef<HTMLButtonElement>(null);
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [topicDropdownRect, setTopicDropdownRect] = useState<{ top: number; left: number } | null>(null);
  const [chartWidth, setChartWidth] = useState(600);
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);
  const [hiddenBrandsInLegend, setHiddenBrandsInLegend] = useState<Set<string>>(new Set());
  const [chartView, setChartView] = useState<ChartView>("grouped");
  const [topicModelScores, setTopicModelScores] = useState<TopicModelScores | null>(null);
  const [groupedLoading, setGroupedLoading] = useState(false);
  const { selectedDateStr, compareToDateStr, compareToDate } = useTrackerDate();
  const compareToDateLabel = compareToDateStr
    ? compareToDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : undefined;

  const fetchMeta = useCallback(() => {
    const q = new URLSearchParams({ brandId, trackerId });
    fetch(`/api/timeline?${q}`)
      .then((res) => res.json())
      .then((data: { brands: string[]; models: ModelOption[]; top10Brands: string[]; topicColumns?: { id: string; label: string }[] }) => {
        const brands = data.brands ?? [];
        setInternalBrandsList(brands);
        setInternalModelsList(data.models ?? []);
        setInternalTop10(data.top10Brands ?? []);
        const cols = data.topicColumns ?? TOPIC_OPTIONS;
        setTopicColumns(cols);
        if (cols.length > 0) {
          setSelectedTopics((prev) => {
            const validIds = new Set(cols.map((c) => String(c.id)));
            const next = new Set<string>();
            prev.forEach((id) => {
              if (validIds.has(String(id))) next.add(String(id));
            });
            if (next.size === 0) {
              const overallFirst = cols.find((c) => String(c.id) === "overall");
              const rest = cols.filter((c) => String(c.id) !== "overall").slice(0, DEFAULT_TOPIC_COUNT - 1);
              (overallFirst ? [overallFirst, ...rest] : cols.slice(0, DEFAULT_TOPIC_COUNT))
                .forEach((c) => next.add(String(c.id)));
            }
            return next;
          });
        }
        const defaultBrand = brands.find((b) => b.toUpperCase() === mainBrand) ?? (data.top10Brands ?? [])[0] ?? brands[0];
        if (defaultBrand) {
          setSelectedBrand((prev) => (brands.some((b) => b.toUpperCase() === prev.toUpperCase()) ? prev : defaultBrand));
        }
        const competitorOrder = brandId === "cetaphil" ? COMPETITOR_LIST_CETAPHIL : COMPETITOR_LIST_PORSCHE;
        const inList = competitorOrder
          .filter((c) => brands.some((b) => b.toUpperCase() === c.toUpperCase()))
          .slice(0, 6)
          .map((c) => brands.find((b) => b.toUpperCase() === c.toUpperCase())!);
        setSelectedBrandsTimeline((prev) => (prev.size === 0 ? new Set(inList) : prev));
      })
      .catch(() => {});
  }, [brandId, trackerId, mainBrand]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    if (brandsList.length > 0 && !brandsList.some((b) => b.toUpperCase() === selectedBrand.toUpperCase())) {
      const defaultBrand = brandsList.find((b) => b.toUpperCase() === mainBrand) ?? top10Brands[0] ?? brandsList[0];
      if (defaultBrand) setSelectedBrand(defaultBrand);
    }
  }, [brandsList, top10Brands, mainBrand, selectedBrand]);

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
    if (chartView !== "timeline") {
      setDates([]);
      setSeries([]);
      setLoading(false);
      return;
    }
    const timelineBrands = Array.from(selectedBrandsTimeline);
    if (timelineBrands.length === 0 || modelIdsForRequest.length === 0) {
      setDates([]);
      setSeries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      brandId,
      trackerId,
      metric,
      brands: timelineBrands.join(","),
      models: modelIdsForRequest.join(","),
      chart: "timeline",
      topics: selectedTopicTimeline,
    });
    if (trackerId === "luxury-suvs-v2") params.set("series", "topics");
    if (selectedDateStr) params.set("date", selectedDateStr);
    if (compareToDateStr) params.set("compareToDate", compareToDateStr);
    fetch(`/api/timeline?${params}`)
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
  }, [chartView, brandId, trackerId, metric, selectedBrandsTimeline, selectedTopicTimeline, selectedModel, modelIdsForRequest.join(","), selectedDateStr, compareToDateStr]);

  useEffect(() => {
    if (chartView !== "grouped") {
      setTopicModelScores(null);
      return;
    }
    if (!selectedBrand) {
      setTopicModelScores(null);
      setGroupedLoading(false);
      return;
    }
    setGroupedLoading(true);
    const params = new URLSearchParams({
      brandId,
      trackerId,
      metric,
      brands: selectedBrand,
      models: modelsList.map((m) => m.id).join(","),
      chart: "grouped",
    });
    if (selectedDateStr) params.set("date", selectedDateStr);
    if (compareToDateStr) params.set("compareToDate", compareToDateStr);
    fetch(`/api/timeline?${params}`)
      .then((res) => res.json())
      .then((data: TopicModelScores & { chart?: string }) => {
        if (data.chart === "grouped" && data.topics && data.models && data.averages) {
          setTopicModelScores({
            topics: data.topics,
            models: data.models,
            averages: data.averages,
          });
        } else {
          setTopicModelScores(null);
        }
      })
      .catch(() => setTopicModelScores(null))
      .finally(() => setGroupedLoading(false));
  }, [chartView, brandId, trackerId, metric, selectedBrand, modelsList, selectedDateStr, compareToDateStr]);

  const brandSearchLower = brandSearchQuery.trim().toLowerCase();
  const competitorOrder = new Map<string, number>(
    (brandId === "cetaphil" ? COMPETITOR_LIST_CETAPHIL : COMPETITOR_LIST_PORSCHE).map((c, i) => [c, i])
  );
  const competitorBrands = brandsList
    .filter((b) => competitorSet.has(b.toUpperCase()))
    .sort((a, b) => (competitorOrder.get(a.toUpperCase()) ?? 999) - (competitorOrder.get(b.toUpperCase()) ?? 999));
  const otherBrands = brandsList.filter((b) => !competitorSet.has(b.toUpperCase()));
  const matchesBrandSearch = (b: string) => !brandSearchLower || b.toLowerCase().includes(brandSearchLower);
  const filteredCompetitor = competitorBrands.filter(matchesBrandSearch);
  const filteredOther = otherBrands.filter(matchesBrandSearch);
  const hasAnyBrandFiltered = filteredCompetitor.length > 0 || filteredOther.length > 0;
  const filteredBrands = sortBrandsWithMainFirst(
    brandsList.filter((b) => !brandSearchLower || b.toLowerCase().includes(brandSearchLower)),
    mainBrand
  );

  const openBrandDropdown = useCallback(() => {
    setBrandSearchQuery("");
    const el = brandTriggerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const w = 224; // 14rem
      setBrandDropdownRect({
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - w),
      });
    } else {
      setBrandDropdownRect({ top: 100, left: 16 });
    }
    setBrandDropdownOpen(true);
  }, []);

  const closeBrandDropdown = useCallback(() => {
    setBrandDropdownOpen(false);
    setBrandSearchQuery("");
    setBrandDropdownRect(null);
  }, []);

  const toggleTopic = useCallback((id: string) => {
    const idStr = String(id);
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(idStr)) next.delete(idStr);
      else next.add(idStr);
      return next;
    });
  }, []);

  const openTopicDropdown = useCallback(() => {
    const el = topicTriggerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const w = 224;
      setTopicDropdownRect({
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - w),
      });
    } else {
      setTopicDropdownRect({ top: 100, left: 16 });
    }
    setTopicDropdownOpen(true);
  }, []);

  const closeTopicDropdown = useCallback(() => {
    setTopicDropdownOpen(false);
    setTopicDropdownRect(null);
  }, []);

  const topicDisplayLabel =
    selectedTopics.size === 0
      ? "Select topics"
      : selectedTopics.size === 1
        ? (topicColumns.find((t) => String(t.id) === Array.from(selectedTopics)[0])?.label ?? "1 topic")
        : `${selectedTopics.size} topics`;

  const timelineTopicDisplayLabel =
    topicColumns.find((t) => String(t.id) === selectedTopicTimeline)?.label ?? "Overall";
  const openModelDropdown = useCallback(() => {
    const el = modelTriggerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setModelDropdownRect({ top: rect.bottom + 4, left: Math.max(8, rect.right - 224) });
    } else setModelDropdownRect({ top: 100, left: 16 });
    setModelDropdownOpen(true);
  }, []);
  const closeModelDropdown = useCallback(() => {
    setModelDropdownOpen(false);
    setModelDropdownRect(null);
  }, []);
  const modelDisplayLabel =
    selectedModel === AVERAGE_ACROSS_ALL
      ? "Average Across All"
      : modelsList.find((m) => m.id === selectedModel)?.label ?? "Model";
  const toggleTimelineBrand = useCallback((b: string) => {
    setSelectedBrandsTimeline((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  }, []);

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
    <div ref={cardRef} className="rounded-xl border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-visible">
      <div className="flex flex-col items-start gap-4 px-4 py-4 sm:px-6 border-b border-[#e5e5e5] md:flex-row md:items-center md:justify-between">
        <h2 className="w-full text-[20px] font-semibold text-[#262626] leading-tight md:w-auto">
          Results Across Topics
        </h2>
        <div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-auto">
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

          {chartView === "grouped" ? (
            <>
              <div className="relative min-w-[10rem] overflow-visible z-10">
                <button
                  ref={brandTriggerRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (brandDropdownOpen) closeBrandDropdown();
                    else openBrandDropdown();
                  }}
                  className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
                  aria-label="Select brand"
                  aria-expanded={brandDropdownOpen}
                >
                  <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Brand</span>
                  <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{selectedBrand || "Select brand"}</span>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {brandDropdownOpen && brandDropdownRect && typeof document !== "undefined" &&
                  createPortal(
                    <>
                      <div className="fixed inset-0 z-[100]" aria-hidden onClick={closeBrandDropdown} />
                      <div className="fixed z-[101] w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg overflow-hidden" style={{ top: brandDropdownRect.top, left: brandDropdownRect.left }} onClick={(ev) => ev.stopPropagation()}>
                        <div className="p-2 border-b border-[#e5e5e5] bg-[#fafafa]">
                          <input type="search" value={brandSearchQuery} onChange={(e) => setBrandSearchQuery(e.target.value)} placeholder="Search brands…" className="w-full rounded-md border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-sm text-[#262626] placeholder:text-[#7F7F7F] focus:outline-none focus:ring-2 focus:ring-[#262626]/20" autoFocus aria-label="Search brands" />
                        </div>
                        <div className="max-h-64 overflow-auto py-1">
                          {!hasAnyBrandFiltered ? (
                            <p className="px-3 py-2 text-sm text-[#7F7F7F]">No brands match</p>
                          ) : (
                            <>
                              <div className="px-3 pt-2 pb-1">
                                <p className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">Competitor &amp; Keywords list</p>
                              </div>
                              {filteredCompetitor.map((b) => {
                                const isSelected = b.toUpperCase() === selectedBrand.toUpperCase();
                                return (
                                  <button key={b} type="button" onClick={() => { setSelectedBrand(b); closeBrandDropdown(); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${isSelected ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"}`}>
                                    <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">{isSelected && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}</span>
                                    <span className="truncate">{b}</span>
                                  </button>
                                );
                              })}
                              <div className="px-3 pt-3 pb-1 border-t border-[#e5e5e5] mt-1">
                                <p className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">All Other Brands &amp; Keywords</p>
                              </div>
                              {filteredOther.map((b) => {
                                const isSelected = b.toUpperCase() === selectedBrand.toUpperCase();
                                return (
                                  <button key={b} type="button" onClick={() => { setSelectedBrand(b); closeBrandDropdown(); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${isSelected ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"}`}>
                                    <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">{isSelected && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}</span>
                                    <span className="truncate">{b}</span>
                                  </button>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
              </div>
              <div className="relative min-w-[10rem] overflow-visible z-10">
                <button ref={topicTriggerRef} type="button" onClick={(e) => { e.stopPropagation(); if (topicDropdownOpen) closeTopicDropdown(); else openTopicDropdown(); }} className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]" aria-label="Select topics" aria-expanded={topicDropdownOpen}>
                  <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Topic</span>
                  <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{topicDisplayLabel}</span>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
                </button>
                {topicDropdownOpen && topicDropdownRect && typeof document !== "undefined" &&
                  createPortal(
                    <>
                      <div className="fixed inset-0 z-[100]" aria-hidden onClick={closeTopicDropdown} />
                      <div className="fixed z-[101] w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg overflow-hidden" style={{ top: topicDropdownRect.top, left: topicDropdownRect.left }} onClick={(ev) => ev.stopPropagation()}>
                        <div className="max-h-64 overflow-auto py-1">
                          {topicColumns.map((t) => {
                            const idStr = String(t.id);
                            const isSelected = selectedTopics.has(idStr);
                            return (
                              <label key={t.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm">
                                <input type="checkbox" checked={isSelected} onChange={() => toggleTopic(idStr)} className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]" />
                                <span className="truncate">{t.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
              </div>
            </>
          ) : (
            <>
              <div className="relative min-w-[10rem] overflow-visible z-10">
                <button ref={brandTriggerRef} type="button" onClick={(e) => { e.stopPropagation(); if (brandDropdownOpen) closeBrandDropdown(); else openBrandDropdown(); }} className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]" aria-label="Select brands" aria-expanded={brandDropdownOpen}>
                  <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Brands</span>
                  <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{selectedBrandsTimeline.size === 0 ? "Select brands" : `${selectedBrandsTimeline.size} brands`}</span>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
                </button>
                {brandDropdownOpen && brandDropdownRect && typeof document !== "undefined" &&
                  createPortal(
                    <>
                      <div className="fixed inset-0 z-[100]" aria-hidden onClick={closeBrandDropdown} />
                      <div className="fixed z-[101] w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg overflow-hidden" style={{ top: brandDropdownRect.top, left: brandDropdownRect.left }} onClick={(ev) => ev.stopPropagation()}>
                        <div className="p-2 border-b border-[#e5e5e5] bg-[#fafafa]">
                          <input type="search" value={brandSearchQuery} onChange={(e) => setBrandSearchQuery(e.target.value)} placeholder="Search brands…" className="w-full rounded-md border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-sm text-[#262626] placeholder:text-[#7F7F7F] focus:outline-none focus:ring-2 focus:ring-[#262626]/20" autoFocus aria-label="Search brands" />
                        </div>
                        <div className="max-h-64 overflow-auto py-1">
                          {!hasAnyBrandFiltered ? (
                            <p className="px-3 py-2 text-sm text-[#7F7F7F]">No brands match</p>
                          ) : (
                            <>
                              <div className="px-3 pt-2 pb-1">
                                <p className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">Competitor &amp; Keywords list</p>
                              </div>
                              {filteredCompetitor.map((b) => (
                                <label key={b} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm">
                                  <input type="checkbox" checked={selectedBrandsTimeline.has(b)} onChange={() => toggleTimelineBrand(b)} className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]" />
                                  <span className="truncate">{b}</span>
                                </label>
                              ))}
                              <div className="px-3 pt-3 pb-1 border-t border-[#e5e5e5] mt-1">
                                <p className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">All Other Brands &amp; Keywords</p>
                              </div>
                              {filteredOther.map((b) => (
                                <label key={b} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm">
                                  <input type="checkbox" checked={selectedBrandsTimeline.has(b)} onChange={() => toggleTimelineBrand(b)} className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]" />
                                  <span className="truncate">{b}</span>
                                </label>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
              </div>
              <div className="relative min-w-[10rem] overflow-visible z-10">
                <button ref={topicTriggerRef} type="button" onClick={(e) => { e.stopPropagation(); if (topicDropdownOpen) closeTopicDropdown(); else openTopicDropdown(); }} className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]" aria-label="Select topic" aria-expanded={topicDropdownOpen}>
                  <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Topic</span>
                  <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{timelineTopicDisplayLabel}</span>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
                </button>
                {topicDropdownOpen && topicDropdownRect && typeof document !== "undefined" &&
                  createPortal(
                    <>
                      <div className="fixed inset-0 z-[100]" aria-hidden onClick={closeTopicDropdown} />
                      <div className="fixed z-[101] w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg overflow-hidden" style={{ top: topicDropdownRect.top, left: topicDropdownRect.left }} onClick={(ev) => ev.stopPropagation()}>
                        <div className="max-h-64 overflow-auto py-1">
                          {topicColumns.map((t) => {
                            const idStr = String(t.id);
                            const isSelected = selectedTopicTimeline === idStr;
                            return (
                              <button key={t.id} type="button" onClick={() => { setSelectedTopicTimeline(idStr); closeTopicDropdown(); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${isSelected ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"}`}>
                                <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">{isSelected && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}</span>
                                <span className="truncate">{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
              </div>
              <div className="relative min-w-[10rem] overflow-visible z-10">
                <button ref={modelTriggerRef} type="button" onClick={(e) => { e.stopPropagation(); if (modelDropdownOpen) closeModelDropdown(); else openModelDropdown(); }} className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]" aria-label="Select model" aria-expanded={modelDropdownOpen}>
                  <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Model</span>
                  <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{modelDisplayLabel}</span>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
                </button>
                {modelDropdownOpen && modelDropdownRect && typeof document !== "undefined" &&
                  createPortal(
                    <>
                      <div className="fixed inset-0 z-[100]" aria-hidden onClick={closeModelDropdown} />
                      <div className="fixed z-[101] w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg overflow-hidden" style={{ top: modelDropdownRect.top, left: modelDropdownRect.left }} onClick={(ev) => ev.stopPropagation()}>
                        <div className="max-h-64 overflow-auto py-1">
                          <button type="button" onClick={() => { setInternalSelectedModel(AVERAGE_ACROSS_ALL); closeModelDropdown(); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${selectedModel === AVERAGE_ACROSS_ALL ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"}`}>
                            <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">{selectedModel === AVERAGE_ACROSS_ALL && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}</span>
                            <span className="truncate">Average Across All</span>
                          </button>
                          {modelsList.map((m) => {
                            const isSelected = selectedModel === m.id;
                            return (
                              <button key={m.id} type="button" onClick={() => { setInternalSelectedModel(m.id); closeModelDropdown(); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${isSelected ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"}`}>
                                <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">{isSelected && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}</span>
                                <span className="truncate">{m.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleCapture}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5] hover:text-[#262626] transition-colors"
            aria-label="Download screenshot of Results Across Topics"
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
        <div ref={chartContainerRef} className="w-full min-w-0">
          {chartView === "grouped" ? (
            groupedLoading ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
                Loading…
              </div>
            ) : !topicModelScores || !selectedBrand ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
                Select a brand to see the chart.
              </div>
            ) : (() => {
              const selected =
                selectedTopics.size > 0
                  ? selectedTopics
                  : new Set(topicColumns.slice(0, DEFAULT_TOPIC_COUNT).map((c) => String(c.id)));
              const topicIdToIndex = new Map(topicModelScores.topics.map((t, i) => [String(t.id), i]));
              const orderIds = topicColumns.map((c) => String(c.id)).filter((id) => selected.has(id));
              const indices = orderIds
                .map((id) => ({ id, i: topicIdToIndex.get(id) }))
                .filter((x): x is { id: string; i: number } => x.i !== undefined)
                .map(({ id, i }) => ({ topic: topicModelScores.topics[i]!, i }));
              const filteredData =
                indices.length > 0
                  ? {
                      topics: indices.map(({ topic }) => topic),
                      models: topicModelScores.models.map((m) => ({
                        ...m,
                        values: indices.map(({ i }) => m.values[i] ?? 0),
                        ...(m.changes && {
                          changes: indices.map(({ i }) => m.changes![i] ?? 0),
                        }),
                      })),
                      averages: indices.map(({ i }) => topicModelScores.averages[i] ?? 0),
                      ...(topicModelScores.averageChanges && {
                        averageChanges: indices.map(({ i }) => topicModelScores.averageChanges![i] ?? 0),
                      }),
                    }
                  : null;
              return filteredData ? (
                <GroupedTopicChart
                  data={filteredData}
                  maxVal={config.max}
                  isPosition={isPosition}
                  width={chartWidth}
                  compareToDateLabel={compareToDateLabel}
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
                  Select at least one topic.
                </div>
              );
            })()
          ) : loading ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
              Loading…
            </div>
          ) : dates.length === 0 || series.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
              {selectedBrandsTimeline.size === 0 ? "Select at least one brand to see the timeline." : "No data for the selected brands, topic, and model."}
            </div>
          ) : (
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
                    // Comparison = score(hovered date) − score(compare-to date)
                    const valueAtCompareTo =
                      compareToDateStr != null
                        ? s.data.find((p) => p.date === compareToDateStr)?.value
                        : undefined;
                    const prevValue =
                      valueAtCompareTo != null && Number.isFinite(valueAtCompareTo)
                        ? valueAtCompareTo
                        : hoveredDateIndex > 0
                          ? s.data.find((p) => p.date === dates[hoveredDateIndex - 1])?.value
                          : undefined;
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
                {compareToDateLabel && (
                  <p className="mt-2 pt-2 border-t border-[#e5e5e5] text-xs text-[#7F7F7F] text-left px-3 pb-2">
                    Compare to {compareToDateLabel}
                  </p>
                )}
              </div>
            )}
            </div>
          )}

        {chartView === "timeline" && series.length > 0 && (
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
            onClick={() => setChartView("grouped")}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              chartView === "grouped"
                ? "border-[var(--primary)] bg-[#f0fafa] text-[var(--primary)]"
                : "border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5]"
            }`}
            aria-label="Grouped column chart"
            title="Topics by model (grouped columns)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          </button>
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
        </div>
        </div>
      </div>
    </div>
  );
}
