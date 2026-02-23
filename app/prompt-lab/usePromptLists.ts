"use client";

import { useState, useEffect, useCallback } from "react";

export interface SavedPrompt {
  text: string;
  topic: string;
  brand: string;
}

export interface PromptList {
  id: string;
  name: string;
  createdAt: number;
  prompts: SavedPrompt[];
}

const STORAGE_KEY = "prompt-lab-lists";

function loadLists(): PromptList[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLists(lists: PromptList[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function usePromptLists() {
  const [lists, setLists] = useState<PromptList[]>([]);

  useEffect(() => {
    setLists(loadLists());
  }, []);

  const createList = useCallback((name: string, prompts: SavedPrompt[]): PromptList => {
    const list: PromptList = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      prompts,
    };
    setLists((prev) => {
      const next = [...prev, list];
      saveLists(next);
      return next;
    });
    return list;
  }, []);

  const addToList = useCallback((listId: string, prompts: SavedPrompt[]) => {
    setLists((prev) => {
      const next = prev.map((l) =>
        l.id === listId
          ? { ...l, prompts: [...l.prompts, ...prompts.filter((p) => !l.prompts.some((e) => e.text === p.text))] }
          : l
      );
      saveLists(next);
      return next;
    });
  }, []);

  const deleteList = useCallback((listId: string) => {
    setLists((prev) => {
      const next = prev.filter((l) => l.id !== listId);
      saveLists(next);
      return next;
    });
  }, []);

  const renameList = useCallback((listId: string, name: string) => {
    setLists((prev) => {
      const next = prev.map((l) => (l.id === listId ? { ...l, name } : l));
      saveLists(next);
      return next;
    });
  }, []);

  const removePrompt = useCallback((listId: string, promptText: string) => {
    setLists((prev) => {
      const next = prev.map((l) =>
        l.id === listId ? { ...l, prompts: l.prompts.filter((p) => p.text !== promptText) } : l
      );
      saveLists(next);
      return next;
    });
  }, []);

  return { lists, createList, addToList, deleteList, renameList, removePrompt };
}
