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
  const [width, setWidth] = useState(420);
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
      const delta = startX.current - ev.clientX;
      setWidth(Math.min(700, Math.max(320, startWidth.current + delta)));
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data: SavedPrompt[] = JSON.parse(e.dataTransfer.getData("application/tracker-prompts"));
      if (data?.length) addPrompts(data);
    } catch {
      // ignore invalid drops
    }
  };

  // Group prompts by topic
  const topicMap = new Map<string, string[]>();
  for (const p of prompts) {
    if (!topicMap.has(p.topic)) topicMap.set(p.topic, []);
    topicMap.get(p.topic)!.push(p.text);
  }
  const topics = Array.from(topicMap.entries());

  return (
    <aside
      style={{ width }}
      className="flex-shrink-0 flex flex-col bg-white border border-[#eeeeee] rounded-lg overflow-hidden relative"
      role="complementary"
      aria-label="Tracker"
    >
      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#19B5EF]/30 transition-colors z-10"
        aria-hidden
      />
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between h-14 px-4 border-b border-[#eeeeee]">
        <div>
          <h2 className="text-base font-semibold text-[#262626]">New Tracker</h2>
          <p className="text-xs text-[#7F7F7F] mt-0.5">Describe the tracker you want to create</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="p-2 rounded-lg text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626] transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4 transition-colors ${isDragOver ? "bg-primary-50" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Tracker Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#262626]">Tracker Name</label>
          <div className="border border-[#e5e5e5] rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-[#19B5EF] focus-within:border-transparent">
            <input
              type="text"
              placeholder="Name goes here"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm text-[#262626] placeholder:text-[#9e9e9e] focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Your Prompts */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-[#262626]">Your Prompts</h3>

          {topics.length === 0 ? (
            <div className={`flex flex-col items-center justify-center gap-2 py-10 text-[#9e9e9e] ${isDragOver ? "opacity-60" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-center leading-relaxed">
                {isDragOver ? "Drop to add prompts" : "Drag topics or prompts here,\nor use Add to Tracker"}
              </p>
            </div>
          ) : (
            <>
              {topics.map(([topic, topicPrompts]) => {
                const isExpanded = expandedTopics.has(topic);
                return (
                  <div key={topic} className="border border-[#eeeeee] rounded-lg overflow-hidden">
                    {/* Topic header */}
                    <div
                      className={`group w-full flex items-center gap-2 px-3 py-2.5 transition-colors cursor-pointer ${isExpanded ? "bg-[#fafafa] hover:bg-[#f5f5f5]" : "bg-white hover:bg-[#f5f5f5]"}`}
                      onClick={() => toggleTopic(topic)}
                    >
                      {/* Topic name */}
                      {editingTopic === topic ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => {
                            renameTopic(topic, editingValue);
                            setEditingTopic(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { renameTopic(topic, editingValue); setEditingTopic(null); }
                            if (e.key === "Escape") setEditingTopic(null);
                          }}
                          className="flex-1 text-sm font-medium text-[#262626] leading-snug bg-transparent border-b border-[#19B5EF] focus:outline-none"
                        />
                      ) : (
                        <span className="flex-1 text-sm font-medium text-[#262626] leading-snug">{topic}</span>
                      )}

                      {/* Prompt count */}
                      <span className="shrink-0 text-xs text-[#7F7F7F] mr-2">{topicPrompts.length} {topicPrompts.length === 1 ? "prompt" : "prompts"}</span>

                      {/* Edit topic name */}
                      {editingTopic !== topic && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingTopic(topic); setEditingValue(topic); }}
                          className="shrink-0 opacity-100 p-0.5 rounded text-[#7F7F7F] hover:text-[#262626] transition-all"
                          aria-label="Rename topic"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}

                      {/* Delete topic */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteTopic(topic); }}
                        className="shrink-0 opacity-100 p-0.5 rounded text-[#7F7F7F] hover:text-red-500 transition-all"
                        aria-label="Delete topic"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* Chevron */}
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        className={`shrink-0 text-[#7F7F7F] transition-transform duration-150 ${isExpanded ? "" : "-rotate-90"}`}
                      >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* Prompts */}
                    {isExpanded && topicPrompts.length > 0 && (
                      <div className="flex flex-col border-t border-[#eeeeee]">
                        {topicPrompts.map((text) => (
                          <div key={text} className="flex items-start gap-2 px-3 py-2 border-b border-[#f3f3f3] last:border-b-0 bg-white">
                            <span className="flex-1 text-sm text-[#262626] leading-snug">{text}</span>
                            <button
                              type="button"
                              onClick={() => deletePrompt(text)}
                              className="shrink-0 mt-0.5 p-0.5 rounded text-[#7F7F7F] hover:text-red-500 transition-all"
                              aria-label="Delete prompt"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isDragOver && (
                <div className="border-2 border-dashed border-primary-300 rounded-lg py-4 text-center text-xs text-primary-600 font-medium">
                  Drop to add
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-[#eeeeee]">
        <button
          type="button"
          onClick={onGenerate}
          disabled={prompts.length === 0}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#048BC5] hover:bg-[#0378ab] transition-colors disabled:opacity-40"
        >
          Run Tracker
        </button>
      </div>
    </aside>
  );
}
