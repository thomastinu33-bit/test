"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

const AVERAGE_ACROSS_ALL = "__average__";
const MAIN_BRAND_PORSCHE = "PORSCHE";
const MAIN_BRAND_CETAPHIL = "CETAPHIL";
const COMPETITOR_LIST_PORSCHE = ["PORSCHE", "BMW", "BENZ", "VOLVOCARS", "AUDI", "LEXUS"] as const;
const COMPETITOR_LIST_CETAPHIL = ["CETAPHIL", "NEUTROGENA", "DRUNK ELEPHANT", "ORDINARY", "SKINCEUTICALS", "ELTAMD"] as const;

const METRIC_CONFIG: Record<
  TimelineMetric,
  { label: string; max: number }
> = {
  "AI Brand Score": { label: "AI Brand Index", max: 100 },
  "Visibility Score": { label: "Visibility", max: 100 },
  "Average Position": { label: "Avg. Position", max: 25 },
};

const SortDownIcon = ({ className }: { className?: string } = {}) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className ?? ""}`} aria-hidden>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);
const SortUpIcon = ({ className }: { className?: string } = {}) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className ?? ""}`} aria-hidden>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const SortNoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40" aria-hidden>
    <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
  </svg>
);

const PORSCHE_TOPIC_IDS = ["overall", "topOfMind", "perception", "media", "process", "product", "price"] as const;
const TOPIC_LABELS: Record<string, string> = {
  overall: "Overall",
  topOfMind: "Top of Mind",
  perception: "Perception",
  media: "Media",
  process: "Process",
  product: "Product",
  price: "Price",
  aiBrandIndex: "AI Brand Index",
  brandReputation: "Brand Reputation",
  ingredients: "Ingredients",
  dermatologistRecommendation: "Dermatologist Recommendation",
  skinTypeCompatibility: "Skin Type Compatibility",
  effectiveness: "Effectiveness",
  sustainability: "Sustainability",
  quality: "Quality",
  packaging: "Packaging",
  safety: "Safety",
};

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

function sortBrandsWithMainFirst(brands: string[], mainBrand: string): string[] {
  const main = brands.find((b) => b.toUpperCase() === mainBrand);
  const rest = brands.filter((b) => b.toUpperCase() !== mainBrand);
  return main ? [main, ...rest] : rest;
}

export type TimelineMetric = "AI Brand Score" | "Visibility Score" | "Average Position";

interface ModelOption {
  id: string;
  label: string;
}

export function ResultsTableCard() {
  const params = useParams();
  const brandId = (params?.brand as string) ?? "porsche";
  const trackerId = (params?.tracker as string) ?? "luxury-suvs";
  const mainBrand = brandId === "cetaphil" ? MAIN_BRAND_CETAPHIL : MAIN_BRAND_PORSCHE;
  const competitorSet = new Set(
    brandId === "cetaphil"
      ? COMPETITOR_LIST_CETAPHIL.map((c) => c.toUpperCase())
      : COMPETITOR_LIST_PORSCHE.map((c) => c.toUpperCase())
  );

  const [metric, setMetric] = useState<TimelineMetric>("AI Brand Score");
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [modelsList, setModelsList] = useState<ModelOption[]>([]);
  const [top10Brands, setTop10Brands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedModel, setSelectedModel] = useState<string>(AVERAGE_ACROSS_ALL);
  const [tableData, setTableData] = useState<{
    brands: string[];
    topicColumns: { id: string; label: string }[];
    rows: { brand: string; [k: string]: unknown }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("brand");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => new Set(PORSCHE_TOPIC_IDS));
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        if (next.size <= 1) return prev;
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnId);
      setSortDir("asc");
    }
    setPage(1);
  };

  const fetchMeta = useCallback(() => {
    const q = new URLSearchParams({ brandId, trackerId });
    fetch(`/api/timeline?${q}`)
      .then((res) => res.json())
      .then((data: { brands: string[]; models: ModelOption[]; top10Brands: string[] }) => {
        const brands = data.brands ?? [];
        setBrandsList(brands);
        setModelsList(data.models ?? []);
        setTop10Brands(data.top10Brands ?? []);
        const defaultBrands = brands.filter((b) => competitorSet.has(b.toUpperCase()));
        setSelectedBrands(new Set(defaultBrands.length ? defaultBrands : (data.top10Brands ?? [])));
      })
      .catch(() => {});
  }, [brandId, trackerId]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    if (brandsList.length > 0 && selectedBrands.size === 0) {
      const defaultBrands = brandsList.filter((b) => competitorSet.has(b.toUpperCase()));
      setSelectedBrands(new Set(defaultBrands.length ? defaultBrands : top10Brands));
    }
  }, [brandsList, top10Brands, selectedBrands.size, competitorSet]);

  const modelIdsForRequest =
    selectedModel === AVERAGE_ACROSS_ALL
      ? modelsList.map((m) => m.id)
      : selectedModel
        ? [selectedModel]
        : [];

  const competitorOrder = new Map<string, number>(
    (brandId === "cetaphil" ? COMPETITOR_LIST_CETAPHIL : COMPETITOR_LIST_PORSCHE).map((c, i) => [c, i])
  );
  const competitorBrands = brandsList
    .filter((b) => competitorSet.has(b.toUpperCase()))
    .sort((a, b) => (competitorOrder.get(a.toUpperCase()) ?? 999) - (competitorOrder.get(b.toUpperCase()) ?? 999));
  const otherBrands = brandsList.filter((b) => !competitorSet.has(b.toUpperCase()));
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

  useEffect(() => {
    if (tableData?.rows && tableData.rows.length > 0) {
      const totalPages = Math.max(1, Math.ceil(tableData.rows.length / pageSize));
      setPage((p) => (p > totalPages ? totalPages : p));
    }
  }, [tableData?.rows?.length, pageSize]);

  useEffect(() => {
    const brands = sortBrandsWithMainFirst(Array.from(selectedBrands), mainBrand);
    if (brands.length === 0 || modelIdsForRequest.length === 0) {
      setTableData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      brandId,
      trackerId,
      metric,
      brands: brands.join(","),
      models: modelIdsForRequest.join(","),
      table: "1",
    });
    fetch(`/api/timeline?${params}`)
      .then((res) => res.json())
      .then((data: { brands?: string[]; topicColumns?: { id: string; label: string }[]; rows?: Record<string, unknown>[] }) => {
        const topicColumns = data.topicColumns ?? [];
        setTableData({
          brands: data.brands ?? [],
          topicColumns,
          rows: (data.rows ?? []) as { brand: string; [k: string]: unknown }[],
        });
        setVisibleColumns((prev) => {
          const ids = new Set(topicColumns.map((c) => c.id));
          if (ids.size === 0) return prev;
          const next = new Set(prev);
          for (const id of ids) next.add(id);
          for (const id of next) if (!ids.has(id)) next.delete(id);
          return next.size ? next : ids;
        });
        setPage(1);
      })
      .catch(() => setTableData(null))
      .finally(() => setLoading(false));
  }, [brandId, trackerId, mainBrand, metric, selectedBrands, selectedModel, modelIdsForRequest.join(",")]);

  return (
    <div className="w-full rounded-xl border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 sm:px-6 border-b border-[#e5e5e5]">
        <h2 className="text-[20px] font-semibold text-[#262626] leading-tight">
          Results table
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
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6">
        {loading ? (
          <p className="text-sm text-[#7F7F7F] py-4">Loading table…</p>
        ) : !tableData || tableData.rows.length === 0 ? (
          <p className="text-sm text-[#7F7F7F] py-4">No data for the current filters.</p>
        ) : (() => {
          const maxVal = METRIC_CONFIG[metric].max;
          const visibleTopicColumns = tableData.topicColumns.filter((col) => visibleColumns.has(col.id));
          const sortedRows = [...tableData.rows].sort((a, b) => {
            const rowA = a as { brand: string; [k: string]: unknown };
            const rowB = b as { brand: string; [k: string]: unknown };
            if (sortBy === "brand") {
              const aa = rowA.brand.toUpperCase();
              const bb = rowB.brand.toUpperCase();
              return sortDir === "asc" ? aa.localeCompare(bb) : bb.localeCompare(aa);
            }
            const aVal = rowA[sortBy];
            const bVal = rowB[sortBy];
            const aNum = typeof aVal === "number" ? aVal : 0;
            const bNum = typeof bVal === "number" ? bVal : 0;
            return sortDir === "asc" ? aNum - bNum : bNum - aNum;
          });
          const totalRows = sortedRows.length;
          const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
          const safePage = Math.min(page, totalPages);
          const start = (safePage - 1) * pageSize;
          const paginatedRows = sortedRows.slice(start, start + pageSize);
          const from = totalRows === 0 ? 0 : start + 1;
          const to = Math.min(start + pageSize, totalRows);
          return (
          <div className="space-y-4">
          <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <table className="w-full min-w-[400px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[#f5f5f5] text-left py-3 px-4 font-medium text-[#262626] border-b border-r border-[#e5e5e5] whitespace-nowrap min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => handleSort("brand")}
                      className="inline-flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors text-left"
                      aria-label={sortBy === "brand" ? `Sort by brand ${sortDir === "asc" ? "ascending" : "descending"}` : "Sort by brand"}
                    >
                      {sortBy === "brand" ? (sortDir === "asc" ? <SortUpIcon /> : <SortDownIcon />) : <SortNoneIcon />}
                      Brand
                    </button>
                  </th>
                  {visibleTopicColumns.map((col) => (
                    <th key={col.id} className="text-left py-3 px-4 font-medium text-[#262626] border-b border-[#e5e5e5] whitespace-nowrap bg-white">
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className="inline-flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors text-left"
                        aria-label={sortBy === col.id ? `Sort by ${col.label} ${sortDir === "asc" ? "ascending" : "descending"}` : `Sort by ${col.label}`}
                      >
                        {sortBy === col.id ? (sortDir === "asc" ? <SortUpIcon /> : <SortDownIcon />) : <SortNoneIcon />}
                        {col.label}
                      </button>
                    </th>
                  ))}
                  <th className="relative text-left py-3 px-3 font-medium text-[#262626] border-b border-[#e5e5e5] whitespace-nowrap bg-[#fafafa] w-12">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setColumnsDropdownOpen((o) => !o)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#7F7F7F] hover:text-[var(--primary)] hover:bg-[#f0fafa] transition-colors"
                        aria-label="Manage columns"
                        aria-expanded={columnsDropdownOpen}
                      >
                        <PlusIcon />
                      </button>
                      {columnsDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setColumnsDropdownOpen(false)} />
                          <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg py-2">
                            <p className="px-3 py-1.5 text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide">
                              Columns
                            </p>
                            {tableData.topicColumns.map((col) => (
                              <label
                                key={col.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm text-[#262626]"
                              >
                                <input
                                  type="checkbox"
                                  checked={visibleColumns.has(col.id)}
                                  onChange={() => toggleColumn(col.id)}
                                  disabled={visibleColumns.has(col.id) && visibleColumns.size <= 1}
                                  className="rounded border-[#e5e5e5] text-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                                <span>{col.label}</span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((r) => {
                  const row = r as { brand: string; [k: string]: unknown };
                  return (
                  <tr key={row.brand} className="border-b border-[#e5e5e5] last:border-b-0 hover:bg-[#fafafa]">
                    <td className="sticky left-0 z-10 bg-[#f5f5f5] py-3 px-4 font-medium text-[#262626] border-r border-[#e5e5e5] whitespace-nowrap hover:bg-[#eeeeee]">
                      {row.brand.toUpperCase()}
                    </td>
                    {visibleTopicColumns.map((col) => {
                      const score = row[col.id];
                      const num = typeof score === "number" ? score : 0;
                      const pct = maxVal > 0 ? Math.min(1, Math.max(0, num / maxVal)) : 0;
                      const changeKey = `change${col.id.charAt(0).toUpperCase()}${col.id.slice(1)}`;
                      const change = row[changeKey];
                      const changeNum = typeof change === "number" && Number.isFinite(change) ? change : null;
                      const changePositive = changeNum != null && changeNum > 0;
                      const changeNegative = changeNum != null && changeNum < 0;
                      return (
                        <td key={col.id} className="py-3 px-4 bg-white">
                          <div className="flex flex-col gap-1.5 min-w-[100px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[#262626] font-medium tabular-nums">
                                {num != null && Number.isFinite(num) ? num.toFixed(1) : "—"}
                              </span>
                              {changeNum != null && (
                                <span
                                  className={`inline-flex items-center rounded-full px-1.5 py-px text-[8px] font-semibold tabular-nums uppercase tracking-wide ${
                                    changePositive
                                      ? "bg-emerald-50 text-emerald-700"
                                      : changeNegative
                                        ? "bg-red-50 text-red-600"
                                        : "bg-[#f0f0f0] text-[#525252]"
                                  }`}
                                >
                                  {changeNum > 0 ? "▲" : changeNum < 0 ? "▼" : ""} {Math.abs(changeNum).toFixed(1)} pts
                                </span>
                              )}
                            </div>
                            <div className="h-2 w-[120px] rounded-full bg-[#f0f0f0] overflow-hidden shrink-0">
                              <div
                                className="h-full rounded-full bg-[var(--primary-dark)] transition-all duration-300"
                                style={{ width: `${pct * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 bg-[#fafafa] border-b border-[#e5e5e5] last:border-b-0 w-12" />
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#7F7F7F]">
                Showing {from}–{to} of {totalRows}
              </span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded-md border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-sm text-[#262626] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                aria-label="Rows per page"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-md text-sm font-medium text-[#262626] hover:bg-[#f0f0f0] disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="text-sm text-[#7F7F7F] px-2">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-md text-sm font-medium text-[#262626] hover:bg-[#f0f0f0] disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}
