# Spec: Phase 0 — 项目初始化

> **遵循 Skill**: `spec-driven-development`  
> **阶段目标**：创建 Next.js 项目、配置 Supabase、配置 i18n、CI/CD、部署到 Vercel  
> **关联 PRD**：`prds/one-page-me-plan-v2.md` 第 264-274 行、附录 A/B

---

## ASSUMPTIONS I'M MAKING

以下是我基于现有信息做出的假设。**请在继续前确认或纠正**：

1. **包管理器**：使用 `pnpm`（速度快、磁盘占用小、支持 workspace，适合后续 PDF 微服务拆分）
2. **Node.js 版本**：`v20 LTS`（Next.js 15 最低要求 18.18，推荐 20）
3. **项目根目录**：当前工作目录 `/Users/grace/Work/project_one_page_me` 即为项目根目录，无需新建子文件夹
4. **Git 仓库**：尚未初始化，需要 `git init` 并推送到 GitHub
5. **shadcn/ui 初始化**：使用最新版 `npx shadcn@latest init`（PRD 中的 `create-next-app` 命令已过时，Next.js 15 + shadcn/ui 最新推荐方式是先 create-next-app，再 init shadcn）
6. **Turbopack**：启用 Next.js 15 默认的 Turbopack（`next dev --turbopack`）
7. **Supabase 项目**：用户尚未创建 Supabase 项目，需要引导创建或提供已有项目凭证
8. **Vercel 部署**：用户已有 Vercel 账号，需要连接 GitHub 仓库
9. **CI/CD 范围**：Phase 0 仅配置基础 lint + type-check，**不配置测试**（测试框架在 Phase 2 后引入）
10. **CSS 方案**：Tailwind CSS v4（Next.js 15 默认集成，无需单独安装 PostCSS）

→ **以上假设如有错误，请立即纠正。纠正后我将更新本 Spec。**

---

## Objective

### What we're building
为 One Page Me（小页）搭建完整的前端项目框架，使其达到可本地开发、可 CI 构建、可生产部署的状态。

### Why
Phase 0 是所有后续开发的基础。项目框架的质量直接影响后续 8 个阶段的开发效率和稳定性。

### Success Criteria（验收标准）
- [ ] `pnpm dev` 能启动开发服务器，访问 `http://localhost:3000` 看到首页
- [ ] `pnpm build` 能成功构建，无 TypeScript 错误、无 lint 错误
- [ ] 品牌主色 `#C9854A` 和预览背景 `#F4EFE8` 已配置到 Tailwind 主题
- [ ] Supabase Client 已配置，能连接数据库（本地开发用 anon key）
- [ ] 数据库初始 Schema（6 张表 + RLS 策略）已通过 Supabase Migration 创建
- [ ] next-intl 已配置，支持 `/zh` 和 `/en` 路由切换
- [ ] GitHub Actions CI Pipeline 配置完成：push 时自动跑 lint + type-check
- [ ] Vercel 生产环境部署成功，访问生产 URL 能看到首页
- [ ] `.env.example` 文件完整，包含所有 Phase 0 需要的变量（不含敏感值）

---

## Tech Stack

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 15.x (App Router) | SSR + SSG + API Routes |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | v4 | 原子化 CSS |
| UI 组件 | shadcn/ui | latest | 组件库 |
| 动画 | Framer Motion | 11.x | 过渡动画 |
| 状态管理 | Zustand | 5.x | 客户端状态 |
| 数据库 | Supabase (PostgreSQL) | — | 数据持久化 + Auth + RLS |
| 国际化 | next-intl | 3.x | 中英双语路由 |
| 包管理 | pnpm | 9.x | 依赖管理 |

---

## Commands

```bash
# 开发
pnpm dev              # 启动 Turbopack 开发服务器 (next dev --turbopack)

# 构建
pnpm build            # 生产构建 (next build)

# 代码检查
pnpm lint             # ESLint 检查
pnpm type-check       # TypeScript 类型检查 (tsc --noEmit)

# shadcn/ui
pnpm dlx shadcn@latest add [component]   # 添加组件

# Supabase
pnpm supabase login                    # 登录 Supabase CLI
pnpm supabase link --project-ref xxx   # 链接项目
pnpm supabase db push                  # 推送 Schema 到远程
pnpm supabase db reset                 # 重置本地数据库

# CI（GitHub Actions 自动执行）
pnpm lint && pnpm type-check && pnpm build   # 完整检查流水线
```

---

## Project Structure

```
project_root/                    # /Users/grace/Work/project_one_page_me
├── app/                         # Next.js App Router
│   ├── (chat)/                  # 对话主界面（双栏布局）
│   │   └── chat/
│   │       └── page.tsx
│   ├── (marketing)/             # 落地页等营销页面
│   │   └── page.tsx
│   ├── api/                     # API Routes（BFF）
│   ├── p/
│   │   └── [pageId]/            # 公开主页 SSR 渲染
│   ├── login/
│   ├── layout.tsx
│   ├── globals.css
│   └── middleware.ts            # i18n 路由 + Session 保护
├── components/                  # React 组件
│   ├── ui/                      # shadcn/ui 组件
│   ├── chat/                    # 对话相关组件
│   └── preview/                 # 实时预览相关组件
├── lib/                         # 工具函数与客户端库
│   ├── supabase/
│   │   ├── client.ts            # 浏览器端 Supabase Client
│   │   └── server.ts            # 服务端 Supabase Client
│   └── utils.ts
├── stores/                      # Zustand stores
│   └── preview-store.ts
├── messages/                    # next-intl 翻译文件
│   ├── zh.json
│   └── en.json
├── supabase/                    # Supabase 配置
│   └── migrations/              # 数据库迁移文件
│       └── 00000000000000_init.sql
├── public/                      # 静态资源
├── docs/                        # 项目文档
│   ├── specs/                   # 技术 Spec
│   ├── agent-skills-playbook.md # Agent Skills 执行手册
│   ├── project-management.md    # 项目管理文档
│   └── execution-log.md         # 执行日志
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI
├── next.config.js
├── tailwind.config.ts           # Tailwind 主题扩展（品牌色）
├── tsconfig.json
├── package.json
├── .env.example                 # 环境变量模板（不含敏感值）
├── .env.local                   # 本地环境变量（gitignore）
├── .gitignore
└── components.json              # shadcn/ui 配置
```

---

## Code Style

### 命名规范
- 组件：`PascalCase`（如 `ChatMessage.tsx`）
- 函数/变量：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 文件：组件同名，工具函数用 `kebab-case.ts`
- 类型/接口：`PascalCase`，后缀 `Props` / `Config` / `Data`

### 组件示例
```tsx
// Good: 分离数据获取与展示，明确 Props 类型
'use client';

import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%] rounded-2xl px-4 py-3">
        <p className="text-sm leading-relaxed">{content}</p>
        {timestamp && (
          <time className="mt-1 block text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString()}
          </time>
        )}
      </div>
    </div>
  );
}
```

### 关键约定
- 使用 `'use client'` 显式标记客户端组件，其余默认服务端组件
- shadcn/ui 组件放在 `components/ui/`，业务组件放在 `components/chat/`、`components/preview/`
- Supabase Client 区分 `client.ts`（浏览器，用 anon key）和 `server.ts`（服务端，用 service role key）
- 环境变量严格区分 `NEXT_PUBLIC_`（暴露给浏览器）和非公开变量

---

## Testing Strategy

> **Phase 0 测试范围**：Phase 0 不引入单元测试框架，仅配置 lint + type-check 作为质量门禁。  
> **测试框架引入时机**：Phase 2 引入 Vitest，Phase 3 引入 Playwright E2E。

| 层级 | 工具 | Phase 0 状态 | 后续引入 |
|------|------|-------------|---------|
| Lint | ESLint (Next.js 内置) | ✅ 配置 | — |
| Type Check | TypeScript (`tsc --noEmit`) | ✅ 配置 | — |
| Unit Test | Vitest | ⬜ 跳过 | Phase 2 |
| E2E Test | Playwright | ⬜ 跳过 | Phase 3 |

**Phase 0 质量门禁**：
```bash
pnpm lint         # 零 ESLint 错误
pnpm type-check   # 零 TypeScript 错误
pnpm build        # 构建成功
```

---

## Boundaries（三层边界系统）

### Always Do（无例外）
- 每次代码变更后运行 `pnpm lint && pnpm type-check`
- 使用 `pnpm` 安装依赖，不使用 npm/yarn 混用
- 环境变量敏感值绝不提交到 Git（检查 `.gitignore` 包含 `.env.local`）
- 提交前检查 `git diff --cached` 中没有密钥、密码、token
- 遵循本 Spec 中的项目结构和命名规范

### Ask First（需人类确认）
- 修改数据库 Schema（新增表、修改字段）
- 添加新的 npm 依赖（尤其是体积大的包）
- 修改 CI/CD 配置
- 修改 next-intl 路由配置（影响所有页面 URL）
- 删除已有的迁移文件或重置数据库

### Never Do（禁止）
- 将 `.env.local`、密钥、API Key 提交到 Git
- 在客户端代码中使用 `SUPABASE_SERVICE_ROLE_KEY`
- 绕过 TypeScript 类型检查（不使用 `@ts-ignore` 除非有明确理由并注释）
- 修改 `node_modules` 或供应商目录
- 删除失败的测试而不说明原因（Phase 0 没有测试，但后续阶段适用）

---

## Open Questions（待确认决策）

以下决策项会阻塞后续执行，**请在继续前逐一确认**：

| # | 决策项 | 我的建议 | 你的选择？ |
|---|--------|---------|-----------|
| D1 | 包管理器 | **pnpm** | ？ |
| D2 | Node.js 版本 | **v20 LTS** | ？ |
| D3 | 是否启用 Turbopack | **启用**（Next.js 15 默认） | ？ |
| D4 | shadcn/ui 组件安装方式 | **按需安装**（不一次性装全部） | ？ |
| D5 | Supabase 项目 | 是否需要我引导你创建？还是已有项目？ | ？ |
| D6 | Vercel 账号 | 是否已有？需要我引导部署步骤？ | ？ |
| D7 | GitHub 仓库 | 是否已有？需要我引导创建？ | ？ |
| D8 | 数据库迁移工具 | **Supabase CLI**（推荐）vs Prisma？ | ？ |

→ **请回复上述决策，我将更新 Spec 并进入 Task 拆解阶段。**

---

*Spec 版本：v1.0-draft  
最后更新：2026-05-01  
遵循 Skill：`spec-driven-development`*
