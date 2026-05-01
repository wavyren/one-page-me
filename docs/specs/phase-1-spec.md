# Spec: Phase 1 — 用户系统

> **遵循 Skill**: `spec-driven-development`  
> **阶段目标**：手机号 OTP 登录、Google OAuth、Apple 登录、Profile 页、Session 管理  
> **关联 PRD**：`prds/one-page-me-plan-v2.md` 第 275-284 行

---

## ASSUMPTIONS I'M MAKING

以下是我基于现有信息做出的假设。**请在继续前确认或纠正**：

1. **Supabase Auth 已启用**：Supabase Dashboard → Authentication 已开启，Phone provider 已启用
2. **登录方式优先级**：手机号 OTP（国内主路径）> Google OAuth（海外主路径）> Apple 登录（可选）
3. **头像存储**：使用 Supabase Storage，创建 `avatars` bucket
4. **登录页面设计**：简洁的单页设计，上方 logo + 中间登录卡片 + 底部切换方式
5. **Session 策略**：使用 Supabase SSR（Server-Side Rendering）方案，`middleware.ts` 刷新 token
6. **未登录跳转**：访问 `/chat` 等受保护路由时，自动跳转到 `/login`
7. **用户注册即登录**：手机号验证成功后自动创建用户并登录（无需单独注册流程）

→ **以上假设如有错误，请立即纠正。**

---

## Open Questions（待确认决策）

以下决策会阻塞后续执行，**请在继续前逐一确认**：

| # | 决策项 | 我的建议 | 你的选择？ |
|---|--------|---------|-----------|
| D9 | **短信服务商** | **方案 A**：先用 Supabase 内置短信（开发测试用，国内手机号可能收不到）；**方案 B**：直接接入阿里云短信（需要阿里云 Access Key + 签名 + 模板） | ？ |
| D10 | **Google OAuth** | 是否需要在 Phase 1 实现？（需要 Google Cloud Console 配置 OAuth 客户端，约 10 分钟） | ？ |
| D11 | **Apple 登录** | 是否需要在 Phase 1 实现？（需要 Apple Developer 账号 ¥688/年，配置较复杂）建议延后 | ？ |
| D12 | **头像上传限制** | 最大 2MB，仅允许 jpg/png/webp | ？ |
| D13 | **登录后跳转** | 登录成功后跳转到 `/chat`（对话页面） | ？ |

---

## Objective

### What we're building
实现完整的用户认证系统，支持国内（手机号 OTP）和海外（Google/Apple OAuth）用户注册/登录，包含用户资料管理和会话保护。

### Why
用户系统是所有功能的基础。对话、主页生成、支付都依赖用户身份。

### Success Criteria（验收标准）
- [ ] 国内用户可通过手机号 + 短信验证码注册/登录
- [ ] 海外用户可通过 Google OAuth 注册/登录
- [ ] 海外用户可通过 Apple 登录注册/登录（如果 D11 选择实现）
- [ ] 登录成功后 Session 持久化，刷新页面不丢失
- [ ] 未登录用户访问 `/chat` 自动跳转到 `/login`
- [ ] 已登录用户访问 `/login` 自动跳转到 `/chat`
- [ ] 用户可查看和编辑 Profile（头像、昵称）
- [ ] 用户可注销登录
- [ ] 所有 API 路由正确获取当前用户身份

---

## Tech Stack

| 功能 | 技术 | 说明 |
|------|------|------|
| 认证核心 | Supabase Auth | OTP + OAuth + Session |
| 短信发送 | Supabase 内置 / 阿里云短信 | 根据 D9 决策 |
| 头像存储 | Supabase Storage | `avatars` bucket |
| UI 组件 | shadcn/ui | Input, Button, Avatar, Card, Tabs |
| 表单验证 | Zod | 手机号格式、验证码格式 |
| 状态管理 | Zustand | 用户全局状态 |

---

## Commands

```bash
# 添加 shadcn/ui 组件（按需）
pnpm dlx shadcn@latest add input button avatar card tabs label separator

# 安装依赖
pnpm add zod

# 本地开发测试
pnpm dev
# 访问 http://localhost:3000/login

# 测试登录流程
# 1. 输入手机号 → 获取验证码
# 2. 输入验证码 → 登录成功
# 3. 刷新页面 → Session 保持
```

---

## Project Structure（新增/修改）

```
app/
  ├── login/
  │   └── page.tsx              # 登录页（手机号 + OAuth）
  ├── profile/
  │   └── page.tsx              # 个人资料页
  ├── chat/
  │   └── page.tsx              # 对话页（新增：未登录跳转）
  ├── layout.tsx                # 修改：添加用户状态 Provider
  ├── globals.css               # 已有
  └── middleware.ts             # 修改：添加登录保护 + Session 刷新

components/
  ├── auth/
  │   ├── phone-login-form.tsx  # 手机号登录表单
  │   ├── oauth-buttons.tsx     # Google/Apple 登录按钮
  │   └── user-menu.tsx         # 用户头像下拉菜单
  └── ui/                       # shadcn/ui 组件（按需安装）

lib/
  ├── supabase/
  │   ├── client.ts             # 已有：浏览器端
  │   └── server.ts             # 已有：服务端
  ├── actions/
  │   └── auth.ts               # Server Actions：获取当前用户
  └── validations/
      └── auth.ts               # Zod schema：手机号、验证码

stores/
  └── user-store.ts             # Zustand：用户状态

types/
  └── user.ts                   # TypeScript：User 类型定义
```

---

## Code Style

### 手机号处理
```typescript
// 统一格式：+86 开头，去除空格和横线
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-]/g, '');
  return cleaned.startsWith('+') ? cleaned : `+86${cleaned}`;
}

// Zod 验证
const phoneSchema = z.string()
  .min(11, '手机号格式不正确')
  .max(15, '手机号格式不正确')
  .transform(normalizePhone);
```

### Session 刷新（middleware.ts）
```typescript
// 使用 Supabase SSR 方案
// 1. middleware 中创建 client 并调用 supabase.auth.getUser()
// 2. 这会触发 session 刷新（如果有 refresh token）
// 3. 将更新后的 cookie 通过 response.cookies.set 写回
```

### 受保护路由
```typescript
// app/chat/page.tsx
export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <ChatView user={user} />;
}
```

---

## Testing Strategy

Phase 1 引入以下测试：

| 层级 | 工具 | 覆盖范围 | 状态 |
|------|------|---------|------|
| 单元测试 | Vitest | 手机号格式化、Zod 验证 | ⬜ Phase 1 引入 |
| 集成测试 | Playwright | 完整登录流程：获取验证码 → 输入 → 登录 → 访问受保护页 | ⬜ Phase 1 引入 |

**测试场景**：
1. 手机号格式校验（+86、空格、横线）
2. 验证码格式校验（6 位数字）
3. 未登录用户访问 `/chat` → 跳转 `/login`
4. 已登录用户访问 `/login` → 跳转 `/chat`
5. 登录后刷新页面 → Session 保持
6. 注销后访问 `/chat` → 跳转 `/login`

---

## Boundaries

### Always Do
- 所有手机号统一转为 `+86` 格式后再调用 Supabase API
- 验证码输入框限制为 6 位数字
- Session 通过 `middleware.ts` 自动刷新
- 用户敏感操作（修改头像、注销）需要二次确认

### Ask First
- 修改 Supabase Auth 配置（Providers、Redirect URLs）
- 修改 `users` 表 Schema
- 添加新的 OAuth Provider

### Never Do
- 在前端暴露 `SUPABASE_SERVICE_ROLE_KEY`
- 将用户密码/token 存入 localStorage
- 跳过手机号格式验证直接调用 API

---

## Implementation Plan（概要）

### Slice 1：Supabase Auth 配置 + middleware Session 刷新
- 配置 Supabase Dashboard：启用 Phone Provider、Google Provider
- 更新 `middleware.ts`：Session 刷新 + 路由保护
- 验证：刷新页面 Session 不丢失

### Slice 2：手机号登录 UI + API
- 创建 `/login` 页面
- 创建 `PhoneLoginForm` 组件
- 实现发送验证码 + 验证登录
- 验证：完整手机号登录流程

### Slice 3：OAuth 登录（Google/Apple）
- 配置 Google OAuth（如需）
- 配置 Apple 登录（如需）
- 创建 OAuth 按钮组件
- 验证：OAuth 登录流程

### Slice 4：Profile 页 + 用户菜单
- 创建 `/profile` 页面
- 头像上传（Supabase Storage）
- 昵称编辑
- 用户菜单（头像下拉）
- 注销功能

### Slice 5：测试 + 质量门禁
- Vitest 单元测试
- Playwright E2E 测试
- 代码审查

---

*Spec 版本：v1.0-draft  
最后更新：2026-05-01  
遵循 Skill：`spec-driven-development`*
