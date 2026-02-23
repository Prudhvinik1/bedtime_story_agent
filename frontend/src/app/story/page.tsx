"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatInput from "@/components/ChatInput";
import StoryMessage from "@/components/StoryMessage";
import FeedbackBar from "@/components/FeedbackBar";
import LoadingIndicator from "@/components/LoadingIndicator";
import { generateStory } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Suggestion {
  icon: "dragon" | "moon" | "cat" | "castle";
  title: string;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: "dragon",
    title: "A shy dragon",
    prompt: "A story about a shy dragon who learns to make friends at school.",
  },
  {
    icon: "moon",
    title: "Moon adventure",
    prompt: "A magical adventure where a child visits the moon and meets star creatures.",
  },
  {
    icon: "cat",
    title: "Brave kitten",
    prompt: "A tiny kitten goes on a brave adventure through a rainy forest.",
  },
  {
    icon: "castle",
    title: "Enchanted castle",
    prompt: "A story about a kind princess who opens her castle to all the forest animals.",
  },
];

function CrescentMoonIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M14.66 2.04c-1.98.48-3.79 1.63-5.2 3.33a9.45 9.45 0 0 0 1.05 13.31 9.53 9.53 0 0 0 11.45 1.06 8.96 8.96 0 0 1-7.3-8.86c0-3.45 1.96-6.44 4.82-7.94a9.17 9.17 0 0 0-4.82-.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SuggestionIcon({
  type,
  className = "h-5 w-5",
}: {
  type: "dragon" | "moon" | "cat" | "castle";
  className?: string;
}) {
  if (type === "dragon") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M5 14c0-3.9 3.1-7 7-7 2.5 0 4.7 1.3 6 3.3-2 .1-3.4 1.1-4.2 2.4.2.1.4.3.6.5 1.2 1.2 1.2 3.1 0 4.3-.8.8-2 1.1-3 .8C10 20 8.2 21 6 21c-1.1 0-2-.9-2-2 0-1.7.4-3.4 1-5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "cat") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M7 7 5.7 4.8A1 1 0 0 1 7.1 3.4L9.8 5h4.4l2.7-1.6a1 1 0 0 1 1.4 1.4L17 7a6 6 0 0 1 1 3.3V13a6 6 0 1 1-12 0v-2.7C6 9.1 6.4 8 7 7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="11.5" r=".7" fill="currentColor" />
        <circle cx="14.5" cy="11.5" r=".7" fill="currentColor" />
      </svg>
    );
  }

  if (type === "castle") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M5 20V9h3V6h2v3h4V6h2v3h3v11H5Zm2-2h10v-7H7v7Zm3-3h4v3h-4v-3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return <CrescentMoonIcon className={className} />;
}

export default function StoryPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUserInput, setLastUserInput] = useState("");
  const [hasStory, setHasStory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (userInput: string) => {
    setError(null);
    setLastUserInput(userInput);
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setLoading(true);

    try {
      const res = await generateStory(userInput);
      if (res.status === "error") {
        setError(res.error || "Something went wrong.");
        setHasStory(false);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: res.story }]);
        setHasStory(true);
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
      setHasStory(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (feedback: string) => {
    if (!lastUserInput) return;
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: feedback }]);
    setLoading(true);

    try {
      const res = await generateStory(lastUserInput, feedback);
      if (res.status === "error") {
        setError(res.error || "Something went wrong.");
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: res.story }]);
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="app-page flex min-h-screen items-center justify-center bg-[#F9F9F8]">
        <div className="app-card glass rounded-2xl px-5 py-3 text-sm text-[#78716C]">
          Checking session...
        </div>
      </main>
    );
  }

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="story-page relative flex h-screen flex-col overflow-hidden bg-[#F9F9F8]">

      <header className="story-topbar glass relative z-10 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="story-brand-icon flex h-8 w-8 items-center justify-center rounded-lg text-sm">
            <CrescentMoonIcon className="moon-logo h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Bedtime Stories</h1>
            <p className="text-[10px] text-text-muted">AI Storyteller for kids</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/logout")}
            className="story-logout rounded-lg border border-surface-400/50 px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 pb-40">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center gap-6 pt-12 animate-fade-in">
              <div className="animate-float relative">
                <div className="moon-logo">
                  <CrescentMoonIcon className="h-16 w-16" />
                </div>
              </div>

              <div className="text-center">
                <h2 className="hero-title mb-2 font-bold">Bedtime Story Generator</h2>
                <p className="hero-subtitle leading-relaxed">
                  Create a safe, comforting bedtime story for children aged 5 to 10.
                  Just describe what you&apos;d like.
                </p>
              </div>

              <div className="mt-4 grid w-full max-w-lg grid-cols-2 gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => handleSend(s.prompt)}
                    className="glass suggestion-card group flex flex-col gap-2 p-4 text-left"
                  >
                    <span className="suggestion-icon-wrap text-text-secondary">
                      <SuggestionIcon type={s.icon} className="h-5 w-5" />
                    </span>
                    <span className="suggestion-title">
                      {s.title}
                    </span>
                    <span className="suggestion-desc leading-snug line-clamp-2">
                      {s.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <StoryMessage key={i} role={msg.role} content={msg.content} />
          ))}

          {loading && <LoadingIndicator />}

          {error && (
            <div className="animate-slide-up flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <span>&#x26A0;&#xFE0F;</span>
              <span>{error}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {hasStory && !loading && (
        <div className="story-composer-shell relative z-10 border-t border-surface-400/30 px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <FeedbackBar onFeedback={handleFeedback} disabled={loading} />
          </div>
        </div>
      )}

      <div className="story-composer-shell story-composer-input relative z-10 px-4 pb-4 pt-2">
        <div className="mx-auto max-w-2xl">
          <ChatInput
            onSend={handleSend}
            disabled={loading}
            placeholder="A story about a shy dragon who learns to make friends..."
          />
          <p className="story-safety-note mt-2 text-center">
            <span className="shield inline-flex align-middle" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                <path
                  d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Stories are generated by AI and reviewed for child safety.
          </p>
        </div>
      </div>
    </div>
  );
}
