"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "./auth";

export async function updateProfile(data: {
  name?: string;
  avatar_url?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: { code: "AUTH_NOT_FOUND", message: "未登录" },
    };
  }

  const { error } = await supabase
    .from("users")
    .update({
      name: data.name,
      avatar_url: data.avatar_url,
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: { code: "PROFILE_UPDATE_FAILED", message: error.message },
    };
  }

  await supabase.auth.updateUser({
    data: {
      name: data.name,
      avatar_url: data.avatar_url,
    },
  });

  return { success: true };
}
