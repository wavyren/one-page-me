import { ImageResponse } from "next/og";

export const runtime = "edge";

interface ImageProps {
  params: Promise<{ pageId: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { pageId } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          background: "#F4EFE8",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        One Page Me
      </div>,
      { width: 1200, height: 630 }
    );
  }

  // Fetch page data via Supabase REST API
  const pageRes = await fetch(
    `${supabaseUrl}/rest/v1/pages?id=eq.${pageId}&select=conversation_id`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!pageRes.ok) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          background: "#F4EFE8",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        One Page Me
      </div>,
      { width: 1200, height: 630 }
    );
  }

  const [page] = await pageRes.json();
  if (!page?.conversation_id) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          background: "#F4EFE8",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        One Page Me
      </div>,
      { width: 1200, height: 630 }
    );
  }

  // Fetch conversation extracted_data
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

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: "#1A1A1A",
          background: "#F4EFE8",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#C9854A",
            marginBottom: 32,
            letterSpacing: "2px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#666666",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 50,
            fontSize: 22,
            color: "#999999",
            letterSpacing: "1px",
          }}
        >
          one-page-me.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
