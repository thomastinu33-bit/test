"use client";

import React, { createContext, useContext, useState } from "react";

interface TrackerContextType {
  isTrackerOpen: boolean;
  setIsTrackerOpen: (open: boolean) => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

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
