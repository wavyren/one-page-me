# One Page Me — 项目管理文档

> **维护规则**：本文档由 AI Agent 主动维护，每次任务状态变更、决策确认、问题澄清后必须立即更新。

---

## 一、项目总览

| 项目 | 信息 |
|------|------|
| 项目名称 | One Page Me（小页） |
| 当前阶段 | **Phase 0：项目初始化** |
| 总阶段数 | Phase 0 ~ Phase 8（共 9 个阶段） |
| 技术栈 | Next.js 15 + shadcn/ui + Tailwind CSS v4 + Zustand + Supabase + DeepSeek API + next-intl |
| 开始日期 | 2026-05-01 |
| 目标 | AI 对话生成个人介绍主页 |

---

## 二、阶段进度看板

| Phase | 名称 | 状态 | 关键交付物 |
|-------|------|------|-----------|
| Phase 0 | 项目初始化 | 🟡 **进行中** | 项目框架可访问，CI Pipeline 绿色 |
| Phase 1 | 用户系统 | ⬜ 未开始 | 三种登录方式正常注册/登录 |
| Phase 2 | 核心对话引擎 | ⬜ 未开始 | 完整对话流程可运行 |
| Phase 3 | 实时预览引擎 | ⬜ 未开始 | 预览实时填充，动画流畅 |
| Phase 4 | 主页生成引擎 | ⬜ 未开始 | 从对话到生成主页完整走通 |
| Phase 5 | 导出功能 | ⬜ 未开始 | 三种格式导出均可用 |
| Phase 6 | 分享与传播 | ⬜ 未开始 | 分享功能完整 |
| Phase 7 | 支付与权限 | ⬜ 未开始 | 国内/海外支付可走通 |
| Phase 8 | 体验打磨 & 上线 | ⬜ 未开始 | Lighthouse ≥ 90 |

---

## 三、当前阶段任务清单（Phase 0）

> **阶段目标**：创建 Next.js 项目、配置 Supabase、配置 i18n、CI/CD、部署到 Vercel

| # | 任务 | 状态 | 验收标准 | 验证命令 | 备注 |
|---|------|------|---------|---------|------|
| 0.1 | 编写 Phase 0 技术 Spec | ✅ 已完成，用户已确认 | Spec 文档通过用户确认 | — | `docs/specs/phase-0-spec.md` |
| 0.2 | 技术决策确认 | ✅ 已完成 | 8 项决策全部确认 | — | 见「关键决策记录」 |
| 0.2a | 引导创建 GitHub 仓库 | ✅ 已完成 | 仓库 URL 已获取 | — | `https://github.com/wavyren/one-page-me.git` |
| 0.2b | 引导创建 Supabase 项目 | ✅ 已完成 | Project URL + Keys 已获取 | — | 见「关键决策记录」 |
| 0.2c | 引导配置 Vercel 项目 | ✅ 已完成 | 生产域名已获取，部署成功 | — | `https://one-page-me.vercel.app` |
| 0.3 | 初始化 Next.js 15 + shadcn/ui | 🟡 **进行中** | `pnpm dev` 启动成功 | `curl http://localhost:3000` | 触发 `incremental-implementation` |
| 0.4 | 配置 Tailwind CSS v4 + 品牌色 | ⬜ 未开始 | 主色 #C9854A、预览背景 #F4EFE8 生效 | 视觉检查 | — |
| 0.5 | 配置 Supabase Client + Schema | ⬜ 未开始 | Supabase 连接成功，初始表创建 | `supabase db push` | — |
| 0.6 | 配置 next-intl 国际化 | ⬜ 未开始 | 中英切换正常 | 访问 `/en`、`/zh` | — |
| 0.7 | 配置 GitHub Actions CI/CD | ⬜ 未开始 | push 自动跑 lint + type-check | GitHub Actions 绿色 | — |
| 0.8 | 配置 Vercel 部署（二次确认） | ⬜ 未开始 | 代码 push 后自动部署成功 | 访问生产 URL | — |
| 0.9 | Phase 0 验证 & 收尾 | ⬜ 未开始 | 全部 checklist 通过 | 综合验证 | — |

---

## 四、关键决策记录

| # | 决策 | 确认时间 | 结论 | 影响范围 |
|---|------|---------|------|---------|
| D1 | 包管理器 | 2026-05-01 | **pnpm** | 所有依赖安装、CI 脚本 |
| D2 | Node.js 版本 | 2026-05-01 | **v20 LTS** | package.json engines |
| D3 | Turbopack | 2026-05-01 | **启用** | package.json dev script |
| D4 | shadcn/ui 组件 | 2026-05-01 | **按需安装** | 组件目录 |
| D5 | Supabase 项目 | 2026-05-01 | **已创建，Project ID: dkeukhabsnqkynvkjcde** | `.env.local`、数据库连接 |
| D6 | Vercel 账号 | 2026-05-01 | **已配置，域名: https://one-page-me.vercel.app** | 部署配置 |
| D7 | GitHub 仓库 | 2026-05-01 | **已创建: wavyren/one-page-me** | 代码托管、CI |
| D8 | 数据库迁移工具 | 2026-05-01 | **Supabase CLI** | 迁移文件格式 |

---

## 五、环境变量清单（Phase 0 需要）

> **存储位置**：`.env.local`（已加入 .gitignore，不提交）

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dkeukhabsnqkynvkjcde.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZXVraGFic25xa3ludmtqY2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MDI2NzksImV4cCI6MjA5MzE3ODY3OX0.qU0fxrSULSliueGBQ52k3kjdgxd_h1wMkGzxIKoxlTQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZXVraGFic25xa3ludmtqY2RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYwMjY3OSwiZXhwIjoyMDkzMTc4Njc5fQ.BcRiw2TAf4xUiJ05-e18-L4SLsOQux1BxPzOdJfFxKA

# 应用配置
NEXT_PUBLIC_APP_URL=https://one-page-me.vercel.app
```

---

## 六、问题与风险日志

| # | 问题/风险 | 发现时间 | 严重程度 | 状态 | 解决方案 |
|---|----------|---------|---------|------|---------|
| — | — | — | — | — | — |

---

## 七、执行日志索引

| 条目 | 时间 | 触发 Skill | 关键动作 | 状态 |
|------|------|-----------|---------|------|
| #001 | 2026-05-01 | `spec-driven-development` | Phase 0 启动，读取 PRD，创建管理文档 | 完成 |
| #002 | 2026-05-01 | `spec-driven-development` | 完成 Phase 0 Spec 初稿 | 完成 |
| #003 | 2026-05-01 | `spec-driven-development` | 用户确认全部 8 项决策，Spec v1.0-final 生效 | 完成 |
| #004 | 2026-05-01 | — | 引导用户创建 GitHub/Supabase/Vercel | 完成 |
| #005 | 2026-05-01 | `incremental-implementation` | **用户返回配置信息，开始代码初始化** | **进行中** |

**完整执行日志**：`docs/execution-log.md`

---

*最后更新：2026-05-01 · 由 Kimi Code CLI 自动维护*
