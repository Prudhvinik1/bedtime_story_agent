"use client";

import { useState } from "react";

interface FeedbackBarProps {
  onFeedback: (feedback: string) => void;
  disabled?: boolean;
}

export default function FeedbackBar({
  onFeedback,
  disabled = false,
}: FeedbackBarProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");

  const presets = [
    {
      icon: "&#x2702;&#xFE0F;",
      label: "Shorter",
      value: "Make the story shorter and more concise.",
    },
    {
      icon: "&#x1F602;",
      label: "Funnier",
      value: "Make the story a bit funnier and more playful.",
    },
    {
      icon: "&#x1F31F;",
      label: "More magical",
      value: "Add more magical and fantastical elements to the story.",
    },
    {
      icon: "&#x1F3B5;",
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
    <div className="animate-fade-in flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-text-muted uppercase">
        Refine your story
      </p>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onFeedback(p.value)}
            disabled={disabled}
            className="glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-text-secondary transition-all hover:border-accent/30 hover:text-text-primary hover:shadow-md hover:shadow-accent-glow disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span dangerouslySetInnerHTML={{ __html: p.icon }} />
            <span>{p.label}</span>
          </button>
        ))}
        <button
          onClick={() => setCustomOpen(!customOpen)}
          disabled={disabled}
          className={`glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-all hover:border-accent/30 hover:text-text-primary hover:shadow-md hover:shadow-accent-glow disabled:opacity-30 disabled:cursor-not-allowed ${
            customOpen ? "text-accent-light border-accent/30" : "text-text-secondary"
          }`}
        >
          <span>&#x270F;&#xFE0F;</span>
          <span>Custom</span>
        </button>
      </div>

      {customOpen && (
        <div className="animate-slide-up flex items-center gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder="What would you like to change?"
            className="flex-1 rounded-xl border border-surface-400/50 bg-surface-200 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent/40 focus:shadow-md focus:shadow-accent-glow"
            disabled={disabled}
            autoFocus
          />
          <button
            onClick={handleCustomSubmit}
            disabled={disabled || !customText.trim()}
            className="rounded-xl bg-accent px-4 py-2.5 text-xs font-medium text-white shadow-md shadow-accent-glow transition-all hover:bg-accent-dark disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
