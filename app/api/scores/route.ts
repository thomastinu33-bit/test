import {
  getDimensionTimelineData,
  getModelTimelineData,
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
import {
  getDimensionTimelineData as getHmPantsDimensionTimelineData,
  getGaugeDimensionsForModelWithChange as getHmPantsGaugeDimensions,
  getUniqueModels as getHmPantsModels,
  getUniqueBrands as getHmPantsBrands,
  HM_PANTS_GAUGE_DIMENSION_KEYS,
  HM_PANTS_DIM_LABELS,
  HM_PANTS_TOPIC_KEYS,
} from "@/data/hmPantsScores";
import {
  getGaugeDimensionsForModelWithChange as getHmHeatmapGaugeDimensions,
  getUniqueModels as getHmHeatmapModels,
  getUniqueBrands as getHmHeatmapBrands,
  HM_HEATMAP_GAUGE_DIMENSION_KEYS,
  HM_HEATMAP_DIM_LABELS,
  HM_HEATMAP_TOPIC_KEYS,
  type HmHeatmapTopic,
} from "@/data/hmHeatmapScores";
import {
  getGaugeDimensionsForModelWithChange as getHmJeansGaugeDimensions,
  getUniqueModels as getHmJeansModels,
  getUniqueBrands as getHmJeansBrands,
  HM_JEANS_GAUGE_DIMENSION_KEYS,
  HM_JEANS_DIM_LABELS,
  HM_JEANS_TOPIC_KEYS,
} from "@/data/hmJeansScores";
import {
  getGaugeDimensionsForModelWithChange as getHmPantsUKGaugeDimensions,
  getUniqueModels as getHmPantsUKModels,
  getUniqueBrands as getHmPantsUKBrands,
  HM_PANTS_TOPIC_KEYS as HM_PANTS_UK_TOPIC_KEYS,
  HM_PANTS_DIM_LABELS as HM_PANTS_UK_DIM_LABELS,
  HM_PANTS_GAUGE_DIMENSION_KEYS as HM_PANTS_UK_GAUGE_KEYS,
  type HmPantsTopic,
} from "@/data/hmPantsScoresUK";
import {
  getGaugeDimensionsForModelWithChange as getHmPantsGermanyGaugeDimensions,
  getUniqueModels as getHmPantsGermanyModels,
  getUniqueBrands as getHmPantsGermanyBrands,
  HM_PANTS_TOPIC_KEYS as HM_PANTS_GERMANY_TOPIC_KEYS,
  HM_PANTS_DIM_LABELS as HM_PANTS_GERMANY_DIM_LABELS,
  HM_PANTS_GAUGE_DIMENSION_KEYS as HM_PANTS_GERMANY_GAUGE_KEYS,
} from "@/data/hmPantsScoresGermany";
import {
  getGaugeDimensionsForModelWithChange as getHmHeatmapUKGaugeDimensions,
  getUniqueModels as getHmHeatmapUKModels,
  getUniqueBrands as getHmHeatmapUKBrands,
  HM_HEATMAP_TOPIC_KEYS as HM_HEATMAP_UK_TOPIC_KEYS,
  HM_HEATMAP_DIM_LABELS as HM_HEATMAP_UK_DIM_LABELS,
  HM_HEATMAP_GAUGE_DIMENSION_KEYS as HM_HEATMAP_UK_GAUGE_KEYS,
} from "@/data/hmHeatmapScoresUK";
import {
  getGaugeDimensionsForModelWithChange as getHmHeatmapGermanyGaugeDimensions,
  getUniqueModels as getHmHeatmapGermanyModels,
  getUniqueBrands as getHmHeatmapGermanyBrands,
  HM_HEATMAP_TOPIC_KEYS as HM_HEATMAP_GERMANY_TOPIC_KEYS,
  HM_HEATMAP_DIM_LABELS as HM_HEATMAP_GERMANY_DIM_LABELS,
  HM_HEATMAP_GAUGE_DIMENSION_KEYS as HM_HEATMAP_GERMANY_GAUGE_KEYS,
} from "@/data/hmHeatmapScoresGermany";
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
  const dateParam = searchParams.get("date");
  const compareToDateParam = searchParams.get("compareToDate");
  const isLuxurySuv = brandId === "porsche" && (trackerId === "luxury-suvs" || trackerId === "luxury-suvs-v2");
  const reportDate = isLuxurySuv && dateParam ? dateParam : undefined;
  const compareToDate = isLuxurySuv && compareToDateParam ? compareToDateParam : undefined;
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

  if (isHmPantsTracker(brandId, trackerId)) {
    const models = getHmPantsModels();
    const brands = getHmPantsBrands();
    const defaultBrand = "H&M";
    const brand = selectedBrand ?? defaultBrand;
    const dimensions = getHmPantsGaugeDimensions(validMetric, model, brand);
    const dimensionKeys = HM_PANTS_GAUGE_DIMENSION_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of HM_PANTS_TOPIC_KEYS) {
      dimensionLabels[k] = HM_PANTS_DIM_LABELS[k];
    }

    const modelScores = dimensionKeys.includes(topic)
      ? models.map((m) => {
          const dims = getHmPantsGaugeDimensions(validMetric, m.id, brand);
          const value = (dims[topic] as number) ?? 0;
          const cKey = changeKeyForTopic(topic);
          const change = (dims[cKey] as number) ?? null;
          return { id: m.id, label: m.label, value, change };
        })
      : undefined;

    return NextResponse.json({
      models,
      brands,
      dimensions,
      dimensionKeys,
      dimensionLabels,
      modelScores,
    });
  }

  if (isHmHeatmapTracker(brandId, trackerId)) {
    const models = getHmHeatmapModels();
    const brands = getHmHeatmapBrands();
    const defaultBrand = "H&M";
    const brand = selectedBrand ?? defaultBrand;
    const dimensions = getHmHeatmapGaugeDimensions(validMetric, model, brand);
    const dimensionKeys = HM_HEATMAP_GAUGE_DIMENSION_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of HM_HEATMAP_TOPIC_KEYS) {
      dimensionLabels[k] = HM_HEATMAP_DIM_LABELS[k];
    }

    const modelScores = dimensionKeys.includes(topic)
      ? models.map((m) => {
          const dims = getHmHeatmapGaugeDimensions(validMetric, m.id, brand);
          const value = (dims[topic] as number) ?? 0;
          const cKey = changeKeyForTopic(topic);
          const change = (dims[cKey] as number) ?? null;
          return { id: m.id, label: m.label, value, change };
        })
      : undefined;

    return NextResponse.json({ models, brands, dimensions, dimensionKeys, dimensionLabels, modelScores });
  }

  if (isHmJeansTracker(brandId, trackerId)) {
    const models = getHmJeansModels();
    const brands = getHmJeansBrands();
    const defaultBrand = "H&M";
    const brand = selectedBrand ?? defaultBrand;
    const dimensions = getHmJeansGaugeDimensions(validMetric, model, brand);
    const dimensionKeys = HM_JEANS_GAUGE_DIMENSION_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of HM_JEANS_TOPIC_KEYS) {
      dimensionLabels[k] = HM_JEANS_DIM_LABELS[k];
    }

    const modelScores = dimensionKeys.includes(topic)
      ? models.map((m) => {
          const dims = getHmJeansGaugeDimensions(validMetric, m.id, brand);
          const value = (dims[topic] as number) ?? 0;
          const cKey = changeKeyForTopic(topic);
          const change = (dims[cKey] as number) ?? null;
          return { id: m.id, label: m.label, value, change };
        })
      : undefined;

    return NextResponse.json({ models, brands, dimensions, dimensionKeys, dimensionLabels, modelScores });
  }

  if (isHmPantsUKTracker(brandId, trackerId)) {
    const models = getHmPantsUKModels();
    const brands = getHmPantsUKBrands();
    const dims = getHmPantsUKGaugeDimensions(model, validMetric);
    const dimensions = dims.dimensions;
    const dimensionKeys = HM_PANTS_UK_GAUGE_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of HM_PANTS_UK_TOPIC_KEYS) {
      dimensionLabels[k] = HM_PANTS_UK_DIM_LABELS[k];
    }
    const modelScores = dimensionKeys.includes(topic)
      ? models.map((m) => {
          const modelDims = getHmPantsUKGaugeDimensions(m.id, validMetric);
          const value = (modelDims.dimensions[topic as HmPantsTopic] as number) ?? 0;
          const cKey = changeKeyForTopic(topic);
          const change = (modelDims.changeDimensions[cKey as HmPantsTopic] as number) ?? null;
          return { id: m.id, label: m.label, value, change };
        })
      : undefined;
    return NextResponse.json({ models, brands, dimensions, dimensionKeys, dimensionLabels, modelScores });
  }

  if (isHmPantsGermanyTracker(brandId, trackerId)) {
    const models = getHmPantsGermanyModels();
    const brands = getHmPantsGermanyBrands();
    const dims = getHmPantsGermanyGaugeDimensions(model, validMetric);
    const dimensions = dims.dimensions;
    const dimensionKeys = HM_PANTS_GERMANY_GAUGE_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of HM_PANTS_GERMANY_TOPIC_KEYS) {
      dimensionLabels[k] = HM_PANTS_GERMANY_DIM_LABELS[k];
    }
    const modelScores = dimensionKeys.includes(topic)
      ? models.map((m) => {
          const modelDims = getHmPantsGermanyGaugeDimensions(m.id, validMetric);
          const value = (modelDims.dimensions[topic as HmPantsTopic] as number) ?? 0;
          const cKey = changeKeyForTopic(topic);
          const change = (modelDims.changeDimensions[cKey as HmPantsTopic] as number) ?? null;
          return { id: m.id, label: m.label, value, change };
        })
      : undefined;
    return NextResponse.json({ models, brands, dimensions, dimensionKeys, dimensionLabels, modelScores });
  }

  if (isHmHeatmapUKTracker(brandId, trackerId)) {
    const models = getHmHeatmapUKModels();
    const brands = getHmHeatmapUKBrands();
    const dims = getHmHeatmapUKGaugeDimensions(model, validMetric);
    const dimensions = dims.dimensions;
    const dimensionKeys = HM_HEATMAP_UK_GAUGE_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of HM_HEATMAP_UK_TOPIC_KEYS) {
      dimensionLabels[k] = HM_HEATMAP_UK_DIM_LABELS[k];
    }
    const modelScores = dimensionKeys.includes(topic)
      ? models.map((m) => {
          const modelDims = getHmHeatmapUKGaugeDimensions(m.id, validMetric);
          const value = (modelDims.dimensions[topic as HmHeatmapTopic] as number) ?? 0;
          const cKey = changeKeyForTopic(topic);
          const change = (modelDims.changeDimensions[cKey as HmHeatmapTopic] as number) ?? null;
          return { id: m.id, label: m.label, value, change };
        })
      : undefined;
    return NextResponse.json({ models, brands, dimensions, dimensionKeys, dimensionLabels, modelScores });
  }

  if (isHmHeatmapGermanyTracker(brandId, trackerId)) {
    const models = getHmHeatmapGermanyModels();
    const brands = getHmHeatmapGermanyBrands();
    const dims = getHmHeatmapGermanyGaugeDimensions(model, validMetric);
    const dimensions = dims.dimensions;
    const dimensionKeys = HM_HEATMAP_GERMANY_GAUGE_KEYS as string[];
    const dimensionLabels: Record<string, string> = {};
    for (const k of HM_HEATMAP_GERMANY_TOPIC_KEYS) {
      dimensionLabels[k] = HM_HEATMAP_GERMANY_DIM_LABELS[k];
    }
    const modelScores = dimensionKeys.includes(topic)
      ? models.map((m) => {
          const modelDims = getHmHeatmapGermanyGaugeDimensions(m.id, validMetric);
          const value = (modelDims.dimensions[topic as HmHeatmapTopic] as number) ?? 0;
          const cKey = changeKeyForTopic(topic);
          const change = (modelDims.changeDimensions[cKey as HmHeatmapTopic] as number) ?? null;
          return { id: m.id, label: m.label, value, change };
        })
      : undefined;
    return NextResponse.json({ models, brands, dimensions, dimensionKeys, dimensionLabels, modelScores });
  }

  const models = getUniqueModels();
  const brands = getUniqueBrands();
  const defaultBrand = "PORSCHE";
  const brand = selectedBrand ?? defaultBrand;
  const dimensions = getGaugeDimensionsForModelWithChange(validMetric, model, brand, reportDate, compareToDate);
  const dimensionKeys = GAUGE_DIMENSION_KEYS as string[];
  const dimensionLabels = PORSCHE_DIM_LABELS;

  const modelScores = dimensionKeys.includes(topic)
    ? models.map((m) => {
        const dims = getGaugeDimensionsForModelWithChange(validMetric, m.id, brand, reportDate, compareToDate);
        const value = (dims[topic as keyof typeof dims] as number) ?? 0;
        const cKey = changeKeyForTopic(topic);
        const change = (dims[cKey as keyof typeof dims] as number) ?? null;
        return { id: m.id, label: m.label, value, change };
      })
    : undefined;

  if (view === "timeline") {
    const timeline =
      trackerId === "luxury-suvs-v2"
        ? getModelTimelineData(validMetric, brand, topic as "overall" | "topOfMind" | "perception" | "media" | "process" | "product" | "price", reportDate)
        : getDimensionTimelineData(validMetric, model, brand, reportDate);
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
