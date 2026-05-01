"use client";

import { useCallback, useEffect } from "react";
import { useChatStore } from "@/stores/chat-store";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { FieldProgress } from "./field-progress";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ChatContainerProps {
  conversationId: string;
  initialMessages: { role: string; content: string }[];
}

export function ChatContainer({
  conversationId,
  initialMessages,
}: ChatContainerProps) {
  const {
    setConversationId,
    setMessages,
    addMessage,
    appendToLastMessage,
    updateLastMessage,
    setIsLoading,
    setExtractedData,
    setIsReadyToGenerate,
    setHint,
    setError,
    isLoading,
    isReadyToGenerate,
    messages,
    error,
  } = useChatStore();

  useEffect(() => {
    setConversationId(conversationId);
    setMessages(
      initialMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
    );
    setError(null);
  }, [conversationId, initialMessages, setConversationId, setMessages, setError]);

  const handleSend = useCallback(
    async (message: string) => {
      if (isLoading || isReadyToGenerate) return;

      setError(null);
      addMessage({ role: "user", content: message });
      setIsLoading(true);
      addMessage({ role: "assistant", content: "" });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, message }),
        });

        if (!response.ok) {
          let errMsg = `请求失败 (${response.status})`;
          try {
            const errBody = await response.json();
            errMsg = errBody.message || errMsg;
          } catch {
            /* ignore */
          }
          throw new Error(errMsg);
        }

        if (!response.body) {
          throw new Error("服务器未返回数据");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const event = parseSSEEvent(line);
            if (!event) continue;

            if (event.event === "delta") {
              const deltaData = event.data as { content?: string };
              appendToLastMessage(deltaData.content || "");
            } else if (event.event === "extracted") {
              const extractedData = event.data as Record<string, unknown>;
              setExtractedData(extractedData);
              if (extractedData.is_ready) {
                setIsReadyToGenerate(true);
              }
              const hints: Record<number, string> = {
                1: "告诉小页你的名字和背景",
                2: "分享你最骄傲的一件事",
                3: "告诉小页你擅长什么",
                4: "最后一步：确认联系方式",
                5: "点击生成你的主页",
              };
              const userMsgCount = messages.filter((m) => m.role === "user")
                .length;
              setHint(hints[userMsgCount + 1] || "");
            } else if (event.event === "done") {
              setIsLoading(false);
            }
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "发送失败，请重试";
        setError(message);
        updateLastMessage("\n\n（发送失败，请重试）");
        setIsLoading(false);
      }
    },
    [
      conversationId,
      isLoading,
      isReadyToGenerate,
      messages,
      addMessage,
      appendToLastMessage,
      updateLastMessage,
      setIsLoading,
      setExtractedData,
      setIsReadyToGenerate,
      setHint,
      setError,
    ]
  );

  return (
    <div className="flex flex-col h-full">
      <FieldProgress />

      {error && (
        <div
          className="mx-3 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="h-7 text-red-700 hover:text-red-900 hover:bg-red-100"
            aria-label="关闭错误提示"
          >
            关闭
          </Button>
        </div>
      )}

      <MessageList />
      <ChatInput onSend={handleSend} />
    </div>
  );
}

function parseSSEEvent(raw: string): { event: string; data: unknown } | null {
  const lines = raw.trim().split("\n");
  let event = "";
  let data = "";

  for (const line of lines) {
    if (line.startsWith("event: ")) {
      event = line.slice(7);
    } else if (line.startsWith("data: ")) {
      data = line.slice(6);
    }
  }

  if (!event || !data) return null;

  try {
    return { event, data: JSON.parse(data) };
  } catch {
    return { event, data };
  }
}
