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

const SUGGESTIONS = [
  {
    icon: "&#x1F409;",
    title: "A shy dragon",
    prompt: "A story about a shy dragon who learns to make friends at school.",
  },
  {
    icon: "&#x1F31B;",
    title: "Moon adventure",
    prompt: "A magical adventure where a child visits the moon and meets star creatures.",
  },
  {
    icon: "&#x1F431;",
    title: "Brave kitten",
    prompt: "A tiny kitten goes on a brave adventure through a rainy forest.",
  },
  {
    icon: "&#x1F3F0;",
    title: "Enchanted castle",
    prompt: "A story about a kind princess who opens her castle to all the forest animals.",
  },
];

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
      <main className="flex min-h-screen items-center justify-center">
        <div className="glass rounded-2xl px-5 py-3 text-sm text-text-secondary">
          Checking session...
        </div>
      </main>
    );
  }

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/[0.04] blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-[300px] w-[400px] rounded-full bg-warm/[0.03] blur-3xl" />
      </div>

      <header className="glass relative z-10 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-warm text-sm">
            &#x1F319;
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Bedtime Stories</h1>
            <p className="text-[10px] text-text-muted">AI Storyteller for kids</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/logout")}
          className="rounded-lg border border-surface-400/50 px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
        >
          Logout
        </button>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center gap-6 pt-12 animate-fade-in">
              <div className="animate-float relative">
                <div className="text-7xl">&#x1F319;</div>
                <div className="absolute -bottom-1 left-1/2 h-4 w-12 -translate-x-1/2 rounded-full bg-accent/20 blur-md" />
              </div>

              <div className="text-center">
                <h2 className="gradient-text mb-2 text-2xl font-bold">Bedtime Story Generator</h2>
                <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
                  Create a safe, comforting bedtime story for children aged 5 to 10.
                  Just describe what you&apos;d like.
                </p>
              </div>

              <div className="mt-4 grid w-full max-w-lg grid-cols-2 gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => handleSend(s.prompt)}
                    className="glass group flex flex-col gap-2 rounded-xl p-4 text-left transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent-glow"
                  >
                    <span className="text-xl" dangerouslySetInnerHTML={{ __html: s.icon }} />
                    <span className="text-xs font-medium text-text-primary group-hover:text-accent-light transition-colors">
                      {s.title}
                    </span>
                    <span className="text-[11px] leading-snug text-text-muted line-clamp-2">
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
        <div className="relative z-10 border-t border-surface-400/30 px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <FeedbackBar onFeedback={handleFeedback} disabled={loading} />
          </div>
        </div>
      )}

      <div className="relative z-10 px-4 pb-4 pt-2">
        <div className="mx-auto max-w-2xl">
          <ChatInput
            onSend={handleSend}
            disabled={loading}
            placeholder="A story about a shy dragon who learns to make friends..."
          />
          <p className="mt-2 text-center text-[10px] text-text-muted">
            Stories are generated by AI and reviewed for child safety.
          </p>
        </div>
      </div>
    </div>
  );
}
