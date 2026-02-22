"use client";

import { AskAIButton, Button } from "@/components/Evertune";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FlaskIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 3h6M9 3v6L4.5 16.5A2 2 0 0 0 6.329 19.5h11.342A2 2 0 0 0 19.5 16.5L15 9V3M9 3H7m8 0h2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PromptLabPage() {
  return (
    <div className="flex flex-col h-full min-h-0 bg-[#f6f6f6]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex-shrink-0 h-20 bg-white border-b border-[#eeeeee] flex items-center justify-between px-8">
        <h1 className="text-xl font-semibold text-[#262626]">Prompt Lab</h1>
        <div className="flex items-center gap-3">
          <AskAIButton />
          <Button variant="primary" className="gap-2">
            <PlusIcon />
            New Tracker
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0 overflow-y-auto p-8">
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#e6f7f7] flex items-center justify-center text-[var(--primary)]">
            <FlaskIcon />
          </div>
          <h2 className="text-lg font-semibold text-[#262626]">Prompt Lab</h2>
          <p className="text-sm text-[#7F7F7F] max-w-sm">
            Test and refine prompts across AI models. Your experiments will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}
