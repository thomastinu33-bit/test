"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getTracker, getBrand } from "@/app/manage-account/data";
import { AskAIButton, Button, PageNav } from "@/components/Evertune";
import { TrackerDateProvider } from "./TrackerDateContext";

function formatLocation(location: string): string {
  if (location === "United States English") return "United States";
  return location;
}

function formatDateForInput(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const y = d.getFullYear();
  return `${m}/${day}/${y}`;
}

function parseDateInput(s: string): Date | null {
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, m, d, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TRACKER_PAGE_NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "sources", label: "Sources" },
  { id: "by-prompts", label: "By Prompts" },
  { id: "keywords", label: "Keywords" },
  { id: "shopping", label: "Shopping" },
];

/** Trackers that show Jan 15–22 only in the date picker (Luxury SUV, Luxury SUV v2). */
const LUXURY_SUV_TRACKER_IDS = new Set(["luxury-suvs", "luxury-suvs-v2"]);
const LUXURY_SUV_DATE_MIN = new Date(2025, 0, 15);
const LUXURY_SUV_DATE_MAX = new Date(2025, 0, 22);

const COMPARISON_OPTIONS = [
  { label: "Compare to last 7 days", value: 7 },
  { label: "Compare to last 14 days", value: 14 },
  { label: "Compare to last 30 days", value: 30 },
] as const;

function dateInRange(d: Date, min: Date, max: Date): boolean {
  const t = d.getTime();
  return t >= min.getTime() && t <= max.getTime();
}

/** Format for comparison line: "15 Jan 2025" */
function formatDateCompare(d: Date): string {
  const day = d.getDate();
  const mon = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${mon} ${year}`;
}

/** Single dropdown: first click sets report date (blue), second click sets compare-to date (yellow). */
function ReportAndCompareDatePicker({
  reportDate,
  compareToDate,
  onReportDateChange,
  onCompareToDateChange,
  minDate,
  maxDate,
  id,
}: {
  reportDate: Date;
  compareToDate: Date;
  onReportDateChange: (d: Date) => void;
  onCompareToDateChange: (d: Date) => void;
  minDate: Date;
  maxDate: Date;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [viewMonth, setViewMonth] = useState(() => new Date(minDate.getFullYear(), minDate.getMonth(), 1));
  const ref = useRef<HTMLDivElement>(null);

  const value = step === 1 ? reportDate : compareToDate;

  useEffect(() => {
    if (!open) {
      setStep(1);
      return;
    }
    const v = value.getTime();
    if (v < minDate.getTime()) setViewMonth(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
    else if (v > maxDate.getTime()) setViewMonth(new Date(maxDate.getFullYear(), maxDate.getMonth(), 1));
    else setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [open, value, minDate, maxDate]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: { day: number; isCurrentMonth: boolean; isPrevMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isPrevMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, isPrevMonth: false });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false, isPrevMonth: false });
  }

  const isReportSelected = (day: number, isCurrent: boolean, isPrev: boolean) => {
    if (isCurrent) return reportDate.getMonth() === month && reportDate.getFullYear() === year && reportDate.getDate() === day;
    if (isPrev) return reportDate.getMonth() === month - 1 && reportDate.getFullYear() === year && reportDate.getDate() === day;
    return reportDate.getMonth() === month + 1 && reportDate.getFullYear() === year && reportDate.getDate() === day;
  };
  const isCompareSelected = (day: number, isCurrent: boolean, isPrev: boolean) => {
    if (isCurrent) return compareToDate.getMonth() === month && compareToDate.getFullYear() === year && compareToDate.getDate() === day;
    if (isPrev) return compareToDate.getMonth() === month - 1 && compareToDate.getFullYear() === year && compareToDate.getDate() === day;
    return compareToDate.getMonth() === month + 1 && compareToDate.getFullYear() === year && compareToDate.getDate() === day;
  };

  const isDateDisabled = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean): boolean => {
    let d: Date;
    if (isCurrentMonth) d = new Date(year, month, day);
    else if (isPrevMonth) d = new Date(year, month - 1, day);
    else d = new Date(year, month + 1, day);
    return !dateInRange(d, minDate, maxDate);
  };

  const handleSelect = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    let d: Date;
    if (isCurrentMonth) d = new Date(year, month, day);
    else if (isPrevMonth) d = new Date(year, month - 1, day);
    else d = new Date(year, month + 1, day);
    if (!dateInRange(d, minDate, maxDate)) return;
    if (step === 1) {
      onReportDateChange(d);
      setStep(2);
    } else {
      onCompareToDateChange(d);
      setOpen(false);
    }
  };

  const canGoPrev = viewMonth.getTime() > new Date(minDate.getFullYear(), minDate.getMonth(), 1).getTime();
  const canGoNext = viewMonth.getTime() < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1).getTime();

  return (
    <div className="relative min-w-[200px]" ref={ref}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Date Picker: report date and compare to date"
      >
        <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
          Date Picker
        </span>
        <span className="mr-2 shrink-0 text-[#7F7F7F]">
          <CalendarIcon />
        </span>
        <span className="flex-1 min-w-0 text-sm truncate flex items-center gap-1.5 text-[#262626]">
          <span>{formatDateForInput(reportDate)}</span>
          <span className="text-[#7F7F7F]">→</span>
          <span>{formatDateForInput(compareToDate)}</span>
        </span>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-[280px] bg-white border border-[#e5e5e5] rounded-lg shadow-lg p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Select report date, then compare to date"
        >
          <p className="mb-3 text-center text-xs text-[#7F7F7F]">
            {step === 1 ? "Pick a date" : "Select compare to date"}
          </p>
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              disabled={!canGoPrev}
              className="p-1.5 rounded-md text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </button>
            <span className="text-sm font-medium text-[#262626]">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              disabled={!canGoNext}
              className="p-1.5 rounded-md text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-[#7F7F7F] py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ day, isCurrentMonth, isPrevMonth }, i) => {
              const disabled = isDateDisabled(day, isCurrentMonth, isPrevMonth);
              const reportSel = isReportSelected(day, isCurrentMonth, isPrevMonth);
              const compareSel = isCompareSelected(day, isCurrentMonth, isPrevMonth);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(day, isCurrentMonth, isPrevMonth)}
                  disabled={disabled}
                  className={`w-9 h-9 rounded-full text-sm flex items-center justify-center ${
                    disabled
                      ? "text-[#d4d4d4] cursor-not-allowed"
                      : reportSel
                        ? "bg-[var(--primary)] text-white"
                        : compareSel
                          ? "bg-[#EAB308] text-[#854D0E]"
                          : isCurrentMonth
                            ? "text-[#262626] hover:bg-[#f6f6f6]"
                            : "text-[#a3a3a3] hover:bg-[#f6f6f6]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="mt-3 pt-3 border-t border-[#e5e5e5] text-center text-xs text-[#525252]">
            <span className="font-medium text-[var(--primary)]">{formatDateCompare(reportDate)}</span>
            {" compared to "}
            <span className="font-medium text-[#EAB308]">{formatDateCompare(compareToDate)}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function DatePicker({
  value,
  onChange,
  id,
  label = "Select Date",
  minDate,
  maxDate,
}: {
  value: Date;
  onChange: (d: Date) => void;
  id: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const v = value.getTime();
    if (minDate && v < minDate.getTime()) return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    if (maxDate && v > maxDate.getTime()) return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return new Date(value.getFullYear(), value.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const v = value.getTime();
    if (minDate && v < minDate.getTime()) setViewMonth(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
    else if (maxDate && v > maxDate.getTime()) setViewMonth(new Date(maxDate.getFullYear(), maxDate.getMonth(), 1));
    else setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [open, value, minDate, maxDate]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: { day: number; isCurrentMonth: boolean; isPrevMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isPrevMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, isPrevMonth: false });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false, isPrevMonth: false });
  }

  const isSelected = (day: number, isCurrent: boolean, isPrev: boolean) => {
    if (isCurrent) return value.getMonth() === month && value.getFullYear() === year && value.getDate() === day;
    if (isPrev) return value.getMonth() === month - 1 && value.getFullYear() === year && value.getDate() === day;
    return value.getMonth() === month + 1 && value.getFullYear() === year && value.getDate() === day;
  };

  const isDateDisabled = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean): boolean => {
    if (!minDate || !maxDate) return false;
    let d: Date;
    if (isCurrentMonth) d = new Date(year, month, day);
    else if (isPrevMonth) d = new Date(year, month - 1, day);
    else d = new Date(year, month + 1, day);
    return !dateInRange(d, minDate, maxDate);
  };

  const handleSelect = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    let d: Date;
    if (isCurrentMonth) d = new Date(year, month, day);
    else if (isPrevMonth) d = new Date(year, month - 1, day);
    else d = new Date(year, month + 1, day);
    if (minDate && maxDate && !dateInRange(d, minDate, maxDate)) return;
    onChange(d);
    setOpen(false);
  };

  const canGoPrev = !minDate || viewMonth.getTime() > new Date(minDate.getFullYear(), minDate.getMonth(), 1).getTime();
  const canGoNext = !maxDate || viewMonth.getTime() < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1).getTime();

  return (
    <div className="relative min-w-[180px]" ref={ref}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
      >
        <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
          {label}
        </span>
        <span className="mr-2 shrink-0 text-[#7F7F7F]">
          <CalendarIcon />
        </span>
        <span className="flex-1 min-w-0 text-sm truncate text-[#262626]">{formatDateForInput(value)}</span>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-[280px] bg-white border border-[#e5e5e5] rounded-lg shadow-lg p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Calendar"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              disabled={!canGoPrev}
              className="p-1.5 rounded-md text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </button>
            <span className="text-sm font-medium text-[#262626]">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              disabled={!canGoNext}
              className="p-1.5 rounded-md text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-[#7F7F7F] py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ day, isCurrentMonth, isPrevMonth }, i) => {
              const disabled = isDateDisabled(day, isCurrentMonth, isPrevMonth);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(day, isCurrentMonth, isPrevMonth)}
                  disabled={disabled}
                  className={`w-9 h-9 rounded-full text-sm flex items-center justify-center ${
                    disabled
                      ? "text-[#d4d4d4] cursor-not-allowed"
                      : isSelected(day, isCurrentMonth, isPrevMonth)
                        ? "bg-[var(--primary)] text-white"
                        : isCurrentMonth
                          ? "text-[#262626] hover:bg-[#f6f6f6]"
                          : "text-[#a3a3a3] hover:bg-[#f6f6f6]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DatePickerWithComparisonRadio({
  value,
  onChange,
  comparisonDays,
  onComparisonDaysChange,
  id,
  minDate,
  maxDate,
}: {
  value: Date;
  onChange: (d: Date) => void;
  comparisonDays: number;
  onComparisonDaysChange: (days: number) => void;
  id: string;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const v = value.getTime();
    if (minDate && v < minDate.getTime()) return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    if (maxDate && v > maxDate.getTime()) return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return new Date(value.getFullYear(), value.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const v = value.getTime();
    if (minDate && v < minDate.getTime()) setViewMonth(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
    else if (maxDate && v > maxDate.getTime()) setViewMonth(new Date(maxDate.getFullYear(), maxDate.getMonth(), 1));
    else setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [open, value, minDate, maxDate]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: { day: number; isCurrentMonth: boolean; isPrevMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isPrevMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, isPrevMonth: false });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false, isPrevMonth: false });
  }

  const isSelected = (day: number, isCurrent: boolean, isPrev: boolean) => {
    if (isCurrent) return value.getMonth() === month && value.getFullYear() === year && value.getDate() === day;
    if (isPrev) return value.getMonth() === month - 1 && value.getFullYear() === year && value.getDate() === day;
    return value.getMonth() === month + 1 && value.getFullYear() === year && value.getDate() === day;
  };

  const isDateDisabled = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean): boolean => {
    if (!minDate || !maxDate) return false;
    let d: Date;
    if (isCurrentMonth) d = new Date(year, month, day);
    else if (isPrevMonth) d = new Date(year, month - 1, day);
    else d = new Date(year, month + 1, day);
    return !dateInRange(d, minDate, maxDate);
  };

  const handleSelect = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    let d: Date;
    if (isCurrentMonth) d = new Date(year, month, day);
    else if (isPrevMonth) d = new Date(year, month - 1, day);
    else d = new Date(year, month + 1, day);
    if (minDate && maxDate && !dateInRange(d, minDate, maxDate)) return;
    onChange(d);
    setOpen(false);
  };

  const canGoPrev = !minDate || viewMonth.getTime() > new Date(minDate.getFullYear(), minDate.getMonth(), 1).getTime();
  const canGoNext = !maxDate || viewMonth.getTime() < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1).getTime();

  const comparisonLabel = COMPARISON_OPTIONS.find((o) => o.value === comparisonDays)?.label.replace("Compare to last ", "Last ") ?? `Last ${comparisonDays} days`;

  return (
    <div className="relative min-w-[220px]" ref={ref}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Date Picker"
      >
        <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
          Date Picker
        </span>
        <span className="mr-2 shrink-0 text-[#7F7F7F]">
          <CalendarIcon />
        </span>
        <span className="flex-1 min-w-0 text-sm truncate flex items-center gap-1.5 text-[#262626]">
          <span>{formatDateForInput(value)}</span>
          <span className="text-[#7F7F7F]">·</span>
          <span className="text-[#7F7F7F] text-xs">{comparisonLabel}</span>
        </span>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-[280px] bg-white border border-[#e5e5e5] rounded-lg shadow-lg p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Select date and comparison period"
        >
          {/* Calendar */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              disabled={!canGoPrev}
              className="p-1.5 rounded-md text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </button>
            <span className="text-sm font-medium text-[#262626]">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              disabled={!canGoNext}
              className="p-1.5 rounded-md text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-[#7F7F7F] py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ day, isCurrentMonth, isPrevMonth }, i) => {
              const disabled = isDateDisabled(day, isCurrentMonth, isPrevMonth);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(day, isCurrentMonth, isPrevMonth)}
                  disabled={disabled}
                  className={`w-9 h-9 rounded-full text-sm flex items-center justify-center ${
                    disabled
                      ? "text-[#d4d4d4] cursor-not-allowed"
                      : isSelected(day, isCurrentMonth, isPrevMonth)
                        ? "bg-[var(--primary)] text-white"
                        : isCurrentMonth
                          ? "text-[#262626] hover:bg-[#f6f6f6]"
                          : "text-[#a3a3a3] hover:bg-[#f6f6f6]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Comparison radio */}
          <div className="mt-4 pt-4 border-t border-[#e5e5e5] flex flex-col gap-2.5">
            <p className="text-xs font-medium text-[#262626]">Comparison period</p>
            {COMPARISON_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name={`comparison-${id}`}
                  value={opt.value}
                  checked={comparisonDays === opt.value}
                  onChange={() => onComparisonDaysChange(opt.value)}
                  className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-[#262626] group-hover:text-[#171717] transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TrackerShell({
  brandId,
  trackerId,
  children,
}: {
  brandId: string;
  trackerId: string;
  children: React.ReactNode;
}) {
  const brand = getBrand(brandId);
  const tracker = getTracker(brandId, trackerId);
  const [movingAverage, setMovingAverage] = useState("30-Day");
  const isLuxurySuv = LUXURY_SUV_TRACKER_IDS.has(trackerId);
  const isLuxurySuvV2 = trackerId === "luxury-suvs-v2";
  const datePickerMin = isLuxurySuv ? LUXURY_SUV_DATE_MIN : undefined;
  const datePickerMax = isLuxurySuv ? LUXURY_SUV_DATE_MAX : undefined;
  const [comparisonDays, setComparisonDays] = useState(30);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (isLuxurySuv) return new Date(LUXURY_SUV_DATE_MAX);
    const d = parseDateInput("01/15/2025");
    return d ?? new Date();
  });
  const [compareToDate, setCompareToDate] = useState(() => {
    if (isLuxurySuvV2) {
      const d = new Date(LUXURY_SUV_DATE_MAX);
      d.setDate(d.getDate() - 30);
      return d;
    }
    if (isLuxurySuv) return new Date(LUXURY_SUV_DATE_MIN);
    return new Date();
  });

  // For v2: compute compareToDate from selectedDate minus comparisonDays
  useEffect(() => {
    if (!isLuxurySuvV2) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - comparisonDays);
    setCompareToDate(d);
  }, [selectedDate, comparisonDays, isLuxurySuvV2]);

  if (!brand || !tracker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h1 className="text-xl font-semibold text-[#262626]">Tracker not found</h1>
        <Link href={`/${brandId}`} className="mt-4 text-[#262626] underline hover:no-underline">
          Back to {brand?.name ?? "Brand"}
        </Link>
      </div>
    );
  }

  const locationLabel = formatLocation(tracker.location);
  const basePath = `/${brandId}/${trackerId}`;

  useEffect(() => {
    if (!isLuxurySuv) return;
    setSelectedDate((prev) => {
      if (prev.getTime() < LUXURY_SUV_DATE_MIN.getTime()) return new Date(LUXURY_SUV_DATE_MIN);
      if (prev.getTime() > LUXURY_SUV_DATE_MAX.getTime()) return new Date(LUXURY_SUV_DATE_MAX);
      return prev;
    });
    // Only clamp compareToDate for v1; v2 computes it from comparisonDays
    if (!isLuxurySuvV2) {
      setCompareToDate((prev) => {
        if (prev.getTime() < LUXURY_SUV_DATE_MIN.getTime()) return new Date(LUXURY_SUV_DATE_MIN);
        if (prev.getTime() > LUXURY_SUV_DATE_MAX.getTime()) return new Date(LUXURY_SUV_DATE_MAX);
        return prev;
      });
    }
  }, [isLuxurySuv, isLuxurySuvV2]);

  return (
    <TrackerDateProvider
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      compareToDate={compareToDate}
      setCompareToDate={setCompareToDate}
      useDateForData={isLuxurySuv}
      comparisonDays={isLuxurySuvV2 ? comparisonDays : null}
    >
      <div className="flex flex-col min-h-full bg-[#f6f6f6]">
        <header className="flex-shrink-0 h-20 bg-white border-b border-[#eeeeee] px-6 flex items-center">
          <div className="flex items-center justify-between gap-6 w-full">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#e5e5e5]" aria-hidden />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--nav-brand)]">
                  {brand.name}
                </span>
                <span className="text-lg font-semibold text-[#262626] truncate">
                  {tracker.name} <span className="font-normal text-[#262626]">| {locationLabel}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Data / view controls */}
              <div className="flex items-center gap-3">
                <div className="relative rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] min-w-[140px] h-10 flex items-center pl-3 pr-9 opacity-70 cursor-not-allowed" aria-disabled="true">
                  <span className="absolute left-3 top-0 -translate-y-1/2 bg-[#f5f5f5] px-1 text-xs text-[#7F7F7F]">
                    Moving Average
                  </span>
                  <span className="text-sm text-[#7F7F7F] truncate">{movingAverage}</span>
                  <button
                    type="button"
                    disabled
                    aria-label="Change moving average (disabled)"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7F7F7F] cursor-not-allowed pointer-events-none"
                  >
                    <ChevronDownIcon />
                  </button>
                </div>
                {isLuxurySuvV2 ? (
                  <DatePickerWithComparisonRadio
                    id="tracker-date-picker"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    comparisonDays={comparisonDays}
                    onComparisonDaysChange={setComparisonDays}
                    minDate={datePickerMin}
                    maxDate={datePickerMax}
                  />
                ) : isLuxurySuv && datePickerMin && datePickerMax ? (
                  <ReportAndCompareDatePicker
                    id="tracker-date-picker"
                    reportDate={selectedDate}
                    compareToDate={compareToDate}
                    onReportDateChange={setSelectedDate}
                    onCompareToDateChange={setCompareToDate}
                    minDate={datePickerMin}
                    maxDate={datePickerMax}
                  />
                ) : (
                  <DatePicker
                    id="tracker-date-picker"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    label="Date Picker"
                    minDate={datePickerMin}
                    maxDate={datePickerMax}
                  />
                )}
              </div>
              <div className="h-8 w-px bg-[#e5e5e5]" aria-hidden />
              {/* Utility: Settings + Ask AI */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-[#262626] hover:bg-[#f5f5f5] transition-colors"
                  aria-label="Settings"
                >
                  <SettingsIcon />
                </button>
                <AskAIButton />
              </div>
              {/* Primary action */}
              <Button variant="primary" className="gap-2 h-10">
                <PlusIcon />
                New Tracker
              </Button>
            </div>
          </div>
        </header>
        <div className="flex-shrink-0">
          <PageNav basePath={basePath} items={TRACKER_PAGE_NAV_ITEMS} />
        </div>
        <div className="flex-1 min-h-0 flex flex-col mt-6">
          <div className="flex-1 min-h-0 mt-0 mx-5 mb-5 bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </TrackerDateProvider>
  );
}
