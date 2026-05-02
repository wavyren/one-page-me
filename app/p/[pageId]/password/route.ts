import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const bodySchema = z.object({
  password: z.string().min(1, "密码不能为空"),
});

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

function jsonError(code: string, message: string, status: number) {
  return Response.json({ code, message }, { status });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { pageId } = await params;

  // Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_JSON", "请求体格式错误", 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message || "密码不能为空",
      400
    );
  }

  // Fetch page password
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("access_password")
    .eq("id", pageId)
    .single();

  if (!page || !page.access_password) {
    // Don't reveal whether page exists
    return jsonError("WRONG_PASSWORD", "密码错误", 401);
  }

  if (page.access_password !== parsed.data.password) {
    return jsonError("WRONG_PASSWORD", "密码错误", 401);
  }

  // Set access cookie
  const cookieStore = await cookies();
  cookieStore.set(`page_access_${pageId}`, "verified", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600, // 1 hour
    path: `/p/${pageId}`,
  });

  return Response.json({ success: true });
}
