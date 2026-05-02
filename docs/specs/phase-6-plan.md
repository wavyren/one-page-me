# Plan: Phase 6 — 分享与传播

## 依赖图

```
app/p/[pageId]/page.tsx
    │
    ├── 自定义路径解析（增量 1）
    │       │
    │       └── 密码保护流程（增量 2）
    │               │
    │               ├── components/share/password-gate.tsx
    │               └── app/p/[pageId]/password/route.ts
    │
    ├── 访问统计记录（增量 4）
    │       │
    │       └── lib/utils/ip-hash.ts
    │
    └── 嵌入代码（增量 3）
            │
            └── components/share/embed-code-modal.tsx
                    │
                    └── app/profile/page.tsx（增量 5：管理页）
                            │
                            └── lib/actions/page-settings.ts
```

**实现顺序**：增量 1 → 增量 2 → 增量 3 → 增量 4 → 增量 5

---

## 增量 1：自定义路径解析

**目标**：访问 `/p/{customSlug}` 或 `/p/{uuid}` 都能正确渲染主页。

**文件（1 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `app/p/[pageId]/page.tsx` | 修改 | `getPageData` 先按 `custom_slug` 查，再按 `id` 查 |

**Acceptance Criteria：**
- [ ] `/p/{uuid}` 正常访问
- [ ] `/p/{customSlug}` 正常访问（如 `/p/test-slug`）
- [ ] custom_slug 不存在时返回 404
- [ ] 两个路径的 OG 图都正确生成

**Verification：**
- [ ] `pnpm type-check && pnpm lint && pnpm build` 通过
- [ ] 手动：访问 `/p/{uuid}` 和 `/p/{customSlug}`，验证渲染一致

**Dependencies：** None

---

## 增量 2：密码保护

**目标**：带 `access_password` 的主页访问时先显示密码输入页，验证通过后展示内容。

**文件（3 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `app/p/[pageId]/page.tsx` | 修改 | 检测 cookie，无则渲染密码门 |
| `components/share/password-gate.tsx` | 新建 | 密码输入 UI + 验证请求 |
| `app/p/[pageId]/password/route.ts` | 新建 | POST API：验证密码 → 设置 cookie |

**Acceptance Criteria：**
- [ ] 带密码的主页未验证时显示密码输入 UI
- [ ] 输入正确密码后设置 cookie，刷新页面可直接访问
- [ ] 输入错误密码显示明确错误提示
- [ ] 不带密码的主页不受影响

**Verification：**
- [ ] `pnpm type-check && pnpm lint && pnpm build` 通过
- [ ] 手动：设置密码 → 访问 → 输入错误 → 输入正确 → 验证 cookie 生效

**Dependencies：** 增量 1

---

## 增量 3：嵌入代码

**目标**：用户在导出 Modal 中可复制 iframe 嵌入代码。

**文件（2 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `components/share/embed-code-modal.tsx` | 新建 | iframe 代码生成 + 复制 |
| `components/export/export-section.tsx` | 修改 | 替换"即将上线"为嵌入代码选项 |

**Acceptance Criteria：**
- [ ] 点击"嵌入代码"弹出 Modal，显示 HTML 代码片段
- [ ] 代码包含固定尺寸 iframe（600×800）+ 自适应脚本
- [ ] 点击复制按钮，代码进入剪贴板

**Verification：**
- [ ] `pnpm type-check && pnpm lint && pnpm build` 通过
- [ ] 手动：复制代码 → 粘贴到本地 HTML 文件 → 验证 iframe 正常加载

**Dependencies：** 增量 1

---

## 增量 4：访问统计

**目标**：每次主页访问记录到 `page_views`，`view_count` +1，主页所有者可见统计。

**文件（3 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `lib/utils/ip-hash.ts` | 新建 | IP → SHA256 哈希 |
| `app/p/[pageId]/page.tsx` | 修改 | SSR 时记录访问 |
| `components/share/stats-panel.tsx` | 新建 | 统计卡片：总访问、今日、来源 |

**Acceptance Criteria：**
- [ ] 访问主页后 `page_views` 新增一条记录
- [ ] `pages.view_count` 对应 +1
- [ ] IP 以 SHA256 哈希存储，无明文
- [ ] stats-panel 正确展示统计数据

**Verification：**
- [ ] `pnpm type-check && pnpm lint && pnpm build` 通过
- [ ] 手动：访问主页 → 查数据库验证记录 → 刷新 stats-panel

**Dependencies：** 增量 1

---

## 增量 5：主页管理页

**目标**：在 `/profile` 页面新增「我的主页」标签页，可设置自定义路径和密码。

**文件（3 个）：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `lib/actions/page-settings.ts` | 新建 | Server Actions: updateSlug, updatePassword |
| `components/profile/pages-tab.tsx` | 新建 | 主页列表 + 自定义路径输入 + 密码开关 |
| `app/profile/page.tsx` | 修改 | 添加 Pages 标签页 |

**Acceptance Criteria：**
- [ ] `/profile` 显示「我的主页」标签页
- [ ] 可修改自定义路径，冲突时提示
- [ ] 可开启/关闭密码保护，设置密码
- [ ] 显示访问统计摘要

**Verification：**
- [ ] `pnpm type-check && pnpm lint && pnpm build` 通过
- [ ] 手动：修改自定义路径 → 访问新路径 → 设置密码 → 验证保护生效

**Dependencies：** 增量 1、2、4

---

## 汇总

| 增量 | 文件数 | 功能 |
|------|--------|------|
| 1 | 1 | 自定义路径解析 |
| 2 | 3 | 密码保护 |
| 3 | 2 | 嵌入代码 |
| 4 | 3 | 访问统计 |
| 5 | 3 | 主页管理页 |
| **合计** | **12** | 完整分享与传播功能 |
