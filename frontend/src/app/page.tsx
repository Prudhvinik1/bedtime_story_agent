"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function routeUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/story");
      } else {
        router.replace("/login");
      }
    }

    routeUser();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="glass rounded-2xl px-5 py-3 text-sm text-text-secondary">
        Redirecting...
      </div>
    </main>
  );
}
