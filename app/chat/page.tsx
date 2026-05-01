import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-brand mb-4">对话</h1>
      <p className="text-muted-foreground">欢迎，{user.phone || user.email || "用户"}</p>
      <p className="mt-4 text-sm text-muted-foreground">对话功能将在 Phase 2 实现</p>
    </main>
  );
}
