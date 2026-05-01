import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatContainer } from "@/components/chat/chat-container";
import { PreviewPanel } from "@/components/preview/preview-panel";

const INITIAL_GREETING =
  "嗨！我是小页 👋\n\n我会通过几轮简单的对话，帮你整理经历、提炼亮点，然后生成一个专属的个人主页。\n\n先告诉我——你想用这个主页来做什么呢？";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get or create conversation
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_complete", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let conversation = existing;
  let messages: { role: string; content: string }[] = [];

  if (conversation) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    messages = msgs || [];
  } else {
    // Create new conversation with initial greeting
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: "新对话",
        language: "zh",
      })
      .select()
      .single();

    if (newConv) {
      conversation = newConv;
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: INITIAL_GREETING,
      });
      messages = [{ role: "assistant", content: INITIAL_GREETING }];
    }
  }

  if (!conversation) {
    redirect("/login");
  }

  return (
    <main className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="h-11 px-3.5 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
            <span className="text-white text-[13px] font-serif font-semibold leading-none">
              O
            </span>
          </div>
          <span className="text-sm font-medium">One Page Me</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            对话模式下，小页会引导你整理信息
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-[44%] flex flex-col border-r border-border">
          <ChatContainer
            conversationId={conversation.id}
            initialMessages={messages}
          />
        </div>

        {/* Right: Preview */}
        <div className="flex-1">
          <PreviewPanel />
        </div>
      </div>
    </main>
  );
}
