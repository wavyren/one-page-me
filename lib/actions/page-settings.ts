"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const customSlugSchema = z
  .string()
  .min(3, "自定义路径至少 3 个字符")
  .max(50, "自定义路径最多 50 个字符")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "只能使用字母、数字、下划线和横线"
  );

const passwordSchema = z
  .string()
  .max(100, "密码最多 100 个字符")
  .nullable();

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export async function updatePageSettings(
  pageId: string,
  settings: {
    customSlug?: string | null;
    accessPassword?: string | null;
  }
): Promise<ActionResult> {
  const supabase = await createClient();

  // Verify ownership
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } };
  }

  const { data: page } = await supabase
    .from("pages")
    .select("user_id")
    .eq("id", pageId)
    .single();

  if (!page || page.user_id !== user.id) {
    return { success: false, error: { code: "FORBIDDEN", message: "无权操作" } };
  }

  const updateData: Record<string, unknown> = {};

  if (settings.customSlug !== undefined) {
    if (settings.customSlug === null || settings.customSlug === "") {
      updateData.custom_slug = null;
    } else {
      const parsed = customSlugSchema.safeParse(settings.customSlug);
      if (!parsed.success) {
        return {
          success: false,
          error: { code: "INVALID_SLUG", message: parsed.error.issues[0]?.message || "路径格式错误" },
        };
      }
      // Check uniqueness
      const { data: existing } = await supabase
        .from("pages")
        .select("id")
        .eq("custom_slug", parsed.data)
        .neq("id", pageId)
        .single();

      if (existing) {
        return {
          success: false,
          error: { code: "SLUG_TAKEN", message: "该路径已被使用，请更换" },
        };
      }
      updateData.custom_slug = parsed.data;
    }
  }

  if (settings.accessPassword !== undefined) {
    const parsed = passwordSchema.safeParse(settings.accessPassword);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "INVALID_PASSWORD", message: parsed.error.issues[0]?.message || "密码格式错误" },
      };
    }
    updateData.access_password = parsed.data || null;
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true };
  }

  const { error } = await supabase
    .from("pages")
    .update(updateData)
    .eq("id", pageId);

  if (error) {
    return { success: false, error: { code: "DB_ERROR", message: "保存失败，请重试" } };
  }

  return { success: true };
}
