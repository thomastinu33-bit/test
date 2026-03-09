"use client";

const LOGOS = {
  chatgpt: "/logos/ChatGPT-Logo.svg",
  gemini: "/logos/Google-gemini-icon.svg",
  google: "/logos/google.svg",
  perplexity: "/logos/Perplexity-Logo-SVG_001.svg",
  copilot: "/logos/Copilot-Logo.svg",
  claude: "/logos/claude-logo.png",
  metaai: "/logos/metaai-color.svg",
  deepseek: "/logos/Deepseek-logo-icon.svg",
} as const;

/** Model label -> logo path. Multiple titles can share the same logo. */
const MODEL_TO_LOGO: Record<string, string> = {
  ChatGPT: LOGOS.chatgpt,
  "ChatGPT Search": LOGOS.chatgpt,
  Gemini: LOGOS.gemini,
  "Gemini Search": LOGOS.gemini,
  "AI Mode": LOGOS.google,
  "Google AI Mode": LOGOS.google,
  "Google Gemini": LOGOS.gemini,
  "Google AI Overview": LOGOS.google,
  "AI Overviews": LOGOS.google,
  Perplexity: LOGOS.perplexity,
  "Perplexity Search": LOGOS.perplexity,
  "Meta AI": LOGOS.metaai,
  Copilot: LOGOS.copilot,
  Claude: LOGOS.claude,
  Deepseek: LOGOS.deepseek,
  "Deep Seek v3.1": LOGOS.deepseek,
  "Claude Haiku 4.5": LOGOS.claude,
  "GPT 4.1": LOGOS.chatgpt,
  "GPT 5": LOGOS.chatgpt,
  "ChatGPT GPT 4.1": LOGOS.chatgpt,
  "ChatGPT GPT 5": LOGOS.chatgpt,
  "Gemini 2.5": LOGOS.gemini,
  "Llama 4": LOGOS.metaai,
  "Meta AI Llama 4": LOGOS.metaai,
};

const defaultLogo = LOGOS.chatgpt;

export function getModelIcon(modelLabel: string): React.ReactNode {
  const src = MODEL_TO_LOGO[modelLabel] ?? defaultLogo;
  const isPerplexity =
    modelLabel === "Perplexity" || modelLabel === "Perplexity Search";
  const isClaude = modelLabel === "Claude";
  const largeLogo = isPerplexity || isClaude;
  return (
    <img
      src={src}
      alt=""
      className={`object-contain flex-shrink-0 ${largeLogo ? "w-7 h-7 min-w-7 min-h-7" : "w-5 h-5"}`}
      aria-hidden
    />
  );
}
