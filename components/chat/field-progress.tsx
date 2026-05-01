"use client";

import { useChatStore } from "@/stores/chat-store";

const FIELD_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  use_case: { label: "使用场景", bg: "bg-green-100", text: "text-green-800" },
  name: { label: "姓名", bg: "bg-blue-100", text: "text-blue-800" },
  highlights: { label: "亮点经历", bg: "bg-orange-100", text: "text-orange-800" },
  skills: { label: "核心技能", bg: "bg-purple-100", text: "text-purple-800" },
  contact: { label: "联系方式", bg: "bg-red-100", text: "text-red-800" },
};

export function FieldProgress() {
  const { extractedData } = useChatStore();

  const collectedFields = Object.keys(FIELD_CONFIG).filter((key) => {
    const value = extractedData?.[key as keyof typeof extractedData];
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
  });

  const totalSteps = 5;
  const currentStep = collectedFields.length;

  return (
    <div
      className="px-3 py-1.5 border-b border-border shrink-0 min-h-8 flex items-center flex-wrap gap-1"
      role="progressbar"
      aria-label="信息收集进度"
      aria-valuenow={currentStep}
      aria-valuemin={0}
      aria-valuemax={totalSteps}
    >
      <span className="text-xs text-muted-foreground mr-1">收集进度：</span>
      {collectedFields.map((key) => {
        const config = FIELD_CONFIG[key];
        return (
          <span
            key={key}
            className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text} animate-[fadeUp_0.3s_ease]`}
          >
            ✓ {config.label}
          </span>
        );
      })}
      {collectedFields.length === 0 && (
        <span className="text-xs text-muted-foreground">
          开始聊天后，小页会在这里记录收集到的信息
        </span>
      )}

      <div className="ml-auto flex gap-1 items-center">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full border border-brand transition-all duration-500 ${
              i < currentStep ? "bg-brand" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
