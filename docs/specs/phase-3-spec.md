# Spec: Phase 3 — 主页生成引擎

## 假设清单

1. **AI 生成 HTML**：使用 DeepSeek V4 Pro 直接生成完整合法 HTML，非模板填充
2. **存储方案**：生成的 HTML 存 Supabase Storage（`pages` bucket），返回公开 URL
3. **单版本优先**：Phase 3 先实现单主页生成，多版本管理（免费 2 个/Pro 无限）延后到 Phase 7
4. **OG 图生成**：使用 `@vercel/og` 动态生成分享预览图
5. **SSR 渲染**：主页路由 `/p/[pageId]` 读取 HTML 内容，直接输出（不 iframe）
→ 如有误请立即纠正。

---

## Objective

实现从对话数据到可访问个人主页的完整生成链路。用户点击"生成我的主页"后，AI 生成 HTML → 存储 → 返回公开链接。

**用户故事：**
- 对话信息收集完成后，用户点击"生成我的主页"
- 系统调用 DeepSeek 生成完整 HTML（含内联 CSS）
- HTML 存入 Supabase Storage，记录到 `pages` 表
- 用户获得公开链接 `one-page-me.vercel.app/p/{pageId}`
- 分享时自动展示 OG 预览图

**成功标准：**
- [ ] 点击生成后 30s 内完成（含 AI 生成 + 存储）
- [ ] 生成的 HTML 在浏览器正常渲染，无致命错误
- [ ] 移动端 320px 宽度自适应
- [ ] 分享链接可访问，内容与预览一致
- [ ] OG 图包含姓名和一句话定位
- [ ] type-check + lint + build 全部通过

---

## Tech Stack

| 功能 | 技术 | 说明 |
|------|------|------|
| HTML 生成 | DeepSeek V4 Pro | 结构化数据 → 完整合法 HTML |
| 存储 | Supabase Storage | `pages` bucket 存 HTML 文件 |
| OG 图 | `@vercel/og` | 动态生成 SVG → PNG |
| 主页路由 | Next.js SSR | `/p/[pageId]` 读取并渲染 HTML |
| 元数据 | Next.js `metadata` | 动态 title/description/og:image |

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
  api/generate-page/route.ts    # POST: 生成 HTML API
  p/
    [pageId]/
      page.tsx                  # SSR 渲染主页
      opengraph-image.tsx       # OG 图动态生成
components/
  generate/
    generate-button.tsx         # "生成我的主页"按钮
    generating-modal.tsx        # 生成中 loading UI
lib/
  ai/
    page-generator.ts           # DeepSeek HTML 生成调用
    prompts.ts                  # 已有：新增 HTML 生成 prompt
  actions/
    page.ts                     # pages 表 CRUD
stores/
  generate-store.ts             # 生成状态管理
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

### HTML 存储路径
```
pages/{userId}/{pageId}.html
```

### 颜色 Token（复用设计系统）
- 品牌主色：`--color-brand: #C9854A`
- 预览背景：`--color-preview-bg: #F4EFE8`

---

## Testing Strategy

| 层级 | 范围 | 验证方式 |
|---|---|---|
| 集成 | `/api/generate-page` 响应格式 | Vitest |
| 人工 | HTML 在 3 种浏览器渲染 | 手动 |
| 人工 | 移动端 320px 自适应 | 手动 |
| 人工 | OG 图包含正确内容 | 手动 |

---

## Boundaries

### Always Do
- 生成前校验 `extracted_data` 完整性（`is_ready === true`）
- HTML 输出经过 DOMPurify 清理（防 XSS）
- 每次 commit 前 `pnpm type-check && pnpm lint && pnpm build`
- API 返回统一错误格式

### Ask First
- 添加新的 npm 依赖（`@vercel/og`, `dompurify` 等）
- 修改数据库 schema
- 修改 Storage bucket 配置

### Never Do
- 直接返回未清理的 AI 生成 HTML 到浏览器
- 在前端暴露 Storage 管理密钥
- 跳过 `is_ready` 校验直接生成

---

## Open Questions

1. **HTML 模板风格**：AI 生成时是否指定固定风格（如 PRD 提到的 professional/warm/creative/casual）？还是单一套风格？
2. **自定义路径**：`custom_slug` 功能是否在 Phase 3 实现？还是延后？
3. **生成 loading UI**：生成过程中展示什么？进度条/骨架屏/动画？
