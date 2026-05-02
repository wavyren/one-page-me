# Plan: Phase 5 — 导出功能

## 依赖图

```
lib/export/markdown-generator.ts
    │
    ├── lib/export/qrcode-generator.ts
    │       │
    │       └── components/export/export-section.tsx（按钮 + Modal + 预览）
    │               │
    │               └── app/p/[pageId]/page.tsx（接入 ExportSection）
    │
    └── app/p/[pageId]/export/image/route.ts（增量 2）
            │
            ├── lib/export/image-generator.ts
            │       │
            │       └── components/export/export-section.tsx
            │
            └── pdf-service/（增量 3，Railway 微服务）
                    │
                    └── app/p/[pageId]/export/pdf/route.ts
                            │
                            └── components/export/export-section.tsx
```

**实现顺序**：增量 1（纯前端）→ 增量 2（图片 API）→ 增量 3（PDF 微服务）

---

## 增量 1：QR Code + Markdown 导出

**目标**：用户在 `/p/[pageId]` 页面底部看到"导出"按钮，点击后选择 QR Code 或 Markdown，可预览并下载。

**文件（4 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `lib/export/markdown-generator.ts` | 新建 | `extractedData → Markdown 字符串` |
| `lib/export/qrcode-generator.ts` | 新建 | `url → SVG 字符串（使用 qrcode 库）` |
| `components/export/export-section.tsx` | 新建 | 按钮组 + Modal + QR/Markdown 预览 + 下载逻辑 |
| `app/p/[pageId]/page.tsx` | 修改 | 底部插入 `<ExportSection pageId={pageId} />` |

**新增依赖**：`qrcode` + `@types/qrcode`

**Acceptance Criteria：**
- [ ] "导出"按钮显示在 `/p/[pageId]` 页面底部
- [ ] 点击弹出 Modal，显示 4 个格式选项（QR / Markdown / 图片 / PDF）
- [ ] QR Code 选项：显示二维码 SVG，可点击下载 PNG
- [ ] Markdown 选项：显示预览，可点击复制或下载 `.md` 文件
- [ ] 未实现的选项（图片/PDF）显示"即将上线"占位

**Verification：**
- [ ] `pnpm type-check` 通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm build` 通过
- [ ] 手动：访问 `/p/{pageId}`，点击导出按钮，验证 QR/Markdown

**Dependencies：** None

---

## 增量 2：图片导出（1:1 正方形）

**目标**：用户选择"图片"导出，生成 1080×1080 品牌色背景的正方形图片，可下载。

**文件（3 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `lib/export/image-generator.ts` | 新建 | 复用 `@vercel/og` 逻辑，生成 1080×1080 SVG |
| `app/p/[pageId]/export/image/route.ts` | 新建 | GET API：读取 extracted_data → 调用 image-generator → 返回 PNG |
| `components/export/export-section.tsx` | 修改 | 激活"图片"选项，点击后在新标签页打开 `/p/{pageId}/export/image` |

**新增依赖**：`sharp`（SVG → PNG 裁切）

**Acceptance Criteria：**
- [ ] `/p/{pageId}/export/image` 返回 PNG 图片
- [ ] 图片尺寸 1080×1080，品牌色 `#C9854A` 背景
- [ ] 包含姓名、tagline、品牌 Logo 区域
- [ ] 导出 Modal 中"图片"选项可点击并正常下载

**Verification：**
- [ ] `pnpm type-check && pnpm lint && pnpm build` 通过
- [ ] 手动：访问 `/p/{pageId}/export/image`，验证 PNG 内容

**Dependencies：** 增量 1

---

## 增量 3：PDF 导出（Railway 微服务）

**目标**：用户选择"PDF"导出，调用 Railway 微服务生成 PDF，返回下载链接。

**文件（5 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `pdf-service/package.json` | 新建 | Express + Puppeteer + @sparticuz/chromium |
| `pdf-service/index.ts` | 新建 | 微服务：接收 HTML URL → Puppeteer 生成 PDF → 返回 Buffer |
| `pdf-service/Dockerfile` | 新建 | 基于 `node:20-slim`，安装 Chromium 依赖 |
| `app/p/[pageId]/export/pdf/route.ts` | 新建 | GET API：调用 Railway 微服务 → 返回 PDF 文件 |
| `components/export/export-section.tsx` | 修改 | 激活"PDF"选项 |

**新增依赖**：无（微服务独立部署）

**Acceptance Criteria：**
- [ ] Railway 微服务成功部署并运行
- [ ] `/p/{pageId}/export/pdf` 返回 PDF 文件
- [ ] PDF 内容与网页一致（品牌色、排版）
- [ ] 导出 Modal 中"PDF"选项可点击并正常下载

**Verification：**
- [ ] 本地 `docker build` 微服务成功
- [ ] Railway 部署成功，健康检查通过
- [ ] 手动：点击 PDF 导出，验证文件内容

**Dependencies：** 增量 1、2

---

## 新增依赖确认

| 包名 | 增量 | 用途 | 大小 |
|------|------|------|------|
| `qrcode` | 增量 1 | QR Code 生成 | ~100KB |
| `@types/qrcode` | 增量 1 | TypeScript 类型 | ~5KB |
| `sharp` | 增量 2 | SVG → PNG 裁切 | ~30MB |

→ 是否同意安装以上依赖？

---

## 汇总

| 增量 | 文件数 | 预估代码行数 | 功能 |
|------|--------|-------------|------|
| 1 | 4 | ~250 | QR Code + Markdown 导出 |
| 2 | 3 | ~150 | 图片导出（1:1） |
| 3 | 5 | ~300 | PDF 导出（Railway 微服务） |
| **合计** | **12** | **~700** | 完整导出功能 |
