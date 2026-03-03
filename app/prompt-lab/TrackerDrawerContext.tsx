"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { SavedPrompt } from "./usePromptLists";

type TrackerDrawerContextValue = {
  isOpen: boolean;
  title: string;
  prompts: SavedPrompt[];
  setTitle: (title: string) => void;
  addPrompts: (prompts: SavedPrompt[], title?: string) => void;
  renameTopic: (oldTopic: string, newTopic: string) => void;
  deleteTopic: (topic: string) => void;
  deletePrompt: (text: string) => void;
  close: () => void;
  clear: () => void;
};

const TrackerDrawerContext = createContext<TrackerDrawerContextValue | null>(null);

export function useTrackerDrawer() {
  const ctx = useContext(TrackerDrawerContext);
  if (!ctx) throw new Error("useTrackerDrawer must be used within TrackerDrawerProvider");
  return ctx;
}

export function TrackerDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("Handbag discovery and style exploration");
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);

  const addPrompts = useCallback((incoming: SavedPrompt[], newTitle?: string) => {
    setPrompts((prev) => [
      ...prev,
      ...incoming.filter((p) => !prev.some((e) => e.text === p.text)),
    ]);
    if (newTitle !== undefined) setTitle(newTitle);
    setIsOpen(true);
  }, []);

  const renameTopic = useCallback((oldTopic: string, newTopic: string) => {
    if (!newTopic.trim() || newTopic === oldTopic) return;
    setPrompts((prev) => prev.map((p) => p.topic === oldTopic ? { ...p, topic: newTopic.trim() } : p));
  }, []);

  const deleteTopic = useCallback((topic: string) => {
    setPrompts((prev) => prev.filter((p) => p.topic !== topic));
  }, []);

  const deletePrompt = useCallback((text: string) => {
    setPrompts((prev) => prev.filter((p) => p.text !== text));
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const clear = useCallback(() => {
    setPrompts([]);
    setTitle("");
    setIsOpen(false);
  }, []);

  return (
    <TrackerDrawerContext.Provider value={{ isOpen, title, prompts, setTitle, addPrompts, renameTopic, deleteTopic, deletePrompt, close, clear }}>
      {children}
    </TrackerDrawerContext.Provider>
  );
}
