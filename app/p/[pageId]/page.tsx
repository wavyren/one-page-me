import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ExportSection } from "@/components/export/export-section";
import type { PageData as ExtractedData } from "@/lib/ai/page-generator";

interface PageProps {
  params: Promise<{ pageId: string }>;
}

interface PageData {
  html: string;
  name: string;
  tagline: string;
  extractedData: ExtractedData;
}

const getPageData = cache(async (pageId: string): Promise<PageData | null> => {
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("html_url, conversation_id, is_public")
    .eq("id", pageId)
    .single();

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
    html,
    name: (extracted?.name as string) || "One Page Me",
    tagline: (extracted?.tagline as string) || "你的个人主页",
    extractedData: (extracted as ExtractedData) || {},
  };
});

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

  return (
    <>
      <main
        dangerouslySetInnerHTML={{ __html: data.html }}
        className="w-full min-h-screen"
      />
      <ExportSection pageId={pageId} extractedData={data.extractedData} />
    </>
  );
}
