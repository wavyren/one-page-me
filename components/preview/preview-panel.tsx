"use client";

import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";

const USE_CASE_LABELS: Record<string, string> = {
  job_seeking: "求职",
  freelance: "副业接单",
  student: "学生",
  founder: "创业",
  personal_story: "个人故事",
  other: "其他",
};

function getPreviewState(extractedData: ReturnType<typeof useChatStore.getState>["extractedData"]): number {
  if (!extractedData) return 0;
  if (extractedData.is_ready) return 5;
  if (extractedData.skills?.length) return 4;
  if (extractedData.highlights?.length) return 3;
  if (extractedData.name) return 2;
  if (extractedData.use_case) return 1;
  return 0;
}

export function PreviewPanel() {
  const { extractedData, isReadyToGenerate } = useChatStore();
  const state = getPreviewState(extractedData);

  const useCaseLabel = extractedData?.use_case
    ? USE_CASE_LABELS[extractedData.use_case] || extractedData.use_case
    : null;

  const name = extractedData?.name;
  const firstChar = name ? name.slice(-2) : "?";
  const tagline = extractedData?.tagline || "产品经理 · 运营转型 · 3年经验";
  const highlights = extractedData?.highlights || [];
  const skills = extractedData?.skills || [];
  const contact = extractedData?.contact;

  return (
    <div className="flex-1 flex flex-col bg-[#F4EFE8] overflow-hidden">
      {/* Toolbar */}
      <div className="h-9 px-3 flex items-center justify-between bg-background border-b border-border shrink-0">
        <span className="text-[11px] text-muted-foreground">主页实时预览</span>
        {isReadyToGenerate && (
          <Button
            size="sm"
            className="h-7 px-3 bg-brand hover:bg-brand-dark text-white text-xs"
          >
            生成我的主页 ↗
          </Button>
        )}
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {state === 0 && <EmptyState />}
        {state >= 1 && (
          <div className="bg-white rounded-xl overflow-hidden border border-[#DDD5C8] animate-[fadeUp_0.4s_ease]">
            <div className="bg-brand h-1" />
            <div className="p-4">
              {/* Use case tag */}
              {useCaseLabel && (
                <div className="mb-3">
                  <span className="text-[11px] px-2.5 py-1 bg-[#FEF0E2] text-brand rounded-full">
                    {useCaseLabel}
                    {extractedData?.use_case === "job_seeking" && " · 产品经理"}
                  </span>
                </div>
              )}

              {/* Avatar + Name */}
              <div className="flex gap-3 items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white text-sm font-medium shrink-0">
                  {firstChar}
                </div>
                {state >= 2 ? (
                  <div>
                    <div className="text-lg font-medium text-[#2A1A0A] font-serif">
                      {name}
                    </div>
                    <div className="text-xs text-[#7A6050]">{tagline}</div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#EDE5DA] rounded w-[55%]" />
                    <div className="h-2 bg-[#EDE5DA] rounded w-[75%]" />
                  </div>
                )}
              </div>

              {/* Bio skeleton (hidden until state 5) */}
              {state < 5 && (
                <div className="space-y-1.5 mb-3">
                  <div className="h-2 bg-[#EDE5DA] rounded w-full" />
                  <div className="h-2 bg-[#EDE5DA] rounded w-[80%]" />
                </div>
              )}

              {/* Highlights */}
              {state >= 3 && highlights.length > 0 && (
                <div className="pt-3 border-t border-[#EDE5DA] mb-3">
                  <div className="text-[10px] font-medium text-[#9A8070] mb-2 tracking-wide">
                    亮点经历
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {highlights.map((h, i) => (
                      <div key={i} className="flex gap-1.5">
                        <span className="text-brand text-xs shrink-0">▸</span>
                        <span className="text-xs text-[#3A2A1A] leading-relaxed">
                          {h}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {state >= 4 && skills.length > 0 && (
                <div className="pt-3 border-t border-[#EDE5DA]">
                  <div className="text-[10px] font-medium text-[#9A8070] mb-2 tracking-wide">
                    核心技能
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, i) => (
                      <span
                        key={i}
                        className={`text-[11px] px-2 py-1 rounded-md ${
                          state >= 5
                            ? "bg-[#FEF0E2] text-[#8A4A10]"
                            : "bg-[#EDE5DA] text-[#5A3A20]"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {state >= 5 && contact && (
                <div className="pt-3 border-t border-[#EDE5DA] mt-3">
                  <div className="text-[10px] font-medium text-[#9A8070] mb-1.5">
                    联系方式
                  </div>
                  {contact.email && (
                    <div className="text-xs text-[#3A2A1A]">
                      📧 {contact.email}
                    </div>
                  )}
                  {contact.wechat && (
                    <div className="text-xs text-[#3A2A1A]">
                      💬 {contact.wechat}
                    </div>
                  )}
                </div>
              )}

              {/* Ready badge */}
              {state >= 5 && (
                <div className="mt-3 py-2 bg-[#FEF9F5] text-center rounded-md">
                  <span className="text-[11px] text-brand">
                    ✓ 主页信息已完整 · 可以生成了
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] gap-3 animate-[fadeUp_0.4s_ease]">
      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#C8B89E] flex items-center justify-center">
        <span className="text-xl text-[#C8B89E]">?</span>
      </div>
      <p className="text-[13px] text-[#A89880] text-center leading-relaxed">
        开始对话后
        <br />
        你的主页会在这里实时预览
      </p>
    </div>
  );
}
