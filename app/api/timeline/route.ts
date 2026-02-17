import {
  getTimelineData,
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
      modelIds
    );
    return NextResponse.json(tableData);
  }

  if (chart === "grouped" && brandIds.length > 0) {
    const brand = brandIds[0]!;
    const topicModelScores = getTopicModelScores(metric as PorscheScoreRow["metric"], brand);
    return NextResponse.json({ chart: "grouped", ...topicModelScores });
  }

  const { dates, series } = getTimelineData(
    metric as PorscheScoreRow["metric"],
    brandIds,
    modelIds,
    topic
  );
  return NextResponse.json({ dates, series });
}
