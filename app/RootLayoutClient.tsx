"use client";

import { SideNav, AiAgentProvider } from "@/components/Evertune";
import { useTracker } from "./TrackerContext";
import { useState } from "react";

export function RootLayoutContent({
  children,
  dmSansFontClass,
}: {
  children: React.ReactNode;
  dmSansFontClass: string;
}) {
  const { isTrackerOpen } = useTracker();
  const [manualCollapse, setManualCollapse] = useState(false);

  const handleCollapseToggle = () => {
    setManualCollapse(!manualCollapse);
  };

  // Show collapsed if either tracker is open OR user manually collapsed it
  const shouldCollapse = isTrackerOpen || manualCollapse;

  return (
    <div className="min-h-screen w-full flex bg-white">
      <SideNav collapsed={shouldCollapse} onCollapseToggle={handleCollapseToggle} />
      <div className="flex-1 bg-white w-full">
        <AiAgentProvider>{children}</AiAgentProvider>
      </div>
    </div>
  );
}
