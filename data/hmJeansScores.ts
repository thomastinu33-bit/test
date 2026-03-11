import { readFileSync } from "fs";
import path from "path";

export type HmJeansTopic = "overall";

export interface HmJeansScoreRow {
  reportDate: string;
  targetBrand: string;
  modelMaker: string;
  model: string;
  brand: string;
  metric: "AI Brand Score" | "Visibility Score" | "Average Position";
  overall: number;
}

export const HM_JEANS_TOPIC_KEYS: HmJeansTopic[] = ["overall"];

export const HM_JEANS_DIM_LABELS: Record<HmJeansTopic, string> = {
  overall: "Overall",
};

export const HM_JEANS_GAUGE_DIMENSION_KEYS = HM_JEANS_TOPIC_KEYS;

// Model ID → display label overrides (to clean up "Maker Model" combinations)
const LABEL_OVERRIDES: Record<string, string> = {
  "ChatGPT|GPT 4.1": "ChatGPT",
  "ChatGPT|GPT 5": "ChatGPT",
  "OpenAI|ChatGPT": "ChatGPT",
  "OpenAI Web|ChatGPT Search": "ChatGPT Search",
  "Perplexity Web|Perplexity": "Perplexity",
  "Perplexity|Perplexity": "Perplexity",
  "Claude|Claude Haiku 4.5": "Claude",
  "Anthropic|Claude": "Claude",
  "DeepSeek|Deep Seek v3.1": "DeepSeek",
  "Gemini|Gemini 2.5": "Gemini",
  "Google|Gemini": "Gemini",
  "Meta AI|Llama 4": "Meta AI",
  "Meta|Llama": "Meta AI",
};

function parseCsvLine(line: string): string[] {
  return line.split(",").map((s) => s.trim());
}

function parseReportDate(s: string): string {
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return s;
  const [, m, d, y] = match;
  return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
}

function hashKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function dayVariation(key: string, daysAgo: number, range: number): number {
  const h = hashKey(key);
  const phase = ((h % 100) / 100) * Math.PI * 2;
  const freq = 0.9 + (h % 7) / 4;
  return range * Math.sin(daysAgo * freq + phase);
}

function addMockHistory(baseRows: HmJeansScoreRow[]): HmJeansScoreRow[] {
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
    const strength = 0.25 + (h % 10) / 30;
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

      out.push({
        ...row,
        reportDate: dateStr,
        overall: Math.round(overall * 10) / 10,
      });
    }
  }

  return out;
}

let cached: HmJeansScoreRow[] | null = null;

export function getHmJeansScores(): HmJeansScoreRow[] {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "data", "HM_Jeans_Scores.csv");
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    cached = [];
    return cached;
  }
  const num = (vals: string[], idx: number) => Number(vals[idx]) || 0;
  const rows: HmJeansScoreRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    if (values.length < 9) continue;
    rows.push({
      reportDate: parseReportDate(values[0] ?? ""),
      targetBrand: values[1] ?? "",
      modelMaker: values[4] ?? "",
      model: values[5] ?? "",
      brand: values[6] ?? "",
      metric: values[7] as HmJeansScoreRow["metric"],
      overall: num(values, 8),
    });
  }
  cached = addMockHistory(rows);
  return cached;
}

export function getLatestReportDate(): string {
  const rows = getHmJeansScores();
  const dates = [...new Set(rows.map((r) => r.reportDate))].sort();
  return dates[dates.length - 1] ?? "2026-03-04";
}

export function getReportDateDaysAgo(daysAgo: number): string {
  const latest = getLatestReportDate();
  const [y, m, d] = latest.split("-").map(Number);
  const t = new Date(y!, m! - 1, d!);
  t.setDate(t.getDate() - daysAgo);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export function getUniqueBrands(): string[] {
  const rows = getHmJeansScores();
  const seen = new Set<string>();
  for (const r of rows) seen.add(r.brand);
  return Array.from(seen).sort();
}

export function getUniqueModels(): { id: string; label: string }[] {
  const rows = getHmJeansScores();
  const seen = new Set<string>();
  const labelToIds = new Map<string, Set<string>>();
  const list: { id: string; label: string }[] = [];

  for (const r of rows) {
    const id = `${r.modelMaker}|${r.model}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const label =
      LABEL_OVERRIDES[id] ??
      (r.modelMaker === r.model ? r.model : `${r.modelMaker} ${r.model}`);

    if (!labelToIds.has(label)) {
      labelToIds.set(label, new Set());
      list.push({ id: label, label });
    }
    labelToIds.get(label)!.add(id);
  }
  return list.sort((a, b) => a.label.localeCompare(b.label));
}

/** Map consolidated label to all original model IDs. */
export function getOriginalModelIds(label: string): string[] {
  const rows = getHmJeansScores();
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const r of rows) {
    const id = `${r.modelMaker}|${r.model}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const rowLabel =
      LABEL_OVERRIDES[id] ??
      (r.modelMaker === r.model ? r.model : `${r.modelMaker} ${r.model}`);

    if (rowLabel === label) {
      ids.push(id);
    }
  }
  return ids;
}

function getDimensionsForRows(
  rows: HmJeansScoreRow[],
  metric: HmJeansScoreRow["metric"]
): Record<HmJeansTopic, number> {
  const filtered = rows.filter((r) => r.metric === metric);
  const zero = { overall: 0 } as Record<HmJeansTopic, number>;
  if (filtered.length === 0) return zero;
  let sum = 0;
  for (const r of filtered) sum += r.overall;
  return { overall: Math.round((sum / filtered.length) * 10) / 10 };
}

export function getGaugeDimensionsForModelWithChange(
  metric: HmJeansScoreRow["metric"],
  modelId: string,
  brand = "H&M"
): Record<string, number> {
  const all = getHmJeansScores();
  const latest = getLatestReportDate();
  const weekAgo = getReportDateDaysAgo(6);

  // Handle consolidated models - fetch all original IDs
  const originalIds = modelId === "__average__" ? [] : getOriginalModelIds(modelId);

  if (originalIds.length > 0) {
    // Aggregate data from all original model IDs
    const currentScores = originalIds.map((id) => {
      const rows = all.filter((r) => r.brand === brand && r.reportDate === latest && `${r.modelMaker}|${r.model}` === id);
      return getDimensionsForRows(rows, metric);
    });
    const previousScores = originalIds.map((id) => {
      const rows = all.filter((r) => r.brand === brand && r.reportDate === weekAgo && `${r.modelMaker}|${r.model}` === id);
      return getDimensionsForRows(rows, metric);
    });

    // Average the scores
    const current = { overall: 0 } as Record<HmJeansTopic, number>;
    for (const score of currentScores) {
      current.overall += score.overall;
    }
    current.overall = currentScores.length > 0 ? current.overall / currentScores.length : 0;

    const previous = { overall: 0 } as Record<HmJeansTopic, number>;
    for (const score of previousScores) {
      previous.overall += score.overall;
    }
    previous.overall = previousScores.length > 0 ? previous.overall / previousScores.length : 0;

    const round = (x: number) => Math.round(x * 10) / 10;
    const result: Record<string, number> = { ...current };
    for (const k of HM_JEANS_TOPIC_KEYS) {
      const changeKey = `change${k.charAt(0).toUpperCase()}${k.slice(1)}`;
      result[changeKey] = round(current[k] - previous[k]);
    }
    return result;
  }

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
  for (const k of HM_JEANS_TOPIC_KEYS) {
    const changeKey = `change${k.charAt(0).toUpperCase()}${k.slice(1)}`;
    result[changeKey] = round(current[k] - previous[k]);
  }
  return result;
}

export function getHmJeansScoreBrands(): string[] {
  const rows = getHmJeansScores();
  return Array.from(new Set(rows.map((r) => r.brand))).sort();
}

export function getTopBrandsByLatestScore(
  metric: HmJeansScoreRow["metric"],
  n: number
): string[] {
  const rows = getHmJeansScores();
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

export const HM_JEANS_TABLE_TOPICS: { id: HmJeansTopic; label: string }[] = HM_JEANS_TOPIC_KEYS.map((id) => ({
  id,
  label: HM_JEANS_DIM_LABELS[id],
}));

export function getResultsTableData(
  metric: HmJeansScoreRow["metric"],
  brandIds: string[],
  modelIds: string[]
): {
  brands: string[];
  topicColumns: typeof HM_JEANS_TABLE_TOPICS;
  rows: Record<string, unknown>[];
} {
  const rows = getHmJeansScores();
  const date = getLatestReportDate();
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
    for (const col of HM_JEANS_TABLE_TOPICS) {
      const key = `${r.brand}|${col.id}`;
      const cur = map.get(key) ?? { sum: 0, count: 0 };
      cur.sum += r[col.id] ?? r.overall;
      cur.count += 1;
      map.set(key, cur);
    }
  }

  const resultRows: Record<string, unknown>[] = brandIds
    .filter((b) => brandSet.has(b))
    .map((brand) => {
      const row: Record<string, unknown> = { brand };
      for (const col of HM_JEANS_TABLE_TOPICS) {
        const key = `${brand}|${col.id}`;
        const v = byBrandTopic.get(key);
        const currentVal = v && v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0;
        row[col.id] = currentVal;
        const prevV = prevByBrandTopic.get(key);
        if (prevV && prevV.count > 0) {
          const prevVal = Math.round((prevV.sum / prevV.count) * 10) / 10;
          const changeKey = `change${col.id.charAt(0).toUpperCase()}${col.id.slice(1)}`;
          row[changeKey] = Math.round((currentVal - prevVal) * 10) / 10;
        }
      }
      return row;
    });

  return { brands: resultRows.map((r) => r.brand as string), topicColumns: HM_JEANS_TABLE_TOPICS, rows: resultRows };
}

export interface HmJeansTopicModelScores {
  topics: { id: HmJeansTopic; label: string }[];
  models: { id: string; label: string; values: number[]; changes?: number[] }[];
  averages: number[];
  averageChanges?: number[];
}

export function getTopicModelScores(
  metric: HmJeansScoreRow["metric"],
  brand = "H&M"
): HmJeansTopicModelScores {
  const models = getUniqueModels();
  const topicIds = HM_JEANS_TOPIC_KEYS;
  const modelData = models.map((m) => {
    const dims = getGaugeDimensionsForModelWithChange(metric, m.id, brand);
    const values = topicIds.map((id) => (dims[id] as number) ?? 0);
    const changes = topicIds.map((id) => {
      const key = `change${id.charAt(0).toUpperCase()}${id.slice(1)}`;
      return (dims[key] as number) ?? 0;
    });
    return { id: m.id, label: m.label, values, changes };
  });
  const averages = topicIds.map((_, ti) => {
    const sum = modelData.reduce((s, m) => s + (m.values[ti] ?? 0), 0);
    return modelData.length > 0 ? Math.round((sum / modelData.length) * 10) / 10 : 0;
  });
  const averageChanges = topicIds.map((_, ti) => {
    const sum = modelData.reduce((s, m) => s + (m.changes?.[ti] ?? 0), 0);
    return modelData.length > 0 ? Math.round((sum / modelData.length) * 10) / 10 : 0;
  });
  return {
    topics: HM_JEANS_TABLE_TOPICS,
    models: modelData,
    averages,
    averageChanges,
  };
}

export function getTimelineData(
  metric: HmJeansScoreRow["metric"],
  brandIds: string[],
  modelIds: string[],
  topic: HmJeansTopic = "overall"
): { dates: string[]; series: { brand: string; data: { date: string; value: number }[] }[] } {
  const rows = getHmJeansScores();
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
  const series = brandIds
    .filter((b) => brandSet.has(b))
    .map((brand) => ({
      brand,
      data: dates.map((date) => {
        const key = `${brand}|${date}`;
        const v = byBrandDate.get(key);
        return { date, value: v && v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0 };
      }),
    }));

  return { dates, series };
}

export function getDimensionTimelineData(
  metric: HmJeansScoreRow["metric"],
  modelId: string,
  brand = "H&M"
): { dates: string[]; series: { dimension: string; label: string; data: { date: string; value: number }[] }[] } {
  const rows = getHmJeansScores();
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
    for (const dim of HM_JEANS_TOPIC_KEYS) {
      const key = `${r.reportDate}|${dim}`;
      const cur = byDateDim.get(key) ?? { sum: 0, count: 0 };
      cur.sum += r[dim] ?? r.overall;
      cur.count += 1;
      byDateDim.set(key, cur);
    }
  }

  const series = HM_JEANS_TOPIC_KEYS.map((dim) => ({
    dimension: dim,
    label: HM_JEANS_DIM_LABELS[dim],
    data: dates.map((date) => {
      const key = `${date}|${dim}`;
      const v = byDateDim.get(key);
      const value = v && v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0;
      return { date, value };
    }),
  }));

  return { dates, series };
}
