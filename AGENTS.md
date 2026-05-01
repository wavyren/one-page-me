# One Page Me — Agent 项目指南

> 最后更新：2026-05-01
> 项目状态：PRD 与原型阶段，尚未开始代码实现

---

## 项目概述

**One Page Me**（内部代号：小页）是一款帮助普通人通过 AI 对话生成个人介绍主页的产品。

核心定位：
- **整理工具**：帮用户梳理经历、职场、学习、人生
- **宣传工具**：生成可对外分享的精美个人主页

核心差异点：不是表单填写，是自然对话；不是固定模板，是场景自适应；不是生成后就结束，是持续对话式打磨。

产品从第一天起支持**中文 / English 双语**。

---

## 当前项目状态

本项目目前处于**产品规划与原型阶段**，尚未初始化任何框架代码。

现有文件：

| 文件 | 说明 |
|------|------|
| `prds/one-page-me-plan-v2.md` | 完整产品方案 v2.0（1213 行），涵盖产品定位、技术栈、UI/UX 设计、开发计划、AI Prompt 设计、支付方案、测试方案、商业化策略、数据库 Schema、环境变量清单 |
| `prds/one_page_me_ui_interaction_demo.html` | 双栏交互 UI 演示原型（319 行 HTML + CSS + JS），展示左侧 AI 对话、右侧实时预览的完整交互流程 |

**尚无**：`package.json`、`next.config.js`、源码目录、测试目录、CI/CD 配置等任何工程文件。

---

## 计划中的技术栈

> 以下信息全部来自 `prds/one-page-me-plan-v2.md`，尚未落地。

| 层级 | 选型 | 版本 | 用途 |
|------|------|------|------|
| 前端框架 | Next.js（App Router） | 15.x | SSR + SSG；API Routes 作 BFF；Vercel 部署 |
| UI 组件 | shadcn/ui + Tailwind CSS v4 | latest | 组件库 + 样式系统 |
| 动画 | Framer Motion | 11.x | 对话消息入场、预览填充动画 |
| 状态管理 | Zustand | 5.x | 对话状态 + 预览状态同步 |
| 后端 | Next.js API Routes | — | BFF 层，无独立后端服务 |
| 数据库 | Supabase（PostgreSQL） | — | 数据持久化、Auth、RLS、实时订阅 |
| AI 对话 | DeepSeek V4 Pro API | — | 中英双语对话引导、主页 HTML 生成、字段结构化提取 |
| PDF 导出 | Puppeteer + @sparticuz/chromium | — | 精确还原主页样式 |
| 图片导出 | Puppeteer 截图 → sharp 裁剪 | — | 生成 1:1 正方形海报图 |
| 对象存储 | Supabase Storage | — | 存储生成的 HTML / PDF / 图片 |
| 国际化 | next-intl | 3.x | 中英翻译文件管理 |
| 邮件 | Resend | — | 邮件通知（免费 3000 封/月） |
| 短信验证码 | 阿里云短信（国内）/ Twilio（海外） | — | +86 走阿里云，其他走 Twilio |
| 监控 | Sentry + Vercel Analytics | — | 错误监控 + 页面性能 |
| 部署 | Vercel（主应用）+ Railway（PDF 微服务） | — | 主应用零配置部署，PDF 服务独立部署 |
| 支付 | 虎皮椒（国内）/ Stripe（海外） | — | 双支付渠道 |
| CI/CD | GitHub Actions | — | push 自动跑测试 + 部署 |

---

## 计划中的开发阶段

开发方式：AI Coding（Cursor 为主），按模块完成度推进，每模块完成后人工审核 + 测试用例验证。

| 阶段 | 内容 | 关键交付物 |
|------|------|-----------|
| Phase 0 | 项目初始化：创建 Next.js 项目、配置 Supabase、配置 i18n、CI/CD、部署到 Vercel | 项目框架可访问，CI Pipeline 绿色 |
| Phase 1 | 用户系统：手机号 OTP、Google / Apple 登录、Profile 页、Session 管理 | 三种登录方式正常注册/登录 |
| Phase 2 | 核心对话引擎：`/api/chat` SSE 流、消息持久化、字段提取、对话 UI、收集进度条、降级快捷选项 | 完整对话流程可运行，字段提取准确率 ≥ 90% |
| Phase 3 | 实时预览引擎：Zustand 状态机、骨架 Shimmer、渐进填充动画、双栏/移动端布局、区块点击编辑 | 预览实时填充，移动端可用，动画流畅 |
| Phase 4 | 主页生成引擎：`/api/generate-page`、HTML 模板方案、`/p/[pageId]` SSR、OG 图生成、对话式修改、多版本管理 | 从对话到生成主页完整走通 |
| Phase 5 | 导出功能：PDF 微服务、图片导出、Markdown 导出、QR Code 生成 | 三种格式导出均可用 |
| Phase 6 | 分享与传播：自定义路径、密码保护、嵌入代码、访问统计 | 分享功能完整 |
| Phase 7 | 支付与权限：虎皮椒支付、Stripe 订阅、权限门控中间件、订阅管理页 | 国内/海外支付可走通 |
| Phase 8 | 体验打磨 & 上线准备：错误处理、加载状态、SEO、a11y、性能优化、落地页 | Lighthouse ≥ 90 |

---

## 计划中的代码组织

> 以下目录结构来自 PRD 中 Phase 0 的开发计划及后续各 Phase 的 API 路由设计，为预期结构。

```
project_root/
├── app/                          # Next.js App Router
│   ├── (chat)/                   # 对话主界面（双栏布局）
│   │   └── chat/
│   │       └── page.tsx
│   ├── (marketing)/              # 落地页等营销页面
│   │   └── page.tsx
│   ├── api/                      # API Routes（BFF）
│   │   ├── chat/                 # SSE 流式对话
│   │   │   └── route.ts
│   │   ├── generate-page/        # 主页生成
│   │   │   └── route.ts
│   │   ├── payment/              # 支付相关
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   └── notify/
│   │   │       └── route.ts
│   │   ├── stripe/               # Stripe 支付
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   └── pages/                # 主页版本管理
│   │       └── create/
│   │           └── route.ts
│   ├── p/
│   │   └── [pageId]/             # 公开主页 SSR 渲染
│   │       └── page.tsx
│   ├── login/                    # 登录页
│   │   └── page.tsx
│   ├── pay/
│   │   └── success/
│   │       └── page.tsx
│   ├── pricing/                  # 定价页
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── middleware.ts             # Session 保护路由
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   ├── chat/                     # 对话相关组件
│   ├── preview/                  # 实时预览相关组件
│   └── marketing/                # 落地页组件
├── lib/                          # 工具函数与客户端库
│   ├── supabase/
│   │   └── client.ts
│   └── utils.ts
├── stores/                       # Zustand stores
│   └── preview-store.ts
├── messages/                     # next-intl 翻译文件
│   ├── zh.json
│   └── en.json
├── tests/                        # 测试目录
│   ├── e2e/                      # Playwright E2E 测试
│   │   └── full-journey.spec.ts
│   ├── integration/              # API 集成测试
│   │   └── payment.spec.ts
│   └── unit/                     # Vitest 单元测试
├── prisma/ 或 supabase/migrations/  # 数据库 Schema / 迁移
├── public/                       # 静态资源
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── playwright.config.ts
└── .github/
    └── workflows/
        └── ci.yml                # GitHub Actions CI/CD
```

---

## 计划中的数据库 Schema

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

完整 Schema 及 RLS 策略定义见 `prds/one-page-me-plan-v2.md` 附录 A。

---

## 计划中的测试策略

| 测试类型 | 工具 | 覆盖范围 |
|---------|------|---------|
| 单元测试 | Vitest | 工具函数（签名生成、字段提取、Prompt 构建） |
| API 集成测试 | Vitest + MSW | 所有 API Routes |
| E2E 测试 | Playwright | 核心用户旅程：注册 → 对话 → 生成 → 付费 → 导出 |
| AI 质量测试 | 自定义脚本 | 字段提取准确率、主页 HTML 合法性 |
| 性能测试 | Lighthouse CI | 首屏加载、主页生成时间 |

测试覆盖率目标：
- 对话 API：`≥ 80%`
- 字段提取：`≥ 90%` 准确率（20 条多场景测试对话）
- 主页生成：HTML 合法率 `≥ 95%`（5 种场景 × 2 种语言 × 3 种语气 = 30 组）
- 支付回调：`100%` 分支覆盖
- 权限门控：`≥ 95%`

---

## AI 设计规范

### 模型选型

| 用途 | 模型 | 配置 |
|------|------|------|
| 对话引导 | DeepSeek V4 Pro | 长上下文（256k），自然对话风格 |
| 主页 HTML 生成 | DeepSeek V4 Pro | 输出完整合法 HTML |
| 字段结构化提取 | DeepSeek V4 Pro | `temperature=0`，JSON 输出 |

### 对话流程（5 个阶段）

1. **破冰 & 场景定位**（1-2 轮）：确认 `use_case`
2. **基本信息**（2-3 轮）：姓名、当前身份
3. **深度挖掘**（3-6 轮）：根据场景动态调整问题方向
4. **AI 主动追问亮点**：穿插在阶段 3 中
5. **信息汇总确认**（1 轮）：确认后触发 `[READY_TO_GENERATE]`

总轮数建议 8-15 轮，超过 15 轮后 AI 主动收尾。

### 提取字段

`name`, `tagline`, `bio`, `skills`, `highlights`, `contact`, `use_case`, `tone`, `language`

完整 System Prompt（中文版 + 英文版）及主页 HTML 生成 Prompt 见 `prds/one-page-me-plan-v2.md` 第 5 章。

---

## 支付方案

### 双渠道策略

| 渠道 | 面向用户 | 方案 | 定价 |
|------|---------|------|------|
| 国内 | +86 手机号用户 | 虎皮椒支付（微信 + 支付宝） | Pro 月付 ¥29.9 / 年付 ¥199 |
| 海外 | 非中国大陆用户 | Stripe（信用卡 + Apple Pay + Google Pay） | Pro 月付 $9.9 / 年付 $79 |

### 套餐功能

| 功能 | 免费版 | Pro | Business |
|------|--------|-----|----------|
| 对话生成 + 公开链接 | ✓ | ✓ | ✓ |
| 主页版本数 | 2 个 | 无限 | 无限 |
| PDF / 图片 / Markdown 导出 | — | ✓ | ✓ |
| 访问统计 | — | ✓ | ✓ |
| 自定义路径 | — | ✓ | ✓ |
| 密码保护 | — | ✓ | ✓ |
| 去水印 | — | ✓ | ✓ |
| A/B 版本测试 | — | — | ✓ |
| 批量生成（CSV 导入） | — | — | ✓ |

---

## 计划中的环境变量

关键环境变量（完整清单见 `prds/one-page-me-plan-v2.md` 附录 B）：

```bash
# DeepSeek API
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 支付（国内）
XUNHUPAY_APPID=
XUNHUPAY_APPSECRET=
XUNHUPAY_APPID_SANDBOX=       # 测试环境
XUNHUPAY_APPSECRET_SANDBOX=   # 测试环境

# 支付（海外）
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# 应用配置
NEXT_PUBLIC_APP_URL=https://onepageme.cn

# PDF 微服务
PDF_SERVICE_URL=https://pdf-service.railway.app
PDF_SERVICE_SECRET=

# 监控
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 开发约定

> 以下约定来自 PRD 中的设计决策，在代码实现阶段应遵循。

### UI/UX 约定

- **品牌主色**：`#C9854A`（橙棕色）
- **预览背景色**：`#F4EFE8`（暖米色）
- **桌面端布局**：左侧 44% 对话区 + 右侧 56% 预览区，双栏并排
- **移动端布局**：单栏 + 底部 Tab 切换（对话 / 预览），预览更新时眼睛图标闪烁橙点提示
- **动画规范**：
  - 区块填充：`fadeUp`（0.35s，`translateY(8px)` → `0`，`opacity 0→1`）
  - 骨架 shimmer：1.5s 循环，灰色线条左右光泽扫过
  - 生成按钮出现：`scaleIn`（`scale(0.9)` → `scale(1)`，配合橙色光晕）

### 代码约定

- **AI Coding 工作流**：
  1. v0.dev 生成 UI 组件初稿（特别是复杂的双栏对话界面）
  2. Cursor 负责日常功能开发和 Bug 修复（用 `@codebase` 全局上下文）
  3. Claude API 负责设计 DeepSeek Prompt、评估生成质量、复杂业务逻辑
  4. GitHub Actions 自动跑测试，不通过不合并

- **语言**：项目界面与文档双语（中文/英文），AI Prompt 分中英双套
- **类型安全**：使用 TypeScript，严格模式
- **API 设计**：Next.js App Router API Routes，流式响应用 SSE

---

## 安全考虑

- **RLS**：所有用户数据表启用 Supabase Row Level Security，用户只能访问自己的数据
- **支付回调**：
  - 虎皮椒：验证 MD5 签名防伪造，幂等处理（同一订单可能多次回调），返回 `"success"`
  - Stripe：验证 Webhook 签名
- **隐私**：访问日志中 IP 做哈希处理，不存明文
- **主页权限**：公开主页所有人可读；私有主页 + 密码保护仅授权用户可访问

---

## 参考文件

| 文件 | 内容 |
|------|------|
| `prds/one-page-me-plan-v2.md` | 完整产品方案 v2.0：定位、技术栈、UI/UX、开发计划、AI Prompt、支付、测试、商业化、数据库 Schema、环境变量 |
| `prds/one_page_me_ui_interaction_demo.html` | 双栏交互演示原型：展示 AI 对话 → 字段收集 → 预览渐进填充 → 生成按钮 的完整交互流程 |

---

*One Page Me · Agent 项目指南 · 2026-05-01*
