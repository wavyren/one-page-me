# Plan: Phase 3 — 主页生成引擎

## 依赖图

```
Supabase Storage pages bucket（需创建）
    │
    ├── pages 表（已存在）
    │       │
    │       ├── lib/ai/prompts.ts（新增 HTML 生成 prompt）
    │       │       │
    │       │       └── lib/ai/page-generator.ts（DeepSeek 生成 HTML）
    │       │               │
    │       │               ├── lib/actions/page.ts（Storage 上传 + DB 记录）
    │       │               │       │
    │       │               │       └── app/api/generate-page/route.ts（POST API）
    │       │               │               │
    │       │               │               ├── stores/generate-store.ts
    │       │               │               └── components/generate/*.tsx
    │       │               │
    │       │               └── app/p/[pageId]/page.tsx（SSR 渲染）
    │                       │
    │                       └── app/p/[pageId]/opengraph-image.tsx（OG 图）
    │
    └── @vercel/og（npm 依赖，增量 3 安装）
```

**实现顺序**：自下而上，先基础设施（增量 1），再触发链路（增量 2），最后渲染层（增量 3）。

---

## 增量 1：AI HTML 生成 + 存储层

**目标**：DeepSeek 能根据结构化数据生成有效 HTML，并正确存储到 Supabase Storage，记录到 pages 表。

**文件（4 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `lib/ai/prompts.ts` | 追加 | 新增 `HTML_GENERATION_PROMPT`，接收 JSON 数据，输出完整合法 HTML |
| `lib/ai/page-generator.ts` | 新建 | `generatePageHtml(data)` 调用 DeepSeek，返回 { html: string } |
| `lib/actions/page.ts` | 新建 | `createPage(userId, conversationId, html)` 上传 Storage + 插入 pages 表 |
| `scripts/test-generate.ts` | 新建 | 临时测试脚本：直接调用 generatePageHtml，输出到文件验证 |

**Acceptance Criteria：**
- [ ] `generatePageHtml()` 返回包含完整 `<html>` 标签的字符串
- [ ] HTML 包含内联 CSS（无外联资源依赖）
- [ ] HTML 在浏览器直接打开无致命错误
- [ ] `createPage()` 返回的 `html_url` 可直接访问
- [ ] pages 表记录正确关联 user_id / conversation_id

**Verification：**
- [ ] `pnpm type-check` 通过
- [ ] `pnpm lint` 通过
- [ ] 运行 `npx tsx scripts/test-generate.ts`，输出文件手动验证

**Dependencies：** None

---

## 增量 2：生成 API + 前端触发

**目标**：用户在预览面板点击"生成我的主页"，触发完整生成流程，成功后跳转 /p/{pageId}。

**文件（4 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `app/api/generate-page/route.ts` | 新建 | POST API：校验 → 获取 extracted_data → 调用 generatePageHtml → createPage → 返回 { pageId, url } |
| `stores/generate-store.ts` | 新建 | 生成状态：isGenerating, progress, pageId, error |
| `components/generate/generate-button.tsx` | 新建 | 按钮组件（onClick → POST /api/generate-page） |
| `components/generate/generating-modal.tsx` | 新建 | 全屏 overlay：进度条 + 状态文案 + 预估时间 |

**Acceptance Criteria：**
- [ ] 未就绪状态（`isReadyToGenerate=false`）按钮 disabled
- [ ] 点击按钮后显示 generating-modal，progress 从 0→100
- [ ] API 返回 200 时，modal 关闭，自动跳转 `/p/{pageId}`
- [ ] API 返回错误时，modal 显示错误信息，可重试
- [ ] 生成过程中可取消（中断 fetch）

**Verification：**
- [ ] `pnpm type-check` 通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm build` 通过
- [ ] 手动测试：完成对话 → 点击生成 → 跳转主页

**Dependencies：** 增量 1

---

## 增量 3：主页 SSR 渲染 + OG 图

**目标**：访问 `/p/{pageId}` 时 SSR 读取生成的 HTML 内容直接渲染；分享时展示 OG 预览图。

**文件（2 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `app/p/[pageId]/page.tsx` | 新建 | SSR Server Component：根据 pageId 查询 pages 表 → 读取 html_url → `dangerouslySetInnerHTML` 输出 |
| `app/p/[pageId]/opengraph-image.tsx` | 新建 | Route Segment Config `export const runtime = "edge"`，@vercel/og 生成 SVG→PNG，含姓名+tagline |

**Acceptance Criteria：**
- [ ] `/p/{pageId}` 正确渲染生成的 HTML
- [ ] 页面 `<title>` 和 `<meta>` 动态设置为用户的 name + tagline
- [ ] OG 图 URL `/p/{pageId}/opengraph-image` 返回 PNG
- [ ] OG 图包含姓名和 tagline，品牌色 `#C9854A` 背景
- [ ] 不存在的 pageId 返回 404

**Verification：**
- [ ] `pnpm type-check` 通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm build` 通过
- [ ] 手动访问 `/p/{pageId}`，验证渲染
- [ ] 手动访问 `/p/{pageId}/opengraph-image`，验证图片内容

**Dependencies：** 增量 1、2

---

## 新增依赖确认

| 包名 | 增量 | 用途 | 大小 |
|------|------|------|------|
| `@vercel/og` | 增量 3 | OG 图动态生成 | ~1MB |

→ 是否同意安装 `@vercel/og`？

---

## 汇总

| 增量 | 文件数 | 预估代码行数 | 功能 |
|------|--------|-------------|------|
| 1 | 4 | ~250 | AI 生成 HTML + Storage 存储 |
| 2 | 4 | ~200 | 前端触发 + API 链路 |
| 3 | 2 | ~150 | SSR 渲染 + OG 图 |
| **合计** | **10** | **~600** | 完整主页生成链路 |
