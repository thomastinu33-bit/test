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

const SortAscIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20V4M6 10l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SortDescIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4v16M6 14l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SortNeutralIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 9l4-4 4 4M8 15l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  brand: string | null;
  productFamily: string | null;
  product: string | null;
  variant: string | null;
  isCompetitor: boolean;
  action: TermAction;
};

function parseDictionaryCsv(csvText: string): SurveyTermRow[] {
  const lines = csvText.trim().split(/\r?\n/);
  const rows: SurveyTermRow[] = [];
  let isNewFormat = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (i === 0 && line === "ev_brand_search_term_dictionary") continue;
    if (i === 1 && line === "search_term,standardized_make_and_model") { isNewFormat = false; continue; }
    if (i === 1 && line === "search_term,brand,product_family,product,variant") { isNewFormat = true; continue; }

    if (isNewFormat) {
      // CSV: search_term,brand,product_family,product,variant
      const parts = line.split(",");
      const searchTerm = (parts[0] ?? "").trim();
      if (!searchTerm) continue;
      const brand = (parts[1] ?? "").trim() || null;
      const productFamily = (parts[2] ?? "").trim() || null;
      const product = (parts[3] ?? "").trim() || null;
      const variant = (parts[4] ?? "").trim() || null;
      rows.push({
        searchTerm,
        displayTerm: brand ?? searchTerm,
        brand,
        productFamily,
        product,
        variant,
        isCompetitor: false,
        action: "mark-competitor",
      });
    } else {
      // Legacy CSV: search_term,standardized_make_and_model
      const idx = line.indexOf(",");
      if (idx === -1) continue;
      const searchTerm = line.slice(0, idx).trim();
      const displayTerm = line.slice(idx + 1).trim();
      if (!searchTerm && !displayTerm) continue;
      rows.push({
        searchTerm: searchTerm || displayTerm,
        displayTerm: displayTerm || searchTerm,
        brand: displayTerm || null,
        productFamily: null,
        product: null,
        variant: null,
        isCompetitor: false,
        action: "mark-competitor",
      });
    }
  }
  return rows;
}

const GRANULARITY_LEVELS = [
  { level: 1, field: "brand" as const, label: "Brand" },
  { level: 2, field: "productFamily" as const, label: "Product Family" },
  { level: 3, field: "product" as const, label: "Product" },
  { level: 4, field: "variant" as const, label: "Variant" },
] as const;

const BRAND_BASE_COMPETITORS: Record<string, string[]> = {
  asus: ["ACER", "LENOVO", "HP", "DELL", "APPLE", "MSI", "RAZER", "MICROSOFT", "SAMSUNG"],
};
const DEFAULT_BASE_COMPETITORS = ["BMW", "AUDI", "VOLVO", "MERCEDES-BENZ"];

const BRAND_COMPETITOR_DISPLAY_NAMES: Record<string, string[]> = {
  asus: ["ACER", "LENOVO", "HP", "DELL", "APPLE", "MSI", "RAZER", "MICROSOFT", "SAMSUNG"],
};
const DEFAULT_COMPETITOR_DISPLAY_NAMES = ["BMW", "BMW (IX)", "AUDI", "VOLVO", "MERCEDES-BENZ"];

const BRAND_DICTIONARY_CSV: Record<string, string> = {
  asus: "/asus-dictionary.csv",
};

export function DictionaryTrackerView(props?: { brandId?: string; trackerId?: string }) {
  const params = useParams();
  const brandId = (props?.brandId ?? params.brandId) as string;
  const trackerId = (props?.trackerId ?? params.trackerId) as string;
  const [surveyTerms, setSurveyTerms] = useState<SurveyTermRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ignoredTerms, setIgnoredTerms] = useState<Set<string>>(new Set());
  const [favoriteTerms, setFavoriteTerms] = useState<Set<string>>(new Set());
  const [columnHeaders, setColumnHeaders] = useState({
    searchTerms: "Search Terms",
    brand: "Brand",
    productFamily: "Product Family",
    product: "Product",
    variant: "Variant",
  });
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [ignoredColumns, setIgnoredColumns] = useState<Set<string>>(new Set());
  const [competitorTerms, setCompetitorTerms] = useState<Set<string>>(new Set());
  const [displayTerms, setDisplayTerms] = useState<Record<string, string>>({});
  const [brandValues, setBrandValues] = useState<Record<string, string>>({});
  const [productFamilyValues, setProductFamilyValues] = useState<Record<string, string>>({});
  const [productValues, setProductValues] = useState<Record<string, string>>({});
  const [variantValues, setVariantValues] = useState<Record<string, string>>({});
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
    { id: string; searchTerm: string; displayTerm: string; brand: string; productFamily: string; product: string; variant: string }[]
  >([]);
  const [savedUserTerms, setSavedUserTerms] = useState<SurveyTermRow[]>([]);

  const dictionaryCsvUrl = BRAND_DICTIONARY_CSV[brandId] ?? "/test-dictionary.csv";
  const BASE_COMPETITORS = BRAND_BASE_COMPETITORS[brandId] ?? DEFAULT_BASE_COMPETITORS;
  const COMPETITOR_DISPLAY_NAMES = BRAND_COMPETITOR_DISPLAY_NAMES[brandId] ?? DEFAULT_COMPETITOR_DISPLAY_NAMES;

  useEffect(() => {
    let cancelled = false;
    fetch(dictionaryCsvUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dictionary");
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const rows = parseDictionaryCsv(text);
        setSurveyTerms(rows);
        setDisplayTerms(Object.fromEntries(rows.map((t) => [t.searchTerm, t.displayTerm])));
        setBrandValues(Object.fromEntries(rows.map((t) => [t.searchTerm, t.brand ?? ""])));
        setProductFamilyValues(Object.fromEntries(rows.map((t) => [t.searchTerm, t.productFamily ?? ""])));
        setProductValues(Object.fromEntries(rows.map((t) => [t.searchTerm, t.product ?? ""])));
        setVariantValues(Object.fromEntries(rows.map((t) => [t.searchTerm, t.variant ?? t.product ?? ""])));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [dictionaryCsvUrl]);

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

  const toggleFavorite = (field: string, value: string) => {
    const key = `${field}:${value}`;
    setFavoriteTerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isFavorite = (field: string, value: string) =>
    !!value && favoriteTerms.has(`${field}:${value}`);

  const allTerms = useMemo(
    () => [...savedUserTerms, ...(surveyTerms ?? [])],
    [savedUserTerms, surveyTerms]
  );

  const competitorTermCounts = useMemo(() => {
    const fieldValues: Record<string, Record<string, number>> = {
      brand: {},
      productFamily: {},
      product: {},
      variant: {},
    };
    allTerms.forEach((row) => {
      const st = row.searchTerm;
      const vals: Record<string, string | undefined> = {
        brand: brandValues[st] ?? row.brand ?? undefined,
        productFamily: productFamilyValues[st] ?? row.productFamily ?? undefined,
        product: productValues[st] ?? row.product ?? undefined,
        variant: variantValues[st] ?? row.variant ?? undefined,
      };
      for (const [field, val] of Object.entries(vals)) {
        if (val) fieldValues[field]![val] = (fieldValues[field]![val] ?? 0) + 1;
      }
    });
    const counts: Record<string, number> = {};
    for (const [field, valMap] of Object.entries(fieldValues)) {
      for (const [val, count] of Object.entries(valMap)) {
        counts[`${field}:${val}`] = count;
      }
    }
    return counts;
  }, [allTerms, brandValues, productFamilyValues, productValues, variantValues]);

  const favoritesList = useMemo(() => {
    const seen = new Set<string>();
    const result: { field: string; value: string }[] = [];
    favoriteTerms.forEach((key) => {
      const colonIdx = key.indexOf(":");
      const field = key.slice(0, colonIdx);
      const value = key.slice(colonIdx + 1);
      if (!seen.has(value)) {
        seen.add(value);
        result.push({ field, value });
      }
    });
    return result;
  }, [favoriteTerms]);

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
      { id: `user-added-${Date.now()}-${Math.random().toString(36).slice(2)}`, searchTerm: "", displayTerm: "", brand: "", productFamily: "", product: "", variant: "" },
      ...prev,
    ]);
  };

  const removeUserAddedTerm = (id: string) => {
    setUserAddedTerms((prev) => prev.filter((t) => t.id !== id));
  };

  const updateUserAddedTerm = (
    id: string,
    field: "searchTerm" | "displayTerm" | "brand" | "productFamily" | "product" | "variant",
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
      brand: row.brand.trim() || null,
      productFamily: row.productFamily.trim() || null,
      product: row.product.trim() || null,
      variant: row.variant.trim() || null,
      isCompetitor: false,
      action: "mark-competitor",
    };
    setSavedUserTerms((prev) => [newRow, ...prev]);
    setDisplayTerms((prev) => ({ ...prev, [searchTerm]: displayTerm }));
    setBrandValues((prev) => ({ ...prev, [searchTerm]: row.brand.trim() }));
    setProductFamilyValues((prev) => ({ ...prev, [searchTerm]: row.productFamily.trim() }));
    setProductValues((prev) => ({ ...prev, [searchTerm]: row.product.trim() }));
    setVariantValues((prev) => ({ ...prev, [searchTerm]: row.variant.trim() }));
    setUserAddedTerms((prev) => prev.filter((t) => t.id !== id));
    setOpenDropdownFor(null);
  };

  const selectDisplayOptionUserAdded = (userRowId: string, selectedValue: string) => {
    updateUserAddedTerm(userRowId, "displayTerm", selectedValue);
    setOpenDropdownFor(null);
  };

  const sortedTerms = useMemo(() => {
    if (!sortField) return filteredTerms;
    return [...filteredTerms].sort((a, b) => {
      let aVal = "";
      let bVal = "";
      if (sortField === "searchTerms") {
        aVal = a.searchTerm;
        bVal = b.searchTerm;
      } else if (sortField === "brand") {
        aVal = brandValues[a.searchTerm] ?? a.brand ?? "";
        bVal = brandValues[b.searchTerm] ?? b.brand ?? "";
      } else if (sortField === "productFamily") {
        aVal = productFamilyValues[a.searchTerm] ?? a.productFamily ?? "";
        bVal = productFamilyValues[b.searchTerm] ?? b.productFamily ?? "";
      } else if (sortField === "product") {
        aVal = productValues[a.searchTerm] ?? a.product ?? "";
        bVal = productValues[b.searchTerm] ?? b.product ?? "";
      } else if (sortField === "variant") {
        aVal = variantValues[a.searchTerm] ?? a.variant ?? "";
        bVal = variantValues[b.searchTerm] ?? b.variant ?? "";
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [filteredTerms, sortField, sortDirection, brandValues, productFamilyValues, productValues, variantValues]);

  const totalRows = filteredTerms.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const paginatedRows = sortedTerms.slice(startIndex, startIndex + pageSize);
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
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-0">
          {/* Breadcrumbs + Close - sticky so content doesn't scroll behind */}
          <div className="sticky top-0 z-30 flex items-center justify-between mb-4 -mx-8 px-8 pb-3 pt-3 bg-white border-b border-[#eeeeee] -mt-px">
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
          <div className="bg-white border border-[#eeeeee] rounded-lg p-5 mb-4">
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
          <div className="bg-white border border-[#eeeeee] rounded-lg p-5 mb-4">
            <h3 className="text-base font-semibold text-[#262626] mb-4">Competitors</h3>
            {favoritesList.length === 0 ? (
              <p className="text-sm text-[#7F7F7F]">Star a brand, product family, product, or variant in the table below to add competitors.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {(["brand", "productFamily", "product", "variant"] as const)
                  .map((field) => {
                    const items = favoritesList.filter((f) => f.field === field);
                    if (items.length === 0) return null;
                    const label = field === "productFamily" ? "Product Family" : field.charAt(0).toUpperCase() + field.slice(1);
                    return (
                      <div key={field}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#7F7F7F] mb-2">{label}</p>
                        <div className="flex flex-wrap gap-2">
                          {items.map(({ value }) => (
                            <span
                              key={value}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#eeeeee] bg-[#fafafa] text-sm font-medium text-[#262626]"
                            >
                              {value}
                              {competitorTermCounts[`${field}:${value}`] !== undefined && (
                                <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#e8e8e8] text-[10px] font-semibold text-[#595959]">
                                  {competitorTermCounts[`${field}:${value}`]}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Survey Dictionary */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-[#262626]">Survey Dictionary</h3>
            <div className="flex items-center gap-2">
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
          </div>
          <div className="bg-white border border-[#eeeeee] rounded-lg">
            <div className="sticky top-11 z-20 bg-white rounded-t-lg">
              <div className="px-6 py-2">
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
                    <th className="sticky top-[6.25rem] z-10 bg-[#f6f6f6] w-12 py-3 px-4 border-b border-[#eeeeee]">
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
                  {(
                    [
                      { key: "searchTerms", width: "w-[20%]" },
                      { key: "brand", width: "w-[12%]" },
                      { key: "productFamily", width: "w-[14%]" },
                      { key: "product", width: "w-[12%]" },
                      { key: "variant", width: "w-[12%]" },
                    ] as const
                  ).map(({ key, width }) => {
                    const lvl = GRANULARITY_LEVELS.find((l) => l.field === key);
                    const isIgnored = lvl ? ignoredColumns.has(lvl.field) : false;
                    return (
                    <th
                      key={key}
                      className={`group sticky top-[6.25rem] z-10 bg-[#f6f6f6] text-left py-3 px-4 text-sm font-medium border-b border-[#eeeeee] transition-colors ${width} ${isIgnored ? "text-[#7F7F7F]" : "text-[#262626]"}`}
                    >
                      {editingHeader === key ? (
                        <input
                          autoFocus
                          value={columnHeaders[key]}
                          onChange={(e) =>
                            setColumnHeaders((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          onBlur={() => setEditingHeader(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Escape") setEditingHeader(null);
                          }}
                          className="w-full bg-transparent text-sm font-medium text-[#262626] focus:outline-none border-b border-[#19B5EF]"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {lvl && (
                            <button
                              type="button"
                              onClick={() => {
                                setIgnoredColumns((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(lvl.field)) next.delete(lvl.field);
                                  else next.add(lvl.field);
                                  return next;
                                });
                              }}
                              title={isIgnored ? "Include column" : "Ignore column"}
                              className={`shrink-0 flex items-center justify-center w-4 h-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#19B5EF] ${
                                isIgnored
                                  ? "text-[#c0c0c0] hover:text-[#7F7F7F]"
                                  : "text-[#7F7F7F]"
                              }`}
                            >
                              {isIgnored ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                                </svg>
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (sortField === key && !isIgnored) {
                                setSortDirection((d) => d === "asc" ? "desc" : "asc");
                              } else if (!isIgnored) {
                                setSortField(key);
                                setSortDirection("asc");
                              }
                            }}
                            className={`flex items-center gap-1 min-w-0 flex-1 ${isIgnored ? "cursor-default" : "hover:text-[var(--primary)] transition-colors"}`}
                          >
                            <span className={`truncate ${isIgnored ? "line-through" : ""}`}>{columnHeaders[key]}</span>
                            {!isIgnored && (
                              <span className={`shrink-0 transition-opacity ${sortField === key ? "opacity-100 text-[var(--primary)]" : "opacity-0 group-hover:opacity-50 text-[#7F7F7F]"}`}>
                                {sortField === key
                                  ? sortDirection === "asc" ? <SortAscIcon /> : <SortDescIcon />
                                  : <SortNeutralIcon />}
                              </span>
                            )}
                          </button>
                          {key !== "searchTerms" && !isIgnored && (
                            <button
                              type="button"
                              onClick={() => setEditingHeader(key)}
                              className="opacity-0 group-hover:opacity-100 text-[#7F7F7F] hover:text-[#262626] transition-opacity shrink-0"
                              aria-label="Rename column"
                            >
                              <EditIcon />
                            </button>
                          )}
                        </div>
                      )}
                    </th>
                    );
                  })}
                  <th className="sticky top-[6.25rem] z-10 bg-[#f6f6f6] text-right py-3 px-4 text-sm font-medium text-[#262626] border-b border-[#eeeeee] w-[12%]">
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
                      {(["brand", "productFamily", "product", "variant"] as const).map((field) => (
                        <td
                          key={field}
                          className="py-3 px-4"
                        >
                          <div className={ignoredColumns.has(field) ? "opacity-40" : undefined}>
                            <input
                              type="text"
                              value={userRow[field]}
                              onChange={(e) => updateUserAddedTerm(userRow.id, field, e.target.value)}
                              placeholder={field === "productFamily" ? "Product family" : field.charAt(0).toUpperCase() + field.slice(1)}
                              disabled={ignoredColumns.has(field)}
                              className={`w-full min-w-0 border rounded-lg px-3 py-2 text-[#262626] text-sm focus:outline-none focus:ring-1 focus:ring-[#19B5EF] focus:border-[#19B5EF] disabled:cursor-not-allowed bg-white border-[#eeeeee]`}
                            />
                          </div>
                        </td>
                      ))}
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
                    <td className={`py-3 px-4 text-sm ${ignoredTerms.has(row.searchTerm) ? "text-[#7F7F7F]" : "text-[#262626]"}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={ignoredTerms.has(row.searchTerm) ? "line-through" : undefined}>
                          {row.searchTerm}
                        </span>
                        {isCompetitorTerm(row.searchTerm) && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[#FFF3E0] text-[#E65100] rounded">
                            Competitor
                          </span>
                        )}
                      </div>
                    </td>
                    {([
                      { field: "brand" as const, values: brandValues, set: setBrandValues },
                      { field: "productFamily" as const, values: productFamilyValues, set: setProductFamilyValues },
                      { field: "product" as const, values: productValues, set: (updater: (prev: Record<string, string>) => Record<string, string>) => {
                        setProductValues((prev) => {
                          const next = updater(prev);
                          const searchTerm = Object.keys(next).find((k) => next[k] !== prev[k]);
                          if (searchTerm) {
                            setVariantValues((vPrev) => {
                              if (!vPrev[searchTerm]) return { ...vPrev, [searchTerm]: next[searchTerm]! };
                              return vPrev;
                            });
                          }
                          return next;
                        });
                      }},
                      { field: "variant" as const, values: variantValues, set: setVariantValues },
                    ]).map(({ field, values, set }) => {
                      const isColIgnored = ignoredColumns.has(field);
                      const isRowIgnored = ignoredTerms.has(row.searchTerm);
                      return (
                      <td
                        key={field}
                        className={`group py-3 px-4 text-sm ${isRowIgnored ? "text-[#7F7F7F]" : "text-[#262626]"}`}
                      >
                        <div className={isColIgnored ? "opacity-40" : undefined}>
                          {isRowIgnored ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 shrink-0" />
                              <span className="line-through">{values[row.searchTerm] || "—"}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const val = values[row.searchTerm] ?? "";
                                  if (val && !isColIgnored) toggleFavorite(field, val);
                                }}
                                disabled={!values[row.searchTerm] || isColIgnored}
                                className={`shrink-0 w-4 text-sm leading-none ${
                                  isFavorite(field, values[row.searchTerm] ?? "")
                                    ? "text-yellow-400"
                                    : "text-[#a0a0a0]"
                                } ${!values[row.searchTerm] ? "invisible" : ""}`}
                                aria-label={isFavorite(field, values[row.searchTerm] ?? "") ? "Unfavorite" : "Favorite"}
                              >
                                {isFavorite(field, values[row.searchTerm] ?? "") ? "★" : "☆"}
                              </button>
                              <input
                                type="text"
                                value={values[row.searchTerm] ?? ""}
                                onChange={(e) => set((prev) => ({ ...prev, [row.searchTerm]: e.target.value }))}
                                disabled={isColIgnored}
                                className={`w-full min-w-0 border rounded-lg px-3 py-2 text-[#262626] text-sm focus:outline-none focus:ring-1 focus:ring-[#19B5EF] focus:border-[#19B5EF] disabled:cursor-not-allowed bg-white border-[#eeeeee]`}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      );
                    })}
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