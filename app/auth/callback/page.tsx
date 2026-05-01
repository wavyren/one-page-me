"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncAuthUser } from "@/lib/actions/auth";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const searchParams = new URL(window.location.href).searchParams;
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/chat";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Exchange code error:", error);
          router.push("/login");
          return;
        }
      }

      const result = await syncAuthUser();
      if (!result.success) {
        console.error("Sync user error:", result.error);
      }

      router.push(next);
      router.refresh();
    };

    handleCallback();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-muted-foreground">登录中...</p>
    </main>
  );
}
