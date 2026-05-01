"use client";

import { useState } from "react";
import { MessageSquare, Eye } from "lucide-react";
import { ChatContainer } from "./chat-container";
import { PreviewPanel } from "@/components/preview/preview-panel";

interface ChatLayoutProps {
  conversationId: string;
  initialMessages: { role: string; content: string }[];
}

export function ChatLayout({
  conversationId,
  initialMessages,
}: ChatLayoutProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

  return (
    <main className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="h-11 px-3.5 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
            <span className="text-white text-sm font-serif font-semibold leading-none">
              O
            </span>
          </div>
          <span className="text-sm font-medium">One Page Me</span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          对话模式下，小页会引导你整理信息
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div
          className={`w-full md:w-[44%] flex flex-col md:border-r md:border-border ${
            activeTab === "preview" ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatContainer
            conversationId={conversationId}
            initialMessages={initialMessages}
          />
        </div>

        {/* Preview */}
        <div
          className={`flex-1 ${
            activeTab === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          <PreviewPanel />
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <nav
        className="md:hidden shrink-0 border-t border-border bg-background"
        aria-label="对话与预览切换"
      >
        <div className="flex">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-sm transition-colors ${
              activeTab === "chat"
                ? "text-brand border-t-2 border-brand -mt-px"
                : "text-muted-foreground"
            }`}
            aria-pressed={activeTab === "chat"}
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>对话</span>
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-sm transition-colors ${
              activeTab === "preview"
                ? "text-brand border-t-2 border-brand -mt-px"
                : "text-muted-foreground"
            }`}
            aria-pressed={activeTab === "preview"}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>预览</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
