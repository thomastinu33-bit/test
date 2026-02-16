import {
  getTimelineData,
  getResultsTableData,
  getTopBrandsByLatestScore,
  getUniqueModels,
  getPorscheScoreBrands,
} from "@/data/porscheScores";
import type { PorscheScoreRow, TimelineTopic } from "@/data/porscheScores";
import { NextResponse } from "next/server";

const DEFAULT_METRIC: PorscheScoreRow["metric"] = "AI Brand Score";

const VALID_TOPICS: TimelineTopic[] = [
  "overall",
  "topOfMind",
  "perception",
  "media",
  "process",
  "product",
  "price",
];

function parseTopic(t: string | null): TimelineTopic {
  if (t && VALID_TOPICS.includes(t as TimelineTopic)) return t as TimelineTopic;
  return "overall";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metricParam = searchParams.get("metric");
  const metric =
    (metricParam as PorscheScoreRow["metric"]) ?? DEFAULT_METRIC;
  const brandsParam = searchParams.get("brands");
  const modelsParam = searchParams.get("models");
  const topic = parseTopic(searchParams.get("topic"));

  if (!brandsParam || !modelsParam) {
    const brands = getPorscheScoreBrands();
    const models = getUniqueModels();
    const top10Brands = getTopBrandsByLatestScore(metric, 10);
    return NextResponse.json({
      brands,
      models,
      top10Brands,
    });
  }

  const brandIds = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
  const modelIds = modelsParam.split(",").map((s) => s.trim()).filter(Boolean);
  const table = searchParams.get("table") === "1";
  if (table) {
    const tableData = getResultsTableData(metric, brandIds, modelIds);
    return NextResponse.json(tableData);
  }
  const { dates, series } = getTimelineData(metric, brandIds, modelIds, topic);
  return NextResponse.json({ dates, series });
}
