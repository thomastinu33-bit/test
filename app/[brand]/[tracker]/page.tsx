"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTracker, getBrand } from "@/app/manage-account/data";

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

function DatePicker({
  value,
  onChange,
  id,
  label = "Select Date",
}: {
  value: Date;
  onChange: (d: Date) => void;
  id: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [open, value]);

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

  const handleSelect = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    if (isCurrentMonth) {
      onChange(new Date(year, month, day));
    } else if (isPrevMonth) {
      onChange(new Date(year, month - 1, day));
    } else {
      onChange(new Date(year, month + 1, day));
    }
    setOpen(false);
  };

  return (
    <div className="relative min-w-[180px]" ref={ref}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-14 pl-3 pr-9 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
      >
        <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
          {label}
        </span>
        <span className="mr-2 text-[#7F7F7F] shrink-0 pt-1">
          <CalendarIcon />
        </span>
        <span className="flex-1 min-w-0 pt-1 text-sm text-[#262626] truncate">{formatDateForInput(value)}</span>
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
              className="p-1.5 rounded-md text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626]"
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
              className="p-1.5 rounded-md text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626]"
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
            {cells.map(({ day, isCurrentMonth, isPrevMonth }, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(day, isCurrentMonth, isPrevMonth)}
                className={`w-9 h-9 rounded-full text-sm flex items-center justify-center ${
                  isSelected(day, isCurrentMonth, isPrevMonth)
                    ? "bg-[var(--primary)] text-white"
                    : isCurrentMonth
                      ? "text-[#262626] hover:bg-[#f6f6f6]"
                      : "text-[#a3a3a3] hover:bg-[#f6f6f6]"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackerPage() {
  const params = useParams();
  const brandId = params.brand as string;
  const trackerId = params.tracker as string;
  const brand = getBrand(brandId);
  const tracker = getTracker(brandId, trackerId);
  const [movingAverage, setMovingAverage] = useState("30-Day");
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = parseDateInput("09/30/2025");
    return d ?? new Date();
  });

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

  return (
    <div className="flex flex-col min-h-full bg-[#f6f6f6]">
      <header className="flex-shrink-0 h-20 bg-white border-b border-[#eeeeee] px-6 flex items-center">
        <div className="flex items-center justify-between gap-6 w-full">
          {/* Left: logo, brand, tracker title */}
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

          {/* Right: Moving Average, Select Date, New Tracker (M3-style outlined) */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative rounded-lg border border-[#e5e5e5] bg-white min-w-[140px] h-14 flex items-center pl-3 pr-9">
              <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
                Moving Average
              </span>
              <span className="text-sm text-[#262626] truncate pt-1">{movingAverage}</span>
              <button
                type="button"
                onClick={() => setMovingAverage(movingAverage === "30-Day" ? "7-Day" : "30-Day")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7F7F7F] hover:text-[#262626]"
                aria-label="Change moving average"
              >
                <ChevronDownIcon />
              </button>
            </div>
            <DatePicker
              id="tracker-date-picker"
              value={selectedDate}
              onChange={setSelectedDate}
              label="Select Date"
            />
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-colors"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-white">
                <PlusIcon />
              </span>
              New Tracker
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-8" />
    </div>
  );
}
