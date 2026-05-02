import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ExportSection } from "@/components/export/export-section";
import { PasswordGate } from "@/components/share/password-gate";
import { hashIp } from "@/lib/ip-hash";
import type { PageData as ExtractedData } from "@/lib/ai/page-generator";

interface PageProps {
  params: Promise<{ pageId: string }>;
}

interface PageData {
  id: string;
  html: string;
  name: string;
  tagline: string;
  extractedData: ExtractedData;
  accessPassword: string | null;
}

// UUID v4 regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getPageData = cache(async (slug: string): Promise<PageData | null> => {
  const supabase = await createClient();

  // Try UUID first, then custom_slug
  const isUuid = UUID_REGEX.test(slug);

  let query = supabase
    .from("pages")
    .select("id, html_url, conversation_id, is_public, custom_slug, access_password");

  if (isUuid) {
    query = query.eq("id", slug);
  } else {
    query = query.eq("custom_slug", slug);
  }

  const { data: page } = await query.single();

  if (!page) return null;
  if (!page.is_public) return null;

  // Fetch HTML from Storage
  const htmlRes = await fetch(page.html_url, { cache: "no-store" });
  if (!htmlRes.ok) return null;
  const html = await htmlRes.text();

  // Get metadata from conversation
  const { data: conv } = await supabase
    .from("conversations")
    .select("extracted_data")
    .eq("id", page.conversation_id)
    .single();

  const extracted = conv?.extracted_data as Record<string, unknown> | null;

  return {
    id: page.id,
    html,
    name: (extracted?.name as string) || "One Page Me",
    tagline: (extracted?.tagline as string) || "你的个人主页",
    extractedData: (extracted as ExtractedData) || {},
    accessPassword: page.access_password || null,
  };
});

async function recordPageView(pageId: string): Promise<void> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
    const ipHash = hashIp(clientIp);

    const supabase = await createClient();

    // Check if same IP has visited in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("page_views")
      .select("id")
      .eq("page_id", pageId)
      .eq("ip_hash", ipHash)
      .gte("created_at", oneDayAgo)
      .limit(1)
      .single();

    if (existing) return; // Already counted today

    // Insert view record
    await supabase.from("page_views").insert({
      page_id: pageId,
      ip_hash: ipHash,
      user_agent: headersList.get("user-agent") || null,
      referer: headersList.get("referer") || null,
      country: headersList.get("cf-ipcountry") || null,
    });

    // Increment view_count atomically via RPC
    await supabase.rpc("increment_view_count", { page_id: pageId });
  } catch {
    // Silently ignore recording errors — don't block page rendering
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { pageId } = await params;
  const data = await getPageData(pageId);

  if (!data) {
    return { title: "页面不存在 | One Page Me" };
  }

  return {
    title: `${data.name} · ${data.tagline}`,
    description: data.tagline,
    openGraph: {
      title: `${data.name} · ${data.tagline}`,
      description: data.tagline,
      type: "website",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { pageId } = await params;
  const data = await getPageData(pageId);

  if (!data) {
    notFound();
  }

  // Check password protection
  if (data.accessPassword) {
    const cookieStore = await cookies();
    const accessCookie = cookieStore.get(`page_access_${data.id}`);
    if (!accessCookie || accessCookie.value !== "verified") {
      return <PasswordGate pageId={data.id} name={data.name} />;
    }
  }

  // Record page view (fire-and-forget, don't block rendering)
  recordPageView(data.id);

  return (
    <>
      <main
        dangerouslySetInnerHTML={{ __html: data.html }}
        className="w-full min-h-screen"
      />
      <ExportSection pageId={data.id} extractedData={data.extractedData} />
    </>
  );
}
