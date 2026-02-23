"use client";

import { useState } from "react";

interface FeedbackBarProps {
  onFeedback: (feedback: string) => void;
  disabled?: boolean;
}

function FeedbackIcon({ type }: { type: "shorter" | "funnier" | "magical" | "rhythmic" | "custom" }) {
  if (type === "shorter") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path d="M4 12h16M4 8h10M4 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "funnier") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 14c.8 1 1.9 1.5 3 1.5s2.2-.5 3-1.5M9.5 10h.01M14.5 10h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "magical") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path d="m12 4 1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "rhythmic") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path d="M9 18a2 2 0 1 1 0-4h1V6l8-2v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17" cy="14" r="2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path d="m4 20 4.5-1 9.8-9.8a2.1 2.1 0 1 0-3-3L5.5 16 4 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FeedbackBar({
  onFeedback,
  disabled = false,
}: FeedbackBarProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");

  const presets = [
    {
      icon: "shorter" as const,
      label: "Shorter",
      value: "Make the story shorter and more concise.",
    },
    {
      icon: "funnier" as const,
      label: "Funnier",
      value: "Make the story a bit funnier and more playful.",
    },
    {
      icon: "magical" as const,
      label: "More magical",
      value: "Add more magical and fantastical elements to the story.",
    },
    {
      icon: "rhythmic" as const,
      label: "More rhythmic",
      value: "Make the story more lyrical and rhythmic, like a poem.",
    },
  ];

  const handleCustomSubmit = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    onFeedback(trimmed);
    setCustomText("");
    setCustomOpen(false);
  };

  return (
    <div className="feedback-bar animate-fade-in flex flex-col gap-3">
      <p className="feedback-title text-xs font-medium tracking-wide text-text-muted uppercase">
        Refine your story
      </p>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onFeedback(p.value)}
            disabled={disabled}
            className="feedback-chip glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-text-secondary transition-all hover:border-accent/30 hover:text-text-primary hover:shadow-md hover:shadow-accent-glow disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FeedbackIcon type={p.icon} />
            <span>{p.label}</span>
          </button>
        ))}
        <button
          onClick={() => setCustomOpen(!customOpen)}
          disabled={disabled}
          className={`feedback-chip glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-all hover:border-accent/30 hover:text-text-primary hover:shadow-md hover:shadow-accent-glow disabled:opacity-30 disabled:cursor-not-allowed ${
            customOpen ? "text-accent-light border-accent/30" : "text-text-secondary"
          }`}
        >
          <FeedbackIcon type="custom" />
          <span>Custom</span>
        </button>
      </div>

      {customOpen && (
        <div className="feedback-custom-row animate-slide-up flex items-center gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder="What would you like to change?"
            className="feedback-custom-input flex-1 rounded-xl border border-surface-400/50 bg-surface-200 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent/40 focus:shadow-md focus:shadow-accent-glow"
            disabled={disabled}
            autoFocus
          />
          <button
            onClick={handleCustomSubmit}
            disabled={disabled || !customText.trim()}
            className="feedback-apply-button rounded-xl bg-accent px-4 py-2.5 text-xs font-medium text-white shadow-md shadow-accent-glow transition-all hover:bg-accent-dark disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
