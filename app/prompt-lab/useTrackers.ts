"use client";

import { useState, useEffect, useCallback } from "react";
import type { SavedPrompt } from "./usePromptLists";

export interface Tracker {
  id: string;
  name: string;
  createdAt: number;
  prompts: SavedPrompt[];
}

const STORAGE_KEY = "prompt-lab-trackers";

const SEED_TRACKERS: Tracker[] = [
  {
    id: "seed-1",
    name: "Handbag Discovery & Style Exploration",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    prompts: [],
  },
  {
    id: "seed-2",
    name: "Coach vs. Competitor Comparison",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    prompts: [],
  },
  {
    id: "seed-3",
    name: "Luxury Pricing & Promotions",
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    prompts: [],
  },
];

function loadTrackers(): Tracker[] {
  if (typeof window === "undefined") return SEED_TRACKERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRACKERS));
      return SEED_TRACKERS;
    }
    return JSON.parse(stored);
  } catch {
    return SEED_TRACKERS;
  }
}

function saveTrackers(trackers: Tracker[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trackers));
}

export function useTrackers() {
  const [trackers, setTrackers] = useState<Tracker[]>([]);

  useEffect(() => {
    setTrackers(loadTrackers());
  }, []);

  const createTracker = useCallback((name: string, prompts: SavedPrompt[]): Tracker => {
    const tracker: Tracker = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      prompts,
    };
    setTrackers((prev) => {
      const next = [...prev, tracker];
      saveTrackers(next);
      return next;
    });
    return tracker;
  }, []);

  const addToTracker = useCallback((trackerId: string, prompts: SavedPrompt[]) => {
    setTrackers((prev) => {
      const next = prev.map((t) =>
        t.id === trackerId
          ? { ...t, prompts: [...t.prompts, ...prompts.filter((p) => !t.prompts.some((e) => e.text === p.text))] }
          : t
      );
      saveTrackers(next);
      return next;
    });
  }, []);

  return { trackers, createTracker, addToTracker };
}
