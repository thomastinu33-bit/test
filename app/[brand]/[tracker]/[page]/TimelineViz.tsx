"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import html2canvas from "html2canvas";
import { useTrackerDate, formatDateForApi } from "../TrackerDateContext";
import { GroupedTopicTooltip } from "./GroupedTopicTooltip";
import { RadarChart, BrandSeries, TopicColumn as RadarTopicColumn } from "./AiPerceptionMap";

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
const MAIN_BRAND_HM = "H&M";
const COMPETITOR_LIST_PORSCHE = ["PORSCHE", "BMW", "BENZ", "VOLVOCARS", "AUDI", "LEXUS"] as const;
const COMPETITOR_LIST_CETAPHIL = ["CETAPHIL", "NEUTROGENA", "DRUNK ELEPHANT", "ORDINARY", "SKINCEUTICALS", "ELTAMD"] as const;
const COMPETITOR_LIST_HM_PANTS = ["H&M", "ZARA", "UNIQLO", "FOREVER 21", "MANGO", "PULL & BEAR", "BERSHKA", "COTTON ON", "ARITZIA", "LEVI'S", "ABERCROMBIE & FITCH", "AMERICAN EAGLE", "GAP", "HOLLISTER", "MADEWELL", "OLD NAVY", "PACSUN", "SHEIN"] as const;
const COMPETITOR_LIST_HM_HEATMAP = ["H&M", "ZARA", "UNIQLO", "NIKE", "ADIDAS", "LEVI'S", "LULULEMON", "NORDSTROM"] as const;
const COMPETITOR_LIST_HM_JEANS = ["H&M", "LEVI'S", "ZARA", "MADEWELL", "AMERICAN EAGLE", "GAP", "BANANA REPUBLIC", "HOLLISTER", "UNIQLO", "MANGO", "ABERCROMBIE & FITCH"] as const;

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

type ChartView = "grouped" | "timeline" | "radar";

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
      {hoveredTopicIndex !== null && topics[hoveredTopicIndex] && (() => {
        const groupLeft = padding.left + hoveredTopicIndex * (groupWidth + topicGap);
        const isLastGroup = hoveredTopicIndex === numTopics - 1;
        const left = isLastGroup
          ? Math.max(TOOLTIP_GAP, Math.min(groupLeft, width - TOOLTIP_MAX_WIDTH - TOOLTIP_GAP))
          : Math.max(TOOLTIP_GAP, groupLeft - TOOLTIP_MAX_WIDTH - TOOLTIP_GAP);
        return (
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
            alignRight={!isLastGroup}
            style={{
              left,
              top: TOOLTIP_GAP,
              transition: "left 0.15s ease-out, top 0.15s ease-out",
            }}
          />
        );
      })()}
    </div>
  );
}

/** Generate mock timeline data for the last 5 days for H&M trackers */
function generateMockTimelineData(
  brands: string[],
  days: number = 5,
  metric: TimelineMetric = "AI Brand Score"
): { dates: string[]; series: TimelineSeries[] } {
  const dates: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const getBaseValue = () => {
    if (metric === "Average Position") return Math.random() * 15 + 2;
    return Math.random() * 20 + 60;
  };

  const series: TimelineSeries[] = brands.map((brand) => {
    const baseValue = getBaseValue();
    const volatility = metric === "Average Position" ? 0.3 : 5;

    return {
      brand,
      data: dates.map((date) => ({
        date,
        value: Math.max(
          metric === "Average Position" ? 1 : 0,
          baseValue + (Math.random() - 0.5) * volatility * 2
        ),
      })),
    };
  });

  return { dates, series };
}

/** Generate mock radar/perception map data for H&M tracker showing topic scores */
function generateMockRadarData(
  brands: string[],
  topicColumns: RadarTopicColumn[],
  metric: TimelineMetric = "AI Brand Score"
): { topicColumns: RadarTopicColumn[]; rows: { brand: string; [k: string]: unknown }[] } {
  const isPosition = metric === "Average Position";
  const baselineScore = isPosition ? 8 : 65;

  // Generate topic scores with variation - some topics naturally score higher/lower
  const topicVariance: Record<string, number> = {};
  topicColumns.forEach((topic) => {
    topicVariance[topic.id] = (Math.random() - 0.5) * 20; // ±10 variance per topic
  });

  const rows = brands.map((brand) => {
    const row: Record<string, unknown> = { brand };
    topicColumns.forEach((topic) => {
      const score = baselineScore + topicVariance[topic.id] + (Math.random() - 0.5) * 5;
      row[topic.id] = Math.max(isPosition ? 1 : 0, score);
    });
    return row;
  });

  return { topicColumns, rows };
}

export interface TimelineVizProps {
  metric?: TimelineMetric;
  setMetric?: (m: TimelineMetric) => void;
}

export function TimelineViz(props?: TimelineVizProps) {
  const params = useParams();
  const brandId = (params?.brand as string) ?? "porsche";
  const trackerId = (params?.tracker as string) ?? "luxury-suvs";
  const mainBrand = brandId === "cetaphil" ? MAIN_BRAND_CETAPHIL : brandId === "hm" ? MAIN_BRAND_HM : MAIN_BRAND_PORSCHE;
  const activeCompetitorList = brandId === "cetaphil" ? COMPETITOR_LIST_CETAPHIL : brandId === "hm" && trackerId === "heatmap" ? COMPETITOR_LIST_HM_HEATMAP : brandId === "hm" && trackerId === "jeans" ? COMPETITOR_LIST_HM_JEANS : brandId === "hm" ? COMPETITOR_LIST_HM_PANTS : COMPETITOR_LIST_PORSCHE;
  const competitorSet = new Set(activeCompetitorList.map((c) => c.toUpperCase()));

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
  const [timelineSeriesBy, setTimelineSeriesBy] = useState<"brands" | "topics">("brands");
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
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const [radarTableData, setRadarTableData] = useState<{ topicColumns: RadarTopicColumn[]; rows: { brand: string; [k: string]: unknown }[] } | null>(null);
  const [radarLoading, setRadarLoading] = useState(false);
  const [topicModelScores, setTopicModelScores] = useState<TopicModelScores | null>(null);
  const [groupedLoading, setGroupedLoading] = useState(false);
  const { selectedDateStr, compareToDateStr, compareToDate, comparisonDays } = useTrackerDate();
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
        const competitorOrder = activeCompetitorList;
        const inList = competitorOrder
          .filter((c) => brands.some((b) => b.toUpperCase() === c.toUpperCase()))
          .slice(0, 6)
          .map((c) => brands.find((b) => b.toUpperCase() === c.toUpperCase())!);
        setSelectedBrandsTimeline((prev) => (prev.size === 0 ? new Set(inList) : prev));
      })
      .catch((err) => {
        console.error("Failed to fetch timeline metadata:", err);
      });
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

  // Initialize selectedBrandsTimeline with competitor list when brands are fetched
  useEffect(() => {
    if (brandsList.length > 0 && selectedBrandsTimeline.size === 0) {
      const competitorOrder = activeCompetitorList;
      const inList = competitorOrder
        .filter((c) => brandsList.some((b) => b.toUpperCase() === c.toUpperCase()))
        .map((c) => brandsList.find((b) => b.toUpperCase() === c.toUpperCase())!);
      if (inList.length > 0) {
        setSelectedBrandsTimeline(new Set(inList));
      }
    }
  }, [brandsList, activeCompetitorList]);

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

  const supportsTopicsMode = trackerId === "luxury-suvs-v2" || brandId === "hm";
  const isV2TopicsMode = supportsTopicsMode && timelineSeriesBy === "topics";

  useEffect(() => {
    if (chartView !== "timeline") {
      setDates([]);
      setSeries([]);
      setLoading(false);
      return;
    }

    // v2 "by topics" mode: single brand, multiple topics
    if (isV2TopicsMode) {
      if (!selectedBrand || selectedTopics.size === 0 || modelIdsForRequest.length === 0) {
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
        brands: selectedBrand,
        models: modelIdsForRequest.join(","),
        chart: "timeline",
        topics: Array.from(selectedTopics).join(","),
        series: "topics",
      });
      if (selectedDateStr) params.set("date", selectedDateStr);
      if (comparisonDays != null) params.set("comparisonDays", String(comparisonDays));
      else if (compareToDateStr) params.set("compareToDate", compareToDateStr);
      fetch(`/api/timeline?${params}`)
        .then((res) => res.json())
        .then((data: { dates: string[]; series: TimelineSeries[] }) => {
          // For topics mode, use mock data if available, otherwise use API response
          if (brandId === "hm" && (!data.dates || data.dates.length === 0)) {
            const availableBrands = (data.brands ?? internalBrandsList).slice(0, 6);
            const mockData = generateMockTimelineData(availableBrands, 5, metric);
            setDates(mockData.dates);
            setSeries(mockData.series);
          } else {
            setDates(data.dates ?? []);
            setSeries(data.series ?? []);
          }
        })
        .catch(() => {
          if (brandId === "hm" && internalBrandsList.length > 0) {
            const mockData = generateMockTimelineData(internalBrandsList.slice(0, 6), 5, metric);
            setDates(mockData.dates);
            setSeries(mockData.series);
          } else {
            setDates([]);
            setSeries([]);
          }
        })
        .finally(() => setLoading(false));
      return;
    }

    // Default "by brands" mode
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
    if (selectedDateStr) params.set("date", selectedDateStr);
    if (comparisonDays != null) params.set("comparisonDays", String(comparisonDays));
    else if (compareToDateStr) params.set("compareToDate", compareToDateStr);
    fetch(`/api/timeline?${params}`)
      .then((res) => res.json())
      .then((data: { dates: string[]; series: TimelineSeries[] }) => {
        // Use mock data as fallback for H&M trackers if API returns empty
        if (brandId === "hm" && (!data.dates || data.dates.length === 0)) {
          const mockData = generateMockTimelineData(timelineBrands, 5, metric);
          setDates(mockData.dates);
          setSeries(mockData.series);
        } else {
          setDates(data.dates ?? []);
          setSeries(data.series ?? []);
        }
      })
      .catch(() => {
        // Use mock data as fallback for H&M trackers on API error
        if (brandId === "hm" && timelineBrands.length > 0) {
          const mockData = generateMockTimelineData(timelineBrands, 5, metric);
          setDates(mockData.dates);
          setSeries(mockData.series);
        } else {
          setDates([]);
          setSeries([]);
        }
      })
      .finally(() => setLoading(false));
  }, [chartView, brandId, trackerId, metric, selectedBrandsTimeline, selectedTopicTimeline, selectedBrand, selectedTopics, timelineSeriesBy, selectedModel, modelIdsForRequest.join(","), selectedDateStr, compareToDateStr, comparisonDays, isV2TopicsMode]);

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

  useEffect(() => {
    if (chartView !== "radar" || selectedBrandsTimeline.size === 0) {
      setRadarTableData(null);
      return;
    }
    setRadarLoading(true);
    const params = new URLSearchParams({
      brandId,
      trackerId,
      metric,
      brands: Array.from(selectedBrandsTimeline).join(","),
      models: modelIdsForRequest.length > 0 ? modelIdsForRequest.join(",") : "__average__",
      table: "1",
    });
    if (selectedDateStr) params.set("date", selectedDateStr);
    if (compareToDateStr) params.set("compareToDate", compareToDateStr);
    fetch(`/api/timeline?${params}`)
      .then((res) => res.json())
      .then((data: { topicColumns: RadarTopicColumn[]; rows: { brand: string; [k: string]: unknown }[] }) => {
        // Use mock data as fallback for H&M trackers if API returns empty
        if (brandId === "hm" && (!data.topicColumns || data.topicColumns.length === 0 || !data.rows || data.rows.length === 0)) {
          const mockData = generateMockRadarData(Array.from(selectedBrandsTimeline), topicColumns, metric);
          setRadarTableData(mockData);
        } else {
          setRadarTableData(data);
        }
      })
      .catch(() => {
        // Use mock data as fallback for H&M trackers on API error
        if (brandId === "hm" && selectedBrandsTimeline.size > 0) {
          const mockData = generateMockRadarData(Array.from(selectedBrandsTimeline), topicColumns, metric);
          setRadarTableData(mockData);
        } else {
          setRadarTableData(null);
        }
      })
      .finally(() => setRadarLoading(false));
  }, [chartView, brandId, trackerId, metric, selectedBrandsTimeline, modelIdsForRequest.join(","), selectedModel, selectedDateStr, compareToDateStr, topicColumns]);

  const radarTopicColumnsAll: RadarTopicColumn[] = radarTableData?.topicColumns ?? [];
  const radarTopicColumnsFiltered = radarTopicColumnsAll.filter((t) => selectedTopics.has(String(t.id)));
  const radarTopicColumns: RadarTopicColumn[] = radarTopicColumnsFiltered.length > 0 ? radarTopicColumnsFiltered : radarTopicColumnsAll.slice(0, 10);
  const radarSeries: BrandSeries[] =
    radarTableData && radarTopicColumns.length > 0
      ? radarTableData.rows
          .filter((row) => selectedBrandsTimeline.has(row.brand))
          .map((row) => ({
            brand: row.brand,
            values: radarTopicColumns.map((t) => {
              const v = row[t.id];
              return typeof v === "number" ? v : 0;
            }),
            changes: radarTopicColumns.map((t) => {
              const changeKey = `change${String(t.id).charAt(0).toUpperCase()}${String(t.id).slice(1)}`;
              const v = row[changeKey];
              return typeof v === "number" && Number.isFinite(v) ? (v as number) : null;
            }),
          }))
      : [];

  const brandSearchLower = brandSearchQuery.trim().toLowerCase();
  const competitorOrder = new Map<string, number>(activeCompetitorList.map((c, i) => [c, i]));
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
          Results Across Models
        </h2>
        <div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-auto">
          {/* By Brands / By Topics toggle — leftmost in timeline view */}
          {supportsTopicsMode && chartView === "timeline" && (
            <div className="flex rounded-lg border border-[#e5e5e5] p-0.5 bg-[#f6f6f6]">
              {(["brands", "topics"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTimelineSeriesBy(mode)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timelineSeriesBy === mode
                      ? "bg-white text-[#262626] shadow-sm"
                      : "text-[#7F7F7F] hover:text-[#262626]"
                  }`}
                >
                  By {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          )}
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
                  {(Object.keys(METRIC_CONFIG) as TimelineMetric[]).map((m) => (
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
              {/* By Topics mode (v2 timeline only): single brand + multi topic */}
              {isV2TopicsMode && chartView !== "radar" ? (
                <>
                  {/* Single brand picker */}
                  <div className="relative min-w-[10rem] overflow-visible z-10">
                    <button ref={brandTriggerRef} type="button" onClick={(e) => { e.stopPropagation(); if (brandDropdownOpen) closeBrandDropdown(); else openBrandDropdown(); }} className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]" aria-label="Select brand" aria-expanded={brandDropdownOpen}>
                      <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Brand</span>
                      <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{selectedBrand || "Select brand"}</span>
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
                              {filteredBrands.length === 0 ? (
                                <p className="px-3 py-2 text-sm text-[#7F7F7F]">No brands match</p>
                              ) : filteredBrands.map((b) => {
                                const isSel = b.toUpperCase() === selectedBrand.toUpperCase();
                                return (
                                  <button key={b} type="button" onClick={() => { setSelectedBrand(b); closeBrandDropdown(); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${isSel ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"}`}>
                                    <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">{isSel && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}</span>
                                    <span className="truncate">{b}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>,
                        document.body
                      )}
                  </div>
                  {/* Multi-topic picker */}
                  <div className="relative min-w-[10rem] overflow-visible z-10">
                    <button ref={topicTriggerRef} type="button" onClick={(e) => { e.stopPropagation(); if (topicDropdownOpen) closeTopicDropdown(); else openTopicDropdown(); }} className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]" aria-label="Select topics" aria-expanded={topicDropdownOpen}>
                      <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Topics</span>
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
                                return (
                                  <label key={t.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm">
                                    <input type="checkbox" checked={selectedTopics.has(idStr)} onChange={() => toggleTopic(idStr)} className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]" />
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
                  {/* Default "by brands" timeline + radar: multi-brand */}
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
                    <button ref={topicTriggerRef} type="button" onClick={(e) => { e.stopPropagation(); if (topicDropdownOpen) closeTopicDropdown(); else openTopicDropdown(); }} className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]" aria-label={chartView === "radar" ? "Select topics" : "Select topic"} aria-expanded={topicDropdownOpen}>
                      <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">{chartView === "radar" ? "Topics" : "Topic"}</span>
                      <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{chartView === "radar" ? topicDisplayLabel : timelineTopicDisplayLabel}</span>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
                    </button>
                    {topicDropdownOpen && topicDropdownRect && typeof document !== "undefined" &&
                      createPortal(
                        <>
                          <div className="fixed inset-0 z-[100]" aria-hidden onClick={closeTopicDropdown} />
                          <div className="fixed z-[101] w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg overflow-hidden" style={{ top: topicDropdownRect.top, left: topicDropdownRect.left }} onClick={(ev) => ev.stopPropagation()}>
                            <div className="max-h-64 overflow-auto py-1">
                              {chartView === "radar" ? (
                                topicColumns.map((t) => {
                                  const idStr = String(t.id);
                                  return (
                                    <label key={t.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm">
                                      <input type="checkbox" checked={selectedTopics.has(idStr)} onChange={() => toggleTopic(idStr)} className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]" />
                                      <span className="truncate">{t.label}</span>
                                    </label>
                                  );
                                })
                              ) : (
                                topicColumns.map((t) => {
                                  const idStr = String(t.id);
                                  const isSel = selectedTopicTimeline === idStr;
                                  return (
                                    <button key={t.id} type="button" onClick={() => { setSelectedTopicTimeline(idStr); closeTopicDropdown(); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${isSel ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"}`}>
                                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">{isSel && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}</span>
                                      <span className="truncate">{t.label}</span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </>,
                        document.body
                      )}
                  </div>
                </>
              )}

              {/* Model dropdown (always shown in timeline mode) */}
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
                            const isSel = selectedModel === m.id;
                            return (
                              <button key={m.id} type="button" onClick={() => { setInternalSelectedModel(m.id); closeModelDropdown(); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${isSel ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"}`}>
                                <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">{isSel && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}</span>
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
            aria-label="Download screenshot of Results Across Models"
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
          ) : chartView === "radar" ? (
            radarLoading ? (
              <div className="h-[400px] flex items-center justify-center text-sm text-[#7F7F7F]">
                Loading…
              </div>
            ) : selectedBrandsTimeline.size === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-sm text-[#7F7F7F]">
                Select at least one brand to see the perception map.
              </div>
            ) : (
              <RadarChart
                topicColumns={radarTopicColumns}
                series={radarSeries}
                metric={metric}
              />
            )
          ) : loading ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
              Loading…
            </div>
          ) : dates.length === 0 || series.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-[#7F7F7F]">
              {isV2TopicsMode
            ? (!selectedBrand ? "Select a brand to see the timeline." : selectedTopics.size === 0 ? "Select at least one topic." : "No data for the selected brand, topics, and model.")
            : (selectedBrandsTimeline.size === 0 ? "Select at least one brand to see the timeline." : "No data for the selected brands, topic, and model.")}
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
                    {(() => {
                      // Compute the rolling comparison date for this hovered day
                      const hoveredDateStr = dates[hoveredDateIndex!]!;
                      const rollingCompareDateStr = comparisonDays != null
                        ? (() => {
                            const [y, m, d] = hoveredDateStr.split("-").map(Number);
                            const dt = new Date(y!, m! - 1, d!);
                            dt.setDate(dt.getDate() - comparisonDays);
                            return formatDateForApi(dt);
                          })()
                        : null;
                      const effectiveCompareToDateStr = rollingCompareDateStr ?? compareToDateStr;
                      const effectiveCompareToLabel = rollingCompareDateStr
                        ? formatDateLabel(rollingCompareDateStr)
                        : compareToDateLabel;
                      return (
                        <>
                    {visibleSeries.map((s) => {
                      const idx = series.findIndex((ss) => ss.brand === s.brand);
                    const point = s.data.find((p) => dates.indexOf(p.date) === hoveredDateIndex);
                    const value = point?.value ?? 0;
                    const valueAtCompareTo =
                      effectiveCompareToDateStr != null
                        ? s.data.find((p) => p.date === effectiveCompareToDateStr)?.value
                        : undefined;
                    const prevValue =
                      valueAtCompareTo != null && Number.isFinite(valueAtCompareTo)
                        ? valueAtCompareTo
                        : hoveredDateIndex! > 0
                          ? s.data.find((p) => p.date === dates[hoveredDateIndex! - 1])?.value
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
                  {effectiveCompareToLabel && (
                    <p className="mt-2 pt-2 border-t border-[#e5e5e5] text-xs text-[#7F7F7F] text-left pb-2">
                      Compare to {effectiveCompareToLabel}
                    </p>
                  )}
                        </>
                      );
                    })()}
                </div>
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
          <button
            type="button"
            onClick={() => setChartView("radar")}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              chartView === "radar"
                ? "border-[var(--primary)] bg-[#f0fafa] text-[var(--primary)]"
                : "border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5]"
            }`}
            aria-label="Perception map (radar)"
            title="Perception map"
          >
            <svg width="20" height="20" viewBox="0 0 96.946 96.946" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M48.473,2.372L0,37.591l18.515,56.984h59.917l18.515-56.984L48.473,2.372z M49.023,6.642L92.48,38.214l-11.082,2.488c-0.352-0.85-1.188-1.451-2.166-1.451c-0.203,0-0.396,0.035-0.584,0.082L50.749,15.828c0.042-0.176,0.07-0.357,0.07-0.545c0-1.105-0.767-2.025-1.796-2.273V6.642z M64.893,77.723l-37.174,4.783c-0.079-0.162-0.177-0.312-0.29-0.451l6.233-9.592c0.235,0.078,0.483,0.131,0.745,0.131c1.296,0,2.347-1.051,2.347-2.346c0-0.002,0-0.004,0-0.004l19.603-4.85c0.408,0.69,1.152,1.16,2.013,1.16c0.338,0,0.657-0.074,0.946-0.203l6.267,9.641c-0.429,0.426-0.694,1.014-0.694,1.664C64.887,77.68,64.893,77.703,64.893,77.723z M34.354,44.817c-0.049-0.232-0.14-0.447-0.251-0.648l12.857-9.34c0.275,0.232,0.6,0.406,0.962,0.494v12.531L34.354,44.817z M47.645,48.92L35.212,68.053c-0.139-0.051-0.283-0.088-0.433-0.113l-1.927-20.438c0.708-0.256,1.252-0.838,1.458-1.568L47.645,48.92z M46.127,33.048c0,0.318,0.064,0.619,0.179,0.895l-12.947,9.408c-0.372-0.248-0.818-0.395-1.298-0.395c-0.761,0-1.431,0.367-1.859,0.93l-10.725-2.4c-0.025-0.109-0.059-0.215-0.099-0.316l28.167-23.732c0.121,0.051,0.248,0.088,0.377,0.121v13.217C46.894,31.022,46.127,31.942,46.127,33.048z M19.452,42.608l10.3,2.307c-0.021,0.127-0.039,0.254-0.039,0.387c0,1.191,0.892,2.166,2.042,2.316l1.924,20.41c-0.938,0.307-1.621,1.18-1.621,2.221c0,0.636,0.255,1.209,0.665,1.632l-6.172,9.497c-0.123-0.053-0.253-0.094-0.386-0.125l-7.472-37.453C19.059,43.494,19.327,43.081,19.452,42.608z M57.768,61.949l-8.4-12.927l13.302-2.985c0.163,0.494,0.478,0.922,0.901,1.209l-4.764,14.662c-0.143-0.026-0.289-0.045-0.438-0.045C58.158,61.863,57.96,61.897,57.768,61.949z M60.188,65.672c0.324-0.402,0.525-0.908,0.525-1.465c0-0.748-0.355-1.406-0.9-1.836l4.793-14.75c0.093,0.012,0.185,0.027,0.281,0.027c1.295,0,2.346-1.051,2.346-2.346c0-0.098-0.018-0.191-0.029-0.287L77.21,42.77c0.196,0.338,0.47,0.619,0.804,0.824L67.692,75.358c-0.149-0.028-0.302-0.047-0.46-0.047c-0.247,0-0.48,0.05-0.704,0.119L60.188,65.672z M49.023,17.558c0.131-0.033,0.258-0.07,0.379-0.121l27.652,23.297c-0.106,0.268-0.17,0.559-0.17,0.865c0,0.039,0.01,0.076,0.012,0.113l-10.078,2.264c-0.422-0.613-1.131-1.018-1.932-1.018c-0.48,0-0.927,0.145-1.299,0.393l-12.947-9.408c0.113-0.275,0.179-0.576,0.179-0.895c0-1.105-0.767-2.025-1.796-2.273V17.558L49.023,17.558z M49.023,35.324c0.363-0.088,0.688-0.262,0.963-0.494l12.857,9.342c-0.129,0.232-0.222,0.484-0.267,0.758l-13.554,3.043V35.324L49.023,35.324z M56.797,62.477c-0.474,0.431-0.775,1.043-0.775,1.73c0,0.045,0.011,0.088,0.013,0.131l-19.552,4.838c-0.096-0.186-0.213-0.356-0.354-0.512L48.473,49.67L56.797,62.477z M47.922,6.642v6.367c-1.028,0.248-1.795,1.168-1.795,2.273c0,0.188,0.028,0.369,0.07,0.545L17.8,39.752c-0.194-0.053-0.395-0.09-0.606-0.09c-0.747,0-1.405,0.355-1.834,0.9L4.562,38.145L47.922,6.642z M3.78,39.101l11.109,2.486c-0.025,0.137-0.042,0.277-0.042,0.422c0,1.109,0.771,2.033,1.805,2.277l7.47,37.441c-0.518,0.43-0.855,1.07-0.855,1.797c0,0.688,0.3,1.299,0.77,1.729l-3.507,5.395L3.78,39.101z M21.326,91.447l3.68-5.664c0.194,0.053,0.396,0.09,0.607,0.09c0.894,0,1.662-0.506,2.058-1.241l38.407-4.941c0.342,0.195,0.732,0.316,1.154,0.316c0.3,0,0.584-0.062,0.848-0.164l7.541,11.604H21.326z M76.417,90.647l-7.435-11.438c0.367-0.416,0.596-0.952,0.596-1.551c0-0.291-0.061-0.567-0.156-0.826l10.75-33.086c0.768-0.336,1.312-1.076,1.387-1.951l11.576-2.6L76.417,90.647z"/>
            </svg>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
