"use client";

import { TrackerDrawerProvider, useTrackerDrawer } from "./TrackerDrawerContext";
import { TrackerDrawer } from "./TrackerDrawer";


function PromptLabContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useTrackerDrawer();

  return (
    <div className="flex flex-col min-h-full bg-[#f6f6f6]">
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
