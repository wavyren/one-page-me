import OpenAI from "openai";
import { EXTRACTION_PROMPT } from "./prompts";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "dummy-key",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
});

export async function streamChat(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  return client.chat.completions.create({
    model: "deepseek-chat",
    messages,
    stream: true,
  });
}

export async function extractFields(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  const completion = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      ...messages,
      {
        role: "user",
        content: EXTRACTION_PROMPT,
      },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
