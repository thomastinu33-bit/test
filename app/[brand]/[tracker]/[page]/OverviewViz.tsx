"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import html2canvas from "html2canvas";
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

interface OverviewApiResponse {
  models: ModelOption[];
  dimensions: Record<string, number>;
  dimensionKeys?: string[];
  dimensionLabels?: Record<string, string>;
  view?: string;
  timeline?: { dates: string[]; series: DimensionTimelineSeries[] };
}

const METRIC_CONFIG: Record<
  OverviewMetric,
  { label: string; max: number }
> = {
  "AI Brand Score": { label: "AI Brand Index", max: 100 },
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

const GAUGE_COLORS = [
  "var(--primary)",
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
  "var(--viz-5)",
  "var(--viz-6)",
  "var(--viz-7)",
];

const GAUGE_GRADIENTS = [
  "linear-gradient(180deg, var(--primary-gradient-start) 0%, var(--primary) 50%, var(--primary-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-2-gradient-start) 0%, var(--viz-2) 50%, var(--viz-2-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-3-gradient-start) 0%, var(--viz-3) 50%, var(--viz-3-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-4-gradient-start) 0%, var(--viz-4) 50%, var(--viz-4-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-5-gradient-start) 0%, var(--viz-5) 50%, var(--viz-5-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-6-gradient-start) 0%, var(--viz-6) 50%, var(--viz-6-gradient-end) 100%)",
  "linear-gradient(180deg, var(--viz-7-gradient-start) 0%, var(--viz-7) 50%, var(--viz-7-gradient-end) 100%)",
];

const GAUGE_ARC_GRADIENT_STARTS = [
  "var(--primary-gauge-start)",
  "var(--viz-2-gauge-start)",
  "var(--viz-3-gauge-start)",
  "var(--viz-4-gauge-start)",
  "var(--viz-5-gauge-start)",
  "var(--viz-6-gauge-start)",
  "var(--viz-7-gauge-start)",
];
const GAUGE_ARC_GRADIENT_ENDS = [
  "var(--primary-gauge-end)",
  "var(--viz-2-gauge-end)",
  "var(--viz-3-gauge-end)",
  "var(--viz-4-gauge-end)",
  "var(--viz-5-gauge-end)",
  "var(--viz-6-gauge-end)",
  "var(--viz-7-gauge-end)",
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
}: {
  dates: string[];
  series: DimensionTimelineSeries[];
  metric: OverviewMetric;
  maxVal: number;
  isAvgPosition: boolean;
  formatValue: (v: number) => string;
  width: number;
}) {
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);

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
          {series.map((s, idx) => {
            const color = getChartColor(GAUGE_COLORS, idx);
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
              {series.map((s, idx) => {
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
                        style={{ background: getChartGradient(GAUGE_GRADIENTS, idx) }}
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
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-[#e5e5e5] pt-3">
        {series.map((s, idx) => (
          <span key={s.dimension} className="flex items-center gap-2 text-xs text-[#525252]">
            <span
              className="w-3 h-0.5 rounded-full shrink-0"
              style={{ background: getChartGradient(GAUGE_GRADIENTS, idx) }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OverviewViz() {
  const params = useParams();
  const brandId = (params?.brand as string) ?? "porsche";
  const trackerId = (params?.tracker as string) ?? "luxury-suvs";

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
  const [modelId, setModelId] = useState<string>(AVERAGE_ACROSS_ALL);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [overviewView, setOverviewView] = useState<OverviewView>("gauge");
  const [chartWidth, setChartWidth] = useState(600);

  const fetchData = () => {
    setLoading(true);
    const q = new URLSearchParams({ brandId, trackerId, metric, model: modelId });
    if (overviewView === "timeline") q.set("view", "timeline");
    fetch(`/api/scores?${q}`)
      .then((res) => res.json())
      .then((json: OverviewApiResponse) => {
        setModels(json.models ?? []);
        setDimensions(json.dimensions ?? null);
        setDimensionKeys(json.dimensionKeys ?? DIMENSION_GAUGES.map((g) => g.key));
        setDimensionLabels(json.dimensionLabels ?? Object.fromEntries(DIMENSION_GAUGES.map((g) => [g.key, g.label])));
        setTimelineData(json.timeline ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [brandId, trackerId, metric, modelId, overviewView]);

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

  const formatValue = (value: number) =>
    typeof value === "number" && Number.isFinite(value)
      ? value.toFixed(isAvgPosition ? 1 : 0)
      : "—";

  const modelDisplayLabel =
    modelId === AVERAGE_ACROSS_ALL
      ? "Avg Across All"
      : models.find((m) => m.id === modelId)?.label ?? "Model";

  const selectModel = (id: string) => {
    setModelId(id);
    setModelDropdownOpen(false);
  };

  return (
    <div ref={cardRef} className="rounded-xl border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 sm:px-6 border-b border-[#e5e5e5]">
        <h2 className="text-[20px] font-semibold text-[#262626] leading-tight">
          Brand Score for {brandId === "cetaphil" ? "Cetaphil" : "Porsche"} in {trackerId === "skincare" ? "Skincare" : "Luxury SUV"}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex flex-wrap rounded-lg border border-[#e5e5e5] p-0.5 bg-[#f6f6f6]">
            {(Object.keys(METRIC_CONFIG) as OverviewMetric[]).map((m) => (
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
              onClick={() => setModelDropdownOpen((o) => !o)}
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
                      modelId === AVERAGE_ACROSS_ALL ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                      {modelId === AVERAGE_ACROSS_ALL && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                    </span>
                    Avg Across All
                  </button>
                  <div className="border-t border-[#e5e5e5] my-1" />
                  {models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => selectModel(m.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                        modelId === m.id ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                        {modelId === m.id && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </span>
                      <span className="truncate">{m.label}</span>
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
            <div className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
              {dimensionKeys.map((key, i) => {
                const changeKey = `change${key.charAt(0).toUpperCase()}${key.slice(1)}`;
                const value = dimensions[key] as number;
                const changeRaw = dimensions[changeKey] as number;
                const change =
                  isAvgPosition && changeRaw != null ? -changeRaw : changeRaw;
                const label = dimensionLabels[key] ?? key;
                return (
                  <div key={key} className="flex justify-center">
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
                    />
                  </div>
                );
              })}
            </div>
            {isAvgPosition && (
              <p className="mt-4 text-xs text-[#7F7F7F]">
                Lower is better (e.g. 2.7 = average position 2.7 in rankings).
              </p>
            )}
          </>
        )}

        {overviewView === "timeline" && (
          <div ref={chartRef} className="w-full min-w-0">
            {loading && !timelineData ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-[#7F7F7F]">
                Loading…
              </div>
            ) : !timelineData || timelineData.dates.length === 0 || timelineData.series.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-[#7F7F7F]">
                No timeline data for this selection.
              </div>
            ) : (
              <OverviewTimelineChart
                dates={timelineData.dates}
                series={timelineData.series}
                metric={metric}
                maxVal={maxVal}
                isAvgPosition={isAvgPosition}
                formatValue={formatValue}
                width={chartWidth}
              />
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#e5e5e5] flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setOverviewView("gauge")}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              overviewView === "gauge"
                ? "border-[var(--primary)] bg-[#f0fafa] text-[var(--primary)]"
                : "border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f5f5f5]"
            }`}
            aria-label="Gauge view"
            title="Gauge view"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {/* Light track: 100% circle */}
              <circle cx="12" cy="12" r="10" strokeWidth="2" className="opacity-40" />
              {/* Dark arc: first 25% (90° from top to right) */}
              <path d="M12 2 A10 10 0 0 1 22 12" strokeWidth="2.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setOverviewView("timeline")}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              overviewView === "timeline"
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
  );
}
