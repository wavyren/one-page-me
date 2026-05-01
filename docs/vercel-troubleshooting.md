# Vercel 404 排查指南

## 问题现象

- 访问 `https://one-page-me.vercel.app` 返回 404: NOT_FOUND
- 错误 ID：`hnd1::27gc7-1777616219339-cbb15e42de60`

## 排查步骤

### 步骤 1：确认项目是否连接了正确的 GitHub 仓库

1. 打开 https://vercel.com/dashboard
2. 找到 `one-page-me` 项目，点击进入
3. 查看页面顶部的 Git 信息：
   - 应该显示 `wavyren/one-page-me` 和最近的 commit 信息
   - 如果显示的是其他仓库，或者没有 Git 信息，说明项目没有正确连接

**如果没有连接或连接错误**：
- 点击 **Settings** → **Git**
- 点击 **Disconnect**（如果有旧的连接）
- 点击 **Connect Git Repository**
- 选择 `wavyren/one-page-me`
- 确认 **Production Branch** 是 `main`
- 点击 **Save**

### 步骤 2：检查 Framework Preset 和 Root Directory

1. 在项目页面点击 **Settings** → **General**
2. 检查以下配置：
   - **Framework Preset**：必须是 `Next.js`
   - **Root Directory**：必须是 `./`（或留空）
   - **Build Command**：留空（让 Vercel 自动检测）
   - **Output Directory**：留空（让 Vercel 自动检测）
3. 如果修改了任何配置，点击 **Save**

### 步骤 3：配置环境变量（正确的位置）

⚠️ **重要：不要点 "Create Pre-production Environment"，那是 Pro 功能！**

正确的路径：
1. 在项目主页（Overview），向下滚动到 **Environment Variables** 区域
2. 直接点击 **+ Add** 按钮（或 **Edit**）
3. 逐个添加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dkeukhabsnqkynvkjcde.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZXVraGFic25xa3ludmtqY2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MDI2NzksImV4cCI6MjA5MzE3ODY3OX0.qU0fxrSULSliueGBQ52k3kjdgxd_h1wMkGzxIKoxlTQ` |
| `NEXT_PUBLIC_APP_URL` | `https://one-page-me.vercel.app` |

4. 确保 **Production** 环境已勾选（默认就是 Production）
5. 点击 **Save**

**如果项目主页没有 Environment Variables 区域**：
- 点击顶部 **Settings** 标签
- 左侧菜单选择 **Environment Variables**
- 在这里添加

### 步骤 4：手动触发重新部署

1. 在项目页面点击 **Deployments** 标签
2. 找到最新的部署，点击右侧的 **...** 菜单
3. 选择 **Redeploy**
4. 在弹窗中确认 **Use existing Build Cache** 不勾选（强制重新构建）
5. 点击 **Redeploy**
6. 等待构建完成（约 1-2 分钟）

### 步骤 5：查看构建日志

如果重新部署后仍然 404：
1. 点击失败的部署（红色）
2. 查看 **Build Logs**
3. 寻找错误信息（通常是红色高亮）
4. 把错误日志复制发给我

## 如果以上步骤都无法解决

最简单的方式：**删除当前 Vercel 项目，重新导入**

1. 在项目页面点击 **Settings** → **General**
2. 滚动到底部，点击 **Delete Project**
3. 确认删除
4. 回到 Vercel Dashboard，点击 **Add New...** → **Project**
5. 导入 `wavyren/one-page-me`
6. 配置环境变量（见步骤 3）
7. 点击 **Deploy**
