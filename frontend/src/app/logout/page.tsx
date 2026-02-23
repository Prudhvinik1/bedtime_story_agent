"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogout() {
    setMessage(null);
    setLoading(true);
    try {
      // TODO: Add your Supabase sign-out logic here.
      // Example:
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || "Logout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="glass w-full max-w-md rounded-2xl p-6">
        <h1 className="mb-1 text-2xl font-semibold text-text-primary">Sign out</h1>
        <p className="mb-6 text-sm text-text-secondary">
          End your current session on this device.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>

        {message ? (
          <p className="mt-4 rounded-xl border border-surface-400/60 bg-surface-200 px-3 py-2 text-sm text-text-secondary">
            {message}
          </p>
        ) : null}

        <div className="mt-5 text-sm text-text-secondary">
          <Link href="/" className="text-accent-light hover:underline">
            Back to app
          </Link>
        </div>
      </section>
    </main>
  );
}
