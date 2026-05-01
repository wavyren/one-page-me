"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(data: {
  name?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "未登录" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      name: data.name,
      avatar_url: data.avatar_url,
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.auth.updateUser({
    data: {
      name: data.name,
      avatar_url: data.avatar_url,
    },
  });

  return { success: true };
}
