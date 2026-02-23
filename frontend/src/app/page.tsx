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
    <main className="app-page flex min-h-screen items-center justify-center">
      <div className="app-card glass rounded-2xl px-5 py-3 text-sm text-[#78716C]">
        Redirecting...
      </div>
    </main>
  );
}
