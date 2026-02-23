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
    <main className="app-page auth-page relative flex min-h-screen items-center justify-center px-4">
      <section className="auth-card glass w-full max-w-md p-6">
        <h1 className="auth-heading mb-1 font-semibold">Create account</h1>
        <p className="auth-subtext mb-6">
          Sign up to save chats and access your story sessions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="auth-label mb-1 block font-medium"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input w-full text-sm outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="auth-label mb-1 block font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input w-full text-sm outline-none transition"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button w-full px-4 py-2 text-sm text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        {message ? (
          <p className="auth-message mt-4 rounded-xl border px-3 py-2 text-sm">
            {message}
          </p>
        ) : null}

        <div className="auth-links mt-5 flex items-center justify-between text-sm">
          <Link href="/" className="auth-link hover:underline">
            Home
          </Link>
          <Link href="/login" className="auth-link hover:underline">
            Already have an account?
          </Link>
        </div>
      </section>
    </main>
  );
}
