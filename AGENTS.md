# One Page Me — Agent 项目指南

> 最后更新：2026-05-02
> 项目状态：Phase 0~5 已完成，Phase 6（分享与传播）待开始

---

## 项目概述

**One Page Me**（内部代号：小页）是一款帮助普通人通过 AI 对话生成个人介绍主页的产品。

核心定位：
- **整理工具**：帮用户梳理经历、职场、学习、人生
- **宣传工具**：生成可对外分享的精美个人主页

核心差异点：不是表单填写，是自然对话；不是固定模板，是场景自适应；不是生成后就结束，是持续对话式打磨。

产品从第一天起支持**中文 / English 双语**。

---

## 技术栈

| 层级 | 选型 | 版本 | 用途 |
|------|------|------|------|
| 前端框架 | Next.js（App Router） | 15.1.x | SSR + SSG；API Routes 作 BFF |
| UI 框架 | React | 19.0.x | UI 渲染 |
| 语言 | TypeScript | 5.7.x | 严格模式（`strict: true`） |
| 样式 | Tailwind CSS | 4.0.x | 原子化 CSS |
| UI 组件 | shadcn/ui | latest | new-york 风格，stone baseColor |
| 动画 | Framer Motion | 11.15.x | 对话消息入场、预览填充动画 |
| 状态管理 | Zustand | 5.0.x | 对话状态、生成状态、用户状态 |
| 数据库 | Supabase（PostgreSQL） | — | 数据持久化、Auth、RLS、Storage |
| AI 对话 | DeepSeek V4 Pro API | — | 中英双语对话引导、主页 HTML 生成 |
| AI SDK | openai | 6.35.x | 兼容 DeepSeek API（OpenAI 格式） |
| 国际化 | next-intl | 3.26.x | 中英翻译文件管理 |
| 校验 | Zod | 4.4.x | 表单与 API 输入校验 |
| 图标 | lucide-react | 0.460.x | 图标库 |
| 部署 | Vercel | — | 零配置部署 |
| CI/CD | GitHub Actions | — | push/PR 自动跑 type-check + lint + build |
| 包管理器 | pnpm | 10.33.2 | 锁定版本 |

---

## 项目结构

```
project_root/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── chat/route.ts         # SSE 流式对话 API
│   │   └── generate-page/route.ts # 主页生成 API
│   ├── auth/callback/page.tsx    # OAuth 登录回调
│   ├── chat/page.tsx             # 对话主界面（双栏布局）
│   ├── login/page.tsx            # 登录页
│   ├── p/[pageId]/               # 公开主页 SSR 渲染
│   │   ├── page.tsx              # 主页展示（dangerouslySetInnerHTML）
│   │   └── opengraph-image.tsx   # 动态 OG 图生成（edge runtime）
│   ├── profile/page.tsx          # 用户资料页
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 落地页（占位）
│   └── globals.css               # Tailwind v4 主题变量 + 自定义动画
├── components/                   # React 组件（按功能域组织）
│   ├── auth/                     # 登录相关（手机号表单、OAuth 按钮）
│   ├── chat/                     # 对话相关（布局、消息列表、输入框、进度条）
│   ├── generate/                 # 生成相关（生成按钮、进度弹窗）
│   ├── preview/                  # 实时预览相关（预览卡片、预览面板）
│   ├── profile/                  # 资料页相关（表单、头像上传）
│   └── ui/                       # shadcn/ui 基础组件（button、card、input 等）
├── lib/                          # 工具函数与客户端库
│   ├── actions/                  # Next.js Server Actions
│   │   ├── auth.ts               # 登录/登出/OTP/用户同步
│   │   ├── conversation.ts       # 对话 CRUD
│   │   ├── page.ts               # 主页生成与查询
│   │   └── profile.ts            # 资料更新
│   ├── ai/                       # AI 集成
│   │   ├── deepseek.ts           # DeepSeek API 客户端（流式聊天、字段提取）
│   │   ├── page-generator.ts     # HTML 生成逻辑
│   │   └── prompts.ts            # System Prompt（中/英）、提取 Prompt、HTML 生成 Prompt
│   ├── supabase/                 # Supabase 客户端
│   │   ├── client.ts             # 浏览器端客户端（createBrowserClient）
│   │   ├── server.ts             # 服务端客户端（createServerClient + cookies）
│   │   └── admin.ts              # Admin 客户端（service_role，用于 Storage 等）
│   ├── validations/              # Zod 校验 schema
│   │   ├── auth.ts               # 手机号、OTP 校验
│   │   └── chat.ts               # 聊天输入校验
│   └── utils.ts                  # 通用工具函数（cn 等）
├── stores/                       # Zustand stores
│   ├── chat-store.ts             # 对话状态（消息、提取数据、loading）
│   ├── generate-store.ts         # 生成状态（步骤、进度、错误）
│   └── user-store.ts             # 用户状态
├── types/
│   └── user.ts                   # User 类型定义
├── messages/                     # next-intl 翻译文件
│   ├── zh.json
│   └── en.json
├── supabase/migrations/          # 数据库迁移文件
│   ├── 00000000000000_initial_schema.sql
│   └── 20260501000001_add_avatar_url.sql
├── docs/                         # 项目文档
│   ├── setup-guide.md            # 第三方服务配置引导
│   ├── specs/                    # 技术规格文档
│   └── ...
├── prds/                         # 产品需求文档
│   └── one-page-me-plan-v2.md    # 完整产品方案 v2.0
├── .github/workflows/
│   └── ci.yml                    # GitHub Actions CI
├── .kimi/skills/                 # 项目专属 Skills（共 20 个）
├── middleware.ts                 # 路由保护（/chat、/profile 需登录；/login 已登录则重定向）
├── i18n.ts                       # 国际化配置（locales、defaultLocale）
├── i18n/routing.ts               # next-intl 路由配置
├── next.config.ts                # Next.js 配置（目前为默认空配置）
├── eslint.config.mjs             # ESLint Flat Config（next/core-web-vitals + next/typescript）
├── tsconfig.json                 # TypeScript 严格模式配置
├── components.json               # shadcn/ui 配置
├── vercel.json                   # Vercel 部署配置（框架预设、环境变量）
├── .env.example                  # 环境变量模板
└── package.json
```

---

## 构建与运行命令

```bash
# 安装依赖
pnpm install

# 开发模式（使用 Turbopack）
pnpm dev
# 默认启动在 http://localhost:3000

# 类型检查
pnpm type-check        # tsc --noEmit

# 代码检查
pnpm lint              # eslint . --ext .ts,.tsx,.js,.jsx

# 生产构建
pnpm build             # next build

# 启动生产服务
pnpm start             # next start
```

**CI Pipeline**（`.github/workflows/ci.yml`）：
- 触发条件：`push` 到 `main` 分支、`pull_request` 到 `main` 分支
- 执行步骤：Checkout → Setup Node.js 20 → Setup pnpm 10 → `pnpm install --frozen-lockfile` → `pnpm type-check` → `pnpm lint` → `pnpm build`

---

## 数据库 Schema

数据库：Supabase PostgreSQL，已启用 RLS（Row Level Security）。

核心表：

| 表名 | 用途 |
|------|------|
| `users` | 用户信息、套餐等级（free / pro / business） |
| `conversations` | 对话会话、结构化提取结果（`extracted_data` JSONB） |
| `messages` | 对话消息（user / assistant） |
| `pages` | 生成的个人主页（HTML/PDF/图片 URL、自定义路径、密码保护） |
| `page_views` | 主页访问日志（IP 哈希、UA、Referer、国家） |
| `orders` | 支付订单（虎皮椒 / Stripe） |

完整 Schema 及 RLS 策略定义见 `supabase/migrations/00000000000000_initial_schema.sql`。

**已配置的 RLS 策略**：
- `conversations`：用户只能访问自己的对话
- `messages`：用户只能访问自己对话下的消息
- `pages`：公开主页所有人可读；私有主页仅所有者可读；修改仅所有者
- `orders`：用户只能查看自己的订单

---

## 环境变量

复制 `.env.example` 为 `.env.local` 进行本地配置：

```bash
# DeepSeek API
DEEPSEEK_API_KEY=                    # 必填，没有则对话走 Mock 模式
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# Supabase（必填）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # 服务端操作 Storage/Admin API 用

# 短信（可选，开发环境可用 Mock）
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
ALIYUN_SMS_SIGN_NAME=
ALIYUN_SMS_TEMPLATE_CODE=

# 邮件（可选）
RESEND_API_KEY=

# 支付（可选）
XUNHUPAY_APPID=
XUNHUPAY_APPSECRET=
XUNHUPAY_APPID_SANDBOX=
XUNHUPAY_APPSECRET_SANDBOX=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Mock OTP（开发模式，无需真实短信服务商）
MOCK_OTP_ENABLED=true
MOCK_OTP_CODE=123456

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PDF 微服务（可选）
PDF_SERVICE_URL=
PDF_SERVICE_SECRET=

# 监控（可选）
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

**Mock 模式**：当 `DEEPSEEK_API_KEY` 未设置时，`/api/chat` 会走预设的 5 步 Mock 对话流程，方便前端开发调试。当 `MOCK_OTP_ENABLED=true` 时，手机号登录使用固定验证码（默认 `123456`），无需配置真实短信服务商。

---

## 代码组织约定

### 路径别名

`tsconfig.json` 中配置 `"@/*": ["./*"]`，所有 import 使用 `@/` 前缀：
- `@/components/*`
- `@/lib/*`
- `@/stores/*`
- `@/types/*`

### Supabase 客户端使用规范

项目中有三种客户端，必须按场景使用：

| 场景 | 导入路径 | 说明 |
|------|---------|------|
| 浏览器组件 | `@/lib/supabase/client` | `createBrowserClient`，用于客户端交互 |
| Server Action / API Route | `@/lib/supabase/server` | `createServerClient`，自动处理 cookies |
| Admin 操作（Storage、用户管理） | `@/lib/supabase/admin` | `createAdminClient`，使用 `SUPABASE_SERVICE_ROLE_KEY` |

### 错误格式

- **API Routes**（`app/api/*/route.ts`）：统一返回 `{ code, message, details? }`，HTTP status 反映错误类型
- **Server Actions**（`lib/actions/*.ts`）：统一返回 `{ success: boolean, data?: T, error?: { code, message } }`

### 校验

所有外部输入必须使用 Zod 校验：
- API 请求体：`lib/validations/chat.ts` 等
- Server Action 参数：在 action 内部使用 Zod 校验

### 组件规范

- 使用函数组件 + TypeScript
- shadcn/ui 组件位于 `components/ui/`，业务组件按功能域分目录
- UI 字符串目前以中文为主，国际化通过 `messages/zh.json` 和 `messages/en.json` 管理

---

## 核心功能模块

### 1. 用户认证（`app/login/`、`lib/actions/auth.ts`）

支持三种登录方式：
- **手机号 + OTP**：Supabase Auth 内置 OTP，开发环境支持 Mock 模式
- **OAuth（Google/Apple 等）**：通过 Supabase OAuth  providers
- **用户同步**：登录后自动同步 `auth.users` 到自定义 `users` 表（`syncAuthUser`）

受保护路由（`middleware.ts`）：
- `/chat`、`/profile` → 未登录重定向到 `/login`
- `/login` → 已登录重定向到 `/chat`

### 2. AI 对话引擎（`app/api/chat/route.ts`、`lib/ai/`）

- **流式响应**：SSE（Server-Sent Events）格式，事件类型：`delta`（内容片段）、`extracted`（提取字段）、`done`
- **Mock 回退**：无 `DEEPSEEK_API_KEY` 时走 5 步预设对话
- **字段提取**：每轮对话后调用 `extractFields`，提取 `name`、`tagline`、`bio`、`skills`、`highlights`、`contact`、`use_case`、`tone`、`language`、`is_ready`
- **语言检测**：根据对话内容自动切换 System Prompt（中/英）
- **Prompt 文件**：`lib/ai/prompts.ts` 集中管理所有 AI Prompt

### 3. 实时预览（`components/preview/`、`stores/chat-store.ts`）

- 桌面端：左侧 44% 对话区 + 右侧 56% 预览区
- 移动端：底部 Tab 切换（对话 / 预览）
- 预览内容根据 `extractedData` 实时更新

### 4. 主页生成（`app/api/generate-page/route.ts`、`lib/ai/page-generator.ts`）

流程：
1. 校验对话是否属于当前用户且 `is_ready=true`
2. 调用 DeepSeek API 生成完整 HTML（内联 CSS，无外部依赖）
3. 上传 HTML 到 Supabase Storage（`pages` bucket）
4. 创建 `pages` 数据库记录
5. 标记对话为完成

### 5. 公开主页（`app/p/[pageId]/`）

- SSR 渲染，从 Storage 获取 HTML 直接注入
- 支持动态 OG 图生成（`opengraph-image.tsx`，edge runtime）
- 非公开主页返回 404

---

## UI/UX 设计规范

### 品牌色值

```css
--color-brand: #C9854A;          /* 品牌主色（橙棕色） */
--color-brand-light: #D9A06E;
--color-brand-dark: #A66B3A;
--color-preview-bg: #F4EFE8;     /* 预览背景（暖米色） */
--color-preview-border: #DDD5C8;
--color-preview-skeleton: #EDE5DA;
```

### 动画

- `fadeUp`：区块填充动画（0.35s，`translateY(7px)` → `0`，`opacity 0→1`）
- 骨架 shimmer：1.5s 循环（由设计系统预留）

### 布局响应式断点

- 移动端优先，md（768px）切换为双栏布局
- 移动端底部 Tab 导航，桌面端并排双栏

---

## 开发工作流

本项目在 `.kimi/skills/` 下安装了 20 个 skills。任何新 Phase / Feature / 超过 30 分钟的改动，必须遵守以下流程。

### 折中版 Gated Workflow

```
SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
   │          │        │          │
   ▼          ▼        ▼          ▼
 Human      Human    Human      增量执行
 reviews    reviews  reviews    （无需逐条确认）
```

**执行规则：**
1. **Phase/Feature 开始前** → 读取 `.kimi/skills/` 下所有相关 SKILL.md，输出关键要求摘要
2. **写 Spec** → 覆盖 Objective / Tech Stack / Commands / Structure / Code Style / Testing / Boundaries / Success Criteria → 人类审核
3. **写 Plan + Tasks** → 拆解为 ≤ 5 个文件的增量，每条有 Acceptance + Verify → 人类审核
4. **增量实现** → 每个增量执行前输出 checklist，执行后验证，单独 commit
5. **Commit 前** → `pnpm type-check && pnpm lint && pnpm build` 全部通过

### 增量执行 Checklist（每次增量前必须输出）

```
【本次增量】[描述]
【涉及 Skills】[skill1, skill2]
【Checklist】
- [ ] 修改 ≤ 5 个文件
- [ ] 有 loading / error / empty 状态（UI 增量）
- [ ] 有 Zod 校验（API 增量）
- [ ] 有统一错误格式（API 增量）
- [ ] 移动端适配（UI 增量）
- [ ] Keyboard accessible（UI 增量）
- [ ] pnpm type-check 通过
- [ ] pnpm lint 通过
- [ ] pnpm build 通过
```

---

## 安全考虑

- **RLS**：所有用户数据表启用 Supabase Row Level Security
- **支付回调**：
  - 虎皮椒：验证 MD5 签名防伪造，幂等处理，返回 `"success"`
  - Stripe：验证 Webhook 签名
- **隐私**：访问日志中 IP 做哈希处理，不存明文
- **主页权限**：公开主页所有人可读；私有主页 + 密码保护仅授权用户可访问
- **中间件**：`middleware.ts` 在 Edge 运行，保护敏感路由并刷新 session

---

## 测试策略

当前项目处于早期阶段，测试基础设施尚未完全搭建。计划中的测试：

| 测试类型 | 工具 | 覆盖范围 |
|---------|------|---------|
| 单元测试 | Vitest | 工具函数、校验逻辑 |
| API 集成测试 | Vitest + MSW | API Routes |
| E2E 测试 | Playwright | 核心用户旅程 |

CI 中已配置 `type-check` 和 `lint` 作为基础质量门禁。

---

## 参考文件

| 文件 | 内容 |
|------|------|
| `prds/one-page-me-plan-v2.md` | 完整产品方案 v2.0：定位、技术栈、UI/UX、开发计划、AI Prompt、支付、测试、商业化、数据库 Schema、环境变量 |
| `prds/one_page_me_ui_interaction_demo.html` | 双栏交互演示原型 |
| `docs/setup-guide.md` | 第三方服务（GitHub/Supabase/Vercel）配置引导 |
| `supabase/migrations/00000000000000_initial_schema.sql` | 数据库初始 Schema + RLS 策略 |

---

*One Page Me · Agent 项目指南 · 2026-05-02*
