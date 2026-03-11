"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/** Format Date as YYYY-MM-DD for API params. */
export function formatDateForApi(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface TrackerDateContextValue {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  /** YYYY-MM-DD for API query params; null when date should not drive data (e.g. non–Luxury SUV). */
  selectedDateStr: string | null;
  compareToDate: Date;
  setCompareToDate: (d: Date) => void;
  /** YYYY-MM-DD for compare-to API param; null when not used. */
  compareToDateStr: string | null;
  /** Number of days for rolling per-day comparison in timeline view; null when not set. */
  comparisonDays: number | null;
}

const TrackerDateContext = createContext<TrackerDateContextValue | null>(null);

export function TrackerDateProvider({
  children,
  selectedDate: propSelectedDate,
  setSelectedDate: propSetSelectedDate,
  compareToDate: propCompareToDate,
  setCompareToDate: propSetCompareToDate,
  useDateForData = false,
  comparisonDays = null,
}: {
  children: ReactNode;
  selectedDate?: Date;
  setSelectedDate?: (d: Date) => void;
  compareToDate?: Date;
  setCompareToDate?: (d: Date) => void;
  /** When true, data fetches use these dates (e.g. Luxury SUV trackers). */
  useDateForData?: boolean;
  comparisonDays?: number | null;
}) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(propSelectedDate ?? today);
  const [compareToDate, setCompareToDate] = useState(propCompareToDate ?? new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));

  const value: TrackerDateContextValue = {
    selectedDate: propSelectedDate ?? selectedDate,
    setSelectedDate: propSetSelectedDate ?? setSelectedDate,
    selectedDateStr: useDateForData ? formatDateForApi(propSelectedDate ?? selectedDate) : null,
    compareToDate: propCompareToDate ?? compareToDate,
    setCompareToDate: propSetCompareToDate ?? setCompareToDate,
    compareToDateStr: useDateForData ? formatDateForApi(propCompareToDate ?? compareToDate) : null,
    comparisonDays: useDateForData ? comparisonDays : null,
  };

  return (
    <TrackerDateContext.Provider value={value}>
      {children}
    </TrackerDateContext.Provider>
  );
}

export function useTrackerDate(): TrackerDateContextValue {
  const ctx = useContext(TrackerDateContext);
  if (!ctx) {
    throw new Error("useTrackerDate must be used within TrackerDateProvider");
  }
  return ctx;
}
