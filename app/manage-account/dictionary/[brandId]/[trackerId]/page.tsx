"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, AskAIButton } from "@/components/Evertune";
import { getBrand, getTracker } from "@/app/manage-account/data";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="#7F7F7F" strokeWidth="1.5" />
    <path d="M16.5 16.5L21 21" stroke="#7F7F7F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5a2.5 2.5 0 0 0 2.5 2.5H20M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type TermAction = "is-competitor" | "mark-competitor" | "include";

export type SurveyTermRow = {
  searchTerm: string;
  displayTerm: string;
  isCompetitor: boolean;
  action: TermAction;
};

function parseDictionaryCsv(csvText: string): SurveyTermRow[] {
  const lines = csvText.trim().split(/\r?\n/);
  const rows: SurveyTermRow[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line === "ev_brand_search_term_dictionary") continue;
    if (i === 1 && line === "search_term,standardized_make_and_model") continue;
    const idx = line.indexOf(",");
    if (idx === -1) continue;
    const searchTerm = line.slice(0, idx).trim();
    const displayTerm = line.slice(idx + 1).trim();
    if (!searchTerm && !displayTerm) continue;
    rows.push({
      searchTerm: searchTerm || displayTerm,
      displayTerm: displayTerm || searchTerm,
      isCompetitor: false,
      action: "mark-competitor",
    });
  }
  return rows;
}

const BASE_COMPETITORS = ["BMW", "AUDI", "VOLVO", "MERCEDES-BENZ"];

const COMPETITOR_DISPLAY_NAMES = [
  "BMW",
  "BMW (IX)",
  "AUDI",
  "VOLVO",
  "MERCEDES-BENZ",
];

export function DictionaryTrackerView(props?: { brandId?: string; trackerId?: string }) {
  const params = useParams();
  const brandId = (props?.brandId ?? params.brandId) as string;
  const trackerId = (props?.trackerId ?? params.trackerId) as string;
  const [surveyTerms, setSurveyTerms] = useState<SurveyTermRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ignoredTerms, setIgnoredTerms] = useState<Set<string>>(new Set());
  const [competitorTerms, setCompetitorTerms] = useState<Set<string>>(new Set());
  const [displayTerms, setDisplayTerms] = useState<Record<string, string>>({});
  const [openDropdownFor, setOpenDropdownFor] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bulkSelectAllRef = useRef<HTMLInputElement>(null);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditingCompetitors, setIsEditingCompetitors] = useState(false);
  const [addedCompetitors, setAddedCompetitors] = useState<string[]>([]);
  const [removedCompetitors, setRemovedCompetitors] = useState<Set<string>>(new Set());
  const [newCompetitorInput, setNewCompetitorInput] = useState("");
  const [highlightedTerms, setHighlightedTerms] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkExcludedRows, setBulkExcludedRows] = useState<Set<string>>(new Set());
  const [bulkMapTerm, setBulkMapTerm] = useState("");
  const [lastBulkMapping, setLastBulkMapping] = useState<{
    appliedTerm: string;
    updates: { searchTerm: string; previousDisplayTerm: string }[];
  } | null>(null);
  const [editedDisplayTerms, setEditedDisplayTerms] = useState<Set<string>>(new Set());
  const [userAddedTerms, setUserAddedTerms] = useState<
    { id: string; searchTerm: string; displayTerm: string }[]
  >([]);
  const [savedUserTerms, setSavedUserTerms] = useState<SurveyTermRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/test-dictionary.csv")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dictionary");
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const rows = parseDictionaryCsv(text);
        setSurveyTerms(rows);
        setDisplayTerms(
          Object.fromEntries(rows.map((t) => [t.searchTerm, t.displayTerm]))
        );
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const competitorDisplayNames = useMemo(
    () => new Set([...COMPETITOR_DISPLAY_NAMES, ...addedCompetitors]),
    [addedCompetitors]
  );

  const competitorsList = useMemo(() => {
    const fromMarked = Array.from(competitorTerms)
      .map((st) => displayTerms[st])
      .filter((name): name is string => Boolean(name));
    const seen = new Set(BASE_COMPETITORS);
    const added: string[] = [];
    fromMarked.forEach((name) => {
      if (!seen.has(name)) {
        seen.add(name);
        added.push(name);
      }
    });
    addedCompetitors.forEach((name) => {
      if (!seen.has(name)) {
        seen.add(name);
        added.push(name);
      }
    });
    return [...BASE_COMPETITORS, ...added];
  }, [competitorTerms, displayTerms, addedCompetitors]);

  const displayedCompetitorsList = useMemo(
    () => competitorsList.filter((c) => !removedCompetitors.has(c)),
    [competitorsList, removedCompetitors]
  );

  const addCompetitor = () => {
    const value = newCompetitorInput.trim();
    if (!value) return;
    const all = new Set(competitorsList);
    if (all.has(value)) return;
    setAddedCompetitors((prev) => [...prev, value]);
    setRemovedCompetitors((prev) => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
    setNewCompetitorInput("");

    // Auto-mark matching rows as competitors and highlight them
    const valueLower = value.toLowerCase();
    const matchingSearchTerms = (surveyTerms ?? [])
      .filter((row) =>
        (displayTerms[row.searchTerm] ?? row.displayTerm).toLowerCase() === valueLower ||
        row.searchTerm.toLowerCase() === valueLower
      )
      .map((row) => row.searchTerm);

    if (matchingSearchTerms.length > 0) {
      setCompetitorTerms((prev) => {
        const next = new Set(prev);
        matchingSearchTerms.forEach((st) => next.add(st));
        return next;
      });
      setHighlightedTerms((prev) => {
        const next = new Set(prev);
        matchingSearchTerms.forEach((st) => next.add(st));
        return next;
      });
      setTimeout(() => {
        setHighlightedTerms((prev) => {
          const next = new Set(prev);
          matchingSearchTerms.forEach((st) => next.delete(st));
          return next;
        });
      }, 1000);
    }
  };

  const removeCompetitor = (name: string) => {
    if (addedCompetitors.includes(name)) {
      setAddedCompetitors((prev) => prev.filter((x) => x !== name));
    } else {
      setRemovedCompetitors((prev) => new Set(prev).add(name));
    }

    // Unmark any table rows whose display term or search term matches this competitor
    const nameLower = name.toLowerCase();
    const matchingSearchTerms = (surveyTerms ?? [])
      .filter((row) =>
        (displayTerms[row.searchTerm] ?? row.displayTerm).toLowerCase() === nameLower ||
        row.searchTerm.toLowerCase() === nameLower
      )
      .map((row) => row.searchTerm);

    if (matchingSearchTerms.length > 0) {
      setCompetitorTerms((prev) => {
        const next = new Set(prev);
        matchingSearchTerms.forEach((st) => next.delete(st));
        return next;
      });
    }
  };

  useEffect(() => {
    if (openDropdownFor === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownFor]);

  const brand = getBrand(brandId);
  const tracker = getTracker(brandId, trackerId);

  const isCompetitorTerm = (searchTerm: string) => competitorTerms.has(searchTerm);

  const toggleCompetitor = (searchTerm: string) => {
    setCompetitorTerms((prev) => {
      const next = new Set(prev);
      if (next.has(searchTerm)) next.delete(searchTerm);
      else next.add(searchTerm);
      return next;
    });
  };

  const setDisplayTerm = (searchTerm: string, value: string) => {
    setDisplayTerms((prev) => ({ ...prev, [searchTerm]: value }));
    setEditedDisplayTerms((prev) => new Set(prev).add(searchTerm));
  };

  const getDropdownOptions = (searchTerm: string, currentValue: string) => {
    const isCompetitor = isCompetitorTerm(searchTerm);
    const filterLower = currentValue.toLowerCase();

    const competitorOptions = COMPETITOR_DISPLAY_NAMES.filter((opt) =>
      opt.toLowerCase().includes(filterLower)
    );

    if (isCompetitor) {
      return { competitorOptions, otherOptions: [] as string[] };
    }

    const otherOptions = [...new Set(Object.values(displayTerms))].filter(
      (opt) =>
        !COMPETITOR_DISPLAY_NAMES.includes(opt) &&
        opt.toLowerCase().includes(filterLower)
    );
    otherOptions.sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return { competitorOptions, otherOptions };
  };

  const selectDisplayOption = (rowSearchTerm: string, selectedValue: string) => {
    setDisplayTerm(rowSearchTerm, selectedValue);
    if (
      !isCompetitorTerm(rowSearchTerm) &&
      competitorDisplayNames.has(selectedValue)
    ) {
      setCompetitorTerms((prev) => new Set(prev).add(rowSearchTerm));
    }
    setOpenDropdownFor(null);
  };

  const downloadCsv = () => {
    const allRows = [
      ...(surveyTerms ?? []).map((row) => ({
        searchTerm: row.searchTerm,
        displayTerm: displayTerms[row.searchTerm] ?? row.displayTerm,
        isCompetitor: competitorTerms.has(row.searchTerm),
        ignored: ignoredTerms.has(row.searchTerm),
      })),
    ];
    const header = ["Search Term", "Display Term", "Is Competitor", "Ignored"];
    const lines = allRows.map((r) =>
      [r.searchTerm, r.displayTerm, r.isCompetitor ? "Yes" : "No", r.ignored ? "Yes" : "No"]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dictionary-${brandId}-${trackerId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleIgnored = (searchTerm: string) => {
    setIgnoredTerms((prev) => {
      const next = new Set(prev);
      if (next.has(searchTerm)) next.delete(searchTerm);
      else next.add(searchTerm);
      return next;
    });
  };

  const allTerms = useMemo(
    () => [...savedUserTerms, ...(surveyTerms ?? [])],
    [savedUserTerms, surveyTerms]
  );

  const existingSearchTermsLower = useMemo(
    () =>
      new Set(
        allTerms.map((r) => r.searchTerm.trim().toLowerCase()).filter(Boolean)
      ),
    [allTerms]
  );

  const filteredTerms = useMemo(() => {
    const base = allTerms;
    if (!base.length) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter((row) => {
      const search = row.searchTerm.toLowerCase();
      const display = (displayTerms[row.searchTerm] ?? row.displayTerm).toLowerCase();
      return search.includes(q) || display.includes(q);
    });
  }, [allTerms, searchQuery, displayTerms]);

  const addYourOwnTerm = () => {
    setUserAddedTerms((prev) => [
      { id: `user-added-${Date.now()}-${Math.random().toString(36).slice(2)}`, searchTerm: "", displayTerm: "" },
      ...prev,
    ]);
  };

  const removeUserAddedTerm = (id: string) => {
    setUserAddedTerms((prev) => prev.filter((t) => t.id !== id));
  };

  const updateUserAddedTerm = (
    id: string,
    field: "searchTerm" | "displayTerm",
    value: string
  ) => {
    setUserAddedTerms((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const isUserAddedSearchTermDuplicate = (id: string, searchTerm: string) => {
    const lower = searchTerm.trim().toLowerCase();
    if (!lower) return false;
    if (existingSearchTermsLower.has(lower)) return true;
    return userAddedTerms.some(
      (t) => t.id !== id && t.searchTerm.trim().toLowerCase() === lower
    );
  };

  const saveUserAddedTerm = (id: string) => {
    const row = userAddedTerms.find((t) => t.id === id);
    if (!row) return;
    const searchTerm = row.searchTerm.trim();
    if (!searchTerm || isUserAddedSearchTermDuplicate(id, row.searchTerm)) return;
    const displayTerm = row.displayTerm.trim() || searchTerm;
    const newRow: SurveyTermRow = {
      searchTerm,
      displayTerm,
      isCompetitor: false,
      action: "mark-competitor",
    };
    setSavedUserTerms((prev) => [newRow, ...prev]);
    setDisplayTerms((prev) => ({ ...prev, [searchTerm]: displayTerm }));
    setUserAddedTerms((prev) => prev.filter((t) => t.id !== id));
    setOpenDropdownFor(null);
  };

  const selectDisplayOptionUserAdded = (userRowId: string, selectedValue: string) => {
    updateUserAddedTerm(userRowId, "displayTerm", selectedValue);
    setOpenDropdownFor(null);
  };

  const totalRows = filteredTerms.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const paginatedRows = filteredTerms.slice(startIndex, startIndex + pageSize);
  const startRow = totalRows === 0 ? 0 : startIndex + 1;
  const endRow = Math.min(startIndex + pageSize, totalRows);

  const showBulkMapping = searchQuery.trim().length > 0;
  const isBulkSelected = (searchTerm: string) => !bulkExcludedRows.has(searchTerm);
  const selectedCount = filteredTerms.filter((r) => isBulkSelected(r.searchTerm)).length;
  const allFilteredSelected = totalRows > 0 && selectedCount === totalRows;
  const someFilteredSelected = selectedCount > 0;

  useEffect(() => {
    const el = bulkSelectAllRef.current;
    if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
  }, [someFilteredSelected, allFilteredSelected]);

  const toggleBulkRow = (searchTerm: string) => {
    setBulkExcludedRows((prev) => {
      const next = new Set(prev);
      if (next.has(searchTerm)) next.delete(searchTerm);
      else next.add(searchTerm);
      return next;
    });
  };

  const toggleBulkAllFiltered = () => {
    if (allFilteredSelected) {
      setBulkExcludedRows((prev) => {
        const next = new Set(prev);
        filteredTerms.forEach((r) => next.add(r.searchTerm));
        return next;
      });
    } else {
      setBulkExcludedRows((prev) => {
        const next = new Set(prev);
        filteredTerms.forEach((r) => next.delete(r.searchTerm));
        return next;
      });
    }
  };

  const applyBulkMapping = () => {
    const term = bulkMapTerm.trim();
    if (!term) return;
    const toUpdate = filteredTerms.filter((r) => isBulkSelected(r.searchTerm));
    if (toUpdate.length === 0) return;
    const updates = toUpdate.map((r) => ({
      searchTerm: r.searchTerm,
      previousDisplayTerm: displayTerms[r.searchTerm] ?? r.displayTerm,
    }));
    setLastBulkMapping({ appliedTerm: term, updates });
    setDisplayTerms((prev) => {
      const next = { ...prev };
      toUpdate.forEach((r) => (next[r.searchTerm] = term));
      return next;
    });
    setEditedDisplayTerms((prev) => {
      const next = new Set(prev);
      toUpdate.forEach((r) => next.add(r.searchTerm));
      return next;
    });
  };

  const undoBulkMapping = () => {
    if (!lastBulkMapping) return;
    setDisplayTerms((prev) => {
      const next = { ...prev };
      lastBulkMapping.updates.forEach(({ searchTerm, previousDisplayTerm }) => {
        next[searchTerm] = previousDisplayTerm;
      });
      return next;
    });
    setEditedDisplayTerms((prev) => {
      const next = new Set(prev);
      lastBulkMapping.updates.forEach(({ searchTerm }) => next.delete(searchTerm));
      return next;
    });
    setLastBulkMapping(null);
  };

  if (!brand || !tracker) {
    return (
      <div className="flex-1 min-h-screen bg-[#f6f6f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#262626] font-medium mb-2">Tracker not found</p>
          <Link href="/manage-account" className="text-[var(--primary)] hover:underline">
            Back to Manage Account
          </Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 min-h-screen bg-[#f6f6f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#262626] font-medium mb-2">{loadError}</p>
          <Link href="/manage-account" className="text-[var(--primary)] hover:underline">
            Back to Manage Account
          </Link>
        </div>
      </div>
    );
  }

  if (surveyTerms === null) {
    return (
      <div className="flex-1 min-h-screen bg-[#f6f6f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#262626] font-medium">Loading dictionary…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#f6f6f6]">
      <header className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white border-b border-[#eeeeee] flex items-center justify-between px-8">
        <h1 className="text-xl font-semibold text-[#262626]">Manage Account</h1>
        <div className="flex items-center gap-3">
          <AskAIButton />
          <Button variant="primary" className="gap-2">
            <PlusIcon />
            New Tracker
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 mt-5 mx-5 mb-5 bg-white rounded-lg overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-8 pt-0">
          {/* Breadcrumbs + Close - sticky so content doesn't scroll behind */}
          <div className="sticky top-0 z-30 flex items-center justify-between mb-6 -mx-8 px-8 pb-4 pt-4 bg-white border-b border-[#eeeeee] -mt-px">
            <nav className="text-sm text-[#7F7F7F]">
              <Link href="/manage-account" className="text-[var(--primary)] hover:underline">
                Dictionaries
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#262626]">{tracker.name}</span>
            </nav>
            <Link
              href="/manage-account"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#262626] hover:text-[var(--primary)] transition-colors"
            >
              <CloseIcon />
              Close
            </Link>
          </div>

          {/* Tracker info card */}
          <div className="bg-white border border-[#eeeeee] rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-[#595959] flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#7F7F7F] mb-1">{brand.name}</p>
                <h2 className="text-2xl font-semibold text-[#262626] mb-1">{tracker.name}</h2>
                <p className="text-sm text-[#7F7F7F]">{tracker.location}</p>
              </div>
            </div>
          </div>

          {/* Competitors */}
          <div className="bg-white border border-[#eeeeee] rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#262626]">Competitors</h3>
              <button
                type="button"
                onClick={() => setIsEditingCompetitors((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                <EditIcon />
                {isEditingCompetitors ? "Done" : "Edit"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayedCompetitorsList.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#eeeeee] bg-[#fafafa] text-sm font-medium text-[#262626]"
                >
                  {c}
                  {isEditingCompetitors && (
                    <button
                      type="button"
                      onClick={() => removeCompetitor(c)}
                      className="p-0.5 rounded-full hover:bg-[#eeeeee] text-[#7F7F7F] hover:text-[#262626] transition-colors"
                      aria-label={`Remove ${c}`}
                    >
                      <CloseIcon />
                    </button>
                  )}
                </span>
              ))}
              {isEditingCompetitors && (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newCompetitorInput}
                    onChange={(e) => setNewCompetitorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
                    placeholder="Add competitor..."
                    className="px-3 py-2 rounded-full border border-[#eeeeee] bg-white text-sm text-[#262626] placeholder:text-[#7F7F7F] focus:outline-none focus:ring-2 focus:ring-[#19B5EF] focus:border-transparent w-40"
                  />
                  <button
                    type="button"
                    onClick={addCompetitor}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-[#eeeeee] bg-[#fafafa] text-[#262626] hover:bg-[#eeeeee] transition-colors"
                    title="Add"
                  >
                    <PlusIcon />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Survey Dictionary */}
          <div className="bg-white border border-[#eeeeee] rounded-lg overflow-hidden">
            <div className="sticky top-0 z-20 bg-white pt-4 border-b border-[#eeeeee]">
              <div className="p-6 pt-0">
                <h3 className="text-base font-semibold text-[#262626] mb-4">Survey Dictionary</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7F7F7F]">
                      <SearchIcon />
                    </span>
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#eeeeee] rounded-lg bg-white text-[#262626] placeholder:text-[#7F7F7F] text-sm focus:outline-none focus:ring-1 focus:ring-[#19B5EF]/30 focus:border-[#19B5EF]/50 transition-colors"
                    />
                  </div>
                  <Button variant="secondary" className="gap-2 shrink-0" onClick={addYourOwnTerm}>
                    <PlusIcon />
                    Your Own Term
                  </Button>
                  <button
                    type="button"
                    className="p-2.5 border border-[#eeeeee] rounded-lg hover:bg-[#f6f6f6] text-[#262626]"
                    title="Download"
                    onClick={downloadCsv}
                  >
                    <DownloadIcon />
                  </button>
                  <button
                    type="button"
                    className="p-2.5 border border-[#eeeeee] rounded-lg hover:bg-[#f6f6f6] text-[#262626]"
                    title="Upload"
                  >
                    <UploadIcon />
                  </button>
                </div>
                {showBulkMapping && (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className="text-sm font-medium text-[#262626]">Bulk Mapping:</span>
                    <input
                      type="text"
                      value={bulkMapTerm}
                      onChange={(e) => setBulkMapTerm(e.target.value)}
                      placeholder="New mapped term"
                      className="flex-1 min-w-[200px] px-4 py-2.5 border border-[#eeeeee] rounded-lg bg-white text-[#262626] placeholder:text-[#7F7F7F] text-sm focus:outline-none focus:ring-2 focus:ring-[#19B5EF] focus:border-transparent"
                    />
                    <Button
                      variant="primary"
                      className="shrink-0"
                      onClick={applyBulkMapping}
                      disabled={!bulkMapTerm.trim() || selectedCount === 0}
                    >
                      Apply to Selected
                    </Button>
                    <button
                      type="button"
                      onClick={undoBulkMapping}
                      disabled={!lastBulkMapping}
                      className="text-sm font-medium text-[var(--primary)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                    >
                      Undo Mapping
                    </button>
                  </div>
                )}
              </div>
            </div>

            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-[#eeeeee]">
                  {showBulkMapping && (
                    <th className="sticky top-[7.5rem] z-10 bg-[#f6f6f6] w-12 py-3 px-4 border-b border-[#eeeeee]">
                      <input
                        type="checkbox"
                        ref={bulkSelectAllRef}
                        checked={allFilteredSelected}
                        onChange={toggleBulkAllFiltered}
                        className="w-4 h-4 rounded border-[#eeeeee] text-[var(--primary)] focus:ring-[#19B5EF] cursor-pointer"
                        aria-label={allFilteredSelected ? "Deselect all" : "Select all"}
                      />
                    </th>
                  )}
                  <th className="sticky top-[7.5rem] z-10 bg-[#f6f6f6] text-left py-3 px-4 text-sm font-medium text-[#262626] border-b border-[#eeeeee] w-[35%]">
                    Search Terms
                  </th>
                  <th className="sticky top-[7.5rem] z-10 bg-[#f6f6f6] text-left py-3 px-4 text-sm font-medium text-[#262626] border-b border-[#eeeeee] w-[35%]">
                    Display Terms
                  </th>
                  <th className="sticky top-[7.5rem] z-10 bg-[#f6f6f6] text-right py-3 px-4 text-sm font-medium text-[#262626] border-b border-[#eeeeee] w-[30%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {userAddedTerms.map((userRow) => {
                  const isDuplicate = isUserAddedSearchTermDuplicate(userRow.id, userRow.searchTerm);
                  return (
                    <tr
                      key={userRow.id}
                      className="border-b border-[#eeeeee] bg-[#fafafa] hover:bg-[#f6f6f6]"
                    >
                      {showBulkMapping && <td className="w-12 py-3 px-4" />}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={userRow.searchTerm}
                          onChange={(e) => updateUserAddedTerm(userRow.id, "searchTerm", e.target.value)}
                          placeholder="Search term"
                          className={`w-full min-w-0 bg-white border rounded-lg px-3 py-2 text-[#262626] text-sm focus:outline-none focus:ring-1 ${
                            isDuplicate
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-[#eeeeee] focus:ring-[#19B5EF] focus:border-[#19B5EF]"
                          }`}
                          aria-invalid={isDuplicate}
                          aria-describedby={isDuplicate ? `duplicate-${userRow.id}` : undefined}
                        />
                        {isDuplicate && (
                          <p id={`duplicate-${userRow.id}`} className="mt-1 text-xs text-red-600">
                            Search term already exists
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          ref={openDropdownFor === `user-added:${userRow.id}` ? dropdownRef : null}
                          className="relative w-full min-w-0"
                        >
                          <input
                            type="text"
                            value={userRow.displayTerm}
                            onChange={(e) => updateUserAddedTerm(userRow.id, "displayTerm", e.target.value)}
                            onFocus={() => setOpenDropdownFor(`user-added:${userRow.id}`)}
                            placeholder="Display term"
                            className="w-full min-w-0 bg-white border border-[#eeeeee] rounded-lg px-3 py-2 text-[#262626] text-sm focus:outline-none focus:ring-1 focus:ring-[#19B5EF] focus:border-[#19B5EF]"
                          />
                          {openDropdownFor === `user-added:${userRow.id}` && (
                            <ul
                              className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-[#eeeeee] rounded-lg shadow-lg max-h-48 overflow-y-auto py-1"
                              role="listbox"
                            >
                              {(() => {
                                const { competitorOptions, otherOptions } = getDropdownOptions(
                                  userRow.searchTerm,
                                  userRow.displayTerm
                                );
                                return (
                                  <>
                                    {competitorOptions.length > 0 && (
                                      <>
                                        <li className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7F7F7F]">
                                          Competitor
                                        </li>
                                        {competitorOptions.map((opt) => (
                                          <li
                                            key={`comp-${opt}`}
                                            role="option"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              selectDisplayOptionUserAdded(userRow.id, opt);
                                            }}
                                            className="px-3 py-2 text-sm text-[#262626] hover:bg-[#f6f6f6] cursor-pointer"
                                          >
                                            {opt}
                                          </li>
                                        ))}
                                      </>
                                    )}
                                    {otherOptions.length > 0 && (
                                      <>
                                        <li className="mt-2 pt-2 border-t border-[#eeeeee] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7F7F7F]">
                                          All other terms
                                        </li>
                                        {otherOptions.map((opt) => (
                                          <li
                                            key={`other-${opt}`}
                                            role="option"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              selectDisplayOptionUserAdded(userRow.id, opt);
                                            }}
                                            className="px-3 py-2 text-sm text-[#262626] hover:bg-[#f6f6f6] cursor-pointer"
                                          >
                                            {opt}
                                          </li>
                                        ))}
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                            </ul>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => removeUserAddedTerm(userRow.id)}
                            className="text-sm text-[#7F7F7F] hover:text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                          <Button
                            variant="primary"
                            className="!py-1.5 !px-3 !text-sm"
                            onClick={() => saveUserAddedTerm(userRow.id)}
                            disabled={
                              !userRow.searchTerm.trim() ||
                              isUserAddedSearchTermDuplicate(userRow.id, userRow.searchTerm)
                            }
                          >
                            Save
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedRows.map((row) => {
                  const isRowChanged = editedDisplayTerms.has(row.searchTerm);
                  const isHighlighted = highlightedTerms.has(row.searchTerm);
                  return (
                  <tr
                    key={row.searchTerm}
                    className={`border-b border-[#eeeeee] last:border-b-0 transition-colors duration-1000 ${
                      isHighlighted
                        ? "bg-blue-100"
                        : isRowChanged
                        ? "bg-[#E8F4FC]/50 hover:bg-[#E8F4FC]/70"
                        : "hover:bg-[#fafafa]"
                    }`}
                  >
                    {showBulkMapping && (
                      <td className="w-12 py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isBulkSelected(row.searchTerm)}
                          onChange={() => toggleBulkRow(row.searchTerm)}
                          className="w-4 h-4 rounded border-[#eeeeee] text-[var(--primary)] focus:ring-[#19B5EF] cursor-pointer"
                          aria-label={`${isBulkSelected(row.searchTerm) ? "Exclude" : "Include"} ${row.searchTerm} from bulk mapping`}
                        />
                      </td>
                    )}
                    <td className="py-3 px-4 text-sm text-[#262626]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={
                            ignoredTerms.has(row.searchTerm)
                              ? "text-[#7F7F7F] line-through"
                              : undefined
                          }
                        >
                          {row.searchTerm}
                        </span>
                        {isCompetitorTerm(row.searchTerm) && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[#FFF3E0] text-[#E65100] rounded">
                            Competitor
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className={`py-3 px-4 text-sm ${
                        ignoredTerms.has(row.searchTerm) ? "text-[#7F7F7F]" : "text-[#262626]"
                      }`}
                    >
                      {ignoredTerms.has(row.searchTerm) ? (
                        displayTerms[row.searchTerm]
                      ) : (
                        <div
                          ref={openDropdownFor === row.searchTerm ? dropdownRef : null}
                          className="relative w-full min-w-0"
                        >
                          <input
                            type="text"
                            value={displayTerms[row.searchTerm] ?? row.displayTerm}
                            onChange={(e) =>
                              setDisplayTerm(row.searchTerm, e.target.value)
                            }
                            onFocus={() => setOpenDropdownFor(row.searchTerm)}
                            className="w-full min-w-0 bg-white border border-[#eeeeee] rounded-lg px-3 py-2 text-[#262626] text-sm focus:outline-none focus:ring-1 focus:ring-[#19B5EF] focus:border-[#19B5EF]"
                          />
                          {openDropdownFor === row.searchTerm && (
                            <ul
                              className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-[#eeeeee] rounded-lg shadow-lg max-h-48 overflow-y-auto py-1"
                              role="listbox"
                            >
                              {(() => {
                                const { competitorOptions, otherOptions } =
                                  getDropdownOptions(
                                    row.searchTerm,
                                    displayTerms[row.searchTerm] ??
                                      row.displayTerm
                                  );
                                return (
                                  <>
                                    {competitorOptions.length > 0 && (
                                      <>
                                        <li className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7F7F7F]">
                                          Competitor
                                        </li>
                                        {competitorOptions.map((opt) => (
                                          <li
                                            key={`comp-${opt}`}
                                            role="option"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              selectDisplayOption(
                                                row.searchTerm,
                                                opt
                                              );
                                            }}
                                            className="px-3 py-2 text-sm text-[#262626] hover:bg-[#f6f6f6] cursor-pointer"
                                          >
                                            {opt}
                                          </li>
                                        ))}
                                      </>
                                    )}
                                    {otherOptions.length > 0 && (
                                      <>
                                        <li className="mt-2 pt-2 border-t border-[#eeeeee] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7F7F7F]">
                                          All other terms
                                        </li>
                                        {otherOptions.map((opt) => (
                                          <li
                                            key={`other-${opt}`}
                                            role="option"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              selectDisplayOption(
                                                row.searchTerm,
                                                opt
                                              );
                                            }}
                                            className="px-3 py-2 text-sm text-[#262626] hover:bg-[#f6f6f6] cursor-pointer"
                                          >
                                            {opt}
                                          </li>
                                        ))}
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                            </ul>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {isCompetitorTerm(row.searchTerm) ? (
                          <span className="text-sm text-[#7F7F7F] opacity-50 cursor-not-allowed">
                            Ignore
                          </span>
                        ) : ignoredTerms.has(row.searchTerm) ? null : (
                          <button
                            type="button"
                            onClick={() => toggleIgnored(row.searchTerm)}
                            className="text-sm text-[#7F7F7F] hover:text-[var(--primary)] hover:underline"
                          >
                            Ignore
                          </button>
                        )}
                        {isCompetitorTerm(row.searchTerm) && (
                          <Button
                            variant="secondary"
                            className="!py-1.5 !px-3 !text-sm min-w-[152px]"
                            onClick={() => toggleCompetitor(row.searchTerm)}
                          >
                            Is Competitor
                          </Button>
                        )}
                        {!isCompetitorTerm(row.searchTerm) &&
                          (row.action === "mark-competitor" ||
                            row.action === "is-competitor" ||
                            row.action === "include") &&
                          !ignoredTerms.has(row.searchTerm) && (
                            <Button
                              variant="primaryOutline"
                              className="!py-1.5 !px-3 !text-sm min-w-[152px]"
                              onClick={() => toggleCompetitor(row.searchTerm)}
                            >
                              Mark Competitor
                            </Button>
                          )}
                        {ignoredTerms.has(row.searchTerm) && (
                          <Button
                            variant="include"
                            className="!py-1.5 !px-3 !text-sm"
                            onClick={() => toggleIgnored(row.searchTerm)}
                          >
                            Include
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 flex-wrap gap-3 px-6 pb-4">
              <div className="flex items-center gap-2 text-sm text-[#434343]">
                <span>Items per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="py-1.5 px-2 pr-8 border border-[#e5e5e5] rounded bg-white hover:bg-[#f6f6f6] text-[#262626] cursor-pointer"
                >
                  {[10, 25, 50, 100, 250].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#434343]">
                <span>
                  {startRow}–{endRow} of {totalRows}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-2 rounded text-[#7f7f7f] hover:bg-[#e5e5e5] disabled:opacity-50 disabled:pointer-events-none"
                    disabled={clampedPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="min-w-[80px] text-center">
                    Page {clampedPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="p-2 rounded text-[#7f7f7f] hover:bg-[#e5e5e5] disabled:opacity-50 disabled:pointer-events-none"
                    disabled={clampedPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-label="Next page"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DictionaryTrackerView;