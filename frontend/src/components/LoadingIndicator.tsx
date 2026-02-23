"use client";

export default function LoadingIndicator() {
  return (
    <div className="loading-indicator flex items-start gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="loading-avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-sm">
        <span className="text-[10px] font-semibold tracking-wide">AI</span>
      </div>

      {/* Bubble */}
      <div className="loading-bubble flex flex-col gap-2 rounded-2xl rounded-tl-sm bg-surface-200 px-5 py-4 shimmer-bg">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot h-2 w-2 rounded-full bg-accent-light" />
          <span className="typing-dot h-2 w-2 rounded-full bg-accent-light" />
          <span className="typing-dot h-2 w-2 rounded-full bg-accent-light" />
        </div>
        <p className="loading-text text-xs text-text-muted">Crafting your story...</p>
      </div>
    </div>
  );
}
