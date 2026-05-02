# Spec: Phase 6 — 分享与传播

## 假设清单

1. **数据库就绪**：`pages` 表已有 `custom_slug`, `access_password`, `view_count`；`page_views` 表已存在
2. **权限门控延后**：自定义路径和密码保护是 Pro 功能，但 Phase 6 先实现基础功能，权限校验在 Phase 7 统一接入
3. **自定义路径唯一性**：`custom_slug` 全局唯一，冲突时提示用户更换
4. **密码保护流程**：访问带密码的主页时，先显示密码输入页，验证通过后展示内容
5. **访问统计实时性**：`view_count` 实时 +1，`page_views` 记录每次访问详情（IP 哈希防重复统计）
6. **嵌入代码**：生成固定尺寸的 `<iframe>` HTML 代码片段，用户可复制粘贴
→ 如有误请立即纠正。

---

## Objective

让用户能更灵活地分享和保护个人主页，同时了解主页的传播效果。

**用户故事：**
- 用户想拥有一个更好记的链接（如 `/grace` 而非 `/p/uuid`）
- 用户想给特定人群分享主页，但不想让所有人看到（设置密码）
- 用户想把主页嵌入到自己的博客或作品集网站
- 用户想知道自己的主页被多少人看过、从哪来的

**成功标准：**
- [ ] 自定义路径 `/p/{customSlug}` 可正常访问，冲突时友好提示
- [ ] 带密码的主页 `/p/{pageId}` 访问时先弹密码输入，验证通过后展示
- [ ] 嵌入代码可复制，iframe 能正常渲染主页
- [ ] 每次访问正确记录到 `page_views`，`view_count` 实时更新
- [ ] 主页所有者在 `/profile` 或独立页面看到访问统计（总访问、今日、来源）
- [ ] type-check + lint + build 全部通过

---

## Tech Stack

| 功能 | 技术 | 说明 |
|------|------|------|
| 自定义路径 | Next.js 动态路由 `/p/[...slug]` | UUID 或 custom_slug 均可解析 |
| 密码保护 | Server Component + cookie/session | 验证通过后设置短期 cookie |
| 嵌入代码 | 模板字符串 | 固定尺寸 iframe + 自适应高度脚本 |
| 访问统计 | Supabase INSERT + 聚合查询 | Edge/Server 端记录，防刷 |
| IP 哈希 | `crypto.createHash('sha256')` | 不存明文 IP |

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
  p/
    [pageId]/
      page.tsx                  # 修改：支持密码保护流程
    [...slug]/                  # 新增：/p/{customSlug} 或 /p/{uuid}
      page.tsx                  # 解析 custom_slug 或 uuid，跳转或渲染
    [pageId]/
      password/
        route.ts                # POST: 验证密码，设置 cookie
components/
  share/
    password-gate.tsx           # 密码输入 UI
    embed-code-modal.tsx        # 嵌入代码复制 Modal
    share-section.tsx           # 分享按钮组（自定义路径/密码/嵌入/统计）
    stats-panel.tsx             # 访问统计展示
lib/
  actions/
    page-settings.ts            # Server Actions: 更新 custom_slug, password
  utils/
    ip-hash.ts                  # IP → SHA256 哈希
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

### 密码验证 cookie
```typescript
// 短期 cookie（1 小时）， httponly + secure
const cookie = `page_access_${pageId}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/p/${pageId}`;
```

### 访问记录
```typescript
// 在 page.tsx 或 middleware 中记录
await supabase.from("page_views").insert({
  page_id: pageId,
  ip_hash: hashIp(clientIp),
  user_agent: headers.get("user-agent"),
  referer: headers.get("referer"),
  country: geo?.country,
});
```

---

## Testing Strategy

| 层级 | 范围 | 验证方式 |
|---|---|---|
| 单元 | `hashIp()` 输出一致性 | Vitest |
| 集成 | `/p/{customSlug}` 解析正确 | Vitest |
| 集成 | 密码验证 API 正确响应 | Vitest |
| 人工 | 自定义路径访问、密码保护流程 | 手动 |
| 人工 | 访问统计数字准确性 | 手动 |

---

## Boundaries

### Always Do
- 自定义路径校验：`^[a-zA-Z0-9_-]+$`，长度 3-50
- 密码输入错误时给出明确提示，不暴露页面是否存在
- IP 做 SHA256 哈希后再存储，不存明文
- 每次 commit 前 `pnpm type-check && pnpm lint && pnpm build`

### Ask First
- 修改数据库 schema（已有字段，但可能需要索引）
- 添加新的 npm 依赖
- 修改 middleware 逻辑（访问统计涉及请求拦截）

### Never Do
- 在前端暴露 access_password 明文
- 存储明文 IP 地址
- 跳过密码验证直接渲染受保护页面

---

## Open Questions

1. **自定义路径管理页**：放在 `/profile` 下，还是独立页面 `/pages`？
2. **访问统计展示位置**：`/profile` 内嵌统计卡片，还是独立 `/stats` 页面？
3. **密码保护 cookie 策略**：1 小时有效期是否合适？是否需要"记住我"选项？
4. **访问统计防刷**：同一 IP 5 分钟内多次访问是否只算一次？
