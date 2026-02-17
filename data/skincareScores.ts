import { readFileSync } from "fs";
import path from "path";

/** Skincare CSV topic columns (camelCase). */
export type SkincareTopic =
  | "overall"
  | "aiBrandIndex"
  | "price"
  | "brandReputation"
  | "ingredients"
  | "dermatologistRecommendation"
  | "skinTypeCompatibility"
  | "effectiveness"
  | "sustainability"
  | "quality"
  | "packaging"
  | "safety";

export interface SkincareScoreRow {
  reportDate: string;
  targetBrand: string;
  modelMaker: string;
  model: string;
  brand: string;
  metric: "AI Brand Score" | "Visibility Score" | "Average Position";
  overall: number;
  aiBrandIndex: number;
  price: number;
  brandReputation: number;
  ingredients: number;
  dermatologistRecommendation: number;
  skinTypeCompatibility: number;
  effectiveness: number;
  sustainability: number;
  quality: number;
  packaging: number;
  safety: number;
}

function parseCsvLine(line: string): string[] {
  return line.split(",").map((s) => s.trim());
}

/** Parse MM/DD/YYYY to YYYY-MM-DD */
function parseReportDate(s: string): string {
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return s;
  const [, m, d, y] = match;
  return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
}

let cached: SkincareScoreRow[] | null = null;

/** Simple hash so mock history is deterministic per brand/model/metric. */
function hashKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Per‑day variation so values clearly change over time. */
function dayVariation(key: string, daysAgo: number, range: number): number {
  const h = hashKey(key);
  const phase = ((h % 100) / 100) * Math.PI * 2;
  const freq = 0.9 + (h % 7) / 4;
  return range * Math.sin(daysAgo * freq + phase);
}

/** Add mock rows for the previous 6 days so each date has clearly different values. */
function addMockHistory(baseRows: SkincareScoreRow[]): SkincareScoreRow[] {
  if (baseRows.length === 0) return baseRows;
  const baseDate = baseRows[0]!.reportDate;
  const [y, m, d] = baseDate.split("-").map(Number);
  const baseTime = new Date(y!, m! - 1, d!).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const out = [...baseRows];

  for (const row of baseRows) {
    const key = `${row.modelMaker}|${row.model}|${row.brand}|${row.metric}`;
    const h = hashKey(key);
    const trendUp = h % 3 === 0;
    const strength = 0.25 + (h % 10) / 30; // how steep the overall trend is
    const isPosition = row.metric === "Average Position";
    const cap = isPosition ? 30 : 100;
    const baseVal = Math.max(1, row.overall);
    const totalChangeOver6Days = trendUp ? baseVal * strength : -baseVal * strength;
    const dailyDelta = totalChangeOver6Days / 6;
    const variationRange = isPosition ? 2.5 : 8 + (h % 10);

    for (let daysAgo = 1; daysAgo <= 6; daysAgo++) {
      const pastDate = new Date(baseTime - daysAgo * oneDay);
      const dateStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(pastDate.getDate()).padStart(2, "0")}`;

      const linear = row.overall - dailyDelta * daysAgo;
      const variation = dayVariation(key, daysAgo, variationRange);
      const daySpread = (daysAgo / 6) * (h % 5) * (isPosition ? 0.5 : 2);
      const overallRaw = linear + variation + (trendUp ? -daySpread : daySpread);
      const overall = Math.max(0, Math.min(cap, overallRaw));

      const segVar = variation * 0.6;
      const seg = (v: number) =>
        Math.max(0, Math.min(100, v - dailyDelta * daysAgo * 0.7 + segVar));

      out.push({
        ...row,
        reportDate: dateStr,
        overall: Math.round(overall * 10) / 10,
        aiBrandIndex: Math.round(seg(row.aiBrandIndex) * 10) / 10,
        price: Math.round(seg(row.price) * 10) / 10,
        brandReputation: Math.round(seg(row.brandReputation) * 10) / 10,
        ingredients: Math.round(seg(row.ingredients) * 10) / 10,
        dermatologistRecommendation:
          Math.round(seg(row.dermatologistRecommendation) * 10) / 10,
        skinTypeCompatibility:
          Math.round(seg(row.skinTypeCompatibility) * 10) / 10,
        effectiveness: Math.round(seg(row.effectiveness) * 10) / 10,
        sustainability: Math.round(seg(row.sustainability) * 10) / 10,
        quality: Math.round(seg(row.quality) * 10) / 10,
        packaging: Math.round(seg(row.packaging) * 10) / 10,
        safety: Math.round(seg(row.safety) * 10) / 10,
      });
    }
  }

  return out;
}

export function getSkincareScores(): SkincareScoreRow[] {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "data", "Skincare_Scores.csv");
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    cached = [];
    return cached;
  }
  const num = (vals: string[], idx: number) => Number(vals[idx]) || 0;
  const rows: SkincareScoreRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    if (values.length < 12) continue;
    rows.push({
      reportDate: parseReportDate(values[0] ?? ""),
      targetBrand: values[1] ?? "",
      modelMaker: values[2] ?? "",
      model: values[3] ?? "",
      brand: values[4] ?? "",
      metric: values[5] as SkincareScoreRow["metric"],
      overall: num(values, 6),
      aiBrandIndex: num(values, 7),
      price: num(values, 8),
      brandReputation: num(values, 9),
      ingredients: num(values, 10),
      dermatologistRecommendation: num(values, 11),
      skinTypeCompatibility: num(values, 12),
      effectiveness: num(values, 13),
      sustainability: num(values, 14),
      quality: num(values, 15),
      packaging: num(values, 16),
      safety: num(values, 17),
    });
  }
  cached = addMockHistory(rows);
  return cached;
}

export function getLatestReportDate(): string {
  const rows = getSkincareScores();
  const dates = [...new Set(rows.map((r) => r.reportDate))].sort();
  return dates[dates.length - 1] ?? "2026-02-15";
}

export function getReportDateDaysAgo(daysAgo: number): string {
  const latest = getLatestReportDate();
  const [y, m, d] = latest.split("-").map(Number);
  const t = new Date(y!, m! - 1, d!);
  t.setDate(t.getDate() - daysAgo);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export function getSkincareScoreBrands(): string[] {
  const rows = getSkincareScores();
  return Array.from(new Set(rows.map((r) => r.brand))).sort();
}

/** Unique brands in the score data. */
export function getUniqueBrands(): string[] {
  const rows = getSkincareScores();
  const seen = new Set<string>();
  for (const r of rows) seen.add(r.brand);
  return Array.from(seen).sort();
}

export function getUniqueModels(): { id: string; label: string }[] {
  const rows = getSkincareScores();
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

export function getTopBrandsByLatestScore(
  metric: SkincareScoreRow["metric"],
  n: number
): string[] {
  const rows = getSkincareScores();
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

const SKINCARE_TOPIC_KEYS: SkincareTopic[] = [
  "overall",
  "aiBrandIndex",
  "price",
  "brandReputation",
  "ingredients",
  "dermatologistRecommendation",
  "skinTypeCompatibility",
  "effectiveness",
  "sustainability",
  "quality",
  "packaging",
  "safety",
];

export function getTimelineData(
  metric: SkincareScoreRow["metric"],
  brandIds: string[],
  modelIds: string[],
  topic: SkincareTopic = "overall"
): { dates: string[]; series: TimelineSeries[] } {
  const rows = getSkincareScores();
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
    const val = r[topic] ?? r.overall;
    const cur = byBrandDate.get(key) ?? { sum: 0, count: 0 };
    cur.sum += val;
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

export interface DimensionTimelineSeries {
  dimension: SkincareTopic;
  label: string;
  data: { date: string; value: number }[];
}

export const SKINCARE_DIM_LABELS: Record<SkincareTopic, string> = {
  overall: "Overall",
  aiBrandIndex: "AI Brand Score",
  price: "Price",
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

export function getDimensionTimelineData(
  metric: SkincareScoreRow["metric"],
  modelId: string,
  brand = "CETAPHIL"
): { dates: string[]; series: DimensionTimelineSeries[] } {
  const rows = getSkincareScores();
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

  const byDateDim = new Map<string, { sum: number; count: number }>();
  for (const r of filtered) {
    for (const dim of SKINCARE_TOPIC_KEYS) {
      const key = `${r.reportDate}|${dim}`;
      const cur = byDateDim.get(key) ?? { sum: 0, count: 0 };
      cur.sum += r[dim] ?? r.overall;
      cur.count += 1;
      byDateDim.set(key, cur);
    }
  }

  const series: DimensionTimelineSeries[] = SKINCARE_TOPIC_KEYS.map((dim) => ({
    dimension: dim,
    label: SKINCARE_DIM_LABELS[dim],
    data: dates.map((date) => {
      const key = `${date}|${dim}`;
      const v = byDateDim.get(key);
      const value = v && v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0;
      return { date, value };
    }),
  }));

  return { dates, series };
}

export const SKINCARE_TABLE_TOPICS: { id: SkincareTopic; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "aiBrandIndex", label: "AI Brand Score" },
  { id: "price", label: "Price" },
  { id: "brandReputation", label: "Brand Reputation" },
  { id: "ingredients", label: "Ingredients" },
  { id: "dermatologistRecommendation", label: "Dermatologist Recommendation" },
  { id: "skinTypeCompatibility", label: "Skin Type Compatibility" },
  { id: "effectiveness", label: "Effectiveness" },
  { id: "sustainability", label: "Sustainability" },
  { id: "quality", label: "Quality" },
  { id: "packaging", label: "Packaging" },
  { id: "safety", label: "Safety" },
];

export interface SkincareResultsTableRow {
  brand: string;
  overall: number;
  aiBrandIndex: number;
  price: number;
  brandReputation: number;
  ingredients: number;
  dermatologistRecommendation: number;
  skinTypeCompatibility: number;
  effectiveness: number;
  sustainability: number;
  quality: number;
  packaging: number;
  safety: number;
  changeOverall: number | null;
  changeAiBrandIndex: number | null;
  changePrice: number | null;
  changeBrandReputation: number | null;
  changeIngredients: number | null;
  changeDermatologistRecommendation: number | null;
  changeSkinTypeCompatibility: number | null;
  changeEffectiveness: number | null;
  changeSustainability: number | null;
  changeQuality: number | null;
  changePackaging: number | null;
  changeSafety: number | null;
}

export function getResultsTableData(
  metric: SkincareScoreRow["metric"],
  brandIds: string[],
  modelIds: string[],
  reportDate?: string
): {
  brands: string[];
  topicColumns: typeof SKINCARE_TABLE_TOPICS;
  rows: SkincareResultsTableRow[];
} {
  const rows = getSkincareScores();
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
    for (const col of SKINCARE_TABLE_TOPICS) {
      const key = `${r.brand}|${col.id}`;
      const cur = map.get(key) ?? { sum: 0, count: 0 };
      const val = r[col.id] ?? r.overall;
      cur.sum += val;
      cur.count += 1;
      map.set(key, cur);
    }
  }

  const resultRows: SkincareResultsTableRow[] = brandIds
    .filter((b) => brandSet.has(b))
    .map((brand) => {
      const row: SkincareResultsTableRow = {
        brand,
        overall: 0,
        aiBrandIndex: 0,
        price: 0,
        brandReputation: 0,
        ingredients: 0,
        dermatologistRecommendation: 0,
        skinTypeCompatibility: 0,
        effectiveness: 0,
        sustainability: 0,
        quality: 0,
        packaging: 0,
        safety: 0,
        changeOverall: null,
        changeAiBrandIndex: null,
        changePrice: null,
        changeBrandReputation: null,
        changeIngredients: null,
        changeDermatologistRecommendation: null,
        changeSkinTypeCompatibility: null,
        changeEffectiveness: null,
        changeSustainability: null,
        changeQuality: null,
        changePackaging: null,
        changeSafety: null,
      };
      for (const col of SKINCARE_TABLE_TOPICS) {
        const key = `${brand}|${col.id}`;
        const v = byBrandTopic.get(key);
        const currentVal = v && v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0;
        row[col.id] = currentVal;
        const prevV = prevByBrandTopic.get(key);
        if (prevV && prevV.count > 0) {
          const prevVal = Math.round((prevV.sum / prevV.count) * 10) / 10;
          const changeKey = `change${col.id.charAt(0).toUpperCase()}${col.id.slice(1)}` as keyof SkincareResultsTableRow;
          (row as unknown as Record<string, number | null>)[changeKey] = Math.round((currentVal - prevVal) * 10) / 10;
        }
      }
      return row;
    });

  return {
    brands: resultRows.map((r) => r.brand),
    topicColumns: SKINCARE_TABLE_TOPICS,
    rows: resultRows,
  };
}

export type SkincareGaugeDimensions = Record<SkincareTopic, number>;

function getDimensionsForRows(
  rows: SkincareScoreRow[],
  metric: SkincareScoreRow["metric"]
): SkincareGaugeDimensions {
  const filtered = rows.filter((r) => r.metric === metric);
  const zero: SkincareGaugeDimensions = {
    overall: 0,
    aiBrandIndex: 0,
    price: 0,
    brandReputation: 0,
    ingredients: 0,
    dermatologistRecommendation: 0,
    skinTypeCompatibility: 0,
    effectiveness: 0,
    sustainability: 0,
    quality: 0,
    packaging: 0,
    safety: 0,
  };
  if (filtered.length === 0) return zero;
  const sum = { ...zero };
  for (const r of filtered) {
    for (const k of SKINCARE_TOPIC_KEYS) {
      sum[k] += r[k] ?? r.overall;
    }
  }
  const n = filtered.length;
  const out = { ...zero };
  for (const k of SKINCARE_TOPIC_KEYS) {
    out[k] = Math.round((sum[k] / n) * 10) / 10;
  }
  return out;
}

export function getGaugeDimensionsForModelWithChange(
  metric: SkincareScoreRow["metric"],
  modelId: string,
  brand = "CETAPHIL"
): Record<string, number> {
  const all = getSkincareScores();
  const latest = getLatestReportDate();
  const weekAgo = getReportDateDaysAgo(6);
  const rowsLatest = all.filter(
    (r) =>
      r.brand === brand &&
      r.reportDate === latest &&
      (modelId === "__average__" || `${r.modelMaker}|${r.model}` === modelId)
  );
  const rowsWeekAgo = all.filter(
    (r) =>
      r.brand === brand &&
      r.reportDate === weekAgo &&
      (modelId === "__average__" || `${r.modelMaker}|${r.model}` === modelId)
  );
  const current = getDimensionsForRows(rowsLatest, metric);
  const previous = getDimensionsForRows(rowsWeekAgo, metric);
  const round = (x: number) => Math.round(x * 10) / 10;
  const result: Record<string, number> = { ...current };
  for (const k of SKINCARE_TOPIC_KEYS) {
    const changeKey = `change${k.charAt(0).toUpperCase()}${k.slice(1)}`;
    result[changeKey] = round(current[k] - previous[k]);
  }
  return result;
}

export const SKINCARE_GAUGE_DIMENSION_KEYS = SKINCARE_TOPIC_KEYS;
