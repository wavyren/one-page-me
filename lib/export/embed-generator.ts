export interface EmbedOptions {
  pageId: string;
  appUrl: string;
  width?: string;
  height?: number;
}

export function generateEmbedCode(options: EmbedOptions): string {
  const { pageId, appUrl, width = "100%", height = 800 } = options;
  const pageUrl = `${appUrl}/p/${pageId}`;

  return `<iframe
  src="${pageUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);"
  title="个人主页"
></iframe>`;
}
