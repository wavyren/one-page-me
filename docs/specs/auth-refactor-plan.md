# Plan: 登录系统重构

## 依赖关系

增量按顺序执行，后面的增量依赖前面的代码清理完成。

```
增量 1 ──→ 增量 2 ──→ 增量 3 ──→ 增量 4 ──→ 增量 5
(清理)     (表单)     (页面)     (回调)     (验证)
```

---

## 增量 1：清理手机号登录代码

**文件**：
1. `components/auth/phone-login-form.tsx` — 删除
2. `lib/actions/auth.ts` — 删除 sendPhoneOtp/verifyPhoneOtp
3. `lib/validations/auth.ts` — 删除 phoneSchema/otpSchema，添加 email/password schemas
4. `vercel.json` — 移除 MOCK_OTP 变量
5. `.env.example` — 移除 MOCK_OTP 和 ALIYUN 变量

**验收标准**：
- `pnpm type-check` 通过（可能需要临时注释 login page 中对 phone form 的引用）
- 项目中不再有任何手机号相关代码

**验证**：
```bash
grep -r "phone\|otp\|MOCK_OTP" --include="*.ts" --include="*.tsx" app/ components/ lib/
# 预期：0 匹配（除了 email/phone 字段名和 Supabase 配置）
```

---

## 增量 2：创建邮箱认证表单 + Actions

**文件**：
1. `lib/validations/auth.ts` — 添加 emailSchema, passwordSchema
2. `lib/actions/auth.ts` — 添加 emailSignUp, emailSignIn, emailOtpSignIn
3. `components/auth/email-auth-form.tsx` — 新建，三模式表单

**表单模式**：
- `mode: "login"` — 邮箱 + 密码 → `signInWithPassword`
- `mode: "register"` — 邮箱 + 密码 + 确认密码 → `signUp`
- `mode: "otp"` — 邮箱 + 验证码 → `signInWithOtp` + `verifyOtp`

**验收标准**：
- 表单 UI 可切换三种模式
- 所有输入有 Zod 校验
- 错误提示明确
- `pnpm type-check` 通过

---

## 增量 3：重构登录页

**文件**：
1. `app/login/page.tsx` — 新布局
2. `components/auth/oauth-buttons.tsx` — Google 放顶部

**布局**：
- Google 按钮在最上方（主 CTA）
- 分隔线
- EmailAuthForm 在下方

**验收标准**：
- 登录页只有 Google 和邮箱两种入口
- 没有手机号相关 UI
- 响应式正常

---

## 增量 4：修复 OAuth Callback

**文件**：
1. `app/auth/callback/page.tsx` — 增强错误处理
2. `app/page.tsx` — 添加 code fallback 重定向

**Callback 修复**：
- 如果 `exchangeCodeForSession` 失败，显示错误信息而不是白屏
- 添加 loading 状态

**Fallback 修复**：
- 在首页检查 URL 是否有 `?code=`
- 如果有，重定向到 `/auth/callback?code=xxx&next=/chat`

**验收标准**：
- Google 登录在本地走通
- 如果 Supabase redirect URL 配置错误，fallback 能自动修复

---

## 增量 5：验证 + 提交

**验证清单**：
- [ ] `pnpm type-check` 通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm build` 通过
- [ ] 登录页没有手机号入口
- [ ] Google 登录按钮可见
- [ ] 邮箱表单可切换登录/注册/OTP 模式

**提交**：
```bash
git add -A
git commit -m "refactor: remove phone login, add email auth, fix OAuth callback"
git push origin main
```
