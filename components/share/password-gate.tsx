"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle } from "lucide-react";

interface PasswordGateProps {
  pageId: string;
  name?: string | null;
}

export function PasswordGate({ pageId, name }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = password.trim();
    if (!trimmed) {
      setError("请输入密码");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/p/${pageId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: trimmed }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "密码错误，请重试");
        setLoading(false);
        return;
      }

      // Success — reload to show the page
      window.location.reload();
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-preview-bg px-4">
      <div className="w-full max-w-sm bg-background rounded-xl border border-border shadow-sm p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-brand" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            {name ? `${name} 的主页` : "受保护的主页"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            此主页已设置密码保护
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Input
            type="password"
            placeholder="输入访问密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="访问密码"
            className="h-10"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !password.trim()}
            className="w-full h-10 bg-brand hover:bg-brand-dark text-white"
          >
            {loading ? "验证中..." : "进入主页"}
          </Button>
        </div>
      </div>
    </div>
  );
}
