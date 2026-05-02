import { generateShareImage } from "@/lib/export/image-generator";

export const runtime = "edge";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

function jsonError(code: string, message: string, status: number) {
  return Response.json({ code, message }, { status });
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { pageId } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return jsonError(
      "CONFIG_MISSING",
      "服务器配置缺失，无法生成图片",
      500
    );
  }

  // 1. Fetch page record
  const pageRes = await fetch(
    `${supabaseUrl}/rest/v1/pages?id=eq.${pageId}&select=conversation_id,is_public`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!pageRes.ok) {
    return jsonError("DB_ERROR", "查询页面失败", 500);
  }

  const [page] = await pageRes.json();
  if (!page) {
    return jsonError("PAGE_NOT_FOUND", "页面不存在", 404);
  }

  if (!page.is_public) {
    return jsonError("PAGE_PRIVATE", "该页面未公开", 403);
  }

  // 2. Fetch conversation extracted_data
  const convRes = await fetch(
    `${supabaseUrl}/rest/v1/conversations?id=eq.${page.conversation_id}&select=extracted_data`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  let name = "One Page Me";
  let tagline = "你的个人主页";

  if (convRes.ok) {
    const [conv] = await convRes.json();
    const extracted = conv?.extracted_data as Record<string, unknown> | null;
    name = (extracted?.name as string) || name;
    tagline = (extracted?.tagline as string) || tagline;
  }

  // 3. Generate image
  try {
    return await generateShareImage({ name, tagline });
  } catch {
    return jsonError("IMAGE_GENERATION_FAILED", "图片生成失败", 500);
  }
}
