"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncAuthUser } from "@/lib/actions/auth";
import { AlertCircle } from "lucide-react";

interface OAuthCallbackHandlerProps {
  code: string;
  next: string;
}

export function OAuthCallbackHandler({ code, next }: OAuthCallbackHandlerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("Exchange code error:", exchangeError);
        setError("登录验证失败，请返回重试");
        return;
      }

      const result = await syncAuthUser();
      if (!result.success) {
        console.error("Sync user error:", result.error);
      }

      // Remove code from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("next");
      window.history.replaceState({}, "", url.toString());

      router.push(next);
      router.refresh();
    };

    handleCallback();
  }, [code, next, router]);

  if (error) {
    return (
      <div className="text-center max-w-sm">
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
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">登录中...</p>
    </div>
  );
}
