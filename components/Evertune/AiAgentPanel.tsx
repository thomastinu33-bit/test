"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Button } from "./Button";

const AskAIIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <g clipPath="url(#askAiClip)">
      <path
        d="M7.17232 39.2394C6.40355 38.3306 5.42355 36.4417 6.19232 33.7151C7.66109 28.7508 10.1074 24.3442 13.7449 20.7063C15.1425 19.2374 16.8225 18.1198 18.8488 17.4885C19.8976 17.1397 20.8776 17.2797 21.8551 17.7685C23.2526 18.3973 23.8126 19.4462 23.7439 20.9151C23.6039 22.1727 23.0439 23.2928 22.4863 24.3417C20.4576 27.9083 17.8 30.9149 14.6537 33.5727C13.3249 34.6927 11.8562 35.6704 10.3874 36.5792C9.75862 36.928 9.75862 37.6281 10.3874 38.0481C11.0874 38.4682 11.7849 38.6769 12.6249 38.4682C13.5337 38.2594 14.5137 38.0481 15.4225 37.6993C20.6663 35.6704 27.9389 31.1261 32.2053 27.4883C32.9053 26.9282 33.4628 26.2306 34.094 25.5994C34.934 24.7593 35.7028 24.6905 36.6803 25.2505C37.1691 25.5993 37.4491 26.2994 37.1691 26.8595C37.0291 27.1395 36.8203 27.4883 36.6091 27.7683C35.7691 28.6771 35.0003 29.6572 34.0916 30.4261C29.8965 34.1327 22.7639 38.6794 17.5888 40.7771C16.1912 41.4059 14.6513 41.8972 12.7625 41.8972C10.7337 41.7572 8.7074 40.9884 7.1674 39.2394H7.17232ZM10.5986 32.3862C10.8786 32.4575 11.1586 32.2462 11.4386 32.0374C14.4449 29.5197 17.0337 26.6531 18.9912 23.2953C19.4112 22.5265 20.2488 21.8264 19.76 20.7088C18.8512 20.7775 18.1512 21.3376 17.4512 21.8976C14.2337 24.5554 12.0674 28.0532 10.5274 31.9687C10.4586 32.1087 10.5274 32.2487 10.5962 32.3887L10.5986 32.3862Z"
        fill="url(#askAiGrad1)"
      />
      <path
        d="M34.782 6.88024C34.8388 6.67943 35.1442 6.67943 35.2011 6.88024C35.5199 8.0067 36.1687 10.0821 36.9115 11.2376C37.7377 12.5227 39.2955 13.6271 39.9318 14.0453C40.0581 14.1283 40.0581 14.3201 39.9318 14.4031C39.2955 14.8213 37.7377 15.9257 36.9115 17.2109C36.1687 18.3663 35.5199 20.4417 35.2011 21.5682C35.1442 21.769 34.8388 21.769 34.782 21.5682C34.4632 20.4417 33.8143 18.3663 33.0715 17.2109C32.2453 15.9257 30.6875 14.8213 30.0513 14.4031C29.925 14.3201 29.925 14.1283 30.0513 14.0453C30.6875 13.6271 32.2453 12.5227 33.0715 11.2376C33.8143 10.0821 34.4632 8.0067 34.782 6.88024Z"
        fill="url(#askAiGrad2)"
      />
      <path
        d="M39.6612 18.5701C39.6906 18.471 39.8423 18.471 39.8717 18.5701C40.0173 19.0608 40.2988 19.915 40.6198 20.3965C40.9779 20.9336 41.6452 21.397 41.9404 21.5859C42.0052 21.6274 42.0052 21.7255 41.9404 21.767C41.6452 21.9559 40.9779 22.4193 40.6198 22.9565C40.2988 23.4379 40.0173 24.2921 39.8717 24.7828C39.8423 24.8819 39.6906 24.8819 39.6612 24.7828C39.5156 24.2921 39.2341 23.4379 38.9131 22.9565C38.555 22.4193 37.8877 21.9559 37.5926 21.767C37.5277 21.7255 37.5277 21.6274 37.5926 21.5859C37.8877 21.397 38.555 20.9336 38.9131 20.3965C39.2341 19.915 39.5156 19.0608 39.6612 18.5701Z"
        fill="url(#askAiGrad3)"
      />
    </g>
    <defs>
      <linearGradient id="askAiGrad1" x1="37.2804" y1="41.8972" x2="11.9392" y2="12.1595" gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="#00DEE6" />
        <stop offset="0.46875" stopColor="#7C9BFF" />
        <stop offset="0.6875" stopColor="#F7594E" />
      </linearGradient>
      <linearGradient id="askAiGrad2" x1="40.2133" y1="22.3469" x2="25.3583" y2="13.5573" gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="#00DEE6" />
        <stop offset="0.46875" stopColor="#7C9BFF" />
        <stop offset="0.6875" stopColor="#F7594E" />
      </linearGradient>
      <linearGradient id="askAiGrad3" x1="42.0872" y1="25.1576" x2="35.6117" y2="21.1842" gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="#00DEE6" />
        <stop offset="0.46875" stopColor="#7C9BFF" />
        <stop offset="0.6875" stopColor="#F7594E" />
      </linearGradient>
      <clipPath id="askAiClip">
        <rect width="36" height="36" fill="white" transform="translate(6 6)" />
      </clipPath>
    </defs>
  </svg>
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
