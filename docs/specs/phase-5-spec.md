# Spec: Phase 5 — 导出功能

## 假设清单

1. **QR Code**: 纯前端实现，使用 `qrcode` 库生成 SVG，用户可下载 PNG
2. **Markdown 导出**: 从结构化数据（`extracted_data`）直接生成 Markdown，无外部依赖
3. **图片导出**: 复用已接入的 `@vercel/og`，扩展为 1:1 正方形主图
4. **PDF 导出**: 使用 Puppeteer + Chromium 微服务，部署到 Railway（复杂度最高，放最后）
5. **入口位置**: 用户生成主页后，在 `/p/[pageId]` 页面底部添加"导出"按钮组
→ 如有误请立即纠正。

---

## Objective

让用户能将生成的个人主页导出为多种格式：QR Code（分享用）、Markdown（内容复用）、图片（社交媒体）、PDF（打印/投递）。

**用户故事：**
- 用户看到自己的主页后，点击"导出"按钮
- 选择格式：QR Code / Markdown / 图片 / PDF
- 系统生成对应格式文件，提供下载链接
- 导出内容风格与网页一致（品牌色、排版）

**成功标准：**
- [ ] QR Code 可扫描，链接正确
- [ ] Markdown 包含所有结构化数据，格式整洁
- [ ] 图片导出 1:1 正方形，品牌色背景，清晰可读
- [ ] PDF 导出样式与网页一致
- [ ] type-check + lint + build 全部通过

---

## Tech Stack

| 功能 | 技术 | 说明 |
|------|------|------|
| QR Code | `qrcode` | 生成 SVG/PNG，前端下载 |
| Markdown | 模板字符串 | 从 `extracted_data` 直接生成 |
| 图片导出 | `@vercel/og` + `sharp` | 复用现有 OG 图逻辑，裁切 1:1 |
| PDF 导出 | Puppeteer + `@sparticuz/chromium` | Railway 微服务 |
| 入口 UI | React Client Component | 导出按钮 + 格式选择 Modal |

---

## Commands

```bash
# 开发
pnpm dev

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 构建
pnpm build
```

---

## Project Structure

```
app/
  p/[pageId]/
    page.tsx                  # 添加 ExportSection
    opengraph-image.tsx       # 已有：复用
    export/
      markdown/route.ts       # GET: 返回 Markdown 文本
      image/route.ts          # GET: 返回 1:1 图片
lib/
  export/
    markdown-generator.ts     # extracted_data → Markdown
    qrcode-generator.ts       # URL → SVG/PNG
components/
  export/
    export-section.tsx        # 导出按钮组
    export-modal.tsx          # 格式选择 + 下载
    qrcode-display.tsx        # QR Code 展示 + 下载
    markdown-preview.tsx      # Markdown 预览 + 下载
```

---

## Code Style

### API 错误格式（复用 Phase 1 规范）
```typescript
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
```

### Markdown 生成示例
```typescript
function generateMarkdown(data: ExtractedData): string {
  return `# ${data.name}

> ${data.tagline}

## 关于我

${data.bio}

## 核心亮点

${data.highlights?.map(h => `- ${h}`).join("\n")}

## 技能

${data.skills?.map(s => `- ${s}`).join("\n")}

## 联系方式

${data.contact?.email ? `- 邮箱: ${data.contact.email}` : ""}
`;
}
```

---

## Testing Strategy

| 层级 | 范围 | 验证方式 |
|---|---|---|
| 单元 | `generateMarkdown()` 输出格式 | Vitest |
| 集成 | `/api/export/markdown` 响应格式 | Vitest |
| 人工 | QR Code 可扫描 | 手动 |
| 人工 | 图片/PDF 样式一致性 | 手动 |

---

## Boundaries

### Always Do
- 导出前校验 `pageId` 存在且 `is_public=true`
- Markdown 生成使用 UTF-8 编码
- 图片导出使用品牌色 `#C9854A` 背景
- 每次 commit 前 `pnpm type-check && pnpm lint && pnpm build`

### Ask First
- 添加新的 npm 依赖（`qrcode`, `sharp` 等）
- 创建新的 Railway 项目
- 修改数据库 schema

### Never Do
- 在前端暴露 Supabase service role key
- 导出的 PDF/图片包含用户敏感信息（如真实手机号）
- 跳过 `is_public` 校验直接导出

---

## Open Questions

1. **PDF 微服务部署**: Railway 账号是否已有？还是需要新注册？
2. **导出按钮位置**: 放在 `/p/[pageId]` 页面底部，还是独立的"管理页"？
3. **图片尺寸**: 1:1 正方形（1080x1080）用于社交媒体，还是需要多种尺寸？
