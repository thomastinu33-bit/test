"use client";

import { TrackerDrawerProvider, useTrackerDrawer } from "./TrackerDrawerContext";
import { TrackerDrawer } from "./TrackerDrawer";
import Script from "next/script";


function PromptLabContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useTrackerDrawer();

  return (
    <div className="flex flex-col min-h-full mx-5">
      {children}
      {isOpen && (
        <TrackerDrawer onGenerate={() => alert("Generating tracker...")} />
      )}
    </div>
  );
}

export default function PromptLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
      <TrackerDrawerProvider>
        <PromptLabContent>{children}</PromptLabContent>
      </TrackerDrawerProvider>
    </>
  );
}
