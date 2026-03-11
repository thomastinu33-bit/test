"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getBrand, trackersByBrand } from "@/app/manage-account/data";
import { useEffect, useState } from "react";
import { OverviewViz } from "@/app/[brand]/[tracker]/[page]/OverviewViz";
import { TrackerDateProvider } from "@/app/[brand]/[tracker]/TrackerDateContext";

interface TrackerMetrics {
  name: string;
  country?: string;
  aiBrandScore?: number;
  aiBrandScoreChange?: number;
  visibilityScore?: number;
  visibilityScoreChange?: number;
  avgPosition?: number;
  avgPositionChange?: number;
  modelsCount: number;
  isMock?: boolean;
}

const MOCK_TRACKERS: TrackerMetrics[] = [
  {
    name: "Summer Collection",
    country: "Canada",
    aiBrandScore: 68,
    aiBrandScoreChange: 3,
    visibilityScore: 82,
    visibilityScoreChange: -1,
    avgPosition: 3.2,
    avgPositionChange: -0.5,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Winter Sale",
    country: "United Kingdom",
    aiBrandScore: 55,
    aiBrandScoreChange: -2,
    visibilityScore: 71,
    visibilityScoreChange: 2,
    avgPosition: 5.1,
    avgPositionChange: 0.8,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Accessories",
    country: "Germany",
    aiBrandScore: 72,
    aiBrandScoreChange: 5,
    visibilityScore: 88,
    visibilityScoreChange: 3,
    avgPosition: 2.9,
    avgPositionChange: -0.3,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Footwear",
    country: "France",
    aiBrandScore: 61,
    aiBrandScoreChange: 1,
    visibilityScore: 75,
    visibilityScoreChange: 0,
    avgPosition: 4.2,
    avgPositionChange: 0.1,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Activewear",
    country: "United States",
    aiBrandScore: 78,
    aiBrandScoreChange: 4,
    visibilityScore: 91,
    visibilityScoreChange: 2,
    avgPosition: 2.1,
    avgPositionChange: -0.7,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Dresses",
    country: "Italy",
    aiBrandScore: 64,
    aiBrandScoreChange: -1,
    visibilityScore: 79,
    visibilityScoreChange: -2,
    avgPosition: 3.8,
    avgPositionChange: 0.4,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Kids Collection",
    country: "Spain",
    aiBrandScore: 59,
    aiBrandScoreChange: 2,
    visibilityScore: 73,
    visibilityScoreChange: 1,
    avgPosition: 4.6,
    avgPositionChange: -0.2,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Basics",
    country: "Netherlands",
    aiBrandScore: 70,
    aiBrandScoreChange: 3,
    visibilityScore: 85,
    visibilityScoreChange: 4,
    avgPosition: 3.0,
    avgPositionChange: -0.6,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Premium Line",
    country: "Sweden",
    aiBrandScore: 76,
    aiBrandScoreChange: 6,
    visibilityScore: 89,
    visibilityScoreChange: 3,
    avgPosition: 2.4,
    avgPositionChange: -0.9,
    modelsCount: 0,
    isMock: true,
  },
  {
    name: "Clearance Sale",
    country: "Belgium",
    aiBrandScore: 52,
    aiBrandScoreChange: -3,
    visibilityScore: 68,
    visibilityScoreChange: -2,
    avgPosition: 5.9,
    avgPositionChange: 1.2,
    modelsCount: 0,
    isMock: true,
  },
];

const ITEMS_PER_PAGE = 10;

export default function BrandPage() {
  const params = useParams();
  const brandId = params.brand as string;
  const brand = getBrand(brandId);
  const trackers = trackersByBrand[brandId] ?? [];
  const [metrics, setMetrics] = useState<Record<string, TrackerMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  // For H&M, default to "all" trackers; for other brands, use first tracker
  const [selectedTracker, setSelectedTracker] = useState<string>(brandId === "hm" ? "all" : (trackers[0]?.id || ""));
  const [trackerDropdownOpen, setTrackerDropdownOpen] = useState(false);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [viewType, setViewType] = useState<"brand" | "model">("brand");

  useEffect(() => {
    const fetchMetrics = async () => {
      const newMetrics: Record<string, TrackerMetrics> = {};
      for (const tracker of trackers) {
        try {
          const response = await fetch(
            `/api/scores?brandId=${brandId}&trackerId=${tracker.id}&metric=AI Brand Score`
          );
          const data = await response.json();

          // For each metric, get the score and change for the main brand
          const metricsToFetch = ["AI Brand Score", "Visibility Score", "Average Position"];
          let aiScore = 0,
            aiScoreChange = 0,
            visScore = 0,
            visScoreChange = 0,
            avgPos = 0,
            avgPosChange = 0;

          for (const metricType of metricsToFetch) {
            const metricResponse = await fetch(
              `/api/scores?brandId=${brandId}&trackerId=${tracker.id}&metric=${encodeURIComponent(metricType)}`
            );
            const metricData = await metricResponse.json();

            // Get overall dimension value and change
            if (metricType === "AI Brand Score" && metricData.dimensions?.overall !== undefined) {
              aiScore = Math.round(metricData.dimensions.overall);
              aiScoreChange = Math.round((metricData.dimensions?.changeOverall ?? 0) * 10) / 10;
            } else if (metricType === "Visibility Score" && metricData.dimensions?.overall !== undefined) {
              visScore = Math.round(metricData.dimensions.overall);
              visScoreChange = Math.round((metricData.dimensions?.changeOverall ?? 0) * 10) / 10;
            } else if (metricType === "Average Position" && metricData.dimensions?.overall !== undefined) {
              avgPos = Math.round(metricData.dimensions.overall * 10) / 10;
              avgPosChange = Math.round((metricData.dimensions?.changeOverall ?? 0) * 10) / 10;
            }
          }

          newMetrics[tracker.id] = {
            name: tracker.name,
            aiBrandScore: aiScore,
            aiBrandScoreChange: aiScoreChange,
            visibilityScore: visScore,
            visibilityScoreChange: visScoreChange,
            avgPosition: avgPos,
            avgPositionChange: avgPosChange,
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

  // Fetch timeline data for visualization
  useEffect(() => {
    const fetchTimelineData = async () => {
      if (trackers.length === 0) return;
      try {
        const response = await fetch(
          `/api/timeline?brandId=${brandId}&trackerId=${trackers[0]?.id}&metric=AI Brand Score`
        );
        const data = await response.json();
        setTimelineData(data);
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
      }
    };
    fetchTimelineData();
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

  // Extract country from location string
  const getCountryFromLocation = (location: string) => {
    if (location.includes("United Kingdom")) return "United Kingdom";
    if (location.includes("Germany")) return "Germany";
    return "United States";
  };

  // Get flag icon URL for country
  const getCountryCode = (country: string | null) => {
    const countryMap: Record<string, string> = {
      "United States": "us",
      "United Kingdom": "gb",
      "Germany": "de",
    };
    return countryMap[country || ""] ?? "un";
  };

  const getFlagIcon = (country: string | null) => {
    if (!country) return null;
    const code = getCountryCode(country);
    return (
      <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center bg-[#f5f5f5] flex-shrink-0">
        <img
          src={`https://flagicons.lipis.dev/flags/4x3/${code}.svg`}
          alt={country}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  // Build combined tracker list
  const allTrackers: Array<{ id: string; name: string; isMock: boolean; mockIndex?: number; country: string; location: string }> = trackers
    .map((tracker) => ({ ...tracker, isMock: false, country: getCountryFromLocation(tracker.location || "") }))
    .concat(
      MOCK_TRACKERS.map((mockTracker, idx) => ({
        id: `mock-${idx}`,
        name: mockTracker.name,
        isMock: true,
        mockIndex: idx,
        country: mockTracker.country || "United States",
        location: mockTracker.country || "United States",
      }))
    );

  // Get unique countries for dropdown
  const countries = Array.from(
    new Set(
      allTrackers
        .map((tracker) => tracker.country)
        .filter(Boolean)
    )
  ).sort();

  // Filter trackers based on search and country
  const filteredTrackers = allTrackers.filter((tracker) => {
    const metric = tracker.isMock
      ? MOCK_TRACKERS[tracker.mockIndex as number]
      : metrics[tracker.id];
    const trackerName = metric?.name || tracker.name;
    const trackerCountry = tracker.country;

    const matchesSearch = trackerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = !selectedCountry || trackerCountry === selectedCountry;

    return matchesSearch && matchesCountry;
  });

  const totalPages = Math.ceil(filteredTrackers.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const pageTrackers = filteredTrackers.slice(startIdx, endIdx);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCountry]);

  // Reset tracker selection when country changes if current tracker is not in filtered list
  useEffect(() => {
    if (selectedCountry && brandId === "hm") {
      const filteredTrackersForCountry = trackers.filter(t => t.location === selectedCountry);
      const currentTrackerExists = selectedTracker === "all" || filteredTrackersForCountry.some(t => t.id === selectedTracker);

      if (!currentTrackerExists) {
        // Reset to "all" if current tracker not in filtered list
        setSelectedTracker("all");
      }
    } else if (!selectedCountry && brandId === "hm") {
      // Reset to "all" when clearing country filter
      setSelectedTracker("all");
    }
  }, [selectedCountry, trackers, brandId]);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f6f6f6" }}>
      <header className="flex-shrink-0 bg-white border-b border-[#eeeeee] px-8 py-6">
      </header>
      <main className="flex-1 overflow-y-auto p-8 m-5 bg-white rounded-lg">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#262626]">{brand.name} Overview</h1>
              <p className="text-sm text-[#7F7F7F] mt-1">An overview of all the trackers for this brand <a href="#" className="text-[#022460] hover:underline">Learn more</a></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative min-w-[10rem]">
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen((o) => !o)}
                  className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
                  aria-label="Select country"
                  aria-expanded={countryDropdownOpen}
                >
                  <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
                    Country
                  </span>
                  {selectedCountry && getFlagIcon(selectedCountry)}
                  <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">
                    {selectedCountry || "All Countries"}
                  </span>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {countryDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" aria-hidden onClick={() => setCountryDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-[#e5e5e5] bg-white shadow-lg overflow-hidden">
                      <div className="max-h-64 overflow-auto py-1">
                        <button
                          key="all"
                          type="button"
                          onClick={() => {
                            setSelectedCountry(null);
                            setCountryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                            !selectedCountry ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                          }`}
                        >
                          <span className="truncate">All Countries</span>
                        </button>
                        {[
                          "United States",
                          "United Kingdom",
                          "Germany",
                        ].map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country);
                              setCountryDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                              selectedCountry === country ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                            }`}
                          >
                            {getFlagIcon(country)}
                            <span className="truncate">{country}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button className="flex items-center gap-1 px-3 py-2 bg-[#475569] text-white rounded-lg text-sm font-medium hover:bg-[#364152] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>

        <TrackerDateProvider>
          <div className="mb-8">
            <OverviewViz
              overrideBrandId={brandId}
              overrideTrackerId={selectedTracker}
              onTrackerChange={setSelectedTracker}
              trackerList={selectedCountry ? trackers.filter(t => t.location === selectedCountry) : trackers}
            />
          </div>
        </TrackerDateProvider>

        <section className="bg-white rounded-lg shadow-sm border border-[#eee] p-6">
          <h2 className="text-xl font-semibold text-[#262626] mb-6">Results</h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex gap-2 border-b border-[#eee]">
              <button className="px-4 py-3 text-sm font-medium text-[#262626] border-b-2 border-[#022460]">By Brand</button>
              <button className="px-4 py-3 text-sm font-medium text-[#7F7F7F] hover:text-[#262626]">By Model</button>
              <button className="px-4 py-3 text-sm font-medium text-[#7F7F7F] hover:text-[#262626]">By Topic</button>
            </div>
          </div>

          <div className="flex gap-4 items-center mb-6">
            <input
              type="text"
              placeholder="🔍 Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#ddd] rounded-lg text-sm bg-[#f9f9f9] focus:outline-none focus:border-[#022460] focus:bg-white"
            />
            <div className="flex gap-3">
              <select
                value={selectedCountry || ""}
                onChange={(e) => setSelectedCountry(e.target.value || null)}
                className="px-4 py-2 border border-[#ddd] rounded-lg text-sm focus:outline-none focus:border-[#022460] bg-white"
              >
                <option value="">All</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <select className="px-4 py-2 border border-[#ddd] rounded-lg text-sm focus:outline-none focus:border-[#022460] bg-white">
                <option>All Models</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg p-8 text-center text-[#7F7F7F]">
              Loading metrics...
            </div>
          ) : trackers.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-[#7F7F7F]">
              No trackers yet.
            </div>
          ) : filteredTrackers.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-[#7F7F7F]">
              No trackers match your search or filter.
            </div>
          ) : (
            <div className="overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="bg-[#f6f6f6] border-b border-[#eee]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#262626]">
                      Tracker Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#262626]">
                      Country
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
                  </tr>
                </thead>
                <tbody>
                  {pageTrackers.map((tracker) => {
                    const metric = tracker.isMock
                      ? MOCK_TRACKERS[tracker.mockIndex as number]
                      : metrics[tracker.id];
                    const aiBrandProgress = (metric?.aiBrandScore ?? 0) || 0;
                    const visibilityProgress = (metric?.visibilityScore ?? 0) || 0;
                    return (
                      <tr
                        key={`${tracker.isMock ? "mock" : "real"}-${tracker.id}`}
                        className="border-b border-[#eee] hover:bg-[#f9f9f9] transition-colors"
                      >
                        <td className="px-6 py-4">
                          {tracker.isMock ? (
                            <span className="text-sm text-[#262626] font-medium">
                              {metric?.name}
                            </span>
                          ) : (
                            <Link
                              href={`/${brandId}/${tracker.id}`}
                              className="text-sm text-[var(--primary)] font-medium hover:opacity-80"
                            >
                              {metric?.name || tracker.name}
                            </Link>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#262626]">
                          {tracker.country}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#262626]">
                                {metric?.aiBrandScore ?? "—"}
                              </span>
                              {metric?.aiBrandScoreChange !== undefined && metric.aiBrandScoreChange !== 0 && (
                                <span
                                  className={`inline-flex items-center rounded-full px-1.5 py-px text-[8px] font-semibold tabular-nums uppercase tracking-wide ${
                                    metric.aiBrandScoreChange > 0
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {metric.aiBrandScoreChange > 0 ? "▲" : "▼"} {Math.abs(metric.aiBrandScoreChange).toFixed(1)} pts
                                </span>
                              )}
                            </div>
                            {metric?.aiBrandScore !== undefined && (
                              <div className="bg-[#f0f0f0] h-2 rounded-full overflow-hidden w-full">
                                <div
                                  className="bg-[#022460] h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(aiBrandProgress, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#262626]">
                                {metric?.visibilityScore ?? "—"}
                              </span>
                              {metric?.visibilityScoreChange !== undefined && metric.visibilityScoreChange !== 0 && (
                                <span
                                  className={`inline-flex items-center rounded-full px-1.5 py-px text-[8px] font-semibold tabular-nums uppercase tracking-wide ${
                                    metric.visibilityScoreChange > 0
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {metric.visibilityScoreChange > 0 ? "▲" : "▼"} {Math.abs(metric.visibilityScoreChange).toFixed(1)} pts
                                </span>
                              )}
                            </div>
                            {metric?.visibilityScore !== undefined && (
                              <div className="bg-[#f0f0f0] h-2 rounded-full overflow-hidden w-full">
                                <div
                                  className="bg-[#022460] h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(visibilityProgress, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#262626]">
                              {metric?.avgPosition ?? "—"}
                            </span>
                            {metric?.avgPositionChange !== undefined && metric.avgPositionChange !== 0 && (
                              <span
                                className={`inline-flex items-center rounded-full px-1.5 py-px text-[8px] font-semibold tabular-nums uppercase tracking-wide ${
                                  metric.avgPositionChange < 0
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {metric.avgPositionChange < 0 ? "▲" : "▼"} {Math.abs(metric.avgPositionChange).toFixed(1)} pts
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#eee] bg-[#f6f6f6]">
                  <div className="text-sm text-[#262626]">
                    Showing {startIdx + 1} to {Math.min(endIdx, filteredTrackers.length)} of {filteredTrackers.length} trackers
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-[#262626] bg-white border border-[#ddd] rounded hover:bg-[#f9f9f9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-sm font-medium rounded transition-colors ${
                            currentPage === page
                              ? "bg-[#022460] text-white"
                              : "text-[#262626] hover:bg-[#f0f0f0]"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-[#262626] bg-white border border-[#ddd] rounded hover:bg-[#f9f9f9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
