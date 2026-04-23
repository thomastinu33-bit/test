"use client";

import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="bg-[#f6f6f6] min-h-screen flex flex-col px-5 py-5">
      {/* Tabs */}
      <div className="bg-[#f6f6f6] pt-5 w-full" style={{borderTopLeftRadius: '8px', borderTopRightRadius: '8px'}}>
        <div className="flex gap-0 px-8">
          <button
            type="button"
            className="px-6 py-3 font-medium text-base transition-colors bg-[#048BC5] text-white"
          >
            Overview
          </button>
          <Link
            href="/site-audit/audited-pages"
            className="px-6 py-3 font-medium text-base transition-colors bg-[#E1EBF8] text-[#262626] opacity-70 hover:opacity-100"
          >
            Audited pages
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white font-sans pt-8 pb-8 w-full flex-1">
        <div className="space-y-8 px-8 max-w-6xl">
          <div>
            <h2 className="text-2xl font-bold text-[#262626] mb-2">Site Audit Overview</h2>
            <p className="text-base text-[#7f7f7f]">
              Monitor and analyze your website's health and performance metrics.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Pages", value: "0", color: "bg-blue-50" },
              { label: "Issues Found", value: "0", color: "bg-red-50" },
              { label: "Passed Checks", value: "0", color: "bg-green-50" },
              { label: "Last Audit", value: "Never", color: "bg-gray-50" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} p-6 rounded-lg`}>
                <p className="text-sm text-[#7f7f7f] mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-[#262626]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
