# One Page Me — 项目管理文档

> **维护规则**：本文档由 AI Agent 主动维护，每次任务状态变更、决策确认、问题澄清后必须立即更新。

---

## 一、项目总览

| 项目 | 信息 |
|------|------|
| 项目名称 | One Page Me（小页） |
| 当前阶段 | **Phase 4：主页生成引擎（基础功能已完成），Phase 5：导出功能待实现** |
| 总阶段数 | Phase 0 ~ Phase 8（共 9 个阶段） |
| 技术栈 | Next.js 15 + shadcn/ui + Tailwind CSS v4 + Zustand + Supabase + DeepSeek API + next-intl |
| 开始日期 | 2026-05-01 |
| 目标 | AI 对话生成个人介绍主页 |

---

## 二、阶段进度看板

| Phase | 名称 | 状态 | 关键交付物 |
|-------|------|------|-----------|
| Phase 0 | 项目初始化 | ✅ 已完成 | 项目框架可访问，CI Pipeline 绿色 |
| Phase 1 | 用户系统 | ✅ 已完成 | 三种登录方式正常注册/登录 |
| Phase 2 | 核心对话引擎 | ✅ 已完成 | 完整对话流程可运行，DeepSeek API 已接入 |
| Phase 3 | 实时预览引擎 | ✅ 已完成 | 预览实时填充，双栏/移动端布局，动画流畅 |
| Phase 4 | 主页生成引擎 | ✅ 基础功能已完成 | 生成 API → Storage → SSR → OG 图完整走通；多版本管理、对话式修改待后续补充 |
| Phase 5 | 导出功能 | ✅ 已完成 | QR Code / Markdown / 图片 / PDF 导出，代码已完成；PDF 微服务待部署到 Railway |
| Phase 6 | 分享与传播 | ⬜ 未开始 | 分享功能完整 |
| Phase 7 | 支付与权限 | ⬜ 未开始 | 国内/海外支付可走通 |
| Phase 8 | 体验打磨 & 上线 | ⬜ 未开始 | Lighthouse ≥ 90 |

---

## 三、Phase 1 任务清单（用户系统）

> **阶段目标**：手机号 OTP 登录、Google OAuth、Apple 登录（延后）、Profile 页、Session 管理

| # | 任务 | 状态 | 验收标准 | 验证方式 | 备注 |
|---|------|------|---------|---------|------|
| 1.1 | 编写 Phase 1 技术 Spec | ✅ 已完成 | Spec 通过用户确认 | — | `docs/specs/phase-1-spec.md` |
| 1.2 | 技术决策确认 | ✅ 已完成 | 5 项决策全部确认 | — | D9=A, D10=实现, D11=延后, D12=2MB, D13=/chat |
| 1.3 | Supabase Auth 配置 + middleware | ✅ 已完成 | Session 刷新正常，路由保护生效 | 刷新页面测试 | Dashboard Providers 已配置 |
| 1.4 | 手机号登录 UI + API | ✅ 已完成 | Mock OTP 完整流程 | E2E 测试 | — |
| 1.5 | Google OAuth 登录 | ✅ 已完成 | Google 账号可登录 | 手动测试 | Dashboard 已配置 |
| 1.6 | Profile 页 + 头像上传 | ✅ 已完成 | 可修改昵称和头像 | 手动测试 | — |
| 1.7 | 用户菜单 + 注销 | ✅ 已完成 | 退出登录功能 | 手动测试 | — |
| 1.8 | 测试 + 质量门禁 | ✅ 已完成 | type-check + lint + build 通过 | CI 自动 | — |

---

## 四、关键决策记录

| # | 决策 | 确认时间 | 结论 | 影响范围 |
|---|------|---------|------|---------|
| D1 | 包管理器 | 2026-05-01 | **pnpm** | 所有依赖安装、CI 脚本 |
| D2 | Node.js 版本 | 2026-05-01 | **v20 LTS**（实际 v24.13.1） | package.json engines |
| D3 | Turbopack | 2026-05-01 | **启用** | package.json dev script |
| D4 | shadcn/ui 组件 | 2026-05-01 | **按需安装** | 组件目录 |
| D5 | Supabase 项目 | 2026-05-01 | **已创建，Project ID: dkeukhabsnqkynvkjcde** | `.env.local`、数据库连接 |
| D6 | Vercel 账号 | 2026-05-01 | **已配置，域名: https://one-page-me.vercel.app** | 部署配置 |
| D7 | GitHub 仓库 | 2026-05-01 | **已创建: wavyren/one-page-me** | 代码托管、CI |
| D8 | 数据库迁移工具 | 2026-05-01 | **Supabase CLI** | 迁移文件格式 |
| D9 | 短信服务商 | 2026-05-01 | **方案 A：Supabase 内置短信（开发测试）** | 登录流程 |
| D10 | Google OAuth | 2026-05-01 | **Phase 1 实现** | 登录方式 |
| D11 | Apple 登录 | 2026-05-01 | **延后到后续阶段** | 登录方式 |
| D12 | 头像限制 | 2026-05-01 | **最大 2MB，jpg/png/webp** | 文件上传 |
| D13 | 登录后跳转 | 2026-05-01 | **跳转到 `/chat`** | 路由逻辑 |

---

## 五、待确认事项（阻塞中）

> **规则**：以下事项必须等用户确认后才能继续。

| # | 事项 | 提出时间 | 优先级 | 状态 | 备注 |
|---|------|---------|--------|------|------|
| 2.1 | DeepSeek API Key 配置 | 2026-05-01 | 🔴 高 | ✅ 已完成 | API Key 已配置并测试通过 |
| 2.2 | Supabase Storage avatars bucket | 2026-05-01 | 🟡 中 | ⏸️ 待用户操作 | Dashboard 创建 bucket |
| 2.3 | avatar_url migration 推送 | 2026-05-01 | 🟡 中 | ⏸️ 待用户操作 | `supabase db push` |

---

## 六、问题与风险日志

| # | 问题/风险 | 发现时间 | 严重程度 | 状态 | 解决方案 |
|---|----------|---------|---------|------|---------|
| — | — | — | — | — | — |

---

## 七、执行日志索引

| 条目 | 时间 | 触发 Skill | 关键动作 | 状态 |
|------|------|-----------|---------|------|
| #001~#009 | 2026-05-01 | 多个 | Phase 0 全部完成 | 完成 |
| #010 | 2026-05-01 | `spec-driven-development` | Phase 1 启动，编写 Spec | 完成 |
| #011 | 2026-05-01 | `spec-driven-development` | **用户确认全部 5 项决策**，Spec v1.0-final 生效 | 完成 |
| #012 | 2026-05-01 | `planning-and-task-breakdown` + `incremental-implementation` | **开始 Task 拆解和代码执行** | **进行中** |

**完整执行日志**：`docs/execution-log.md`

---

*最后更新：2026-05-02 · Phase 5（导出功能）代码已完成*
