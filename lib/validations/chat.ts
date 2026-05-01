import { z } from "zod";

export const chatInputSchema = z.object({
  conversationId: z
    .string()
    .min(1, "conversationId 不能为空")
    .uuid("conversationId 必须是有效的 UUID"),
  message: z
    .string()
    .min(1, "消息不能为空")
    .max(2000, "消息长度不能超过 2000 字符"),
});

export type ChatInput = z.infer<typeof chatInputSchema>;
