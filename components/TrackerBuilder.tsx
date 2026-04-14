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
            <div key={item.name} className="border border-[#EEE] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleTopic(item.name)}
                className="w-full px-5 py-2 flex items-center justify-between bg-white hover:bg-[#F9F9F9] transition-colors border-b border-[#EEE]"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
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
                      className="text-sm font-medium text-[#262626] border border-[#048BC5] rounded px-2 py-1 flex-1 min-w-0"
                    />
                  ) : (
                    <span className="text-sm font-medium text-[#262626] truncate">{item.name}</span>
                  )}
                </div>
                <span className="text-xs text-[#7F7F7F] font-medium whitespace-nowrap mx-2">
                  {item.promptCount} prompts
                </span>
                {editingTopicName === item.name ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveTopicEdit(item.name);
                      }}
                      className="text-xs font-medium text-[#048BC5] hover:bg-[#E0F3FE] px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTopicName(null);
                      }}
                      className="text-xs font-medium text-[#7F7F7F] hover:bg-[#EEE] px-2 py-1 rounded"
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
                      className="hover:bg-[#EEE] p-1 rounded"
                      title="Edit topic"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.name);
                      }}
                      className="hover:bg-[#EEE] p-1 rounded"
                    >
                      <DeleteIcon />
                    </button>
                  </>
                )}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform ${
                    expandedTopics.has(item.name) ? "rotate-90" : ""
                  }`}
                >
                  <path d="M9 6l6 6-6 6" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Prompts */}
              {expandedTopics.has(item.name) && item.prompts && (
                <div className="bg-[#F9F9F9] space-y-1.5 p-2">
                  {item.prompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white border border-[#EEE] rounded p-2"
                    >
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
                          className="text-xs text-[#262626] flex-1 min-w-0 border border-[#048BC5] rounded px-2 py-1"
                        />
                      ) : (
                        <p className="text-xs text-[#262626] flex-1 min-w-0">{prompt}</p>
                      )}
                      {editingPrompt?.topicName === item.name && editingPrompt?.index === idx ? (
                        <>
                          <button
                            onClick={() => savePromptEdit()}
                            className="text-xs font-medium text-[#048BC5] hover:bg-[#E0F3FE] px-1 py-0.5 rounded flex-shrink-0"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPrompt(null)}
                            className="text-xs font-medium text-[#7F7F7F] hover:bg-[#EEE] px-1 py-0.5 rounded flex-shrink-0"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditingPrompt(item.name, idx, prompt)}
                          className="hover:bg-[#EEE] p-1 rounded flex-shrink-0"
                          title="Edit prompt"
                        >
                          <EditIcon />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // Remove individual prompt
                        }}
                        className="hover:bg-[#EEE] p-1 rounded flex-shrink-0"
                      >
                        <DeleteIcon />
                      </button>
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
