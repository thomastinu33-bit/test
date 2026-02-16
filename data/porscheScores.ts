import { readFileSync } from "fs";
import path from "path";

export interface PorscheScoreRow {
  reportDate: string;
  targetBrand: string;
  modelMaker: string;
  model: string;
  brand: string;
  metric: "AI Brand Score" | "Visibility Score" | "Average Position";
  overall: number;
  topOfMind: number;
  perception: number;
  media: number;
  process: number;
  product: number;
  price: number;
}

function parseCsvLine(line: string): string[] {
  return line.split(",").map((s) => s.trim());
}

let cached: PorscheScoreRow[] | null = null;

/** Simple hash for deterministic mock trends from a string. */
function hashKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Per-day variation so values clearly change over time (deterministic from key + daysAgo). */
function dayVariation(key: string, daysAgo: number, range: number): number {
  const h = hashKey(key);
  const phase = (h % 100) / 100 * Math.PI * 2;
  const freq = 0.9 + (h % 7) / 4;
  return range * Math.sin(daysAgo * freq + phase);
}

/** Add mock rows for the previous 6 days so each date has clearly different values. */
function addMockHistory(baseRows: PorscheScoreRow[]): PorscheScoreRow[] {
  if (baseRows.length === 0) return baseRows;
  const baseDate = baseRows[0]!.reportDate;
  const parts = baseDate.split("-");
  const y = parseInt(parts[0]!, 10);
  const m = parseInt(parts[1]!, 10);
  const d = parseInt(parts[2]!, 10);
  const baseTime = new Date(y, m - 1, d).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const out = [...baseRows];
  for (const row of baseRows) {
    const key = `${row.modelMaker}|${row.model}|${row.brand}|${row.metric}`;
    const h = hashKey(key);
    const trendUp = h % 3 === 0;
    const strength = 0.28 + (h % 12) / 20;
    const isPosition = row.metric === "Average Position";
    const cap = isPosition ? 30 : 100;
    const baseVal = Math.max(1, row.overall);
    const totalChangeOver6Days = trendUp ? baseVal * strength : -baseVal * strength;
    const dailyDelta = totalChangeOver6Days / 6;
    const variationRange = isPosition ? 2.5 : 8 + (h % 10);
    for (let daysAgo = 1; daysAgo <= 6; daysAgo++) {
      const pastDate = new Date(baseTime - daysAgo * oneDay);
      const dateStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, "0")}-${String(pastDate.getDate()).padStart(2, "0")}`;
      const linear = row.overall - dailyDelta * daysAgo;
      const variation = dayVariation(key, daysAgo, variationRange);
      const daySpread = (daysAgo / 6) * (h % 5) * (isPosition ? 0.5 : 2);
      const overallRaw = linear + variation + (trendUp ? -daySpread : daySpread);
      const overall = Math.max(0, Math.min(cap, overallRaw));
      const segVar = variation * 0.6;
      const seg = (v: number) => Math.max(0, Math.min(100, v - dailyDelta * daysAgo * 0.7 + segVar));
      out.push({
        reportDate: dateStr,
        targetBrand: row.targetBrand,
        modelMaker: row.modelMaker,
        model: row.model,
        brand: row.brand,
        metric: row.metric,
        overall: Math.round(overall * 10) / 10,
        topOfMind: Math.round(seg(row.topOfMind) * 10) / 10,
        perception: Math.round(seg(row.perception) * 10) / 10,
        media: Math.round(seg(row.media) * 10) / 10,
        process: Math.round(seg(row.process) * 10) / 10,
        product: Math.round(seg(row.product) * 10) / 10,
        price: Math.round(seg(row.price) * 10) / 10,
      });
    }
  }
  return out;
}

export function getPorscheScores(): PorscheScoreRow[] {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "data", "Porsche_Scores.csv");
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = lines[0];
  if (!header) {
    cached = [];
    return cached;
  }
  const rows: PorscheScoreRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    if (values.length < 9) continue;
    const num = (idx: number) => Number(values[idx]) || 0;
    rows.push({
      reportDate: values[0] ?? "",
      targetBrand: values[1] ?? "",
      modelMaker: values[2] ?? "",
      model: values[3] ?? "",
      brand: values[4] ?? "",
      metric: values[5] as PorscheScoreRow["metric"],
      overall: num(6),
      topOfMind: values.length > 7 ? num(7) : num(6),
      perception: values.length > 8 ? num(8) : num(6),
      media: values.length > 9 ? num(9) : num(6),
      process: values.length > 10 ? num(10) : num(6),
      product: values.length > 11 ? num(11) : num(6),
      price: values.length > 12 ? num(12) : num(6),
    });
  }
  cached = addMockHistory(rows);
  return cached;
}

/** Latest report date (YYYY-MM-DD) in the data. */
export function getLatestReportDate(): string {
  const rows = getPorscheScores();
  const dates = [...new Set(rows.map((r) => r.reportDate))].sort();
  return dates[dates.length - 1] ?? "2026-02-03";
}

/** Report date for N days before the latest. */
export function getReportDateDaysAgo(daysAgo: number): string {
  const latest = getLatestReportDate();
  const [y, m, d] = latest.split("-").map(Number);
  const t = new Date(y!, m! - 1, d!);
  t.setDate(t.getDate() - daysAgo);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

/** Get unique brands from the CSV (for filters/dropdowns). */
export function getPorscheScoreBrands(): string[] {
  const rows = getPorscheScores();
  const set = new Set(rows.map((r) => r.brand));
  return Array.from(set).sort();
}

/** Get rows for a specific brand, optionally by metric. */
export function getPorscheScoresByBrand(
  brand: string,
  metric?: PorscheScoreRow["metric"]
): PorscheScoreRow[] {
  const rows = getPorscheScores();
  return rows.filter(
    (r) => r.brand === brand && (metric == null || r.metric === metric)
  );
}

/** Unique model labels (modelMaker === model ? model : "modelMaker model"). */
export function getUniqueModels(): { id: string; label: string }[] {
  const rows = getPorscheScores();
  const seen = new Set<string>();
  const list: { id: string; label: string }[] = [];
  for (const r of rows) {
    const id = `${r.modelMaker}|${r.model}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const label = r.modelMaker === r.model ? r.model : `${r.modelMaker} ${r.model}`;
    list.push({ id, label });
  }
  return list.sort((a, b) => a.label.localeCompare(b.label));
}

/** Top N brands by latest-date aggregate score for the given metric (average of overall across models). */
export function getTopBrandsByLatestScore(
  metric: PorscheScoreRow["metric"],
  n: number
): string[] {
  const rows = getPorscheScores();
  const latest = getLatestReportDate();
  const byBrand = new Map<string, { sum: number; count: number }>();
  for (const r of rows) {
    if (r.reportDate !== latest || r.metric !== metric) continue;
    const cur = byBrand.get(r.brand) ?? { sum: 0, count: 0 };
    cur.sum += r.overall;
    cur.count += 1;
    byBrand.set(r.brand, cur);
  }
  const sorted = Array.from(byBrand.entries())
    .map(([brand, v]) => ({ brand, avg: v.sum / (v.count || 1) }))
    .sort((a, b) => b.avg - a.avg);
  return sorted.slice(0, n).map((x) => x.brand);
}

export interface TimelineSeriesPoint {
  date: string;
  value: number;
}

export interface TimelineSeries {
  brand: string;
  data: TimelineSeriesPoint[];
}

/** Topic/dimension for timeline: Overall or one of the segment columns. */
export type TimelineTopic = keyof GaugeDimensions;

/** Timeline data for selected brands and models and metric. Aggregates selected models (average) per brand per date. */
export function getTimelineData(
  metric: PorscheScoreRow["metric"],
  brandIds: string[],
  modelIds: string[],
  topic: TimelineTopic = "overall"
): { dates: string[]; series: TimelineSeries[] } {
  const rows = getPorscheScores();
  const brandSet = new Set(brandIds);
  const modelSet = new Set(modelIds);
  const dateSet = new Set<string>();
  const byBrandDate = new Map<string, { sum: number; count: number }>();

  for (const r of rows) {
    if (!brandSet.has(r.brand) || r.metric !== metric) continue;
    const mid = `${r.modelMaker}|${r.model}`;
    if (!modelSet.has(mid)) continue;
    dateSet.add(r.reportDate);
    const key = `${r.brand}|${r.reportDate}`;
    const cur = byBrandDate.get(key) ?? { sum: 0, count: 0 };
    const value = r[topic] ?? r.overall;
    cur.sum += value;
    cur.count += 1;
    byBrandDate.set(key, cur);
  }

  const dates = Array.from(dateSet).sort();
  const byBrand = new Map<string, TimelineSeriesPoint[]>();

  for (const brand of brandIds) {
    if (!brandSet.has(brand)) continue;
    const data = dates.map((date) => {
      const key = `${brand}|${date}`;
      const v = byBrandDate.get(key);
      const value = v && v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0;
      return { date, value };
    });
    byBrand.set(brand, data);
  }

  const series: TimelineSeries[] = brandIds
    .filter((b) => byBrand.has(b))
    .map((brand) => ({ brand, data: byBrand.get(brand)! }));

  return { dates, series };
}

/** One series for overview timeline: one dimension over time. */
export interface DimensionTimelineSeries {
  dimension: keyof GaugeDimensions;
  label: string;
  data: { date: string; value: number }[];
}

/** Timeline of all 7 dimensions for one brand and model (or average). For Overview "topics over time" view. */
export function getDimensionTimelineData(
  metric: PorscheScoreRow["metric"],
  modelId: string,
  brand = "PORSCHE"
): { dates: string[]; series: DimensionTimelineSeries[] } {
  const rows = getPorscheScores();
  const dateSet = new Set<string>();
  const isAvg = modelId === "__average__";
  const filtered = rows.filter(
    (r) =>
      r.brand === brand &&
      r.metric === metric &&
      (isAvg || `${r.modelMaker}|${r.model}` === modelId)
  );
  for (const r of filtered) dateSet.add(r.reportDate);
  const dates = Array.from(dateSet).sort();

  const dimKeys: (keyof GaugeDimensions)[] = [
    "overall",
    "topOfMind",
    "perception",
    "media",
    "process",
    "product",
    "price",
  ];
  const dimLabels: Record<keyof GaugeDimensions, string> = {
    overall: "Overall",
    topOfMind: "Top of Mind",
    perception: "Perception",
    media: "Media",
    process: "Process",
    product: "Product",
    price: "Price",
  };

  const byDateDim = new Map<string, { sum: number; count: number }>();
  for (const r of filtered) {
    for (const dim of dimKeys) {
      const key = `${r.reportDate}|${dim}`;
      const cur = byDateDim.get(key) ?? { sum: 0, count: 0 };
      cur.sum += r[dim] ?? r.overall;
      cur.count += 1;
      byDateDim.set(key, cur);
    }
  }

  const series: DimensionTimelineSeries[] = dimKeys.map((dim) => ({
    dimension: dim,
    label: dimLabels[dim],
    data: dates.map((date) => {
      const key = `${date}|${dim}`;
      const v = byDateDim.get(key);
      const value =
        v && v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0;
      return { date, value };
    }),
  }));

  return { dates, series };
}

/** Topic columns for results table: Overall first, then others. */
export const RESULTS_TABLE_TOPICS: { id: keyof GaugeDimensions; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "topOfMind", label: "Top of Mind" },
  { id: "perception", label: "Perception" },
  { id: "media", label: "Media" },
  { id: "process", label: "Process" },
  { id: "product", label: "Product" },
  { id: "price", label: "Price" },
];

export interface ResultsTableRow {
  brand: string;
  overall: number;
  topOfMind: number;
  perception: number;
  media: number;
  process: number;
  product: number;
  price: number;
  changeOverall: number | null;
  changeTopOfMind: number | null;
  changePerception: number | null;
  changeMedia: number | null;
  changeProcess: number | null;
  changeProduct: number | null;
  changePrice: number | null;
}

/** Results table: brands × topics for latest (or given) date, metric and models. Includes change vs previous date. */
export function getResultsTableData(
  metric: PorscheScoreRow["metric"],
  brandIds: string[],
  modelIds: string[],
  reportDate?: string
): { brands: string[]; topicColumns: typeof RESULTS_TABLE_TOPICS; rows: ResultsTableRow[] } {
  const rows = getPorscheScores();
  const date = reportDate ?? getLatestReportDate();
  const prevDate = getReportDateDaysAgo(1);
  const brandSet = new Set(brandIds);
  const modelSet = new Set(modelIds);
  const byBrandTopic = new Map<string, { sum: number; count: number }>();
  const prevByBrandTopic = new Map<string, { sum: number; count: number }>();

  for (const r of rows) {
    if (!brandSet.has(r.brand) || r.metric !== metric) continue;
    const mid = `${r.modelMaker}|${r.model}`;
    if (!modelSet.has(mid)) continue;
    const isCurrent = r.reportDate === date;
    const isPrev = r.reportDate === prevDate;
    if (!isCurrent && !isPrev) continue;
    const map = isCurrent ? byBrandTopic : prevByBrandTopic;
    for (const col of RESULTS_TABLE_TOPICS) {
      const key = `${r.brand}|${col.id}`;
      const cur = map.get(key) ?? { sum: 0, count: 0 };
      const val = r[col.id] ?? r.overall;
      cur.sum += val;
      cur.count += 1;
      map.set(key, cur);
    }
  }

  const topicColumns = RESULTS_TABLE_TOPICS;
  const resultRows: ResultsTableRow[] = brandIds
    .filter((b) => brandSet.has(b))
    .map((brand) => {
      const row: ResultsTableRow = {
        brand,
        overall: 0,
        topOfMind: 0,
        perception: 0,
        media: 0,
        process: 0,
        product: 0,
        price: 0,
        changeOverall: null,
        changeTopOfMind: null,
        changePerception: null,
        changeMedia: null,
        changeProcess: null,
        changeProduct: null,
        changePrice: null,
      };
      for (const col of topicColumns) {
        const key = `${brand}|${col.id}`;
        const v = byBrandTopic.get(key);
        const currentVal = v && v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0;
        row[col.id] = currentVal;
        const prevV = prevByBrandTopic.get(key);
        if (prevV && prevV.count > 0) {
          const prevVal = Math.round((prevV.sum / prevV.count) * 10) / 10;
          const changeKey = (`change${col.id.charAt(0).toUpperCase()}${col.id.slice(1)}` as keyof ResultsTableRow);
          row[changeKey] = Math.round((currentVal - prevVal) * 10) / 10;
        }
      }
      return row;
    });

  return { brands: resultRows.map((r) => r.brand), topicColumns, rows: resultRows };
}

export type MetricType = "AI Brand Score" | "Visibility Score" | "Average Position";

/** Gauge dimensions: Overall + segment columns from CSV. */
export interface GaugeDimensions {
  overall: number;
  topOfMind: number;
  perception: number;
  media: number;
  process: number;
  product: number;
  price: number;
}

export interface GaugeDimensionsWithChange extends GaugeDimensions {
  changeOverall: number;
  changeTopOfMind: number;
  changePerception: number;
  changeMedia: number;
  changeProcess: number;
  changeProduct: number;
  changePrice: number;
}

const GAUGE_DIMENSION_KEYS: (keyof GaugeDimensions)[] = [
  "overall",
  "topOfMind",
  "perception",
  "media",
  "process",
  "product",
  "price",
];

/** Get dimension values for the gauge viz: for one metric, for selected model (or average). */
function getDimensionsForRows(
  rows: PorscheScoreRow[],
  metric: PorscheScoreRow["metric"]
): GaugeDimensions {
  const filtered = rows.filter((r) => r.metric === metric);
  if (filtered.length === 0) {
    return {
      overall: 0,
      topOfMind: 0,
      perception: 0,
      media: 0,
      process: 0,
      product: 0,
      price: 0,
    };
  }
  const sum = { overall: 0, topOfMind: 0, perception: 0, media: 0, process: 0, product: 0, price: 0 };
  for (const r of filtered) {
    sum.overall += r.overall;
    sum.topOfMind += r.topOfMind;
    sum.perception += r.perception;
    sum.media += r.media;
    sum.process += r.process;
    sum.product += r.product;
    sum.price += r.price;
  }
  const n = filtered.length;
  return {
    overall: Math.round((sum.overall / n) * 10) / 10,
    topOfMind: Math.round((sum.topOfMind / n) * 10) / 10,
    perception: Math.round((sum.perception / n) * 10) / 10,
    media: Math.round((sum.media / n) * 10) / 10,
    process: Math.round((sum.process / n) * 10) / 10,
    product: Math.round((sum.product / n) * 10) / 10,
    price: Math.round((sum.price / n) * 10) / 10,
  };
}

/** Get gauge dimension data for a model (or average) and metric, with change vs 7 days ago. */
export function getGaugeDimensionsForModelWithChange(
  metric: PorscheScoreRow["metric"],
  modelId: string,
  brand = "PORSCHE"
): GaugeDimensionsWithChange {
  const all = getPorscheScores();
  const latest = getLatestReportDate();
  const weekAgo = getReportDateDaysAgo(6);
  const rowsLatest = all.filter(
    (r) => r.brand === brand && r.reportDate === latest && (modelId === "__average__" || `${r.modelMaker}|${r.model}` === modelId)
  );
  const rowsWeekAgo = all.filter(
    (r) => r.brand === brand && r.reportDate === weekAgo && (modelId === "__average__" || `${r.modelMaker}|${r.model}` === modelId)
  );
  const current = getDimensionsForRows(rowsLatest, metric);
  const previous = getDimensionsForRows(rowsWeekAgo, metric);
  const round = (x: number) => Math.round(x * 10) / 10;
  return {
    ...current,
    changeOverall: round(current.overall - previous.overall),
    changeTopOfMind: round(current.topOfMind - previous.topOfMind),
    changePerception: round(current.perception - previous.perception),
    changeMedia: round(current.media - previous.media),
    changeProcess: round(current.process - previous.process),
    changeProduct: round(current.product - previous.product),
    changePrice: round(current.price - previous.price),
  };
}

export { GAUGE_DIMENSION_KEYS };

export interface PorscheScoreByModel {
  modelLabel: string;
  aiBrandScore: number;
  visibilityScore: number;
  averagePosition: number;
}

/** Aggregate PORSCHE rows for a given date into per-model + average. */
function aggregateByDate(rows: PorscheScoreRow[]): PorscheScoreByModel[] {
  const byModel = new Map<string, { ai: number; vis: number; pos: number }>();
  for (const r of rows) {
    const key = `${r.modelMaker}|${r.model}`;
    const label = r.modelMaker === r.model ? r.model : `${r.modelMaker} ${r.model}`;
    if (!byModel.has(key)) {
      byModel.set(key, { ai: 0, vis: 0, pos: 0 });
    }
    const row = byModel.get(key)!;
    if (r.metric === "AI Brand Score") row.ai = r.overall;
    if (r.metric === "Visibility Score") row.vis = r.overall;
    if (r.metric === "Average Position") row.pos = r.overall;
    byModel.set(key, row);
  }
  const labels = new Map<string, string>();
  for (const r of rows) {
    const key = `${r.modelMaker}|${r.model}`;
    const label = r.modelMaker === r.model ? r.model : `${r.modelMaker} ${r.model}`;
    labels.set(key, label);
  }
  const result: PorscheScoreByModel[] = [];
  let sumAi = 0, sumVis = 0, sumPos = 0;
  const entries = Array.from(byModel.entries()).sort((a, b) =>
    (labels.get(a[0]) ?? "").localeCompare(labels.get(b[0]) ?? "")
  );
  for (const [key, v] of entries) {
    const modelLabel = labels.get(key) ?? key;
    result.push({
      modelLabel,
      aiBrandScore: v.ai,
      visibilityScore: v.vis,
      averagePosition: v.pos,
    });
    sumAi += v.ai;
    sumVis += v.vis;
    sumPos += v.pos;
  }
  const n = result.length || 1;
  result.push({
    modelLabel: "Average (all models)",
    aiBrandScore: Math.round((sumAi / n) * 10) / 10,
    visibilityScore: Math.round((sumVis / n) * 10) / 10,
    averagePosition: Math.round((sumPos / n) * 10) / 10,
  });
  return result;
}

/** Get Porsche scores grouped by AI model for the latest date, plus average. */
export function getPorscheScoresByModelWithAvg(): PorscheScoreByModel[] {
  const all = getPorscheScores();
  const latest = getLatestReportDate();
  const rows = all.filter((r) => r.brand === "PORSCHE" && r.reportDate === latest);
  return aggregateByDate(rows);
}

export interface PorscheScoreByModelWithChange extends PorscheScoreByModel {
  aiBrandScoreChange: number;
  visibilityScoreChange: number;
  averagePositionChange: number;
}

/** Latest snapshot plus change vs 7 days ago (for gauge ▲/▼). */
export function getPorscheScoresByModelWithAvgAndChange(): PorscheScoreByModelWithChange[] {
  const all = getPorscheScores();
  const latest = getLatestReportDate();
  const weekAgo = getReportDateDaysAgo(6);
  const rowsLatest = all.filter((r) => r.brand === "PORSCHE" && r.reportDate === latest);
  const rowsWeekAgo = all.filter((r) => r.brand === "PORSCHE" && r.reportDate === weekAgo);
  const current = aggregateByDate(rowsLatest);
  const previous = aggregateByDate(rowsWeekAgo);
  const prevByLabel = new Map(previous.map((p) => [p.modelLabel, p]));
  return current.map((c) => {
    const p = prevByLabel.get(c.modelLabel);
    return {
      ...c,
      aiBrandScoreChange: p ? Math.round((c.aiBrandScore - p.aiBrandScore) * 10) / 10 : 0,
      visibilityScoreChange: p ? Math.round((c.visibilityScore - p.visibilityScore) * 10) / 10 : 0,
      averagePositionChange: p ? Math.round((c.averagePosition - p.averagePosition) * 10) / 10 : 0,
    };
  });
}
