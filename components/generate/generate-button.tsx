"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGenerateStore } from "@/stores/generate-store";
import { GeneratingModal } from "./generating-modal";

interface GenerateButtonProps {
  conversationId: string;
  disabled?: boolean;
}

export function GenerateButton({ conversationId, disabled }: GenerateButtonProps) {
  const router = useRouter();
  const { isGenerating, startGeneration, setSuccess, setError, reset } =
    useGenerateStore();

  const handleGenerate = async () => {
    if (isGenerating) return;

    startGeneration();

    try {
      const response = await fetch("/api/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const message =
          result.message || result.error?.message || "生成失败，请重试";
        setError(message);
        return;
      }

      setSuccess(result.data.pageId, result.data.url);

      // Small delay to show "完成" state before redirect
      setTimeout(() => {
        router.push(`/p/${result.data.pageId}`);
      }, 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : "网络错误，请重试";
      setError(message);
    }
  };

  return (
    <>
      <Button
        size="sm"
        className="h-7 px-3 bg-brand hover:bg-brand-dark text-white text-xs disabled:opacity-50"
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        aria-label="生成我的个人主页"
      >
        {isGenerating ? "生成中..." : "生成我的主页 ↗"}
      </Button>
      <GeneratingModal onClose={reset} />
    </>
  );
}
