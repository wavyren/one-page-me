"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/chat");
        router.refresh();
      }
    });
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-muted-foreground">登录中...</p>
    </main>
  );
}
