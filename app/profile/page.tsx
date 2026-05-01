import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-brand mb-4">个人资料</h1>
      <div className="space-y-2 text-center">
        <p>ID: {user.id}</p>
        <p>手机: {user.phone || "未绑定"}</p>
        <p>邮箱: {user.email || "未绑定"}</p>
      </div>
      <form action={signOut} className="mt-8">
        <Button type="submit" variant="outline">
          退出登录
        </Button>
      </form>
    </main>
  );
}
