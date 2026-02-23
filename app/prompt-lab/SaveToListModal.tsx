"use client";

import { useState } from "react";
import { Button } from "@/components/Evertune";
import { usePromptLists, type SavedPrompt } from "./usePromptLists";

interface SaveToListModalProps {
  prompts: SavedPrompt[];
  onClose: () => void;
  defaultName?: string;
}

export function SaveToListModal({ prompts, onClose, defaultName = "" }: SaveToListModalProps) {
  const { lists, createList, addToList } = usePromptLists();
  const [newListName, setNewListName] = useState(defaultName);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (selectedListId) {
      addToList(selectedListId, prompts);
    } else if (newListName.trim()) {
      createList(newListName.trim(), prompts);
    } else {
      return;
    }
    setSaved(true);
    setTimeout(onClose, 800);
  };

  const canSave = !!selectedListId || !!newListName.trim();
  const label = prompts.length === 1 ? "1 prompt" : `${prompts.length} prompts`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Save to List</h3>
            <p className="text-xs text-muted mt-0.5">Saving {label}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Add to existing list */}
        {lists.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Add to existing list</p>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => { setSelectedListId(list.id === selectedListId ? "" : list.id); setNewListName(""); }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${
                    selectedListId === list.id
                      ? "bg-primary-100 border-primary-200 text-primary-600"
                      : "bg-white border-border text-foreground hover:bg-surface"
                  }`}
                >
                  <span className="font-medium">{list.name}</span>
                  <span className="text-xs text-muted">{list.prompts.length} prompts</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {lists.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or create new</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* New list name */}
        <div className="flex flex-col gap-2">
          {lists.length === 0 && <p className="text-sm font-medium text-foreground">Name your list</p>}
          <input
            autoFocus={lists.length === 0}
            type="text"
            placeholder="e.g. Coach Spring Campaign"
            value={newListName}
            onChange={(e) => { setNewListName(e.target.value); setSelectedListId(""); }}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary-600"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!canSave}>
            {saved ? "Saved!" : "Save to List"}
          </Button>
        </div>
      </div>
    </div>
  );
}
