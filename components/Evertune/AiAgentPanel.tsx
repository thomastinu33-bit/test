"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Button } from "./Button";

const AskAIIcon = () => (
  <img
    src="/logos/evetune-ai.svg"
    alt=""
    role="presentation"
    className="shrink-0 w-6 h-6 object-contain"
  />
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SuggestionArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M9 10L4 15L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 15H15C18.866 15 22 11.866 22 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SendArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type AiAgentContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const AiAgentContext = createContext<AiAgentContextValue | null>(null);

export function useAiAgent() {
  const ctx = useContext(AiAgentContext);
  if (!ctx) throw new Error("useAiAgent must be used within AiAgentProvider");
  return ctx;
}

export function AskAIButton() {
  const { toggle } = useAiAgent();
  return (
    <Button variant="askAI" onClick={toggle} aria-label="Open AI agent">
      <AskAIIcon />
      Ask AI
    </Button>
  );
}

export function AiAgentProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <AiAgentContext.Provider value={{ isOpen, open, close, toggle }}>
      <main className="ml-[280px] h-screen flex overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {children}
        </div>
        {isOpen && (
          <aside
            className="w-[420px] min-w-[320px] flex-shrink-0 flex flex-col h-full bg-white border-l border-[#eeeeee]"
            role="complementary"
            aria-label="Ask AI"
          >
            {/* Header: icon + "Ask AI" + close */}
            <div className="flex-shrink-0 flex items-center justify-between h-14 px-4 border-b border-[#eeeeee]">
              <div className="flex items-center gap-2">
                <AskAIIcon />
                <h2 className="text-base font-semibold text-[#262626]">Ask AI</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="p-2 rounded-lg text-[#7F7F7F] hover:bg-[#f6f6f6] hover:text-[#262626] transition-colors"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Main: centered gradient headline (colors shift slowly in a loop) */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6">
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes aiTextShine {
                  0% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                .ai-gradient-text {
                  display: inline-block;
                  background: linear-gradient(to right, #F7594E 20%, #00DEE6 30%, #7C9BFF 70%, #F7594E 80%);
                  background-size: 500% auto;
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  color: transparent;
                  animation: aiTextShine 8s linear infinite;
                }
              `}} />
              <p className="text-xl font-semibold text-center">
                <span className="ai-gradient-text">
                  Find What You Need.
                </span>
              </p>
            </div>

            {/* Bottom: suggestion pills + input with send */}
            <div className="flex-shrink-0 p-4 pt-0 space-y-4">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 w-full rounded-full bg-[#f0f0f0] hover:bg-[#e8e8e8] text-left px-4 py-2.5 text-sm text-[#262626] transition-colors"
                >
                  <SuggestionArrowIcon />
                  <span>Find dictionary for a brand.</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full rounded-full bg-[#f0f0f0] hover:bg-[#e8e8e8] text-left px-4 py-2.5 text-sm text-[#262626] transition-colors"
                >
                  <SuggestionArrowIcon />
                  <span>Find dictionary for a tracker.</span>
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#eeeeee] bg-white pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-[#19B5EF] focus-within:border-transparent">
                <input
                  type="text"
                  placeholder="Ask me anything."
                  className="flex-1 min-w-0 bg-transparent text-sm text-[#262626] placeholder:text-[#7F7F7F] focus:outline-none"
                />
                <button
                  type="button"
                  className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #F7594E 0%, #7C9BFF 50%, #00DEE6 100%)",
                  }}
                  aria-label="Send"
                >
                  <SendArrowIcon />
                </button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </AiAgentContext.Provider>
  );
}
