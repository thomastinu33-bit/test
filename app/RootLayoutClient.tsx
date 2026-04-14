"use client";

import { SideNav, AiAgentProvider } from "@/components/Evertune";
import { useTracker } from "./TrackerContext";

export function RootLayoutContent({
  children,
  dmSansFontClass,
}: {
  children: React.ReactNode;
  dmSansFontClass: string;
}) {
  const { isTrackerOpen } = useTracker();

  return (
    <div className="min-h-screen flex">
      <SideNav collapsed={isTrackerOpen} />
      <div className="flex-1">
        <AiAgentProvider>{children}</AiAgentProvider>
      </div>
    </div>
  );
}
