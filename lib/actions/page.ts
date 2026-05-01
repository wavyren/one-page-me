"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePageHtml } from "@/lib/ai/page-generator";
import type { PageData } from "@/lib/ai/page-generator";

export interface ActionError {
  code: string;
  message: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ActionError;
}

export interface CreatePageInput {
  conversationId: string;
  extractedData: PageData;
}

export interface CreatePageOutput {
  pageId: string;
  url: string;
}

function createError(code: string, message: string): ActionResult<never> {
  return { success: false, error: { code, message } };
}

/**
 * Generate HTML from extracted data, upload to Storage, and create page record.
 */
export async function createPage(
  input: CreatePageInput
): Promise<ActionResult<CreatePageOutput>> {
  const supabase = await createClient();

  // 1. Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return createError("UNAUTHORIZED", "请先登录");
  }

  // 2. Verify conversation belongs to user and has extracted_data
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id, user_id, extracted_data")
    .eq("id", input.conversationId)
    .single();

  if (convError || !conversation) {
    return createError("CONVERSATION_NOT_FOUND", "对话不存在");
  }

  if (conversation.user_id !== user.id) {
    return createError("FORBIDDEN", "无权访问此对话");
  }

  // 3. Generate HTML
  let htmlResult: { html: string };
  try {
    htmlResult = await generatePageHtml(input.extractedData);
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成失败";
    return createError("GENERATION_FAILED", message);
  }

  // 4. Upload HTML to Storage
  const admin = createAdminClient();
  const pageId = crypto.randomUUID();
  const filePath = `${user.id}/${pageId}.html`;

  const { error: uploadError } = await admin.storage
    .from("pages")
    .upload(filePath, htmlResult.html, {
      contentType: "text/html",
      upsert: false,
    });

  if (uploadError) {
    // If bucket doesn't exist, return meaningful error
    if (uploadError.message?.includes("bucket")) {
      return createError(
        "STORAGE_BUCKET_MISSING",
        "Storage bucket 'pages' 未配置，请联系管理员"
      );
    }
    return createError("STORAGE_UPLOAD_FAILED", uploadError.message);
  }

  // 5. Get public URL
  const {
    data: { publicUrl },
  } = admin.storage.from("pages").getPublicUrl(filePath);

  // 6. Insert page record
  const { data: page, error: insertError } = await supabase
    .from("pages")
    .insert({
      id: pageId,
      user_id: user.id,
      conversation_id: input.conversationId,
      html_url: publicUrl,
      language: input.extractedData.language || "zh",
    })
    .select()
    .single();

  if (insertError) {
    // Try to clean up uploaded file
    await admin.storage.from("pages").remove([filePath]);
    return createError("DB_INSERT_FAILED", insertError.message);
  }

  // 7. Mark conversation as complete
  await supabase
    .from("conversations")
    .update({ is_complete: true })
    .eq("id", input.conversationId);

  return {
    success: true,
    data: { pageId: page.id, url: publicUrl },
  };
}

/**
 * Get a page by ID.
 */
export async function getPageById(
  pageId: string
): Promise<ActionResult<{ id: string; html_url: string; custom_slug: string | null }>> {
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from("pages")
    .select("id, html_url, custom_slug")
    .eq("id", pageId)
    .single();

  if (error || !page) {
    return createError("PAGE_NOT_FOUND", "主页不存在");
  }

  return { success: true, data: page };
}

/**
 * Get HTML content from Storage URL.
 */
export async function fetchPageHtml(url: string): Promise<ActionResult<string>> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return createError("FETCH_FAILED", `Failed to fetch HTML: ${res.status}`);
    }
    const html = await res.text();
    return { success: true, data: html };
  } catch (err) {
    const message = err instanceof Error ? err.message : "获取失败";
    return createError("FETCH_FAILED", message);
  }
}
