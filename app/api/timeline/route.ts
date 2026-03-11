import {
  getTimelineData,
  getDimensionTimelineData,
  getResultsTableData,
  getTopBrandsByLatestScore,
  getUniqueModels,
  getPorscheScoreBrands,
  getTopicModelScores,
  RESULTS_TABLE_TOPICS as PORSCHE_TOPIC_COLUMNS,
} from "@/data/porscheScores";
import type { PorscheScoreRow, TimelineTopic } from "@/data/porscheScores";
import {
  getTimelineData as getSkincareTimelineData,
  getDimensionTimelineData as getSkincareDimensionTimelineData,
  getResultsTableData as getSkincareResultsTableData,
  getTopBrandsByLatestScore as getSkincareTopBrands,
  getUniqueModels as getSkincareModels,
  getSkincareScoreBrands,
  SKINCARE_TABLE_TOPICS as SKINCARE_TOPIC_COLUMNS,
  type SkincareScoreRow,
  type SkincareTopic,
} from "@/data/skincareScores";
import {
  getTimelineData as getHmPantsTimelineData,
  getDimensionTimelineData as getHmPantsDimensionTimelineData,
  getResultsTableData as getHmPantsResultsTableData,
  getTopBrandsByLatestScore as getHmPantsTopBrands,
  getUniqueModels as getHmPantsModels,
  getTopicModelScores as getHmPantsTopicModelScores,
  getHmPantsScoreBrands,
  HM_PANTS_TABLE_TOPICS as HM_PANTS_TOPIC_COLUMNS,
  HM_PANTS_TOPIC_KEYS,
  type HmPantsTopic,
  type HmPantsScoreRow,
} from "@/data/hmPantsScores";
import {
  getTimelineData as getHmHeatmapTimelineData,
  getDimensionTimelineData as getHmHeatmapDimensionTimelineData,
  getResultsTableData as getHmHeatmapResultsTableData,
  getTopBrandsByLatestScore as getHmHeatmapTopBrands,
  getUniqueModels as getHmHeatmapModels,
  getTopicModelScores as getHmHeatmapTopicModelScores,
  getHmHeatmapScoreBrands,
  HM_HEATMAP_TABLE_TOPICS as HM_HEATMAP_TOPIC_COLUMNS,
  HM_HEATMAP_TOPIC_KEYS,
  type HmHeatmapTopic,
  type HmHeatmapScoreRow,
} from "@/data/hmHeatmapScores";
import {
  getTimelineData as getHmJeansTimelineData,
  getDimensionTimelineData as getHmJeansDimensionTimelineData,
  getResultsTableData as getHmJeansResultsTableData,
  getTopBrandsByLatestScore as getHmJeansTopBrands,
  getUniqueModels as getHmJeansModels,
  getTopicModelScores as getHmJeansTopicModelScores,
  getHmJeansScoreBrands,
  HM_JEANS_TABLE_TOPICS as HM_JEANS_TOPIC_COLUMNS,
  HM_JEANS_TOPIC_KEYS,
  type HmJeansTopic,
  type HmJeansScoreRow,
} from "@/data/hmJeansScores";
import {
  getTimelineData as getHmPantsUKTimelineData,
  getDimensionTimelineData as getHmPantsUKDimensionTimelineData,
  getResultsTableData as getHmPantsUKResultsTableData,
  getTopBrandsByLatestScore as getHmPantsUKTopBrands,
  getUniqueModels as getHmPantsUKModels,
  getTopicModelScores as getHmPantsUKTopicModelScores,
  HM_PANTS_TOPIC_KEYS as HM_PANTS_UK_TOPIC_KEYS,
} from "@/data/hmPantsScoresUK";
import {
  getTimelineData as getHmPantsGermanyTimelineData,
  getDimensionTimelineData as getHmPantsGermanyDimensionTimelineData,
  getResultsTableData as getHmPantsGermanyResultsTableData,
  getTopBrandsByLatestScore as getHmPantsGermanyTopBrands,
  getUniqueModels as getHmPantsGermanyModels,
  getTopicModelScores as getHmPantsGermanyTopicModelScores,
  HM_PANTS_TOPIC_KEYS as HM_PANTS_GERMANY_TOPIC_KEYS,
} from "@/data/hmPantsScoresGermany";
import {
  getTimelineData as getHmHeatmapUKTimelineData,
  getDimensionTimelineData as getHmHeatmapUKDimensionTimelineData,
  getResultsTableData as getHmHeatmapUKResultsTableData,
  getTopBrandsByLatestScore as getHmHeatmapUKTopBrands,
  getUniqueModels as getHmHeatmapUKModels,
  getTopicModelScores as getHmHeatmapUKTopicModelScores,
  HM_HEATMAP_TOPIC_KEYS as HM_HEATMAP_UK_TOPIC_KEYS,
} from "@/data/hmHeatmapScoresUK";
import {
  getTimelineData as getHmHeatmapGermanyTimelineData,
  getDimensionTimelineData as getHmHeatmapGermanyDimensionTimelineData,
  getResultsTableData as getHmHeatmapGermanyResultsTableData,
  getTopBrandsByLatestScore as getHmHeatmapGermanyTopBrands,
  getUniqueModels as getHmHeatmapGermanyModels,
  getTopicModelScores as getHmHeatmapGermanyTopicModelScores,
  HM_HEATMAP_TOPIC_KEYS as HM_HEATMAP_GERMANY_TOPIC_KEYS,
} from "@/data/hmHeatmapScoresGermany";
import { NextResponse } from "next/server";

const DEFAULT_METRIC = "AI Brand Score" as const;
type Metric = "AI Brand Score" | "Visibility Score" | "Average Position";

const PORSCHE_TOPICS: TimelineTopic[] = [
  "overall",
  "topOfMind",
  "perception",
  "media",
  "process",
  "product",
  "price",
];

const SKINCARE_TOPICS: SkincareTopic[] = [
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

function isSkincareTracker(brandId: string, trackerId: string): boolean {
  return brandId === "cetaphil" && trackerId === "skincare";
}

function isHmPantsTracker(brandId: string, trackerId: string): boolean {
  return brandId === "hm" && trackerId === "pants";
}

function isHmHeatmapTracker(brandId: string, trackerId: string): boolean {
  return brandId === "hm" && trackerId === "heatmap";
}

function isHmJeansTracker(brandId: string, trackerId: string): boolean {
  return brandId === "hm" && trackerId === "jeans";
}

function isHmPantsUKTracker(brandId: string, trackerId: string): boolean {
  return brandId === "hm" && trackerId === "pants-uk";
}

function isHmPantsGermanyTracker(brandId: string, trackerId: string): boolean {
  return brandId === "hm" && trackerId === "pants-germany";
}

function isHmHeatmapUKTracker(brandId: string, trackerId: string): boolean {
  return brandId === "hm" && trackerId === "heatmap-uk";
}

function isHmHeatmapGermanyTracker(brandId: string, trackerId: string): boolean {
  return brandId === "hm" && trackerId === "heatmap-germany";
}

function parsePorscheTopic(t: string | null): TimelineTopic {
  if (t && PORSCHE_TOPICS.includes(t as TimelineTopic)) return t as TimelineTopic;
  return "overall";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId") ?? "porsche";
  const trackerId = searchParams.get("trackerId") ?? "luxury-suvs";
  const metricParam = searchParams.get("metric");
  const metric = (metricParam as Metric) ?? DEFAULT_METRIC;
  const brandsParam = searchParams.get("brands");
  const modelsParam = searchParams.get("models");
  const topicParam = searchParams.get("topic");
  const dateParam = searchParams.get("date");
  const compareToDateParam = searchParams.get("compareToDate");
  const isLuxurySuv = brandId === "porsche" && (trackerId === "luxury-suvs" || trackerId === "luxury-suvs-v2");
  const reportDate = isLuxurySuv && dateParam ? dateParam : undefined;
  const compareToDate = isLuxurySuv && compareToDateParam ? compareToDateParam : undefined;

  if (isSkincareTracker(brandId, trackerId)) {
    const topic = topicParam && SKINCARE_TOPICS.includes(topicParam as SkincareTopic)
      ? (topicParam as SkincareTopic)
      : "overall";

    if (!brandsParam || !modelsParam) {
      const brands = getSkincareScoreBrands();
      const models = getSkincareModels();
      const top10Brands = getSkincareTopBrands(metric as SkincareScoreRow["metric"], 10);
      return NextResponse.json({
        brands,
        models,
        top10Brands,
        topicColumns: SKINCARE_TOPIC_COLUMNS,
      });
    }

    const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const table = searchParams.get("table") === "1";

    if (table) {
      const tableData = getSkincareResultsTableData(
        metric as SkincareScoreRow["metric"],
        brandIds,
        modelIds
      );
      return NextResponse.json(tableData);
    }

    const chart = searchParams.get("chart");
    const topicsParam = searchParams.get("topics");
    if (chart === "timeline" && brandIds.length > 0 && modelIds.length > 0) {
      const singleTopic = topicsParam
        ? (topicsParam.split(",").map((s) => s.trim()).filter(Boolean)[0] as SkincareTopic) || "overall"
        : "overall";
      const topic = SKINCARE_TOPICS.includes(singleTopic as SkincareTopic) ? (singleTopic as SkincareTopic) : "overall";
      const { dates, series } = getSkincareTimelineData(
        metric as SkincareScoreRow["metric"],
        brandIds,
        modelIds,
        topic
      );
      return NextResponse.json({ dates, series });
    }

    const { dates, series } = getSkincareTimelineData(
      metric as SkincareScoreRow["metric"],
      brandIds,
      modelIds,
      topic
    );
    return NextResponse.json({ dates, series });
  }

  if (isHmPantsTracker(brandId, trackerId)) {
    const topic = topicParam && HM_PANTS_TOPIC_KEYS.includes(topicParam as HmPantsTopic)
      ? (topicParam as HmPantsTopic)
      : "overall";

    if (!brandsParam || !modelsParam) {
      const brands = getHmPantsScoreBrands();
      const models = getHmPantsModels();
      const top10Brands = getHmPantsTopBrands(metric as HmPantsScoreRow["metric"], 10);
      return NextResponse.json({ brands, models, top10Brands, topicColumns: HM_PANTS_TOPIC_COLUMNS });
    }

    const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const table = searchParams.get("table") === "1";
    const chart = searchParams.get("chart");

    if (chart === "grouped" && brandIds.length > 0) {
      const brand = brandIds[0]!;
      const topicModelScores = getHmPantsTopicModelScores(metric as HmPantsScoreRow["metric"], brand);
      return NextResponse.json({ chart: "grouped", ...topicModelScores });
    }

    if (table) {
      const tableData = getHmPantsResultsTableData(metric as HmPantsScoreRow["metric"], brandIds, modelIds);
      return NextResponse.json(tableData);
    }

    const topicsParam = searchParams.get("topics");
    const seriesParam = searchParams.get("series");

    if (chart === "timeline" && seriesParam === "topics" && brandIds.length > 0 && modelIds.length > 0) {
      const brand = brandIds[0]!;
      const modelId = modelIds[0]!;
      const { dates, series: dimSeries } = getHmPantsDimensionTimelineData(
        metric as HmPantsScoreRow["metric"],
        modelId,
        brand
      );
      const series = dimSeries.map((s) => ({ brand: s.label, data: s.data }));
      return NextResponse.json({ dates, series });
    }

    const singleTopic = topicsParam
      ? (topicsParam.split(",").map((s) => s.trim()).filter(Boolean)[0] as HmPantsTopic) || "overall"
      : topic;
    const resolvedTopic = HM_PANTS_TOPIC_KEYS.includes(singleTopic as HmPantsTopic)
      ? (singleTopic as HmPantsTopic)
      : "overall";
    const { dates, series } = getHmPantsTimelineData(
      metric as HmPantsScoreRow["metric"],
      brandIds,
      modelIds,
      resolvedTopic
    );
    return NextResponse.json({ dates, series });
  }

  if (isHmHeatmapTracker(brandId, trackerId)) {
    const topic = topicParam && HM_HEATMAP_TOPIC_KEYS.includes(topicParam as HmHeatmapTopic)
      ? (topicParam as HmHeatmapTopic)
      : "overall";

    if (!brandsParam || !modelsParam) {
      const brands = getHmHeatmapScoreBrands();
      const models = getHmHeatmapModels();
      const top10Brands = getHmHeatmapTopBrands(metric as HmHeatmapScoreRow["metric"], 10);
      return NextResponse.json({ brands, models, top10Brands, topicColumns: HM_HEATMAP_TOPIC_COLUMNS });
    }

    const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const table = searchParams.get("table") === "1";
    const chart = searchParams.get("chart");

    if (chart === "grouped" && brandIds.length > 0) {
      const brand = brandIds[0]!;
      return NextResponse.json({ chart: "grouped", ...getHmHeatmapTopicModelScores(metric as HmHeatmapScoreRow["metric"], brand) });
    }

    if (table) {
      return NextResponse.json(getHmHeatmapResultsTableData(metric as HmHeatmapScoreRow["metric"], brandIds, modelIds));
    }

    const topicsParam = searchParams.get("topics");
    const seriesParam = searchParams.get("series");

    if (chart === "timeline" && seriesParam === "topics" && brandIds.length > 0 && modelIds.length > 0) {
      const brand = brandIds[0]!;
      const modelId = modelIds[0]!;
      const { dates, series: dimSeries } = getHmHeatmapDimensionTimelineData(metric as HmHeatmapScoreRow["metric"], modelId, brand);
      return NextResponse.json({ dates, series: dimSeries.map((s) => ({ brand: s.label, data: s.data })) });
    }

    const singleTopic = topicsParam
      ? (topicsParam.split(",").map((s) => s.trim()).filter(Boolean)[0] as HmHeatmapTopic) || "overall"
      : topic;
    const resolvedTopic = HM_HEATMAP_TOPIC_KEYS.includes(singleTopic as HmHeatmapTopic)
      ? (singleTopic as HmHeatmapTopic)
      : "overall";
    const { dates, series } = getHmHeatmapTimelineData(metric as HmHeatmapScoreRow["metric"], brandIds, modelIds, resolvedTopic);
    return NextResponse.json({ dates, series });
  }

  if (isHmJeansTracker(brandId, trackerId)) {
    const topic: HmJeansTopic = "overall";

    if (!brandsParam || !modelsParam) {
      const brands = getHmJeansScoreBrands();
      const models = getHmJeansModels();
      const top10Brands = getHmJeansTopBrands(metric as HmJeansScoreRow["metric"], 10);
      return NextResponse.json({ brands, models, top10Brands, topicColumns: HM_JEANS_TOPIC_COLUMNS });
    }

    const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const table = searchParams.get("table") === "1";
    const chart = searchParams.get("chart");

    if (chart === "grouped" && brandIds.length > 0) {
      const brand = brandIds[0]!;
      return NextResponse.json({ chart: "grouped", ...getHmJeansTopicModelScores(metric as HmJeansScoreRow["metric"], brand) });
    }

    if (table) {
      return NextResponse.json(getHmJeansResultsTableData(metric as HmJeansScoreRow["metric"], brandIds, modelIds));
    }

    const topicsParam = searchParams.get("topics");
    const seriesParam = searchParams.get("series");

    if (chart === "timeline" && seriesParam === "topics" && brandIds.length > 0 && modelIds.length > 0) {
      const brand = brandIds[0]!;
      const modelId = modelIds[0]!;
      const { dates, series: dimSeries } = getHmJeansDimensionTimelineData(metric as HmJeansScoreRow["metric"], modelId, brand);
      return NextResponse.json({ dates, series: dimSeries.map((s) => ({ brand: s.label, data: s.data })) });
    }

    const singleTopic = topicsParam
      ? (topicsParam.split(",").map((s) => s.trim()).filter(Boolean)[0] as HmJeansTopic) || "overall"
      : topic;
    const resolvedTopic: HmJeansTopic = HM_JEANS_TOPIC_KEYS.includes(singleTopic as HmJeansTopic)
      ? (singleTopic as HmJeansTopic)
      : "overall";
    const { dates, series } = getHmJeansTimelineData(metric as HmJeansScoreRow["metric"], brandIds, modelIds, resolvedTopic);
    return NextResponse.json({ dates, series });
  }

  if (isHmPantsUKTracker(brandId, trackerId)) {
    const topic: HmPantsTopic = "overall";
    if (!brandsParam || !modelsParam) {
      const brands = getHmPantsUKModels().map(m => m.label);
      const models = getHmPantsUKModels();
      const top10Brands = getHmPantsUKTopBrands(metric as HmPantsScoreRow["metric"], 10);
      return NextResponse.json({ brands, models, top10Brands, topicColumns: HM_PANTS_UK_TOPIC_KEYS });
    }
    const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const table = searchParams.get("table") === "1";
    const chart = searchParams.get("chart");
    if (table) {
      return NextResponse.json(getHmPantsUKResultsTableData(metric as HmPantsScoreRow["metric"]));
    }
    const topicsParam = searchParams.get("topics");
    const singleTopic = topicsParam ? (topicsParam.split(",")[0] as HmPantsTopic) || "overall" : topic;
    const resolvedTopic: HmPantsTopic = HM_PANTS_UK_TOPIC_KEYS.includes(singleTopic as HmPantsTopic) ? (singleTopic as HmPantsTopic) : "overall";
    const { dates, series } = getHmPantsUKTimelineData(metric as HmPantsScoreRow["metric"], brandIds.length > 0 ? brandIds[0] : undefined);
    return NextResponse.json({ dates, series: Array.isArray(series) ? series : [series] });
  }

  if (isHmPantsGermanyTracker(brandId, trackerId)) {
    const topic: HmPantsTopic = "overall";
    if (!brandsParam || !modelsParam) {
      const brands = getHmPantsGermanyModels().map(m => m.label);
      const models = getHmPantsGermanyModels();
      const top10Brands = getHmPantsGermanyTopBrands(metric as HmPantsScoreRow["metric"], 10);
      return NextResponse.json({ brands, models, top10Brands, topicColumns: HM_PANTS_GERMANY_TOPIC_KEYS });
    }
    const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const table = searchParams.get("table") === "1";
    const chart = searchParams.get("chart");
    if (table) {
      return NextResponse.json(getHmPantsGermanyResultsTableData(metric as HmPantsScoreRow["metric"]));
    }
    const topicsParam = searchParams.get("topics");
    const singleTopic = topicsParam ? (topicsParam.split(",")[0] as HmPantsTopic) || "overall" : topic;
    const resolvedTopic: HmPantsTopic = HM_PANTS_GERMANY_TOPIC_KEYS.includes(singleTopic as HmPantsTopic) ? (singleTopic as HmPantsTopic) : "overall";
    const { dates, series } = getHmPantsGermanyTimelineData(metric as HmPantsScoreRow["metric"], brandIds.length > 0 ? brandIds[0] : undefined);
    return NextResponse.json({ dates, series: Array.isArray(series) ? series : [series] });
  }

  if (isHmHeatmapUKTracker(brandId, trackerId)) {
    const topic: HmHeatmapTopic = "overall";
    if (!brandsParam || !modelsParam) {
      const brands = getHmHeatmapUKModels().map(m => m.label);
      const models = getHmHeatmapUKModels();
      const top10Brands = getHmHeatmapUKTopBrands(metric as HmHeatmapScoreRow["metric"], 10);
      return NextResponse.json({ brands, models, top10Brands, topicColumns: HM_HEATMAP_UK_TOPIC_KEYS });
    }
    const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const table = searchParams.get("table") === "1";
    const chart = searchParams.get("chart");
    if (table) {
      return NextResponse.json(getHmHeatmapUKResultsTableData(metric as HmHeatmapScoreRow["metric"]));
    }
    const topicsParam = searchParams.get("topics");
    const singleTopic = topicsParam ? (topicsParam.split(",")[0] as HmHeatmapTopic) || "overall" : topic;
    const resolvedTopic: HmHeatmapTopic = HM_HEATMAP_UK_TOPIC_KEYS.includes(singleTopic as HmHeatmapTopic) ? (singleTopic as HmHeatmapTopic) : "overall";
    const { dates, series } = getHmHeatmapUKTimelineData(metric as HmHeatmapScoreRow["metric"], brandIds.length > 0 ? brandIds[0] : undefined);
    return NextResponse.json({ dates, series: Array.isArray(series) ? series : [series] });
  }

  if (isHmHeatmapGermanyTracker(brandId, trackerId)) {
    const topic: HmHeatmapTopic = "overall";
    if (!brandsParam || !modelsParam) {
      const brands = getHmHeatmapGermanyModels().map(m => m.label);
      const models = getHmHeatmapGermanyModels();
      const top10Brands = getHmHeatmapGermanyTopBrands(metric as HmHeatmapScoreRow["metric"], 10);
      return NextResponse.json({ brands, models, top10Brands, topicColumns: HM_HEATMAP_GERMANY_TOPIC_KEYS });
    }
    const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const table = searchParams.get("table") === "1";
    const chart = searchParams.get("chart");
    if (table) {
      return NextResponse.json(getHmHeatmapGermanyResultsTableData(metric as HmHeatmapScoreRow["metric"]));
    }
    const topicsParam = searchParams.get("topics");
    const singleTopic = topicsParam ? (topicsParam.split(",")[0] as HmHeatmapTopic) || "overall" : topic;
    const resolvedTopic: HmHeatmapTopic = HM_HEATMAP_GERMANY_TOPIC_KEYS.includes(singleTopic as HmHeatmapTopic) ? (singleTopic as HmHeatmapTopic) : "overall";
    const { dates, series } = getHmHeatmapGermanyTimelineData(metric as HmHeatmapScoreRow["metric"], brandIds.length > 0 ? brandIds[0] : undefined);
    return NextResponse.json({ dates, series: Array.isArray(series) ? series : [series] });
  }

  const topic = parsePorscheTopic(topicParam);
  const chart = searchParams.get("chart");

  if (!brandsParam || !modelsParam) {
    const brands = getPorscheScoreBrands();
    const models = getUniqueModels();
    const top10Brands = getTopBrandsByLatestScore(metric as PorscheScoreRow["metric"], 10);
    return NextResponse.json({
      brands,
      models,
      top10Brands,
      topicColumns: PORSCHE_TOPIC_COLUMNS,
    });
  }

  const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
  const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
  const table = searchParams.get("table") === "1";

  if (table) {
    const tableData = getResultsTableData(
      metric as PorscheScoreRow["metric"],
      brandIds,
      modelIds,
      reportDate,
      compareToDate
    );
    return NextResponse.json(tableData);
  }

  if (chart === "grouped" && brandIds.length > 0) {
    const brand = brandIds[0]!;
    const topicModelScores = getTopicModelScores(metric as PorscheScoreRow["metric"], brand, reportDate, compareToDate);
    return NextResponse.json({ chart: "grouped", ...topicModelScores });
  }

  const topicsParam = searchParams.get("topics");
  const seriesParam = searchParams.get("series");
  if (chart === "timeline" && brandIds.length > 0 && modelIds.length > 0) {
    if (trackerId === "luxury-suvs-v2" && seriesParam === "topics") {
      const brand = brandIds[0]!;
      const modelId = modelIds[0]!;
      const { dates, series: dimSeries } = getDimensionTimelineData(
        metric as PorscheScoreRow["metric"],
        modelId,
        brand,
        reportDate
      );
      const series = dimSeries.map((s) => ({ brand: s.label, data: s.data }));
      return NextResponse.json({ dates, series });
    }
    const singleTopic = topicsParam
      ? (topicsParam.split(",").map((s) => s.trim()).filter(Boolean)[0] as TimelineTopic) || "overall"
      : "overall";
    const topic = parsePorscheTopic(singleTopic);
    const { dates, series } = getTimelineData(
      metric as PorscheScoreRow["metric"],
      brandIds,
      modelIds,
      topic,
      reportDate
    );
    return NextResponse.json({ dates, series });
  }

  const { dates, series } = getTimelineData(
    metric as PorscheScoreRow["metric"],
    brandIds,
    modelIds,
    topic,
    reportDate
  );
  return NextResponse.json({ dates, series });
}
