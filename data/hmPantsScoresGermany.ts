export type HmPantsTopic =
  | "overall"
  | "jeans"
  | "lowRiseJeans"
  | "highWaistedJeans"
  | "midRiseJeans"
  | "bootcutJeans"
  | "highWaistedPants"
  | "wideLegPants"
  | "sweatpantsJoggers"
  | "dressPants"
  | "chinosSlacks"
  | "cargoPants"
  | "linenPants";

export interface HmPantsScoreRow {
  reportDate: string;
  targetBrand: string;
  modelMaker: string;
  model: string;
  brand: string;
  metric: "AI Brand Score" | "Visibility Score" | "Average Position";
  overall: number;
  jeans: number;
  lowRiseJeans: number;
  highWaistedJeans: number;
  midRiseJeans: number;
  bootcutJeans: number;
  highWaistedPants: number;
  wideLegPants: number;
  sweatpantsJoggers: number;
  dressPants: number;
  chinosSlacks: number;
  cargoPants: number;
  linenPants: number;
}

export const HM_PANTS_TOPIC_KEYS: HmPantsTopic[] = [
  "overall",
  "jeans",
  "lowRiseJeans",
  "highWaistedJeans",
  "midRiseJeans",
  "bootcutJeans",
  "highWaistedPants",
  "wideLegPants",
  "sweatpantsJoggers",
  "dressPants",
  "chinosSlacks",
  "cargoPants",
  "linenPants",
];

export const HM_PANTS_DIM_LABELS: Record<HmPantsTopic, string> = {
  overall: "Overall",
  jeans: "Jeans",
  lowRiseJeans: "Low Rise Jeans",
  highWaistedJeans: "High Waisted Jeans",
  midRiseJeans: "Mid Rise Jeans",
  bootcutJeans: "Bootcut Jeans",
  highWaistedPants: "High Waisted Pants",
  wideLegPants: "Wide Leg Pants",
  sweatpantsJoggers: "Sweatpants & Joggers",
  dressPants: "Dress Pants",
  chinosSlacks: "Chinos & Slacks",
  cargoPants: "Cargo Pants",
  linenPants: "Linen Pants",
};

export const HM_PANTS_GAUGE_DIMENSION_KEYS = HM_PANTS_TOPIC_KEYS;

// Model ID → display label overrides (to clean up "Maker Model" combinations)
const LABEL_OVERRIDES: Record<string, string> = {
  "OpenAI|ChatGPT": "ChatGPT",
  "Google|Gemini": "Gemini",
  "Anthropic|Claude": "Claude",
  "Meta|Llama": "Meta AI",
  "Perplexity|Perplexity": "Perplexity",
};

const BRANDS = ["H&M", "Zalando", "C&A", "Esprit", "Tom Tailor", "Jack & Jones", "Peek & Cloppenburg"];
const MODELS = [
  { maker: "OpenAI", model: "ChatGPT" },
  { maker: "Google", model: "Gemini" },
  { maker: "Anthropic", model: "Claude" },
  { maker: "Meta", model: "Llama" },
  { maker: "Perplexity", model: "Perplexity" },
];

function generateMockData(): HmPantsScoreRow[] {
  const rows: HmPantsScoreRow[] = [];
  const today = new Date("2026-03-07");
  const baseFactor = 1.05; // Germany scores ~5% higher

  for (let daysAgo = 0; daysAgo <= 6; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    for (const brand of BRANDS) {
      for (const model of MODELS) {
        for (const metric of ["AI Brand Score", "Visibility Score", "Average Position"] as const) {
          const baseScore = Math.random() * 100;
          const scoreAdjusted = metric === "Average Position"
            ? Math.random() * 10
            : Math.min(100, baseScore * baseFactor);

          rows.push({
            reportDate: dateStr,
            targetBrand: "H&M",
            modelMaker: model.maker,
            model: model.model,
            brand,
            metric,
            overall: Math.round(scoreAdjusted * 10) / 10,
            jeans: Math.round(scoreAdjusted * 0.98 * 10) / 10,
            lowRiseJeans: Math.round(scoreAdjusted * 0.96 * 10) / 10,
            highWaistedJeans: Math.round(scoreAdjusted * 1.02 * 10) / 10,
            midRiseJeans: Math.round(scoreAdjusted * 0.99 * 10) / 10,
            bootcutJeans: Math.round(scoreAdjusted * 0.97 * 10) / 10,
            highWaistedPants: Math.round(scoreAdjusted * 1.01 * 10) / 10,
            wideLegPants: Math.round(scoreAdjusted * 0.95 * 10) / 10,
            sweatpantsJoggers: Math.round(scoreAdjusted * 1.03 * 10) / 10,
            dressPants: Math.round(scoreAdjusted * 0.94 * 10) / 10,
            chinosSlacks: Math.round(scoreAdjusted * 0.98 * 10) / 10,
            cargoPants: Math.round(scoreAdjusted * 0.92 * 10) / 10,
            linenPants: Math.round(scoreAdjusted * 0.96 * 10) / 10,
          });
        }
      }
    }
  }

  return rows;
}

let cached: HmPantsScoreRow[] | null = null;

export function getHmPantsScoresGermany(): HmPantsScoreRow[] {
  if (cached) return cached;
  cached = generateMockData();
  return cached;
}

export function getLatestReportDate(): string {
  return "2026-03-07";
}

export function getReportDateDaysAgo(daysAgo: number): string {
  const t = new Date("2026-03-07");
  t.setDate(t.getDate() - daysAgo);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export function getUniqueBrands(): string[] {
  return BRANDS;
}

export function getUniqueModels(): { id: string; label: string }[] {
  const seen = new Set<string>();
  const labelToIds = new Map<string, Set<string>>();
  const list: { id: string; label: string }[] = [];

  for (const m of MODELS) {
    const id = `${m.maker}|${m.model}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const label = LABEL_OVERRIDES[id] ?? m.model;

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
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const m of MODELS) {
    const id = `${m.maker}|${m.model}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const rowLabel = LABEL_OVERRIDES[id] ?? m.model;

    if (rowLabel === label) {
      ids.push(id);
    }
  }
  return ids;
}

function getDimensionsForRows(
  rows: HmPantsScoreRow[],
  metric: HmPantsScoreRow["metric"]
): Record<HmPantsTopic, number> {
  const filtered = rows.filter((r) => r.metric === metric);
  const zero = Object.fromEntries(HM_PANTS_TOPIC_KEYS.map((k) => [k, 0])) as Record<HmPantsTopic, number>;
  if (filtered.length === 0) return zero;
  const sum = { ...zero };
  for (const r of filtered) {
    for (const k of HM_PANTS_TOPIC_KEYS) {
      sum[k] += r[k] ?? r.overall;
    }
  }
  const n = filtered.length;
  const out = { ...zero };
  for (const k of HM_PANTS_TOPIC_KEYS) {
    out[k] = Math.round((sum[k] / n) * 10) / 10;
  }
  return out;
}

export function getGaugeDimensionsForBrand(
  brand: string,
  model: string,
  metric: "AI Brand Score" | "Visibility Score" | "Average Position"
): Record<HmPantsTopic, number> {
  const rows = getHmPantsScoresGermany();
  const [maker, modelName] = model.split("|");
  const filtered = rows.filter(
    (r) =>
      r.brand === brand &&
      r.modelMaker === maker &&
      r.model === modelName &&
      r.metric === metric
  );
  return getDimensionsForRows(filtered, metric);
}

export function getTopBrandsByLatestScore(
  metric: "AI Brand Score" | "Visibility Score" | "Average Position",
  limit: number = 10
): Array<{ brand: string; score: number }> {
  const rows = getHmPantsScoresGermany();
  const latestDate = "2026-03-07";
  const latest = rows.filter((r) => r.reportDate === latestDate && r.metric === metric);
  const byBrand = new Map<string, number[]>();
  for (const r of latest) {
    if (!byBrand.has(r.brand)) byBrand.set(r.brand, []);
    byBrand.get(r.brand)!.push(r.overall);
  }
  const out: Array<{ brand: string; score: number }> = [];
  for (const [brand, scores] of byBrand) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    out.push({ brand, score: Math.round(avg * 10) / 10 });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getResultsTableData(metric: "AI Brand Score" | "Visibility Score" | "Average Position") {
  const rows = getHmPantsScoresGermany();
  const latestDate = "2026-03-07";
  const latest = rows.filter((r) => r.reportDate === latestDate && r.metric === metric);
  return latest;
}

export function getTimelineData(
  metric: "AI Brand Score" | "Visibility Score" | "Average Position",
  brand?: string
) {
  const rows = getHmPantsScoresGermany();
  const dates = [...new Set(rows.map((r) => r.reportDate))].sort();
  const filtered = brand ? rows.filter((r) => r.brand === brand && r.metric === metric) : rows.filter((r) => r.metric === metric);
  const byDate = new Map<string, number[]>();
  for (const r of filtered) {
    if (!byDate.has(r.reportDate)) byDate.set(r.reportDate, []);
    byDate.get(r.reportDate)!.push(r.overall);
  }
  const avgByDate = dates.map((d) => {
    const vals = byDate.get(d) || [];
    return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b) / vals.length) * 10) / 10 : 0;
  });
  return { dates, series: [{ name: brand || "Average", data: avgByDate }] };
}

export function getDimensionTimelineData(
  dimension: HmPantsTopic,
  metric: "AI Brand Score" | "Visibility Score" | "Average Position"
) {
  const rows = getHmPantsScoresGermany();
  const dates = [...new Set(rows.map((r) => r.reportDate))].sort();
  const filtered = rows.filter((r) => r.metric === metric);
  const byDate = new Map<string, number[]>();
  for (const r of filtered) {
    if (!byDate.has(r.reportDate)) byDate.set(r.reportDate, []);
    byDate.get(r.reportDate)!.push(r[dimension] ?? 0);
  }
  const avgByDate = dates.map((d) => {
    const vals = byDate.get(d) || [];
    return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b) / vals.length) * 10) / 10 : 0;
  });
  return { dates, series: [{ name: HM_PANTS_DIM_LABELS[dimension], data: avgByDate }] };
}

export function getGaugeDimensionsForModelWithChange(
  model: string,
  metric: "AI Brand Score" | "Visibility Score" | "Average Position"
): {
  dimensions: Record<HmPantsTopic, number>;
  changeDimensions: Record<HmPantsTopic, number>;
} {
  const rows = getHmPantsScoresGermany();
  const originalIds = model === "__average__" ? [] : getOriginalModelIds(model);

  if (originalIds.length > 0) {
    // Aggregate data from all original model IDs
    const latestScores = originalIds.map((id) => {
      const [maker, modelName] = id.split("|");
      const modelRows = rows.filter((r) => r.modelMaker === maker && r.model === modelName && r.metric === metric);
      const sorted = modelRows.sort((a, b) => b.reportDate.localeCompare(a.reportDate));
      return getDimensionsForRows(sorted.slice(0, 1), metric);
    });
    const prevScores = originalIds.map((id) => {
      const [maker, modelName] = id.split("|");
      const modelRows = rows.filter((r) => r.modelMaker === maker && r.model === modelName && r.metric === metric);
      const sorted = modelRows.sort((a, b) => b.reportDate.localeCompare(a.reportDate));
      return getDimensionsForRows(sorted.slice(1, 8), metric);
    });

    // Average the scores across all dimensions
    const latestDims = Object.fromEntries(HM_PANTS_TOPIC_KEYS.map((k) => [k, 0])) as Record<HmPantsTopic, number>;
    for (const score of latestScores) {
      for (const k of HM_PANTS_TOPIC_KEYS) {
        latestDims[k] += score[k];
      }
    }
    for (const k of HM_PANTS_TOPIC_KEYS) {
      latestDims[k] = latestScores.length > 0 ? latestDims[k] / latestScores.length : 0;
    }

    const prevDims = Object.fromEntries(HM_PANTS_TOPIC_KEYS.map((k) => [k, 0])) as Record<HmPantsTopic, number>;
    for (const score of prevScores) {
      for (const k of HM_PANTS_TOPIC_KEYS) {
        prevDims[k] += score[k];
      }
    }
    for (const k of HM_PANTS_TOPIC_KEYS) {
      prevDims[k] = prevScores.length > 0 ? prevDims[k] / prevScores.length : 0;
    }

    const changeDims = { ...latestDims };
    for (const k of HM_PANTS_TOPIC_KEYS) {
      changeDims[k] = Math.round((latestDims[k] - prevDims[k]) * 10) / 10;
    }
    return { dimensions: latestDims, changeDimensions: changeDims };
  }

  // For "__average__" model
  const latestAll = rows.filter((r) => r.metric === metric);
  const latestDims = getDimensionsForRows(latestAll, metric);
  const prevAll = rows.filter((r) => r.metric === metric);
  const prevDims = getDimensionsForRows(prevAll, metric);
  const changeDims = { ...latestDims };
  for (const k of HM_PANTS_TOPIC_KEYS) {
    changeDims[k] = Math.round((latestDims[k] - prevDims[k]) * 10) / 10;
  }
  return { dimensions: latestDims, changeDimensions: changeDims };
}

export function getTopicModelScores(
  topic: HmPantsTopic,
  metric: "AI Brand Score" | "Visibility Score" | "Average Position",
  limit: number = 10
): Array<{ model: string; score: number }> {
  const rows = getHmPantsScoresGermany();
  const latestDate = "2026-03-07";
  const latest = rows.filter((r) => r.reportDate === latestDate && r.metric === metric);
  const byModel = new Map<string, number[]>();
  for (const r of latest) {
    const modelId = `${r.modelMaker}|${r.model}`;
    if (!byModel.has(modelId)) byModel.set(modelId, []);
    byModel.get(modelId)!.push(r[topic] ?? 0);
  }
  const out: Array<{ model: string; score: number }> = [];
  for (const [model, scores] of byModel) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    out.push({ model, score: Math.round(avg * 10) / 10 });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getHmPantsBrands(): string[] {
  return getUniqueBrands();
}
