"use client";

interface TrackerItem {
  id: string;
  name: string;
}

interface TopicDropdownProps {
  topicDropdownOpen: boolean;
  setTopicDropdownOpen: (open: boolean) => void;
  topicId: string;
  selectTopic: (topicId: string) => void;
  topicDisplayLabel: string;
  dimensionKeys: string[];
  dimensionLabels: Record<string, string>;
  trackerId: string;
  trackerList?: TrackerItem[];
  trackerTopics: Record<string, { keys: string[]; labels: Record<string, string> }>;
  expandedTrackers: Set<string>;
  toggleTrackerExpanded: (trackerId: string) => void;
  hidden?: boolean;
}

export function TopicDropdown({
  topicDropdownOpen,
  setTopicDropdownOpen,
  topicId,
  selectTopic,
  topicDisplayLabel,
  dimensionKeys,
  dimensionLabels,
  trackerId,
  trackerList,
  trackerTopics,
  expandedTrackers,
  toggleTrackerExpanded,
  hidden,
}: TopicDropdownProps) {
  if (hidden) return null;

  return (
    <>
      {dimensionKeys.length > 0 && (
        <div className="relative min-w-[10rem]">
          <button
            type="button"
            onClick={() => setTopicDropdownOpen(!topicDropdownOpen)}
            className="relative flex w-full items-center rounded-lg border border-[#e5e5e5] bg-white h-10 pl-3 pr-9 text-left hover:bg-[#fafafa]"
            aria-label="Select topic"
            aria-expanded={topicDropdownOpen}
          >
            <span className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs text-[#7F7F7F]">
              Topic
            </span>
            <span className="flex-1 min-w-0 text-sm text-[#262626] truncate pt-0.5">{topicDisplayLabel}</span>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {topicDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" aria-hidden onClick={() => setTopicDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-56 max-h-64 overflow-auto rounded-lg border border-[#e5e5e5] bg-white shadow-lg py-1">
                {trackerId === "all" && trackerList && trackerList.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => selectTopic("__average__")}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                        topicId === "__average__" ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                        {topicId === "__average__" && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </span>
                      <span className="truncate font-medium">Average</span>
                    </button>
                    <div className="border-t border-[#e5e5e5] my-1" />
                    {trackerList.map((t) => {
                      const trackerKey = `tracker-${t.id}`;
                      const tTopics = trackerTopics[t.id];
                      const isExpanded = expandedTrackers.has(t.id);
                      return (
                        <div key={trackerKey}>
                          <button
                            type="button"
                            onClick={() => toggleTrackerExpanded(t.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#7F7F7F] uppercase tracking-wide hover:bg-[#f5f5f5]"
                          >
                            <span className="w-4 h-4 flex items-center justify-center shrink-0">
                              <svg
                                className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </span>
                            <span className="truncate">{t.name}</span>
                          </button>
                          {isExpanded && (
                            <>
                              {tTopics ? (
                                tTopics.keys.map((key) => (
                                  <button
                                    key={`${trackerKey}-${key}`}
                                    type="button"
                                    onClick={() => selectTopic(`${t.id}:${key}`)}
                                    className={`w-full flex items-center gap-2 px-6 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                                      topicId === `${t.id}:${key}` ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                                    }`}
                                  >
                                    <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                                      {topicId === `${t.id}:${key}` && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                                    </span>
                                    <span className="truncate">{tTopics.labels[key] ?? key}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-6 py-2 text-xs text-[#a3a3a3]">No topics</div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  dimensionKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectTopic(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                        topicId === key ? "bg-[#f0fafa] text-[var(--primary)] font-medium" : "text-[#262626]"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0">
                        {topicId === key && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </span>
                      <span className="truncate">{dimensionLabels[key] ?? key}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
