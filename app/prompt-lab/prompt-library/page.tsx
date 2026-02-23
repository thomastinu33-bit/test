"use client";

import { useState, useRef, useEffect } from "react";
import { usePromptLists } from "../usePromptLists";
import { Button } from "@/components/Evertune";

const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 9l6 6 6-6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PromptLibraryPage() {
  const { lists, deleteList, renameList, removePrompt } = usePromptLists();
  const [openLists, setOpenLists] = useState<Set<string>>(new Set());
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const trackerBarRef = useRef<HTMLDivElement>(null);

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
    setTimeout(() => renameInputRef.current?.select(), 0);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameList(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const toggleList = (id: string) => {
    setOpenLists((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedLists((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (selectedLists.size === 1) {
      setTimeout(() => {
        trackerBarRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [selectedLists.size]);

  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-muted">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm font-medium text-foreground">No saved lists yet</p>
        <p className="text-xs text-muted max-w-xs">Go to Prompt Insights, generate insights for a brand, and save prompts or topics to a list.</p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-foreground">Prompt Library</h2>
        <span className="text-sm text-muted">{lists.length} list{lists.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex flex-col gap-3">
        {lists.map((list) => {
          const isOpen = openLists.has(list.id);
          const isSelected = selectedLists.has(list.id);

          return (
            <div key={list.id} className={`border rounded-lg overflow-hidden transition-colors ${isSelected ? "border-primary-200" : "border-border"}`}>
              {/* List header */}
              <div className={`flex items-center justify-between px-5 py-3 transition-colors ${isSelected ? "bg-primary-50" : "bg-white hover:bg-surface"}`}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleList(list.id)}
                  onKeyDown={(e) => e.key === "Enter" && toggleList(list.id)}
                  className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                >
                  <span
                    onClick={(e) => { e.stopPropagation(); toggleSelect(list.id); }}
                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected ? "bg-primary-600 border-primary-600" : "bg-white border-muted"
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1">
                    {renamingId === list.id ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-base font-semibold text-foreground bg-transparent border-b border-primary-600 focus:outline-none w-full"
                        autoFocus
                      />
                    ) : (
                      <p className="text-base font-semibold text-foreground">{list.name}</p>
                    )}
                    <p className="text-xs text-muted">
                      {list.prompts.length} prompt{list.prompts.length !== 1 ? "s" : ""} · Saved {formatDate(list.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); startRename(list.id, list.name); }}
                    className="shrink-0 text-muted hover:text-foreground transition-colors"
                    title="Rename list"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                    className="shrink-0 text-muted hover:text-red-500 transition-colors"
                    title="Delete list"
                  >
                    <TrashIcon />
                  </button>
                  <ChevronDownIcon className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Expanded prompts */}
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-border">
                    {list.prompts.map((prompt, i) => (
                      <div key={i} className="group flex items-center justify-between px-5 py-3 border-t border-background hover:bg-surface transition-colors">
                        <p className="text-[13px] text-foreground">{prompt.text}</p>
                        <button
                          type="button"
                          onClick={() => removePrompt(list.id, prompt.text)}
                          className="shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500"
                          title="Remove prompt"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedLists.size > 0 && (
        <div ref={trackerBarRef} className="flex items-center justify-between pt-4 mt-4 border-t border-border">
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">{selectedLists.size}</span> list{selectedLists.size > 1 ? "s" : ""} selected
          </p>
          <Button variant="primary" onClick={() => alert(`Running tracker for: ${[...selectedLists].map(id => lists.find(l => l.id === id)?.name).join(", ")}`)}>
            Run New Tracker
          </Button>
        </div>
      )}
    </div>
  );
}
