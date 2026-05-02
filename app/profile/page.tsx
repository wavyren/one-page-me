import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { StatsPanel } from "@/components/share/stats-panel";
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

  // Fetch user's pages with stats
  const { data: pages } = await supabase
    .from("pages")
    .select("id, custom_slug, view_count, created_at, is_public")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch today's views for each page
  const pageIds = pages?.map((p) => p.id) || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const { data: todayViews } =
    pageIds.length > 0
      ? await supabase
          .from("page_views")
          .select("page_id")
          .in("page_id", pageIds)
          .gte("created_at", todayIso)
      : { data: [] };

  const todayCountByPage: Record<string, number> = {};
  todayViews?.forEach((v) => {
    todayCountByPage[v.page_id] = (todayCountByPage[v.page_id] || 0) + 1;
  });

  const pagesWithStats =
    pages?.map((p) => ({
      id: p.id,
      customSlug: p.custom_slug,
      viewCount: p.view_count || 0,
      todayCount: todayCountByPage[p.id] || 0,
      createdAt: p.created_at,
      isPublic: p.is_public,
    })) || [];

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-preview-bg p-4"
      aria-label="个人资料页面"
    >
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

        <StatsPanel pages={pagesWithStats} />

        <form action={signOut} className="flex justify-center">
          <Button type="submit" variant="outline" className="w-full">
            退出登录
          </Button>
        </form>
      </div>
    </main>
  );
}
