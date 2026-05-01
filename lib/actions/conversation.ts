"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getOrCreateConversation() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_complete", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", existing.id)
      .order("created_at", { ascending: true });

    return { conversation: existing, messages: messages || [] };
  }

  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: "新对话",
      language: "zh",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { conversation: newConv, messages: [] };
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return messages || [];
}

export async function addMessage(
  conversationId: string,
  role: string,
  content: string
) {
  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateConversationExtractedData(
  conversationId: string,
  data: Record<string, unknown>
) {
  const supabase = await createClient();
  await supabase
    .from("conversations")
    .update({ extracted_data: data })
    .eq("id", conversationId);
}

export async function completeConversation(conversationId: string) {
  const supabase = await createClient();
  await supabase
    .from("conversations")
    .update({ is_complete: true })
    .eq("id", conversationId);
}
