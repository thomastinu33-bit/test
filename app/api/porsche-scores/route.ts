import {
  getDimensionTimelineData,
  getGaugeDimensionsForModelWithChange,
  getUniqueModels,
  type MetricType,
} from "@/data/porscheScores";
import { NextRequest, NextResponse } from "next/server";

const VALID_METRICS: MetricType[] = [
  "AI Brand Score",
  "Visibility Score",
  "Average Position",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const metric = (searchParams.get("metric") ?? "AI Brand Score") as MetricType;
  const model = searchParams.get("model") ?? "__average__";
  const view = searchParams.get("view") ?? "gauge";
  const validMetric = VALID_METRICS.includes(metric) ? metric : "AI Brand Score";
  const models = getUniqueModels();
  const dimensions = getGaugeDimensionsForModelWithChange(validMetric, model);

  if (view === "timeline") {
    const timeline = getDimensionTimelineData(validMetric, model);
    return NextResponse.json({ models, dimensions, view: "timeline", timeline });
  }

  return NextResponse.json({ models, dimensions });
}
