# Spec: Phase 2 — 核心对话引擎

## 假设清单

1. AI 模型使用 DeepSeek V4 Pro（或兼容 OpenAI API 格式的任意模型）
2. 对话流为单会话模式：一个用户同一时间只有一个进行中的 conversation
3. 字段提取通过独立 API 调用完成（非流内标记解析）
4. 实时预览为客户端渲染，不与 AI 生成的主页 HTML 混淆
5. 移动端（< 768px）采用单栏 + Tab 切换，非双栏并排
→ 如有误请立即纠正。

---

## Objective

构建 AI 对话引导系统，通过 SSE 流式交互帮助用户整理个人信息，并在右侧实时预览主页填充效果。

**用户故事：**
- 用户登录后进入对话页面，看到 AI 开场白
- 用户输入回答，AI 通过 SSE 流式返回回复
- 每轮对话后，系统自动提取结构化字段（name/use_case/highlights/skills/contact）
- 右侧预览根据已收集字段渐进式更新
- 信息完整后显示"生成我的主页"按钮

**成功标准：**
- [ ] SSE 流式对话延迟 < 3s（首字）
- [ ] 字段提取准确率 ≥ 80%（人工抽检 10 组对话）
- [ ] 预览在字段提取后 1s 内更新
- [ ] 移动端 320px-768px 可用（单栏 + Tab 切换）
- [ ] 所有交互元素支持键盘操作（Tab 可达）
- [ ] API 有统一的输入验证和错误格式
- [ ] type-check + lint + build 全部通过

---

## Tech Stack

| 层 | 选型 | 版本 |
|---|---|---|
| AI API | DeepSeek (OpenAI-compatible) | deepseek-chat |
| HTTP 流式 | Next.js Route Handler + SSE | — |
| 状态管理 | Zustand | 5.x |
| UI 框架 | React 19 + Tailwind CSS v4 | — |
| 组件库 | shadcn/ui | — |
| 输入验证 | Zod | 4.x |

---

## Commands

```bash
# 开发
pnpm dev

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 构建
pnpm build
```

---

## Project Structure

```
app/
  api/chat/route.ts          # SSE 对话 API
  chat/page.tsx              # 对话页面（双栏布局）
components/
  chat/
    chat-container.tsx       # 对话容器（SSE 连接管理）
    message-list.tsx         # 消息列表
    chat-input.tsx           # 输入框
    typing-indicator.tsx     # AI 打字指示器
    field-progress.tsx       # 字段收集进度条
  preview/
    preview-panel.tsx        # 实时预览面板
lib/
  ai/
    deepseek.ts              # DeepSeek API 客户端
    prompts.ts               # System Prompt（中英文）
  actions/
    conversation.ts          # Conversation CRUD Server Actions
  validations/
    chat.ts                  # 对话 API 输入校验 schema
stores/
  chat-store.ts              # Zustand 对话状态
types/
  chat.ts                    # 对话相关 TypeScript 类型
```

---

## Code Style

### 命名规范
- 组件：PascalCase（`ChatContainer.tsx`）
- Hooks：camelCase 前缀 `use-`（`use-chat-stream.ts`）
- Server Actions：camelCase（`addMessage`）
- Zod schemas：camelCase 后缀 `Schema`（`chatInputSchema`）

### Tailwind 规范
- 使用设计系统变量，避免任意值
- ✅ `text-sm`, `gap-3`, `p-4`
- ❌ `text-[13px]`, `gap-[7px]`, `p-[10px]`
- 移动端优先：`flex-col md:flex-row`

### API 错误格式
```typescript
interface ApiError {
  code: string;      // 机器可读错误码
  message: string;   // 人类可读消息
  details?: unknown; // 附加详情
}
```

### 示例代码
```typescript
// Good: 分离数据获取与展示
export function ChatContainer({ conversationId }: { conversationId: string }) {
  const { messages, isLoading, sendMessage } = useChatStream(conversationId);
  
  if (messages.length === 0) return <ChatSkeleton />;
  if (error) return <ChatError message={error.message} retry={retry} />;
  
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
```

---

## Testing Strategy

| 层级 | 范围 | 工具 | 目标 |
|---|---|---|---|
| 单元 | Zod schema 校验、工具函数 | Vitest | 边界条件覆盖 |
| 集成 | `/api/chat` SSE 响应格式 | Vitest + MSW | 事件格式正确 |
| E2E | 完整对话 → 预览更新 | Playwright | 核心用户旅程 |
| AI 质量 | 字段提取准确率 | 人工抽检 | ≥ 80% |

---

## Boundaries

### Always
- 每次 commit 前运行 `pnpm type-check && pnpm lint`
- API 输入必须经过 Zod 校验
- UI 组件必须处理 loading、error、empty 三种状态
- 新增文件必须包含在 git commit 中

### Ask First
- 添加新的 npm 依赖
- 修改数据库 schema（migration）
- 修改 CI/CD 配置
- 更改已有的 API 响应格式

### Never
- 在代码中硬编码 API Key 或 Secret
- 跳过类型检查直接 push
- 删除或修改已有测试而不解释原因
- 在 client component 中直接访问 `process.env`（非 NEXT_PUBLIC_ 前缀）

---

## Open Questions

1. **DeepSeek API Key**：用户是否已获取？如未获取，mock 模式是否足够用于 Phase 2 验收？
2. **字段提取策略**：当前为流结束后独立调用。是否需要在流内实时提取以减少延迟？
3. **移动端 Tab 切换**：对话/预览 Tab 的默认选中状态是什么？新消息到达时是否需要自动切换？
