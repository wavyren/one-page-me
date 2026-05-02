# One Page Me — Agent Skills 执行手册

> **版本**：v1.0  
> **适用阶段**：Phase 0 ~ Phase 8 全生命周期  
> **关联文件**：`prds/one-page-me-plan-v2.md`、`prds/one_page_me_ui_interaction_demo.html`

---

## 一、项目当前状态

| 项目 | 状态 |
|------|------|
| PRD v2.0（产品方案） | ✅ 已完成，`prds/one-page-me-plan-v2.md` |
| UI 交互原型 | ✅ 已完成，`prds/one_page_me_ui_interaction_demo.html` |
| 代码仓库 | ✅ 已初始化，Phase 0~4 基础功能代码已完成 |
| 当前阶段 | **Phase 5：导出功能（已完成），Phase 6：分享与传播待开始** |

**技术栈确认**：Next.js 15 (App Router) + shadcn/ui + Tailwind CSS v4 + Zustand + Supabase + DeepSeek API + next-intl

---

## 二、Agent Skills 是怎么工作的？

你已经安装了 **20 个 Google Agent Skills**（来自 Addy Osmani 的工程规范库）。它们不是需要手动调用的插件，而是 **Kimi 在对应场景下自动遵循的「行为准则」**。

### 触发方式

| 触发方式 | 说明 | 示例 |
|---------|------|------|
| **自动触发** | 根据当前操作自动匹配 Skill | 写 UI 时自动遵循 `frontend-ui-engineering` |
| **显式引用** | 在 Prompt 中直接要求使用某 Skill | "按 `spec-driven-development` 的流程，先写 Spec" |
| **生命周期推进** | 进入新阶段时自动切换 Skill 组合 | 从 Build 进入 Review 时自动激活代码审查规范 |

### 你（用户）需要做的事

很简单：**在关键节点给我明确的指令**，我会自动调用对应的 Skill。例如：

- `"我们准备开始 Phase 0，先写 Spec"` → 触发 `spec-driven-development`
- `"这个功能怎么实现？"` → 触发 `planning-and-task-breakdown` + `incremental-implementation`
- `"UI 写好了，帮我检查一下"` → 触发 `code-review-and-quality` + `frontend-ui-engineering`
- `"准备上线"` → 触发 `shipping-and-launch`

---

## 三、Phase-by-Phase 执行指南

### 🔵 Phase 0：项目初始化（我们现在在这里）

**目标**：创建 Next.js 项目、配置 Supabase、配置 i18n、CI/CD、部署到 Vercel

**激活的 Skills**：
```
spec-driven-development
planning-and-task-breakdown
source-driven-development
security-and-hardening
ci-cd-and-automation
```

#### Step 1：写 Phase 0 Spec（触发 `spec-driven-development`）

**你的指令模板**：
```
我们要开始 Phase 0 了。请基于 PRD（prds/one-page-me-plan-v2.md）中的 Phase 0 计划，
写一份详细的 Phase 0 技术 Spec，包括：
1. 项目初始化命令（Next.js + shadcn/ui）
2. Supabase 配置步骤（Auth、RLS、数据库 Schema）
3. next-intl 国际化配置
4. 环境变量清单（.env.example）
5. CI/CD 配置（GitHub Actions）
6. Vercel 部署配置
7. 成功标准（什么算 Phase 0 完成）
```

**我会自动做**：
- 先列出假设（如：Node.js 版本、包管理器选择）
- 使用 `source-driven-development` 核实 Next.js 15 和 shadcn/ui 最新初始化命令
- 生成完整 Spec 文档（建议保存到 `docs/specs/phase-0-spec.md`）
- 标出需要你先确认的决策点（如：是否使用 pnpm）

#### Step 2：任务拆解（触发 `planning-and-task-breakdown`）

**你的指令模板**：
```
Spec 已确认。请将 Phase 0 拆解为具体可执行的任务列表，
每个任务包含：描述、验收标准、验证命令、依赖关系、涉及的文件。
```

**预期输出示例**：
```markdown
## Task 1: 初始化 Next.js 15 + shadcn/ui 项目
- 验收：项目能 `npm run dev` 启动，看到默认首页
- 验证：`curl http://localhost:3000` 返回 200
- 依赖：无
- 文件：`package.json`, `app/`, `components/ui/`

## Task 2: 配置 Tailwind CSS v4 + 品牌色
- 验收：主色 #C9854A 生效，预览区背景 #F4EFE8
- 验证：创建一个测试组件，颜色正确
- 依赖：Task 1
- 文件：`app/globals.css`, `tailwind.config.ts`

## Task 3: 配置 Supabase Client + 环境变量
...
```

#### Step 3：增量执行（触发 `incremental-implementation`）

**你的指令模板**：
```
开始执行 Task 1：初始化 Next.js 项目。不要一次性做多个任务，
完成一个后运行验证命令，确认通过再继续下一个。
```

**执行纪律**（我会自动遵循）：
- 每个 Task 完成后执行 `npm run build && npm test`（如果已配置测试）
- 每个 Task 结束后提交 Git（原子提交）
- 不触碰当前 Task 范围外的文件

---

### 🟢 Phase 1：用户系统

**目标**：手机号 OTP、Google/Apple 登录、Profile 页、Session 管理

**激活的 Skills**：
```
planning-and-task-breakdown
incremental-implementation
test-driven-development
security-and-hardening
api-and-interface-design
```

#### 关键执行点

**Step 1：先写测试（触发 `test-driven-development`）**

**你的指令**：
```
我们要实现手机号 OTP 登录。按 TDD 流程：
1. 先写测试：测试 OTP 发送、验证、错误重试、过期逻辑
2. 让测试失败（RED）
3. 实现最小代码让测试通过（GREEN）
4. 重构
```

**Step 2：API 设计审查（触发 `api-and-interface-design`）**

在实现 `/api/auth/otp/send` 和 `/api/auth/otp/verify` 前，我会：
- 定义请求/响应契约（Zod Schema）
- 确认错误语义（统一错误格式）
- 确认速率限制策略

**Step 3：安全加固（触发 `security-and-hardening`）**

自动检查：
- OTP 码是否使用安全随机数生成
- 是否限制发送频率（防短信轰炸）
- Session Cookie 是否 httpOnly + secure + sameSite
- 是否验证手机号格式

---

### 🟡 Phase 2：核心对话引擎

**目标**：`/api/chat` SSE 流、消息持久化、字段提取、对话 UI

**激活的 Skills**：
```
spec-driven-development
planning-and-task-breakdown
incremental-implementation
frontend-ui-engineering
context-engineering
debugging-and-error-recovery
```

#### 关键执行点

**Step 1：Spec 先行**

对话引擎是整个产品的核心，必须先写 Spec：
- SSE 流式响应协议设计
- 消息持久化 Schema（`conversations`、`messages` 表）
- 字段提取机制（何时触发、如何校验准确率）
- 对话状态机（5 个阶段的状态流转）

**Step 2：前端 UI 工程规范（触发 `frontend-ui-engineering`）**

双栏布局实现时自动遵循：
- 桌面端：左侧 44% + 右侧 56%
- 移动端：单栏 + 底部 Tab
- 动画规范：`fadeUp` 0.35s、`scaleIn` 配合橙色光晕
- 骨架屏 shimmer：1.5s 循环
- 加载/错误/空状态处理
- 可访问性：键盘导航、ARIA 标签

**Step 3：上下文工程（触发 `context-engineering`）**

在构建 DeepSeek Prompt 时：
- 只加载当前对话阶段需要的 Prompt 片段
- 不一次性加载全部 System Prompt（避免上下文膨胀）
- 按阶段加载：破冰 → 基本信息 → 深度挖掘 → 汇总确认

---

### 🟠 Phase 3：实时预览引擎

**目标**：Zustand 状态机、骨架 Shimmer、渐进填充动画、双栏/移动端布局

**激活的 Skills**：
```
frontend-ui-engineering
incremental-implementation
performance-optimization
browser-testing-with-devtools
```

#### 关键执行点

**Step 1：性能优先（触发 `performance-optimization`）**

预览引擎对性能敏感，自动遵循：
- 先测量基线（Lighthouse）
- 状态更新避免不必要的重渲染（Zustand selector 优化）
- 动画使用 CSS transform 而非 layout 属性
- 图片懒加载、骨架屏占位

**Step 2：浏览器测试（触发 `browser-testing-with-devtools`）**

实现后自动验证：
- Console 无报错
- 网络请求 waterfall（避免 SSE 连接阻塞其他请求）
- 性能 trace（动画帧率 60fps）
- 响应式断点测试（320px / 768px / 1024px / 1440px）

---

### 🔴 Phase 4：主页生成引擎

**目标**：`/api/generate-page`、HTML 模板、SSR 渲染、OG 图生成

**激活的 Skills**：
```
api-and-interface-design
test-driven-development
security-and-hardening
performance-optimization
source-driven-development
```

#### 关键执行点

**Step 1：API 契约设计**

`/api/generate-page` 接口设计时：
- 输入：结构化提取结果 JSON
- 输出：完整合法 HTML（或 HTML + CSS 分离）
- 错误处理：生成失败时的降级策略

**Step 2：Source-Driven 验证（触发 `source-driven-development`）**

生成 HTML 模板时：
- 核实 DeepSeek API 的输出格式限制
- 确认 HTML 合法性（使用验证工具）
- 确认 OG 图生成方案（Puppeteer / satori）

---

### 🟣 Phase 5：导出功能

**目标**：PDF 微服务、图片导出、Markdown 导出、QR Code

**激活的 Skills**：
```
planning-and-task-breakdown
incremental-implementation
test-driven-development
performance-optimization
```

#### 关键执行点

**Step 1：垂直切片**

不要一次性实现所有导出格式：
- Slice 1：HTML → PDF（Puppeteer + @sparticuz/chromium）
- Slice 2：HTML → 图片（Puppeteer 截图 + sharp 裁剪）
- Slice 3：Markdown 导出
- Slice 4：QR Code 生成

每个 Slice 独立测试、独立提交。

---

### 🟤 Phase 6：分享与传播

**目标**：自定义路径、密码保护、嵌入代码、访问统计

**激活的 Skills**：
```
security-and-hardening
api-and-interface-design
test-driven-development
```

#### 关键执行点

**Step 1：安全审查（触发 `security-and-hardening`）**

分享功能涉及权限控制，自动检查：
- 自定义路径是否防遍历攻击（`../../admin`）
- 密码保护页面是否正确哈希存储密码
- 访问统计是否哈希处理 IP（不存明文）
- 嵌入代码的 iframe sandbox 策略

---

### ⚫ Phase 7：支付与权限

**目标**：虎皮椒支付、Stripe 订阅、权限门控

**激活的 Skills**：
```
security-and-hardening
api-and-interface-design
test-driven-development
code-review-and-quality
```

#### 关键执行点

**Step 1：支付安全（最高优先级）**

- 虎皮椒回调：验证 MD5 签名、幂等处理
- Stripe Webhook：验证签名、防重放攻击
- 绝不将支付密钥提交到 Git
- `npm audit` 零高危漏洞

**Step 2：100% 分支覆盖测试**

支付回调逻辑必须 100% 测试覆盖：
- 正常支付成功
- 重复回调（幂等）
- 签名错误（拒绝）
- 金额不匹配（拒绝）
- 过期订单（拒绝）

---

### ⚪ Phase 8：体验打磨 & 上线

**目标**：错误处理、加载状态、SEO、a11y、性能优化、落地页

**激活的 Skills**：
```
performance-optimization
frontend-ui-engineering
shipping-and-launch
code-simplification
documentation-and-adrs
```

#### 关键执行点

**Step 1：上线前检查清单（触发 `shipping-and-launch`）**

部署前自动执行：
- [ ] 所有测试通过（`npm test`）
- [ ] 构建成功（`npm run build`）
- [ ] Lighthouse Performance ≥ 90
- [ ] Core Web Vitals 全部 Good
- [ ] `npm audit` 无 Critical/High 漏洞
- [ ] 环境变量在 Vercel 已配置
- [ ] 功能开关（Feature Flag）策略就绪
- [ ] 回滚方案文档化

**Step 2：代码简化（触发 `code-simplification`）**

上线前清理：
- 删除调试用的 `console.log`
- 删除未使用的导入和变量
- 简化过度抽象的函数
- 确认没有死代码

**Step 3：文档（触发 `documentation-and-adrs`）**

- 更新 `README.md`（安装、开发、部署指南）
- 编写关键架构决策 ADR（如：为什么选 Zustand 而非 Redux）
- API 文档更新

---

## 四、常用 Prompt 模板（直接复制使用）

### 场景 1：开始一个新 Phase
```
我们要开始 [Phase X: 阶段名称] 了。
请：
1. 先阅读 PRD 中对应章节（prds/one-page-me-plan-v2.md）
2. 按 spec-driven-development 写一份 Phase X 技术 Spec
3. 列出需要我先确认的技术决策
4. 不要写代码，先写文档
```

### 场景 2：实现一个功能
```
Spec 已确认。请按 planning-and-task-breakdown 拆解为任务列表，
然后按 incremental-implementation 逐个执行。
每次只做一个任务，完成后运行测试和构建验证。
```

### 场景 3：写 UI 组件
```
请实现 [组件名称] UI 组件。
要求：
- 遵循 frontend-ui-engineering 规范
- 使用项目设计系统（品牌色 #C9854A，预览背景 #F4EFE8）
- 处理 loading、error、empty 三种状态
- 支持响应式（桌面端双栏 / 移动端单栏）
- 键盘可访问、ARIA 标签完整
```

### 场景 4：修 Bug
```
用户反馈：[Bug 描述]
请按 test-driven-development 的 Prove-It 模式：
1. 先写一个能复现这个 Bug 的测试（测试应该失败）
2. 然后修复 Bug
3. 确认测试通过
4. 运行完整测试套件确认无回归
```

### 场景 5：代码审查
```
我完成了 [功能/PR 描述] 的实现，请做代码审查。
要求：
- 按 code-review-and-quality 的五维审查法检查
- 特别关注 security-and-hardening 和 performance-optimization
- 标出 Critical / Important / Suggestion 级别
- 检查是否有死代码需要清理
```

### 场景 6：准备上线
```
我们准备将 [版本/功能] 部署到生产环境。
请按 shipping-and-launch 执行上线前检查：
1. 运行完整的 Pre-launch Checklist
2. 确认 Feature Flag 策略
3. 确认回滚方案
4. 给出部署建议（直接全量 / 灰度发布）
```

### 场景 7：性能优化
```
[LCP/INP/CLS] 指标不达标，请优化。
要求：
- 按 performance-optimization：先测量，再定位瓶颈，再修复
- 提供优化前后的具体数据对比
- 不要过早优化，只修测量证明的瓶颈
```

---

## 五、Skill 快查表

| 当你要... | 引用这个 Skill | 一句话说明 |
|-----------|---------------|-----------|
| 写 Spec / PRD | `spec-driven-development` | 先写文档，再写代码 |
| 拆任务 | `planning-and-task-breakdown` | 小任务、有验收标准、有验证步骤 |
| 写代码 | `incremental-implementation` | 垂直切片、测完提交、再下一个 |
| 写测试 | `test-driven-development` | 先写失败测试，再写代码让它通过 |
| 写 UI | `frontend-ui-engineering` | 无 AI 审美、可访问、响应式、三态处理 |
| 查资料 | `source-driven-development` | 看官方文档，不凭记忆 |
| 管理上下文 | `context-engineering` | 只加载需要的信息 |
| 设计 API | `api-and-interface-design` | 契约优先、版本管理、错误语义 |
| 浏览器测试 | `browser-testing-with-devtools` | Console、Network、Performance、Screenshot |
| 修 Bug | `debugging-and-error-recovery` | 复现 → 定位 → 缩减 → 修复 → 防护 |
| 审代码 | `code-review-and-quality` | 五维审查、标严重程度 |
| 简化代码 | `code-simplification` | 清晰胜于聪明 |
| 加固安全 | `security-and-hardening` | 所有输入都是恶意的 |
| 优化性能 | `performance-optimization` | 先测量，再优化 |
| Git 提交 | `git-workflow-and-versioning` | 原子提交、主干开发 |
| CI/CD | `ci-cd-and-automation` | Shift Left、Feature Flag |
| 废弃旧代码 | `deprecation-and-migration` | 代码是负债 |
| 写文档 | `documentation-and-adrs` | 记录 Why，不是 What |
| 发布上线 | `shipping-and-launch` | 可回滚、可观察、渐进发布 |
| 打磨想法 | `idea-refine` | 发散 → 收敛 |

---

## 六、Anti-Pattern 警示（我会自动拒绝）

以下行为我会自动阻止，并引用对应 Skill 说明原因：

| 你的指令 | 我的反应 | 引用 Skill |
|---------|---------|-----------|
| "直接开始写代码吧，不用写 Spec" | ❌ 拒绝。先写 Spec，哪怕是两行的。 | `spec-driven-development` |
| "一次性把 Phase 2 全部做完" | ❌ 拒绝。按 Task 拆解，逐个增量实现。 | `incremental-implementation` |
| "先写功能，测试后面补" | ❌ 拒绝。TDD：测试先行。 | `test-driven-development` |
| "这个 UI 先随便做一下" | ❌ 拒绝。用设计系统，处理三态，保证可访问性。 | `frontend-ui-engineering` |
| "直接全量发布，不用灰度" | ❌ 拒绝。必须有 Feature Flag + 渐进发布。 | `shipping-and-launch` |
| "用户输入不用校验，前端已经验过了" | ❌ 拒绝。所有外部输入在边界校验。 | `security-and-hardening` |
| "这段代码先这样，后面再优化" | ❌ 拒绝。先测量证明有性能问题，再针对性优化。 | `performance-optimization` |

---

## 七、文档维护

- **更新时机**：每完成一个 Phase，回顾并更新本手册中的实践经验
- **责任人**：AI Agent（自动）+ 用户（人工确认）
- **存放位置**：`docs/agent-skills-playbook.md`

---

*One Page Me · Agent Skills 执行手册 · 2026-05-01*
