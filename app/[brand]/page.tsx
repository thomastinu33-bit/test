"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getBrand, trackersByBrand } from "@/app/manage-account/data";
import { useEffect, useState } from "react";

interface TrackerStats {
  name: string;
  topBrands: string[];
  modelsCount: number;
}

export default function BrandPage() {
  const params = useParams();
  const brandId = params.brand as string;
  const brand = getBrand(brandId);
  const trackers = trackersByBrand[brandId] ?? [];
  const [stats, setStats] = useState<Record<string, TrackerStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const newStats: Record<string, TrackerStats> = {};
      for (const tracker of trackers) {
        try {
          const response = await fetch(
            `/api/timeline?brandId=${brandId}&trackerId=${tracker.id}&metric=AI Brand Score`
          );
          const data = await response.json();
          newStats[tracker.id] = {
            name: tracker.name,
            topBrands: data.brands?.slice(0, 5) ?? [],
            modelsCount: data.models?.length ?? 0,
          };
        } catch {
          newStats[tracker.id] = {
            name: tracker.name,
            topBrands: [],
            modelsCount: 0,
          };
        }
      }
      setStats(newStats);
      setLoading(false);
    };
    if (trackers.length > 0) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [trackers, brandId]);

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
        <h1 className="text-xl font-semibold text-[#262626]">{brand.name}</h1>
      </header>
      <main className="flex-1 p-8">
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[#262626] mb-4">Trackers Overview</h2>
          {loading ? (
            <div className="text-sm text-[#7F7F7F]">Loading stats...</div>
          ) : trackers.length === 0 ? (
            <div className="text-sm text-[#7F7F7F]">No trackers yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trackers.map((t) => {
                const stat = stats[t.id];
                return (
                  <Link
                    key={t.id}
                    href={`/${brandId}/${t.id}`}
                    className="bg-white border border-[#eeeeee] rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-[#262626] mb-3">{t.name}</h3>
                    {stat ? (
                      <>
                        <div className="mb-3">
                          <p className="text-xs font-medium text-[#7F7F7F] mb-1">Top Brands</p>
                          <div className="flex flex-wrap gap-1">
                            {stat.topBrands.length > 0 ? (
                              stat.topBrands.map((b) => (
                                <span key={b} className="text-xs bg-[#f0f0f0] text-[#262626] px-2 py-1 rounded">
                                  {b}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[#7F7F7F]">No brands</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-[#7F7F7F]">
                          {stat.modelsCount} AI model{stat.modelsCount !== 1 ? "s" : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-[#7F7F7F]">No data available</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
