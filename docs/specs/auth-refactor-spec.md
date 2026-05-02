# Spec: 登录系统重构

## 假设清单

1. **Supabase 邮件服务可用**：Supabase Auth 内置邮件服务（OTP/Confirm），无需额外配置 Resend
2. **Google OAuth 已配置**：Supabase Dashboard 中 Google Provider 已启用，Client ID/Secret 已配置
3. **Additional Redirect URLs**：Supabase Dashboard 中已添加 `http://localhost:3000/auth/callback` 和 `https://one-page-me.vercel.app/auth/callback`
4. **users 表已存在**：`public.users` 表结构不变，继续通过 `syncAuthUser` 同步
→ 如有误请立即纠正。

---

## Objective

重构登录系统：移除手机号登录，改为邮箱 + Google OAuth 双通道。修复 Google OAuth callback 报错。

**用户故事：**
- 用户打开网站，首页有"开始创建"按钮
- 点击后进入登录页，看到 Google 登录（最显眼）和邮箱登录（下方）
- 新用户输入邮箱+密码注册，或点击 Google 一键登录
- 老用户输入邮箱+密码登录，或请求邮箱验证码登录
- 登录成功后自动跳转到 /chat

**成功标准：**
- [ ] Google OAuth 登录完整走通，不报错
- [ ] 邮箱注册成功，数据同步到 public.users
- [ ] 邮箱+密码登录成功
- [ ] 邮箱 OTP 登录成功
- [ ] 所有旧的手机号登录代码已删除
- [ ] type-check + lint + build 全部通过

---

## Tech Stack

| 功能 | 技术 | 说明 |
|------|------|------|
| Google OAuth | Supabase Auth `signInWithOAuth` | 保留现有逻辑，修复 callback |
| 邮箱注册 | Supabase Auth `signUp` | email + password |
| 邮箱密码登录 | Supabase Auth `signInWithPassword` | email + password |
| 邮箱 OTP | Supabase Auth `signInWithOtp({ email })` | 发送验证码到邮箱 |
| 用户同步 | Server Action `syncAuthUser` | 保留现有逻辑 |

---

## Commands

```bash
pnpm dev
pnpm type-check
pnpm lint
pnpm build
```

---

## Project Structure

```
app/
  auth/
    callback/
      page.tsx              # 修改：增强错误处理，支持 fallback
  login/
    page.tsx                # 修改：新布局（Google 在上，邮箱在下）
components/
  auth/
    oauth-buttons.tsx       # 修改：Google 放最上面，去掉 separator 文案
    email-auth-form.tsx     # 新增：邮箱注册/登录/OTP 三模式表单
lib/
  actions/
    auth.ts                 # 修改：删除 sendPhoneOtp/verifyPhoneOtp，保留 syncAuthUser/signOut
  validations/
    auth.ts                 # 修改：删除 phoneSchema/otpSchema，改为 emailSchema/passwordSchema
```

---

## Code Style

### 表单错误显示
```tsx
{error && (
  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
    {error}
  </div>
)}
```

### 统一 Action 返回格式
```typescript
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
```

---

## 删除清单

| 文件/代码 | 原因 |
|-----------|------|
| `components/auth/phone-login-form.tsx` | 手机号登录下线 |
| `lib/actions/auth.ts` 中 `sendPhoneOtp` | 手机号登录下线 |
| `lib/actions/auth.ts` 中 `verifyPhoneOtp` | 手机号登录下线 |
| `lib/validations/auth.ts` 中 `phoneSchema` | 不再使用 |
| `lib/validations/auth.ts` 中 `otpSchema` | 不再使用 |
| `vercel.json` 中 `MOCK_OTP_ENABLED` | Mock 模式下线 |
| `vercel.json` 中 `MOCK_OTP_CODE` | Mock 模式下线 |
| `.env.example` 中 `MOCK_OTP_*` | Mock 模式下线 |
| `.env.example` 中 `ALIYUN_*` | 短信服务下线 |

---

## 登录页 UI 设计

```
┌─────────────────────────────┐
│         登录 One Page Me     │
│                             │
│  ┌───────────────────────┐  │
│  │  🔍 使用 Google 登录   │  │  ← 主按钮，最显眼
│  └───────────────────────┘  │
│                             │
│  ─────── 或使用邮箱 ───────  │
│                             │
│  [邮箱输入框]                │
│                             │
│  [密码输入框]                │
│                             │
│  ┌───────────────────────┐  │
│  │       登录             │  │
│  └───────────────────────┘  │
│                             │
│  还没有账号？立即注册         │
│  忘记密码？使用验证码登录      │
└─────────────────────────────┘
```

模式切换：
- **登录模式**：邮箱 + 密码 + "登录"按钮
- **注册模式**：邮箱 + 密码 + 确认密码 + "注册"按钮
- **OTP 模式**：邮箱 + 验证码 + "登录"按钮

---

## OAuth Callback 修复方案

**问题**：回调 URL 变成 `/?code=xxx` 而不是 `/auth/callback?code=xxx`

**根因**：Supabase Dashboard → Authentication → URL Configuration → Additional Redirect URLs 中可能没有配置 `/auth/callback`

**代码修复**：
1. 在 `app/page.tsx` 中添加 fallback 检测：如果 URL 包含 `?code=` 且不在 `/auth/callback`，自动重定向到 `/auth/callback?code=xxx`
2. `app/auth/callback/page.tsx` 增加更完善的错误处理和用户提示

---

## Testing Strategy

| 层级 | 范围 | 验证方式 |
|---|---|---|
| 人工 | Google OAuth 完整流程 | 本地 + Vercel 各测一次 |
| 人工 | 邮箱注册 → 登录 → 创建主页 | 本地完整走一遍 |
| 人工 | 邮箱 OTP 登录 | 检查邮箱是否收到验证码 |
| 人工 | 旧手机号入口已消失 | 检查登录页 |
| 自动 | type-check + lint + build | CI |

---

## Boundaries

### Always Do
- 所有表单输入用 Zod 校验
- 密码最小 6 位
- 错误提示明确，不暴露系统信息
- 每次 commit 前 `pnpm type-check && pnpm lint && pnpm build`

### Ask First
- 修改数据库 schema
- 添加新的 npm 依赖
- 修改 Supabase Dashboard 配置

### Never Do
- 保留已废弃的手机号登录代码
- 在前端暴露 Supabase service role key
- 跳过 `syncAuthUser` 直接操作 public.users

---

## Open Questions

1. **Supabase Dashboard 配置**：Additional Redirect URLs 是否已包含 `/auth/callback`？需要用户确认
2. **邮箱 OTP 的邮件模板**：使用 Supabase 默认模板还是自定义？
3. **密码重置功能**：Phase 7 再实现？
