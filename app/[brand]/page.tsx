"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getBrand, trackersByBrand } from "@/app/manage-account/data";
import { useEffect, useState } from "react";

interface TrackerMetrics {
  name: string;
  aiBrandScore?: number;
  visibilityScore?: number;
  avgPosition?: number;
  modelsCount: number;
}

export default function BrandPage() {
  const params = useParams();
  const brandId = params.brand as string;
  const brand = getBrand(brandId);
  const trackers = trackersByBrand[brandId] ?? [];
  const [metrics, setMetrics] = useState<Record<string, TrackerMetrics>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      const newMetrics: Record<string, TrackerMetrics> = {};
      for (const tracker of trackers) {
        try {
          const response = await fetch(
            `/api/scores?brandId=${brandId}&trackerId=${tracker.id}&metric=AI Brand Score`
          );
          const data = await response.json();

          // Get values for the main brand
          const mainBrandName = brandId === "hm" ? "H&M" : brand?.name || "";
          let aiScore = 0,
            visScore = 0,
            avgPos = 0;

          // For each metric, get the score for the main brand
          const metricsToFetch = ["AI Brand Score", "Visibility Score", "Average Position"];
          for (const metricType of metricsToFetch) {
            const metricResponse = await fetch(
              `/api/scores?brandId=${brandId}&trackerId=${tracker.id}&metric=${encodeURIComponent(metricType)}`
            );
            const metricData = await metricResponse.json();

            // Get overall dimension value
            if (metricType === "AI Brand Score" && metricData.dimensions?.overall !== undefined) {
              aiScore = Math.round(metricData.dimensions.overall);
            } else if (metricType === "Visibility Score" && metricData.dimensions?.overall !== undefined) {
              visScore = Math.round(metricData.dimensions.overall);
            } else if (metricType === "Average Position" && metricData.dimensions?.overall !== undefined) {
              avgPos = Math.round(metricData.dimensions.overall * 10) / 10;
            }
          }

          newMetrics[tracker.id] = {
            name: tracker.name,
            aiBrandScore: aiScore,
            visibilityScore: visScore,
            avgPosition: avgPos,
            modelsCount: data.models?.length ?? 0,
          };
        } catch {
          newMetrics[tracker.id] = {
            name: tracker.name,
            modelsCount: 0,
          };
        }
      }
      setMetrics(newMetrics);
      setLoading(false);
    };
    if (trackers.length > 0) {
      fetchMetrics();
    } else {
      setLoading(false);
    }
  }, [trackers, brandId, brand?.name]);

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h1 className="text-xl font-semibold text-[#262626]">Brand not found</h1>
        <Link href="/manage-account" className="mt-4 text-[#262626] underline hover:no-underline">
          Back to Manage Account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#f6f6f6]">
      <header className="flex-shrink-0 h-16 bg-white border-b border-[#eeeeee] flex items-center px-8">
        <h1 className="text-xl font-semibold text-[#262626]">{brand.name} Overview</h1>
      </header>
      <main className="flex-1 p-8">
        <section>
          <div className="mb-6">
            <h2 className="text-[25px] font-semibold text-[#262626] mb-6">All Trackers</h2>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg p-8 text-center text-[#7F7F7F]">
              Loading metrics...
            </div>
          ) : trackers.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-[#7F7F7F]">
              No trackers yet.
            </div>
          ) : (
            <div className="bg-white border border-[#eee] rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f6f6f6] border-b border-[#eee]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#262626]">
                      Tracker Name
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#262626]">
                      AI Brand Score
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#262626]">
                      Visibility Score
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#262626]">
                      Avg. Position
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#262626]">
                      Models
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trackers.map((tracker, idx) => {
                    const metric = metrics[tracker.id];
                    return (
                      <tr
                        key={tracker.id}
                        className="border-b border-[#eee] hover:bg-[#f9f9f9] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/${brandId}/${tracker.id}`}
                            className="text-sm text-[#262626] font-medium hover:text-[var(--primary)] underline"
                          >
                            {metric?.name || tracker.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-[#262626]">
                          {metric?.aiBrandScore ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-[#262626]">
                          {metric?.visibilityScore ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-[#262626]">
                          {metric?.avgPosition ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-[#262626]">
                          {metric?.modelsCount ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
