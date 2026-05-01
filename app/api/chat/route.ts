import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamChat, extractFields } from "@/lib/ai/deepseek";
import { SYSTEM_PROMPT_ZH, SYSTEM_PROMPT_EN } from "@/lib/ai/prompts";
import { chatInputSchema } from "@/lib/validations/chat";

const MOCK_STEPS = [
  {
    ai: "明白！求职主页的核心是让 HR 和面试官 3 秒内看到你的价值 💼\n\n先介绍一下你自己吧——你叫什么名字？目前在哪工作还是在读书？",
    extracted: { use_case: "job_seeking", is_ready: false },
    prev: 1,
    hint: "告诉小页你的名字和背景",
  },
  {
    ai: "晓雨你好！运营转产品是很顺畅的路径，你的数据感和用户感正是产品最需要的 ✨\n\n这3年里，有没有让你特别有成就感的项目？哪怕一个就够了。",
    extracted: {
      name: "李晓雨",
      use_case: "job_seeking",
      is_ready: false,
    },
    prev: 2,
    hint: "分享你最骄傲的一件事",
  },
  {
    ai: "哇，DAU 3个月从5万到18万——这个数据非常有说服力 🔥\n\n这背后你用了哪些方法？你现在主要会哪些工具或技能，比如数据分析、原型设计之类的？",
    extracted: {
      name: "李晓雨",
      use_case: "job_seeking",
      highlights: [
        "用户增长项目：3个月 DAU 5万→18万（+260%）",
        "独立主导社区产品从0到1，上线首月留存 62%",
      ],
      is_ready: false,
    },
    prev: 3,
    hint: "告诉小页你擅长什么",
  },
  {
    ai: "很全面！数据+用户+原型，产品经理的三板斧你都有了 💪\n\n最后——你希望别人用什么方式联系你？邮件、微信还是都放上去？",
    extracted: {
      name: "李晓雨",
      use_case: "job_seeking",
      highlights: [
        "用户增长项目：3个月 DAU 5万→18万（+260%）",
        "独立主导社区产品从0到1，上线首月留存 62%",
      ],
      skills: ["数据分析", "SQL · Python", "原型设计", "用户研究", "Axure"],
      is_ready: false,
    },
    prev: 4,
    hint: "最后一步：确认联系方式",
  },
  {
    ai: '好！我帮你整理一下所有信息：\n\n姓名：李晓雨\n方向：产品经理（运营转型）\n亮点：DAU 5万→18万 · 社区产品从0到1\n技能：数据分析 · 原型设计 · 用户研究\n联系：lixiaoyu@gmail.com\n\n信息很完整了，点"生成我的主页"吧 🎉',
    extracted: {
      name: "李晓雨",
      tagline: "用数据和用户洞察驱动产品增长",
      use_case: "job_seeking",
      highlights: [
        "用户增长：3个月 DAU 5万→18万（+260%）",
        "社区产品从0到1，首月留存率 62%",
        "3年全链路增长运营，熟悉完整产品流程",
      ],
      skills: ["数据分析", "SQL · Python", "原型设计", "用户研究", "Axure"],
      contact: { email: "lixiaoyu@gmail.com" },
      tone: "professional",
      language: "zh",
      is_ready: true,
    },
    prev: 5,
    hint: "点击生成你的主页",
  },
];

function jsonError(
  code: string,
  message: string,
  status: number,
  details?: unknown
) {
  return Response.json({ code, message, details }, { status });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_JSON", "请求体必须是有效的 JSON", 400);
  }

  const parseResult = chatInputSchema.safeParse(body);
  if (!parseResult.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "请求参数校验失败",
      400,
      parseResult.error.issues
    );
  }

  const { conversationId, message } = parseResult.data;

  const supabase = await createClient();

  // Save user message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: message,
  });

  // Get history
  const { data: historyMessages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const history =
    historyMessages?.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })) || [];

  const userMessageCount = history.filter((m) => m.role === "user").length;

  // Mock mode when no DEEPSEEK_API_KEY
  if (!process.env.DEEPSEEK_API_KEY) {
    const step =
      MOCK_STEPS[Math.min(userMessageCount - 1, MOCK_STEPS.length - 1)];
    return mockStreamResponse(step, conversationId, supabase);
  }

  // Real DeepSeek stream
  const systemPrompt =
    historyMessages && historyMessages.length > 0
      ? detectLanguage(historyMessages) === "en"
        ? SYSTEM_PROMPT_EN
        : SYSTEM_PROMPT_ZH
      : SYSTEM_PROMPT_ZH;

  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...history,
  ];

  const aiStream = await streamChat(apiMessages);

  const encoder = new TextEncoder();
  let fullContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of aiStream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            controller.enqueue(
              encoder.encode(
                `event: delta\ndata: ${JSON.stringify({ content })}\n\n`
              )
            );
          }
        }

        // Save AI message
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          role: "assistant",
          content: fullContent,
        });

        // Extract fields
        try {
          const extracted = await extractFields(apiMessages);
          if (extracted) {
            await supabase
              .from("conversations")
              .update({ extracted_data: extracted })
              .eq("id", conversationId);

            controller.enqueue(
              encoder.encode(
                `event: extracted\ndata: ${JSON.stringify(extracted)}\n\n`
              )
            );
          }
        } catch (e) {
          console.error("Field extraction failed:", e);
        }

        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function mockStreamResponse(
  step: (typeof MOCK_STEPS)[number],
  conversationId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const encoder = new TextEncoder();
  const chunks = step.ai.split("");

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(
          encoder.encode(
            `event: delta\ndata: ${JSON.stringify({ content: chunk })}\n\n`
          )
        );
        await new Promise((r) => setTimeout(r, 15));
      }

      // Save AI message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: step.ai,
      });

      // Update extracted data
      await supabase
        .from("conversations")
        .update({ extracted_data: step.extracted })
        .eq("id", conversationId);

      controller.enqueue(
        encoder.encode(
          `event: extracted\ndata: ${JSON.stringify(step.extracted)}\n\n`
        )
      );

      controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function detectLanguage(
  messages: { role: string; content: string }[]
): "zh" | "en" {
  const text = messages.map((m) => m.content).join(" ");
  const zhChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  return zhChars > text.length * 0.1 ? "zh" : "en";
}
