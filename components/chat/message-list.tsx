"use client";

import { useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chat-store";
import { TypingIndicator } from "./typing-indicator";

export function MessageList() {
  const { messages, isLoading } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
      {messages.map((msg, i) => (
        <div
          key={i}
          className="animate-[fadeUp_0.3s_ease]"
          style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
        >
          {msg.role === "assistant" ? (
            <div className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white text-[9px] shrink-0 mt-0.5">
                小页
              </div>
              <div className="bg-muted rounded-r-xl rounded-bl-xl px-3 py-2.5 text-[13px] leading-relaxed max-w-[87%] whitespace-pre-wrap text-foreground">
                {msg.content}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <div className="bg-brand text-white rounded-l-xl rounded-br-xl px-3 py-2.5 text-[13px] leading-relaxed max-w-[87%] whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          )}
        </div>
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
