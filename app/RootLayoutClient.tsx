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
    <div className="min-h-screen w-full">
      <SideNav collapsed={shouldCollapse} onCollapseToggle={handleCollapseToggle} />
      <div className={`transition-all duration-200 ${shouldCollapse ? "pl-[72px]" : "pl-[280px]"}`}>
        <AiAgentProvider>{children}</AiAgentProvider>
      </div>
    </div>
  );
}
