"use client";

import { useState, useCallback, useRef } from "react";
import { useTrackerDrawer } from "./TrackerDrawerContext";
import type { SavedPrompt } from "./usePromptLists";

interface TrackerDrawerProps {
  onGenerate: () => void;
}

export function TrackerDrawer({ onGenerate }: TrackerDrawerProps) {
  const { title, setTitle, prompts, close, addPrompts, renameTopic, deleteTopic, deletePrompt } = useTrackerDrawer();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [width, setWidth] = useState(600);
  const resizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    const onMouseMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      setWidth(Math.min(700, Math.max(320, startWidth.current + (startX.current - ev.clientX))));
    };
    const onMouseUp = () => {
      resizing.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [width]);

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(topic) ? next.delete(topic) : next.add(topic);
      return next;
    });
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data: SavedPrompt[] = JSON.parse(e.dataTransfer.getData("application/tracker-prompts"));
      if (data?.length) addPrompts(data);
    } catch { /* ignore */ }
  };

  const [generatingFor, setGeneratingFor] = useState<Set<string>>(new Set());
  const [highlightedPrompts, setHighlightedPrompts] = useState<Set<string>>(new Set());

  function generateSimilar(text: string, topic: string) {
    if (generatingFor.has(text)) return;
    setGeneratingFor((prev) => new Set(prev).add(text));

    setTimeout(() => {
      const variations = [
        (t: string) => t.replace(/^What are the best/, "Which are the top").replace(/^What are the most/, "Which are the most popular"),
        (t: string) => t.replace(/^What are the best/, "What are the most popular").replace(/\?$/, " in 2025?"),
        (t: string) => t.replace(/^What are the/, "Can you recommend some").replace(/^Where can I find/, "Where can I buy").replace(/\?$/, " for women?"),
        (t: string) => t.replace(/^What are the best/, "What are some affordable").replace(/^Which/, "What"),
        (t: string) => t.replace(/^What are the best/, "What are the highest-rated").replace(/\?$/, " worth buying?"),
      ];
      const idx = Math.floor(Math.random() * variations.length);
      const generated = variations[idx](text);
      if (generated !== text) {
        const original = prompts.find((p) => p.text === text);
        addPrompts([{ text: generated, topic, brand: original?.brand ?? "" }]);
        setHighlightedPrompts((prev) => new Set(prev).add(generated));
        setTimeout(() => setHighlightedPrompts((prev) => { const next = new Set(prev); next.delete(generated); return next; }), 2000);
      }
      setGeneratingFor((prev) => { const next = new Set(prev); next.delete(text); return next; });
    }, 900);
  }

  const topicMap = new Map<string, string[]>();
  for (const p of prompts) {
    if (!topicMap.has(p.topic)) topicMap.set(p.topic, []);
    topicMap.get(p.topic)!.push(p.text);
  }
  const topics = Array.from(topicMap.entries());

  return (
    <aside
      style={{ width }}
      className="flex-shrink-0 flex flex-col bg-white border border-border rounded-xl overflow-hidden relative"
      role="complementary"
      aria-label="Tracker"
    >
      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-200 transition-colors z-10"
        aria-hidden
      />

      {/* Header */}
      <div className="flex-shrink-0 flex items-start justify-between px-5 pt-5 pb-4 border-b border-border">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-foreground leading-snug">New Tracker</h2>
          <p className="text-xs text-muted">Drag topics or prompts to build your tracker</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="p-1.5 rounded-lg text-muted hover:bg-surface hover:text-foreground transition-colors mt-0.5"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-5 transition-colors ${isDragOver ? "bg-primary-50" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Tracker Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted uppercase tracking-wide">Tracker Name</label>
          <input
            type="text"
            placeholder="e.g. Coach Handbag Competitors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm text-foreground placeholder:text-muted bg-surface border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
          />
        </div>

        {/* Prompts */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Prompts</label>
            {prompts.length > 0 && (
              <span className="text-xs text-muted tabular-nums">{prompts.length} total</span>
            )}
          </div>

          {topics.length === 0 ? (
            <div className={`flex flex-col items-center justify-center gap-3 py-12 rounded-xl border-2 border-dashed transition-colors ${isDragOver ? "border-primary-300 bg-primary-50" : "border-border"}`}>
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-xs text-muted text-center leading-relaxed">
                {isDragOver ? "Drop to add prompts" : "Drag topics or prompts here,\nor use Add to Tracker"}
              </p>
            </div>
          ) : (
            <>
              {topics.map(([topic, topicPrompts]) => {
                const isExpanded = expandedTopics.has(topic);
                return (
                  <div key={topic} className="border border-border rounded-lg overflow-hidden">
                    {/* Topic row */}
                    <div
                      className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors select-none ${isExpanded ? "bg-surface" : "bg-white hover:bg-surface"}`}
                      onClick={() => toggleTopic(topic)}
                    >
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none"
                        className={`shrink-0 text-muted transition-transform duration-150 ${isExpanded ? "" : "-rotate-90"}`}
                      >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                      {editingTopic === topic ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => { renameTopic(topic, editingValue); setEditingTopic(null); }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { renameTopic(topic, editingValue); setEditingTopic(null); }
                            if (e.key === "Escape") setEditingTopic(null);
                          }}
                          className="flex-1 text-sm font-medium text-foreground bg-transparent border-b border-primary focus:outline-none"
                        />
                      ) : (
                        <span className="flex-1 text-sm font-medium text-foreground truncate">{topic}</span>
                      )}

                      <span className="shrink-0 text-xs text-muted">{topicPrompts.length} {topicPrompts.length === 1 ? "prompt" : "prompts"}</span>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditingTopic(topic); setEditingValue(topic); }}
                        className="shrink-0 p-1 rounded text-muted hover:text-foreground transition-all"
                        aria-label="Rename"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteTopic(topic); }}
                        className="shrink-0 p-1 rounded text-muted hover:text-red-500 transition-all"
                        aria-label="Delete topic"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Prompt rows */}
                    {isExpanded && (
                      <div className="border-t border-border divide-y divide-border">
                        {topicPrompts.map((text) => (
                          <div key={text} className={`group flex items-start gap-2.5 px-3 py-2.5 transition-colors duration-700 ${highlightedPrompts.has(text) ? "bg-primary-100" : "bg-white hover:bg-surface"}`}>
                            <span className="flex-1 text-[13px] text-foreground leading-snug">{text}</span>
                            <div className="shrink-0 flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => generateSimilar(text, topic)}
                                disabled={generatingFor.has(text)}
                                className="flex items-center gap-1 text-[11px] text-primary-600 font-medium px-2 py-0.5 rounded-md hover:bg-primary-100 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={generatingFor.has(text) ? "animate-spin" : ""}>
                                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
                                </svg>
                                {generatingFor.has(text) ? "Generating…" : "Show more like this"}
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePrompt(text)}
                                className="p-1 rounded text-muted hover:text-red-500 transition-all"
                                aria-label="Delete prompt"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isDragOver && (
                <div className="border-2 border-dashed border-primary-300 rounded-lg py-4 text-center text-xs text-primary-600 font-medium bg-primary-50">
                  Drop to add
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-border flex flex-col gap-2">
        <p className="text-xs text-muted text-center leading-relaxed">
          Goes to the new tracker flow step where you pick models and run the tracker
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={prompts.length === 0}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--primary)] hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Run Tracker
        </button>
      </div>
    </aside>
  );
}
