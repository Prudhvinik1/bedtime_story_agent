"use client";

interface StoryMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function StoryMessage({ role, content }: StoryMessageProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 animate-slide-up">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-accent to-accent-dark px-5 py-3 shadow-lg shadow-accent-glow">
          <p className="text-sm leading-relaxed text-white">{content}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-300 text-xs font-semibold text-text-secondary">
          You
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-slide-up">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-warm text-sm">
        <span>&#x2728;</span>
      </div>

      {/* Story bubble */}
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-surface-400/50 bg-surface-200 px-5 py-4 shadow-lg">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-accent-light">
          Storyteller
        </p>
        <div className="font-story text-[15px] leading-[1.8] text-text-primary whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}
