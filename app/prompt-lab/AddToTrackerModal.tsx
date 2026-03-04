"use client";

import { useState } from "react";
import { Button } from "@/components/Evertune";
import { useTrackers } from "./useTrackers";
import { useTrackerDrawer } from "./TrackerDrawerContext";
import type { SavedPrompt } from "./usePromptLists";

interface AddToTrackerModalProps {
  prompts: SavedPrompt[];
  onClose: () => void;
  defaultName?: string;
}

export function AddToTrackerModal({ prompts, onClose, defaultName = "" }: AddToTrackerModalProps) {
  const { trackers, createTracker, addToTracker } = useTrackers();
  const { addPrompts } = useTrackerDrawer();
  const [newTrackerName, setNewTrackerName] = useState(defaultName);
  const [selectedTrackerId, setSelectedTrackerId] = useState<string>("");

  const canSave = !!selectedTrackerId || !!newTrackerName.trim();
  const label = prompts.length === 1 ? "1 prompt" : `${prompts.length} prompts`;

  const handleSave = () => {
    if (selectedTrackerId) {
      const tracker = trackers.find((t) => t.id === selectedTrackerId);
      if (!tracker) return;
      addToTracker(tracker.id, prompts);
      addPrompts(prompts, tracker.name);
    } else if (newTrackerName.trim()) {
      createTracker(newTrackerName.trim(), prompts);
      addPrompts(prompts, newTrackerName.trim());
    } else {
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Add to Tracker</h3>
            <p className="text-xs text-muted mt-0.5">Adding {label}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Add to existing tracker */}
        {trackers.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Add to existing tracker</p>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {trackers.map((tracker) => (
                <button
                  key={tracker.id}
                  onClick={() => { setSelectedTrackerId(tracker.id === selectedTrackerId ? "" : tracker.id); setNewTrackerName(""); }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${
                    selectedTrackerId === tracker.id
                      ? "bg-primary-100 border-primary-200 text-primary-600"
                      : "bg-white border-border text-foreground hover:bg-surface"
                  }`}
                >
                  <span className="font-medium">{tracker.name}</span>
                  <span className="text-xs text-muted">{tracker.prompts.length} prompts</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {trackers.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or create new</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* New tracker name */}
        <div className="flex flex-col gap-2">
          {trackers.length === 0 && <p className="text-sm font-medium text-foreground">Name your tracker</p>}
          <input
            autoFocus={trackers.length === 0}
            type="text"
            placeholder="e.g. Coach Competitor Tracker"
            value={newTrackerName}
            onChange={(e) => { setNewTrackerName(e.target.value); setSelectedTrackerId(""); }}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary-600"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!canSave}>
            Add to Tracker
          </Button>
        </div>
      </div>
    </div>
  );
}
