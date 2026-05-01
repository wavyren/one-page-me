# One Page Me — 第三方服务配置引导

> **适用阶段**：Phase 0 项目初始化  
> **配置目标**：GitHub 仓库、Supabase 项目、Vercel 部署

---

## 前置条件

- [ ] 已安装 Node.js v20 LTS（运行 `node -v` 确认）
- [ ] 已安装 pnpm（运行 `pnpm -v` 确认，没有则 `npm install -g pnpm`）
- [ ] 已有 GitHub 账号（https://github.com）

---

## 第一步：创建 GitHub 仓库（5 分钟）

**目的**：存放代码，后续 Vercel 和 CI/CD 都依赖它。

1. 打开 https://github.com/new
2. 填写信息：
   - **Repository name**：`one-page-me`（或你喜欢的名字）
   - **Description**：`AI-powered personal homepage generator`
   - **Visibility**：`Public`（Vercel 免费版只支持 Public 仓库自动部署）
   - ✅ **Add a README file**：不勾选（我们后面自己创建）
   - ✅ **Add .gitignore**：选择 `Node`
   - ✅ **Choose a license**：选择 `MIT`
3. 点击 **Create repository**
4. 创建完成后，复制仓库地址（HTTPS 或 SSH，如 `https://github.com/你的用户名/one-page-me.git`）

**完成后告诉我**：仓库的 HTTPS/SSH URL

---

## 第二步：创建 Supabase 项目（10 分钟）

**目的**：PostgreSQL 数据库 + Auth + Storage + RLS。

1. 打开 https://supabase.com 并登录（可用 GitHub 账号直接登录）
2. 点击 **New project**
3. 填写信息：
   - **Organization**：选择或创建你的组织
   - **Project name**：`one-page-me`
   - **Database Password**：设置一个强密码（保存到密码管理器，后面不会经常用到）
   - **Region**：**`East Asia (Singapore)`**（离你最近，延迟最低）
4. 点击 **Create new project**，等待 1-2 分钟初始化
5. 项目创建完成后，进入项目 Dashboard：
   - 点击左侧菜单 **Project Settings** → **API**
   - 复制以下三个值：
     - `URL`（格式：`https://xxxxx.supabase.co`）
     - `anon public`（以 `eyJ...` 开头的长字符串）
     - `service_role secret`（以 `eyJ...` 开头的长字符串）
   - ⚠️ **service_role secret 是敏感密钥，不要分享给不信任的人**

**完成后告诉我**：
- Supabase Project URL
- Supabase Anon Key
- Supabase Service Role Key

---

## 第三步：配置 Vercel 项目（10 分钟）

**目的**：自动部署，每次 push 到 GitHub 自动更新生产环境。

1. 打开 https://vercel.com 并登录（可用 GitHub 账号直接登录）
2. 点击 **Add New...** → **Project**
3. 在 **Import Git Repository** 页面：
   - 找到你刚创建的 `one-page-me` 仓库，点击 **Import**
4. 配置项目：
   - **Project Name**：`one-page-me`（或默认）
   - **Framework Preset**：应该自动识别为 `Next.js`，如果不是请手动选择
   - **Root Directory**：`./`（默认）
5. **环境变量**（关键！先配置好，避免第一次部署失败）：
   - 点击 **Environment Variables**，逐个添加：
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://你的项目.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = 你的 anon key
     NEXT_PUBLIC_APP_URL = https://one-page-me.vercel.app（或你的自定义域名）
     ```
   - 注意：`SUPABASE_SERVICE_ROLE_KEY`、`DEEPSEEK_API_KEY` 等后续再添加，Phase 0 只需要上面 3 个
6. 点击 **Deploy**
7. 等待构建完成（约 1-2 分钟），看到 **Congratulations!** 页面即成功

**完成后告诉我**：
- Vercel 生产域名（如 `https://one-page-me.vercel.app`）
- 是否部署成功

---

## 第四步：安装 Supabase CLI（本地开发用）

**目的**：在本地执行数据库迁移、生成类型等。

```bash
# 安装 Supabase CLI
pnpm add -g supabase

# 登录（会打开浏览器让你授权）
supabase login

# 链接到远程项目（把 xxxxxx 换成你的 Project ID）
supabase link --project-ref xxxxxx
```

Project ID 在 Supabase Dashboard → Project Settings → General 页面可以找到。

**完成后告诉我**：`supabase link` 是否成功

---

## 总结：完成后你需要给我的信息

请复制以下模板，填入你的实际值后回复给我：

```markdown
## GitHub
- 仓库 URL：`https://github.com/你的用户名/one-page-me.git`

## Supabase
- Project URL：`https://xxxxx.supabase.co`
- Anon Key：`eyJ...`
- Service Role Key：`eyJ...`
- Project ID：`xxxxx`

## Vercel
- 生产域名：`https://one-page-me.vercel.app`
- 部署状态：成功 / 失败（如果失败请贴错误信息）
```

---

*收到你的配置信息后，我将立即开始执行代码初始化（Task 0.3 及以后）。*
