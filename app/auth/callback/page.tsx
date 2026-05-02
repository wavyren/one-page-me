"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncAuthUser } from "@/lib/actions/auth";
import { AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const searchParams = new URL(window.location.href).searchParams;
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/chat";

      if (!code) {
        setError("登录链接无效（缺少授权码），请返回重试");
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("Exchange code error:", exchangeError);
        // Show specific error message for common cases
        let msg = "登录验证失败，请返回重试";
        if (exchangeError.message?.includes("expired")) {
          msg = "授权码已过期，请重新登录";
        } else if (exchangeError.message?.includes("invalid")) {
          msg = "授权码无效，请重新登录";
        } else if (exchangeError.message) {
          msg = `登录失败：${exchangeError.message}`;
        }
        setError(msg);
        return;
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

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-preview-bg px-4">
        <div className="w-full max-w-sm bg-background rounded-xl border border-border shadow-sm p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">登录遇到问题</h1>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-brand hover:underline"
          >
            返回登录页
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-preview-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">登录中...</p>
      </div>
    </main>
  );
}
