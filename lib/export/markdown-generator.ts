import { PageData } from "@/lib/ai/page-generator";

export function generateMarkdown(data: PageData): string {
  const lines: string[] = [];

  // Title
  if (data.name) {
    lines.push(`# ${data.name}`);
    lines.push("");
  }

  // Tagline
  if (data.tagline) {
    lines.push(`> ${data.tagline}`);
    lines.push("");
  }

  // Bio
  if (data.bio) {
    lines.push("## 关于我");
    lines.push("");
    lines.push(data.bio);
    lines.push("");
  }

  // Highlights
  if (data.highlights && data.highlights.length > 0) {
    lines.push("## 核心亮点");
    lines.push("");
    data.highlights.forEach((h) => lines.push(`- ${h}`));
    lines.push("");
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    lines.push("## 技能");
    lines.push("");
    data.skills.forEach((s) => lines.push(`- ${s}`));
    lines.push("");
  }

  // Contact
  if (data.contact) {
    const contactLines: string[] = [];
    if (data.contact.email) contactLines.push(`- 邮箱: ${data.contact.email}`);
    if (data.contact.wechat) contactLines.push(`- 微信: ${data.contact.wechat}`);
    if (data.contact.phone) contactLines.push(`- 电话: ${data.contact.phone}`);

    if (contactLines.length > 0) {
      lines.push("## 联系方式");
      lines.push("");
      lines.push(...contactLines);
      lines.push("");
    }
  }

  // Footer
  lines.push("---");
  lines.push("");
  lines.push("*由 [One Page Me](https://one-page-me.vercel.app) 生成*");

  return lines.join("\n");
}
