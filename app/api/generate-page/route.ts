import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePageHtml } from "@/lib/ai/page-generator";

const generateInputSchema = z.object({
  conversationId: z.string().uuid(),
});

function jsonError(
  code: string,
  message: string,
  status: number,
  details?: unknown
) {
  return Response.json({ code, message, details }, { status });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_JSON", "请求体必须是有效的 JSON", 400);
  }

  const parseResult = generateInputSchema.safeParse(body);
  if (!parseResult.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "请求参数校验失败",
      400,
      parseResult.error.issues
    );
  }

  const { conversationId } = parseResult.data;

  // 1. Get current user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("UNAUTHORIZED", "请先登录", 401);
  }

  // 2. Verify conversation belongs to user and has extracted_data
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id, user_id, extracted_data")
    .eq("id", conversationId)
    .single();

  if (convError || !conversation) {
    return jsonError("CONVERSATION_NOT_FOUND", "对话不存在", 404);
  }

  if (conversation.user_id !== user.id) {
    return jsonError("FORBIDDEN", "无权访问此对话", 403);
  }

  const extractedData = conversation.extracted_data as Record<
    string,
    unknown
  > | null;

  if (!extractedData || !extractedData.is_ready) {
    return jsonError(
      "NOT_READY",
      "对话信息尚未收集完成，无法生成主页",
      400
    );
  }

  // 3. Generate HTML
  let htmlResult: { html: string };
  try {
    htmlResult = await generatePageHtml(extractedData);
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成失败";
    return jsonError("GENERATION_FAILED", message, 500);
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
    if (uploadError.message?.includes("bucket")) {
      return jsonError(
        "STORAGE_BUCKET_MISSING",
        "Storage bucket 'pages' 未配置，请联系管理员",
        500
      );
    }
    return jsonError("STORAGE_UPLOAD_FAILED", uploadError.message, 500);
  }

  // 5. Get public URL
  const {
    data: { publicUrl },
  } = admin.storage.from("pages").getPublicUrl(filePath);

  // 6. Insert page record
  const { error: insertError } = await supabase.from("pages").insert({
    id: pageId,
    user_id: user.id,
    conversation_id: conversationId,
    html_url: publicUrl,
    language: (extractedData.language as string) || "zh",
  });

  if (insertError) {
    // Clean up uploaded file
    await admin.storage.from("pages").remove([filePath]);
    return jsonError("DB_INSERT_FAILED", insertError.message, 500);
  }

  // 7. Mark conversation as complete
  await supabase
    .from("conversations")
    .update({ is_complete: true })
    .eq("id", conversationId);

  return Response.json({
    success: true,
    data: { pageId, url: publicUrl },
  });
}
