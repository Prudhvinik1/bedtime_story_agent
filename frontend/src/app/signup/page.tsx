"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/story");
      }
    });
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMessage("Signup successful. Please check your email for verification.");
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="glass w-full max-w-md rounded-2xl p-6">
        <h1 className="mb-1 text-2xl font-semibold text-text-primary">Create account</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Sign up to save chats and access your story sessions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-surface-400/60 bg-surface-200 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-surface-400/60 bg-surface-200 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/50"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-xl border border-surface-400/60 bg-surface-200 px-3 py-2 text-sm text-text-secondary">
            {message}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between text-sm text-text-secondary">
          <Link href="/" className="text-accent-light hover:underline">
            Home
          </Link>
          <Link href="/login" className="text-accent-light hover:underline">
            Already have an account?
          </Link>
        </div>
      </section>
    </main>
  );
}
