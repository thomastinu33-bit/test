"use client";

import React, { createContext, useContext, useState } from "react";

interface TrackerContextType {
  isTrackerOpen: boolean;
  setIsTrackerOpen: (open: boolean) => void;
}

interface SideNavContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);
const SideNavContext = createContext<SideNavContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  return (
    <TrackerContext.Provider value={{ isTrackerOpen, setIsTrackerOpen }}>
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (context === undefined) {
    throw new Error("useTracker must be used within TrackerProvider");
  }
  return context;
}

export function useSideNav() {
  const context = useContext(SideNavContext);
  if (context === undefined) {
    throw new Error("useSideNav must be used within SideNavProvider");
  }
  return context;
}

export function SideNavProvider({ children, isCollapsed }: { children: React.ReactNode; isCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  React.useEffect(() => {
    setCollapsed(isCollapsed);
  }, [isCollapsed]);

  return (
    <SideNavContext.Provider value={{ isCollapsed: collapsed, setIsCollapsed: setCollapsed }}>
      {children}
    </SideNavContext.Provider>
  );
}
