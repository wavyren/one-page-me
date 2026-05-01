"use client";

import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { PreviewCard } from "./preview-card";

export function PreviewPanel() {
  const { isReadyToGenerate } = useChatStore();

  return (
    <div className="flex-1 flex flex-col bg-preview-bg overflow-hidden">
      {/* Toolbar */}
      <div className="h-9 px-3 flex items-center justify-between bg-background border-b border-border shrink-0">
        <span className="text-xs text-muted-foreground">主页实时预览</span>
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
        <PreviewCard />
      </div>
    </div>
  );
}
