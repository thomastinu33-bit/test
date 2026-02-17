import {
  getDimensionTimelineData,
  getGaugeDimensionsForModelWithChange,
  getUniqueModels,
  GAUGE_DIMENSION_KEYS,
  type MetricType,
} from "@/data/porscheScores";
import {
  getDimensionTimelineData as getSkincareDimensionTimelineData,
  getGaugeDimensionsForModelWithChange as getSkincareGaugeDimensions,
  getUniqueModels as getSkincareModels,
  SKINCARE_GAUGE_DIMENSION_KEYS,
  SKINCARE_DIM_LABELS,
} from "@/data/skincareScores";
import type { SkincareTopic } from "@/data/skincareScores";
import { NextRequest, NextResponse } from "next/server";

const VALID_METRICS: MetricType[] = [
  "AI Brand Score",
  "Visibility Score",
  "Average Position",
];

const PORSCHE_DIM_LABELS: Record<string, string> = {
  overall: "Overall",
  topOfMind: "Top of Mind",
  perception: "Perception",
  media: "Media",
  process: "Process",
  product: "Product",
  price: "Price",
};

function isSkincareTracker(brandId: string, trackerId: string): boolean {
  return brandId === "cetaphil" && trackerId === "skincare";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId") ?? "porsche";
  const trackerId = searchParams.get("trackerId") ?? "luxury-suvs";
  const metric = (searchParams.get("metric") ?? "AI Brand Score") as MetricType;
  const model = searchParams.get("model") ?? "__average__";
  const view = searchParams.get("view") ?? "gauge";
  const validMetric = VALID_METRICS.includes(metric) ? metric : "AI Brand Score";

  if (isSkincareTracker(brandId, trackerId)) {
    const models = getSkincareModels();
    const dimensions = getSkincareGaugeDimensions(validMetric, model);
    const dimensionKeys = SKINCARE_GAUGE_DIMENSION_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of SKINCARE_GAUGE_DIMENSION_KEYS) {
      dimensionLabels[k] = SKINCARE_DIM_LABELS[k as SkincareTopic];
    }

    if (view === "timeline") {
      const timeline = getSkincareDimensionTimelineData(validMetric, model);
      return NextResponse.json({
        models,
        dimensions,
        dimensionKeys,
        dimensionLabels,
        view: "timeline",
        timeline,
      });
    }

    return NextResponse.json({
      models,
      dimensions,
      dimensionKeys,
      dimensionLabels,
    });
  }

  const models = getUniqueModels();
  const dimensions = getGaugeDimensionsForModelWithChange(validMetric, model);
  const dimensionKeys = GAUGE_DIMENSION_KEYS as string[];
  const dimensionLabels = PORSCHE_DIM_LABELS;

  if (view === "timeline") {
    const timeline = getDimensionTimelineData(validMetric, model);
    return NextResponse.json({
      models,
      dimensions,
      dimensionKeys,
      dimensionLabels,
      view: "timeline",
      timeline,
    });
  }

  return NextResponse.json({
    models,
    dimensions,
    dimensionKeys,
    dimensionLabels,
  });
}
