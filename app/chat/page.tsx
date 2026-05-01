import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatLayout } from "@/components/chat/chat-layout";

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
    <ChatLayout
      conversationId={conversation.id}
      initialMessages={messages}
    />
  );
}
