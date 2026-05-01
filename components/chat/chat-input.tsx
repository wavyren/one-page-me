"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/chat-store";

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const { isLoading, isReadyToGenerate } = useChatStore();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || isReadyToGenerate) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 border-t border-border flex gap-2 items-center shrink-0">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isReadyToGenerate
            ? "信息已完整，点击上方按钮生成主页"
            : "输入你的回答，按 Enter 发送…"
        }
        disabled={isLoading || isReadyToGenerate}
        aria-label="消息输入"
        className="h-9 text-sm"
      />
      <Button
        onClick={handleSend}
        disabled={isLoading || isReadyToGenerate || !text.trim()}
        aria-label="发送消息"
        className="h-9 px-4 bg-brand hover:bg-brand-dark text-white text-sm shrink-0"
      >
        发送
      </Button>
    </div>
  );
}
