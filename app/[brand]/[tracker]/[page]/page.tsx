"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const PAGE_CONTENT: Record<string, string> = {
  sources: "Sources content",
  "by-prompts": "By Prompts content",
  keywords: "Keywords content",
  shopping: "Shopping content",
};

export default function TrackerPagePage() {
  const params = useParams();
  const page = params.page as string;

  if (page === "overview") {
    return (
      <div className="space-y-2">
        <h1 className="text-[25px] font-semibold text-[#262626]">Overview</h1>
        <p className="text-[#71717a]">
          See AI visibility on custom prompts for your brand vs. competitors.{" "}
          <Link
            href="#"
            className="font-medium text-[var(--primary)] hover:underline no-underline"
          >
            Learn More
          </Link>
        </p>
      </div>
    );
  }

  const content = PAGE_CONTENT[page] ?? "Page not found";
  return <p className="text-sm text-[#7F7F7F]">{content}</p>;
}
