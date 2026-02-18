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
