import {
  getDimensionTimelineData,
  getGaugeDimensionsForModelWithChange,
  getUniqueModels,
  getUniqueBrands,
  GAUGE_DIMENSION_KEYS,
  type MetricType,
} from "@/data/porscheScores";
import {
  getDimensionTimelineData as getSkincareDimensionTimelineData,
  getGaugeDimensionsForModelWithChange as getSkincareGaugeDimensions,
  getUniqueModels as getSkincareModels,
  getUniqueBrands as getSkincareBrands,
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

function changeKeyForTopic(topic: string): string {
  return "change" + topic.charAt(0).toUpperCase() + topic.slice(1);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId") ?? "porsche";
  const trackerId = searchParams.get("trackerId") ?? "luxury-suvs";
  const metric = (searchParams.get("metric") ?? "AI Brand Score") as MetricType;
  const model = searchParams.get("model") ?? "__average__";
  const view = searchParams.get("view") ?? "gauge";
  const topic = searchParams.get("topic") ?? "overall";
  const selectedBrand = searchParams.get("brand") ?? null; // null = use default per tracker
  const validMetric = VALID_METRICS.includes(metric) ? metric : "AI Brand Score";

  if (isSkincareTracker(brandId, trackerId)) {
    const models = getSkincareModels();
    const brands = getSkincareBrands();
    const defaultBrand = "CETAPHIL";
    const brand = selectedBrand ?? defaultBrand;
    const dimensions = getSkincareGaugeDimensions(validMetric, model, brand);
    const dimensionKeys = SKINCARE_GAUGE_DIMENSION_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of SKINCARE_GAUGE_DIMENSION_KEYS) {
      dimensionLabels[k] = SKINCARE_DIM_LABELS[k as SkincareTopic];
    }

    const modelScores = dimensionKeys.includes(topic)
      ? models.map((m) => {
          const dims = getSkincareGaugeDimensions(validMetric, m.id, brand);
          const value = (dims[topic] as number) ?? 0;
          const cKey = changeKeyForTopic(topic);
          const change = (dims[cKey] as number) ?? null;
          return { id: m.id, label: m.label, value, change };
        })
      : undefined;

    if (view === "timeline") {
      const timeline = getSkincareDimensionTimelineData(validMetric, model);
      return NextResponse.json({
        models,
        brands,
        dimensions,
        dimensionKeys,
        dimensionLabels,
        modelScores,
        view: "timeline",
        timeline,
      });
    }

    return NextResponse.json({
      models,
      brands,
      dimensions,
      dimensionKeys,
      dimensionLabels,
      modelScores,
    });
  }

  const models = getUniqueModels();
  const brands = getUniqueBrands();
  const defaultBrand = "PORSCHE";
  const brand = selectedBrand ?? defaultBrand;
  const dimensions = getGaugeDimensionsForModelWithChange(validMetric, model, brand);
  const dimensionKeys = GAUGE_DIMENSION_KEYS as string[];
  const dimensionLabels = PORSCHE_DIM_LABELS;

  const modelScores = dimensionKeys.includes(topic)
    ? models.map((m) => {
        const dims = getGaugeDimensionsForModelWithChange(validMetric, m.id, brand);
        const value = (dims[topic as keyof typeof dims] as number) ?? 0;
        const cKey = changeKeyForTopic(topic);
        const change = (dims[cKey as keyof typeof dims] as number) ?? null;
        return { id: m.id, label: m.label, value, change };
      })
    : undefined;

  if (view === "timeline") {
    const timeline = getDimensionTimelineData(validMetric, model);
    return NextResponse.json({
      models,
      brands,
      dimensions,
      dimensionKeys,
      dimensionLabels,
      modelScores,
      view: "timeline",
      timeline,
    });
  }

  return NextResponse.json({
    models,
    brands,
    dimensions,
    dimensionKeys,
    dimensionLabels,
    modelScores,
  });
}
