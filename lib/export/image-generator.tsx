import { ImageResponse } from "next/og";

interface ShareImageData {
  name: string;
  tagline: string;
}

async function fetchGoogleFontUrls(): Promise<{
  regular: string;
  bold: string;
}> {
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap"
  ).then((r) => r.text());

  const regularMatch = css.match(/font-weight: 400[^}]+src: url\(([^)]+)\)/);
  const boldMatch = css.match(/font-weight: 700[^}]+src: url\(([^)]+)\)/);

  if (!regularMatch || !boldMatch) {
    throw new Error("Failed to parse Google Fonts CSS");
  }

  return { regular: regularMatch[1], bold: boldMatch[1] };
}

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font: ${url}`);
  return res.arrayBuffer();
}

export async function generateShareImage(
  data: ShareImageData
): Promise<ImageResponse> {
  const { regular, bold } = await fetchGoogleFontUrls();
  const [regularFont, boldFont] = await Promise.all([
    loadFont(regular),
    loadFont(bold),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: "#1A1A1A",
          background: "#C9854A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: '"Noto Sans SC", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: 40,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {data.name}
        </div>
        <div
          style={{
            fontSize: 42,
            color: "#F4EFE8",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.5,
          }}
        >
          {data.tagline}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "2px",
          }}
        >
          one-page-me.vercel.app
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        {
          name: "Noto Sans SC",
          data: regularFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Noto Sans SC",
          data: boldFont,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
