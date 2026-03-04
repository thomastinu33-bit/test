"use client";

import Link from "next/link";
import { AskAIButton, Button } from "@/components/Evertune";
import { TrackerDrawerProvider, useTrackerDrawer } from "./TrackerDrawerContext";
import { TrackerDrawer } from "./TrackerDrawer";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);


function PromptLabContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useTrackerDrawer();

  return (
    <div className="flex flex-col min-h-full bg-[#f6f6f6]">
      <header className="sticky top-0 z-10 flex-shrink-0 h-20 bg-white border-b border-[#eeeeee] flex items-center justify-between px-8">
        <Link href="/prompt-lab/prompt-insights" className="text-xl font-semibold text-[#262626] hover:text-primary-600 transition-colors">Prompt Lab</Link>
        <div className="flex items-center gap-3">
          <AskAIButton />
          <Button variant="primary" className="gap-2">
            <PlusIcon />
            New Tracker
          </Button>
        </div>
      </header>
<div className="flex-1 min-h-0 flex flex-row mt-6 mx-5 mb-5 gap-3">
        <div className="flex-1 min-w-0 bg-white rounded-lg overflow-hidden flex flex-row">
          {children}
        </div>
        {isOpen && (
          <TrackerDrawer onGenerate={() => alert("Generating tracker...")} />
        )}
      </div>
    </div>
  );
}

export default function PromptLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <TrackerDrawerProvider>
      <PromptLabContent>{children}</PromptLabContent>
    </TrackerDrawerProvider>
  );
}
