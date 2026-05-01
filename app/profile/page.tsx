import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-preview-bg p-4" aria-label="个人资料页面">
      <div className="w-full max-w-md space-y-6">
        <ProfileForm
          user={{
            id: user.id,
            name: profile?.name || user.user_metadata?.name,
            email: user.email,
            phone: user.phone,
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
          }}
        />
        <form action={signOut} className="flex justify-center">
          <Button type="submit" variant="outline" className="w-full">
            退出登录
          </Button>
        </form>
      </div>
    </main>
  );
}
