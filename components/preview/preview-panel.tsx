"use client";

import { useChatStore } from "@/stores/chat-store";
import { GenerateButton } from "@/components/generate/generate-button";
import { PreviewCard } from "./preview-card";

export function PreviewPanel() {
  const { conversationId, isReadyToGenerate } = useChatStore();

  return (
    <div className="flex-1 flex flex-col bg-preview-bg overflow-hidden">
      {/* Toolbar */}
      <div className="h-9 px-3 flex items-center justify-between bg-background border-b border-border shrink-0">
        <span className="text-xs text-muted-foreground">主页实时预览</span>
        {isReadyToGenerate && conversationId && (
          <GenerateButton
            conversationId={conversationId}
            disabled={!isReadyToGenerate}
          />
        )}
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <PreviewCard />
      </div>
    </div>
  );
}
