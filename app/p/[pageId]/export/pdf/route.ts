import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

function jsonError(code: string, message: string, status: number) {
  return Response.json({ code, message }, { status });
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { pageId } = await params;

  // 1. Verify page exists and is public
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("html_url, is_public")
    .eq("id", pageId)
    .single();

  if (!page) {
    return jsonError("PAGE_NOT_FOUND", "页面不存在", 404);
  }

  if (!page.is_public) {
    return jsonError("PAGE_PRIVATE", "该页面未公开", 403);
  }

  // 2. Call PDF microservice
  const pdfServiceUrl = process.env.PDF_SERVICE_URL;
  const pdfServiceSecret = process.env.PDF_SERVICE_SECRET;

  if (!pdfServiceUrl || !pdfServiceSecret) {
    return jsonError(
      "SERVICE_NOT_CONFIGURED",
      "PDF 导出服务未配置",
      503
    );
  }

  try {
    const response = await fetch(`${pdfServiceUrl}/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        htmlUrl: page.html_url,
        secret: pdfServiceSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return jsonError(
        errorData.code || "PDF_SERVICE_ERROR",
        errorData.message || "PDF 生成失败",
        502
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pageId}.pdf"`,
      },
    });
  } catch {
    return jsonError("PDF_GENERATION_FAILED", "PDF 生成服务暂时不可用", 503);
  }
}
