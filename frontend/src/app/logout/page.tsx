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
    <main className="app-page auth-page flex min-h-screen items-center justify-center px-4">
      <section className="auth-card glass w-full max-w-md p-6">
        <h1 className="app-heading auth-heading mb-1 font-semibold">Sign out</h1>
        <p className="app-subtext auth-subtext mb-6">
          End your current session on this device.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="app-button auth-button w-full px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>

        {message ? (
          <p className="app-message auth-message mt-4 rounded-xl border px-3 py-2 text-sm">
            {message}
          </p>
        ) : null}

        <div className="auth-links mt-5 flex items-center justify-between text-sm">
          <Link href="/" className="app-link auth-link hover:underline">
            Back to app
          </Link>
        </div>
      </section>
    </main>
  );
}
