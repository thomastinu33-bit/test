"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Evertune";

export interface TrackerItem {
  name: string;
  promptCount: number;
  type: "subcategory" | "topic";
  prompts?: string[];
}

interface TrackerBuilderProps {
  items: TrackerItem[];
  onRemoveItem: (name: string) => void;
  onUpdateItem?: (oldName: string, newName: string) => void;
  onUpdatePrompt?: (topicName: string, promptIndex: number, newPrompt: string) => void;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h12zM10 11v6M14 11v6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6l6 6-6 6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function TrackerBuilder({ items, onRemoveItem, onUpdateItem, onUpdatePrompt, onClose }: TrackerBuilderProps) {
  const defaultName = items.length > 0 ? items[0].name : "Untitled";
  const [trackerName, setTrackerName] = useState(defaultName);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [editingTopicName, setEditingTopicName] = useState<string | null>(null);
  const [editingTopicValue, setEditingTopicValue] = useState("");
  const [editingPrompt, setEditingPrompt] = useState<{ topicName: string; index: number } | null>(null);
  const [editingPromptValue, setEditingPromptValue] = useState("");

  useEffect(() => {
    if (items.length > 0 && trackerName === "Untitled") {
      setTrackerName(items[0].name);
    }
    // Expand all topics by default
    if (items.length > 0) {
      const allTopics = new Set(items.map(item => item.name));
      setExpandedTopics(allTopics);
    }
  }, [items]);

  const toggleTopic = (topicName: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicName)) {
      newExpanded.delete(topicName);
    } else {
      newExpanded.add(topicName);
    }
    setExpandedTopics(newExpanded);
  };

  const startEditingTopic = (topicName: string) => {
    setEditingTopicName(topicName);
    setEditingTopicValue(topicName);
  };

  const saveTopicEdit = (oldName: string) => {
    if (editingTopicValue.trim() && editingTopicValue !== oldName) {
      onUpdateItem?.(oldName, editingTopicValue.trim());
    }
    setEditingTopicName(null);
  };

  const startEditingPrompt = (topicName: string, index: number, prompt: string) => {
    setEditingPrompt({ topicName, index });
    setEditingPromptValue(prompt);
  };

  const savePromptEdit = () => {
    if (editingPrompt && editingPromptValue.trim()) {
      onUpdatePrompt?.(editingPrompt.topicName, editingPrompt.index, editingPromptValue.trim());
    }
    setEditingPrompt(null);
  };

  const totalPrompts = items.reduce((sum, item) => sum + item.promptCount, 0);

  return (
    <div className="bg-white border-l border-[#EEE] p-5 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-[#EEE]">
        <div className="flex-1">
          <h2 className="text-[20px] font-semibold text-[#262626]">New Tracker</h2>
        </div>
        <button onClick={onClose} className="hover:bg-[#F9F9F9] p-1 rounded">
          <CloseIcon />
        </button>
      </div>

      {/* Tracker Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#262626] mb-1.5">Tracker Name</label>
        <input
          type="text"
          value={trackerName}
          onChange={(e) => setTrackerName(e.target.value)}
          placeholder="Enter tracker name"
          className="w-full bg-white border border-[#EEE] rounded-lg px-3 py-2 text-sm text-[#262626] placeholder-[#7F7F7F] hover:border-[#BBE9FC] focus:border-[#048BC5] focus:outline-none transition-colors"
        />
      </div>

      {/* Your Analysis */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-[20px] font-semibold text-[#262626]">Your Analysis</h3>
            <span className="text-xs text-[#7F7F7F] font-medium bg-[#F9F9F9] px-2 py-1 rounded-full">
              {totalPrompts} prompts
            </span>
          </div>

          {items.map((item) => (
            <div key={item.name} className="border border-[#E5E5E5] rounded-lg overflow-hidden bg-white hover:border-[#D0D0D0] transition-colors">
              <div
                onClick={() => toggleTopic(item.name)}
                className="w-full px-4 py-3.5 flex items-center gap-2 bg-white hover:bg-[#FAFAFA] transition-colors cursor-pointer"
              >
                {editingTopicName === item.name ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingTopicValue}
                    onChange={(e) => setEditingTopicValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveTopicEdit(item.name);
                      } else if (e.key === "Escape") {
                        setEditingTopicName(null);
                      }
                    }}
                    className="text-sm font-semibold text-[#262626] border border-[#048BC5] rounded px-2 py-1 min-w-0 flex-1 text-left"
                  />
                ) : (
                  <span className="text-sm font-semibold text-[#262626] truncate flex-1 text-left">{item.name}</span>
                )}
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                  <span className="text-xs text-[#999] font-medium whitespace-nowrap">{item.promptCount} prompts</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {editingTopicName === item.name ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveTopicEdit(item.name);
                        }}
                        className="text-xs font-medium text-[#048BC5] hover:bg-[#E0F3FE] px-2.5 py-1.5 rounded transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTopicName(null);
                        }}
                        className="text-xs font-medium text-[#7F7F7F] hover:bg-[#F0F0F0] px-2.5 py-1.5 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTopic(item.name);
                        }}
                        className="p-1.5 hover:bg-[#F0F0F0] rounded transition-colors"
                        title="Edit topic"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.name);
                        }}
                        className="p-1.5 hover:bg-[#F0F0F0] rounded transition-colors text-[#7F7F7F] hover:text-[#EF4444]"
                      >
                        <DeleteIcon />
                      </button>
                    </>
                  )}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 transition-transform ${
                    expandedTopics.has(item.name) ? "rotate-90" : ""
                  }`}
                >
                  <path d="M9 6l6 6-6 6" stroke="#7F7F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Prompts */}
              {expandedTopics.has(item.name) && item.prompts && (
                <div className="border-t border-[#E5E5E5] bg-[#FAFAFA] divide-y divide-[#E5E5E5]">
                  {item.prompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#F3F3F3] transition-colors group"
                    >
                      <span className="text-xs font-medium text-[#BBB] mt-1 flex-shrink-0">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        {editingPrompt?.topicName === item.name && editingPrompt?.index === idx ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingPromptValue}
                            onChange={(e) => setEditingPromptValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                savePromptEdit();
                              } else if (e.key === "Escape") {
                                setEditingPrompt(null);
                              }
                            }}
                            className="text-sm text-[#262626] flex-1 w-full border border-[#048BC5] rounded px-2 py-1"
                          />
                        ) : (
                          <p className="text-sm text-[#262626] leading-relaxed">{prompt}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {editingPrompt?.topicName === item.name && editingPrompt?.index === idx ? (
                          <>
                            <button
                              onClick={() => savePromptEdit()}
                              className="text-xs font-medium text-[#048BC5] hover:bg-[#E0F3FE] px-2 py-1 rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPrompt(null)}
                              className="text-xs font-medium text-[#7F7F7F] hover:bg-[#E0E0E0] px-2 py-1 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditingPrompt(item.name, idx, prompt)}
                              className="p-1.5 hover:bg-[#E0E0E0] rounded transition-colors"
                              title="Edit prompt"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => {
                                // Remove individual prompt
                              }}
                              className="p-1.5 hover:bg-[#E0E0E0] rounded transition-colors text-[#7F7F7F] hover:text-[#EF4444]"
                            >
                              <DeleteIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
