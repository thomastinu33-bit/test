"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";

type RadarMetric = "AI Brand Score" | "Visibility Score" | "Average Position";

const METRIC_CONFIG: Record<RadarMetric, { label: string; max: number }> = {
  "AI Brand Score": { label: "AI Brand Score", max: 100 },
  "Visibility Score": { label: "Visibility", max: 100 },
  "Average Position": { label: "Avg. Position", max: 25 },
};

interface ModelOption {
  id: string;
  label: string;
}

interface TopicColumn {
  id: string;
  label: string;
}

interface TableRow {
  brand: string;
  [key: string]: unknown;
}

interface TableResponse {
  brands: string[];
  topicColumns: TopicColumn[];
  rows: TableRow[];
}

const AVERAGE_ACROSS_ALL = "__average__";

const COMPETITOR_LIST_PORSCHE = ["PORSCHE", "BMW", "BENZ", "VOLVOCARS", "AUDI", "LEXUS"] as const;
const COMPETITOR_LIST_CETAPHIL = ["CETAPHIL", "NEUTROGENA", "DRUNK ELEPHANT", "ORDINARY", "SKINCEUTICALS", "ELTAMD"] as const;

const DEFAULT_TOPIC_COUNT = 10;

const METRIC_MAX: Record<RadarMetric, number> = {
  "AI Brand Score": 100,
  "Visibility Score": 100,
  "Average Position": 25,
};

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

function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]!;
}

interface BrandSeries {
  brand: string;
  values: number[];
  changes: (number | null)[];
}

interface RadarChartProps {
  topicColumns: TopicColumn[];
  series: BrandSeries[];
  metric: RadarMetric;
  width?: number;
  height?: number;
}

function RadarChart({ topicColumns, series, metric, width = 560, height = 460 }: RadarChartProps) {
  const maxVal = METRIC_MAX[metric];
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;
  const levels = 5;
  const labelDistance = radius + 44;

  const n = topicColumns.length;
  if (n === 0 || series.length === 0) {
    return (
      <div className="h-[360px] flex items-center justify-center text-sm text-[#7F7F7F]">
        No data for the current selection.
      </div>
    );
  }

  const angleForIndex = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const toXY = (i: number, value: number) => {
    const ang = angleForIndex(i);
    const r = (Math.max(0, Math.min(maxVal, value)) / maxVal) * radius;
    return {
      x: cx + r * Math.cos(ang),
      y: cy + r * Math.sin(ang),
    };
  };

  const [hovered, setHovered] = useState(false);
  const [hoveredTopicIndex, setHoveredTopicIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setHoveredTopicIndexSafe = useCallback((index: number | null) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (index === null) {
      leaveTimeoutRef.current = setTimeout(() => setHoveredTopicIndex(null), 80);
    } else {
      setHoveredTopicIndex(index);
    }
  }, []);

  const clearLeaveTimeout = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    if (hoveredTopicIndex === null || !svgRef.current || !chartWrapperRef.current) {
      setTooltipPos(null);
      return () => {};
    }
    const ang = angleForIndex(hoveredTopicIndex);
    const labelX = cx + labelDistance * Math.cos(ang);
    const labelY = cy + labelDistance * Math.sin(ang);
    const svgRect = svgRef.current.getBoundingClientRect();
    const wrapperRect = chartWrapperRef.current.getBoundingClientRect();
    const gap = 12;
    setTooltipPos({
      left: svgRect.left - wrapperRect.left + labelX + gap,
      top: svgRect.top - wrapperRect.top + labelY - 24,
    });
    return () => {};
  }, [hoveredTopicIndex, cx, cy, labelDistance, n]);

  useEffect(() => () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
  }, []);

  return (
    <div ref={chartWrapperRef} className="relative w-full min-w-0 py-2">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block mx-auto"
        aria-hidden
        onMouseEnter={() => { setHovered(true); clearLeaveTimeout(); }}
        onMouseLeave={() => { setHovered(false); setHoveredTopicIndexSafe(null); }}
      >
        {/* grid circles — subtle solid lines */}
        {Array.from({ length: levels }, (_, li) => {
          const r = ((li + 1) / levels) * radius;
          return (
            <circle
              key={li}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#e8e8e8"
              strokeWidth={1.5}
            />
          );
        })}

        {/* axes */}
        {topicColumns.map((_, i) => {
          const { x, y } = toXY(i, maxVal);
          return (
            <line
              key={topicColumns[i]!.id}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#d1d5db"
              strokeWidth={1.5}
            />
          );
        })}

        {/* topic labels — outside the chart; hover triggers tooltip */}
        {topicColumns.map((t, i) => {
          const ang = angleForIndex(i);
          const x = cx + labelDistance * Math.cos(ang);
          const y = cy + labelDistance * Math.sin(ang);
          const isHovered = hoveredTopicIndex === i;
          const hitRadius = 20;
          return (
            <g
              key={t.id}
              onMouseEnter={() => setHoveredTopicIndexSafe(i)}
              onMouseLeave={() => setHoveredTopicIndexSafe(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r={hitRadius} fill="transparent" />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                className={`fill-[#525252] text-[11px] transition-colors pointer-events-none ${isHovered ? "fill-[var(--primary)] font-medium" : ""}`}
              >
                {t.label}
              </text>
            </g>
          );
        })}

        {/* one polygon per brand — rounded joins, slightly thicker */}
        {series.map((s, brandIdx) => {
          const pathD = s.values
            .map((val, i) => {
              const { x, y } = toXY(i, val);
              return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
            })
            .join(" ") + " Z";
          const color = getChartColor(brandIdx);
          return (
            <g key={s.brand}>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.values.map((val, i) => {
                const { x, y } = toXY(i, val);
                return (
                  <circle
                    key={`${s.brand}-${i}`}
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill={color}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3">
        {series.map((s, idx) => (
          <span key={s.brand} className="flex items-center gap-2 text-xs text-[#525252]">
            <span
              className="inline-block w-3 h-0.5 rounded-full shrink-0"
              style={{ backgroundColor: getChartColor(idx) }}
            />
            <span className="truncate">{s.brand}</span>
          </span>
        ))}
      </div>

      {/* Tooltip: to the right of the hovered topic label */}
      {hovered && hoveredTopicIndex !== null && tooltipPos != null && topicColumns[hoveredTopicIndex] && (
        <div
          className="absolute z-10 w-52 max-w-[14rem] rounded-lg border border-[#e5e5e5] bg-white shadow-lg px-3 py-2 text-xs will-change-[left,top]"
          style={{
            left: tooltipPos.left,
            top: tooltipPos.top,
            transition: "left 0.2s ease-out, top 0.2s ease-out",
          }}
        >
          <p className="text-xs font-semibold text-[#262626] mb-2 border-b border-[#e5e5e5] pb-1.5 text-left">
            {topicColumns[hoveredTopicIndex]!.label}
          </p>
          <div className="space-y-1 max-h-56 overflow-auto pr-1">
            {series.map((s, idx) => {
              const value = s.values[hoveredTopicIndex!];
              const change = s.changes[hoveredTopicIndex!];
              const hasChange = change != null && Number.isFinite(change);
              const changePositive = hasChange && change! > 0;
              const changeNegative = hasChange && change! < 0;
              const pillClass =
                !hasChange
                  ? "bg-[#f0f0f0] text-[#999]"
                  : changePositive
                    ? "bg-emerald-50 text-emerald-700"
                    : changeNegative
                      ? "bg-red-50 text-red-600"
                      : "bg-[#f0f0f0] text-[#525252]";
              const changeText = hasChange
                ? `${change! > 0 ? "▲" : change! < 0 ? "▼" : ""} ${Math.abs(change!).toFixed(1)} pts`
                : "—";
              return (
                <div key={s.brand} className="flex items-center justify-between gap-4 text-xs w-full">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: getChartColor(idx) }}
                    />
                    <span className="text-[#525252] truncate">{s.brand}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="font-medium tabular-nums text-[#262626]">
                      {Number.isFinite(value) ? value.toFixed(1) : "—"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold tabular-nums uppercase tracking-wide ${pillClass}`}
                    >
                      {changeText}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function sortBrandsWithMainFirst(brands: string[], mainBrand: string): string[] {
  const main = brands.find((b) => b.toUpperCase() === mainBrand);
  const rest = brands.filter((b) => b.toUpperCase() !== mainBrand);
  return main ? [main, ...rest] : rest;
}

export function AiPerceptionMap() {
  const params = useParams();
  const brandId = (params?.brand as string) ?? "porsche";
  const trackerId = (params?.tracker as string) ?? "luxury-suvs";
  const mainBrand = brandId === "cetaphil" ? "CETAPHIL" : "PORSCHE";

  const [metric, setMetric] = useState<RadarMetric>("AI Brand Score");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedModel, setSelectedModel] = useState<string>(AVERAGE_ACROSS_ALL);
  const [topicColumns, setTopicColumns] = useState<TopicColumn[]>([]);
  const [tableData, setTableData] = useState<TableResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const brandTriggerRef = useRef<HTMLButtonElement>(null);
  const [brandDropdownRect, setBrandDropdownRect] = useState<{ top: number; left: number } | null>(null);
  const topicTriggerRef = useRef<HTMLButtonElement>(null);
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [topicDropdownRect, setTopicDropdownRect] = useState<{ top: number; left: number } | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const competitorSet = new Set(
    brandId === "cetaphil"
      ? COMPETITOR_LIST_CETAPHIL.map((c) => c.toUpperCase())
      : COMPETITOR_LIST_PORSCHE.map((c) => c.toUpperCase())
  );

  const fetchMeta = useCallback(() => {
    const q = new URLSearchParams({ brandId, trackerId });
    fetch(`/api/timeline?${q}`)
      .then((res) => res.json())
      .then((data: { brands: string[]; models: ModelOption[]; top10Brands: string[]; topicColumns?: TopicColumn[] }) => {
        const brands = data.brands ?? [];
        setModels(data.models ?? []);
        setBrandsList(brands);
        const cols = data.topicColumns ?? [];
        setTopicColumns(cols);
        setSelectedTopics((prev) => {
          if (prev.size > 0) return prev;
          return new Set(cols.slice(0, DEFAULT_TOPIC_COUNT).map((c) => String(c.id)));
        });
        const competitorOrder = brandId === "cetaphil" ? COMPETITOR_LIST_CETAPHIL : COMPETITOR_LIST_PORSCHE;
        const inList = competitorOrder
          .filter((c) => brands.some((b) => b.toUpperCase() === c.toUpperCase()))
          .map((c) => brands.find((b) => b.toUpperCase() === c.toUpperCase())!);
        setSelectedBrands((prev) => (prev.size === 0 ? new Set(inList) : prev));
      })
      .catch(() => {});
  }, [brandId, trackerId]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const modelIdsForRequest =
    selectedModel === AVERAGE_ACROSS_ALL
      ? models.map((m) => m.id)
      : selectedModel
        ? [selectedModel]
        : [];

  const brandsForRequest = sortBrandsWithMainFirst(Array.from(selectedBrands), mainBrand);

  useEffect(() => {
    if (modelIdsForRequest.length === 0 || brandsForRequest.length === 0) {
      setTableData(null);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      brandId,
      trackerId,
      metric,
      brands: brandsForRequest.join(","),
      models: modelIdsForRequest.join(","),
      table: "1",
    });
    fetch(`/api/timeline?${params}`)
      .then((res) => res.json())
      .then((data: TableResponse) => {
        setTableData(data);
        const cols = data.topicColumns && data.topicColumns.length > 0 ? data.topicColumns : [];
        setTopicColumns((prev) => (cols.length > 0 ? cols : prev));
        setSelectedTopics((prev) => {
          if (prev.size > 0) return prev;
          return new Set(cols.slice(0, DEFAULT_TOPIC_COUNT).map((c) => String(c.id)));
        });
      })
      .catch(() => setTableData(null))
      .finally(() => setLoading(false));
  }, [brandId, trackerId, metric, modelIdsForRequest.join(","), selectedModel, brandsForRequest.join(",")]);

  const competitorOrder = new Map<string, number>(
    (brandId === "cetaphil" ? COMPETITOR_LIST_CETAPHIL : COMPETITOR_LIST_PORSCHE).map((c, i) => [c, i])
  );
  const competitorBrands = brandsList
    .filter((b) => competitorSet.has(b.toUpperCase()))
    .sort((a, b) => (competitorOrder.get(a.toUpperCase()) ?? 999) - (competitorOrder.get(b.toUpperCase()) ?? 999));
  const otherBrands = brandsList.filter((b) => !competitorSet.has(b.toUpperCase()));
  const qSearch = brandSearchQuery.trim().toLowerCase();
  const matchesSearch = (b: string) => !qSearch || b.toLowerCase().includes(qSearch);
  const filteredCompetitor = competitorBrands.filter(matchesSearch);
  const filteredOther = otherBrands.filter(matchesSearch);
  const hasAnyBrandFiltered = filteredCompetitor.length > 0 || filteredOther.length > 0;

  const toggleBrand = useCallback((b: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  }, []);

  const openBrandDropdown = useCallback(() => {
    setBrandSearchQuery("");
    setModelDropdownOpen(false);
    const el = brandTriggerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setBrandDropdownRect({ top: rect.bottom + 4, left: Math.max(8, rect.right - 224) });
    } else setBrandDropdownRect({ top: 100, left: 16 });
    setBrandDropdownOpen(true);
  }, []);

  const closeBrandDropdown = useCallback(() => {
    setBrandDropdownOpen(false);
    setBrandSearchQuery("");
    setBrandDropdownRect(null);
  }, []);

  const openTopicDropdown = useCallback(() => {
    setModelDropdownOpen(false);
    const el = topicTriggerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setTopicDropdownRect({ top: rect.bottom + 4, left: Math.max(8, rect.right - 224) });
    } else setTopicDropdownRect({ top: 100, left: 16 });
    setTopicDropdownOpen(true);
  }, []);

  const closeTopicDropdown = useCallback(() => {
    setTopicDropdownOpen(false);
    setTopicDropdownRect(null);
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

  const topicColumnsForChart = topicColumns.filter((t) => selectedTopics.has(String(t.id)));
  const effectiveTopics = topicColumnsForChart.length > 0 ? topicColumnsForChart : topicColumns.slice(0, DEFAULT_TOPIC_COUNT);
  const topicDisplayLabel =
    selectedTopics.size === 0
      ? "Select topics"
      : selectedTopics.size === 1
        ? (topicColumns.find((t) => String(t.id) === Array.from(selectedTopics)[0])?.label ?? "1 topic")
        : `${selectedTopics.size} topics`;

  const series: BrandSeries[] =
    tableData && effectiveTopics.length > 0
      ? tableData.rows
          .filter((row) => selectedBrands.has(row.brand))
          .map((row) => {
            const r = row as TableRow;
            const values = effectiveTopics.map((t) => {
              const v = r[t.id];
              return typeof v === "number" ? v : 0;
            });
            const changes = effectiveTopics.map((t) => {
              const changeKey = `change${String(t.id).charAt(0).toUpperCase()}${String(t.id).slice(1)}`;
              const v = r[changeKey];
              return typeof v === "number" && Number.isFinite(v) ? (v as number) : null;
            });
            return { brand: r.brand, values, changes };
          })
      : [];

  const modelDisplayLabel =
    selectedModel === AVERAGE_ACROSS_ALL
      ? "Avg Across All"
      : models.find((m) => m.id === selectedModel)?.label ?? "Model";

  const selectModel = (id: string) => {
    setSelectedModel(id);
    setModelDropdownOpen(false);
  };

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-visible">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 sm:px-6 border-b border-[#e5e5e5]">
        <h2 className="text-[20px] font-semibold text-[#262626] leading-tight">
          AI Perception Map
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex flex-wrap rounded-lg border border-[#e5e5e5] p-0.5 bg-[#f6f6f6]">
            {(Object.keys(METRIC_CONFIG) as RadarMetric[]).map((m) => (
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
              aria-label="Select brands"
              aria-expanded={brandDropdownOpen}
            >
              <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Brands</span>
              <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">
                {selectedBrands.size === 0 ? "Select brands" : `${selectedBrands.size} brands`}
              </span>
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
                      <input
                        type="search"
                        value={brandSearchQuery}
                        onChange={(e) => setBrandSearchQuery(e.target.value)}
                        placeholder="Search brands…"
                        className="w-full rounded-md border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-sm text-[#262626] placeholder:text-[#7F7F7F] focus:outline-none focus:ring-2 focus:ring-[#262626]/20"
                        autoFocus
                        aria-label="Search brands"
                      />
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
                              <input type="checkbox" checked={selectedBrands.has(b)} onChange={() => toggleBrand(b)} className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]" />
                              <span className="truncate">{b}</span>
                            </label>
                          ))}
                          <div className="px-3 pt-3 pb-1 border-t border-[#e5e5e5] mt-1">
                            <p className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">All Other Brands &amp; Keywords</p>
                          </div>
                          {filteredOther.map((b) => (
                            <label key={b} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm">
                              <input type="checkbox" checked={selectedBrands.has(b)} onChange={() => toggleBrand(b)} className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]" />
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

          {topicColumns.length > 0 && (
            <div className="relative min-w-[10rem] overflow-visible z-10">
              <button
                ref={topicTriggerRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (topicDropdownOpen) closeTopicDropdown();
                  else openTopicDropdown();
                }}
                className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
                aria-label="Select topics"
                aria-expanded={topicDropdownOpen}
              >
                <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Topic</span>
                <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{topicDisplayLabel}</span>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
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
          )}

          <div className="relative min-w-[10rem] overflow-visible z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeBrandDropdown();
                closeTopicDropdown();
                setModelDropdownOpen((o) => !o);
              }}
              className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
              aria-label="Select model"
              aria-expanded={modelDropdownOpen}
            >
              <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F] z-[1]">Select Model</span>
              <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{modelDisplayLabel}</span>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {modelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[100]" aria-hidden onClick={() => setModelDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-[101] w-56 max-h-64 overflow-auto rounded-lg border border-[#e5e5e5] bg-white shadow-lg py-1">
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
                  {models.map((m) => (
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
        </div>
      </div>

      <div className="px-4 pt-6 pb-6 sm:px-6">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center text-sm text-[#7F7F7F]">
            Loading…
          </div>
        ) : selectedBrands.size === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center text-sm text-[#7F7F7F]">
            Select at least one brand to see the map.
          </div>
        ) : series.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center text-sm text-[#7F7F7F]">
            No data for the current selection.
          </div>
        ) : (
          <RadarChart topicColumns={effectiveTopics} series={series} metric={metric} />
        )}
      </div>
    </div>
  );
}

