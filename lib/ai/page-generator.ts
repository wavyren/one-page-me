import OpenAI from "openai";
import { HTML_GENERATION_PROMPT } from "./prompts";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "dummy-key",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
});

export interface PageData {
  name?: string | null;
  tagline?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  highlights?: string[] | null;
  contact?: { email?: string; wechat?: string; phone?: string } | null;
  use_case?: string | null;
  tone?: string | null;
  language?: string | null;
}

export interface GeneratePageResult {
  html: string;
}

export async function generatePageHtml(data: PageData): Promise<GeneratePageResult> {
  const prompt = HTML_GENERATION_PROMPT.replace("{data}", JSON.stringify(data, null, 2));

  const completion = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          "You are an expert frontend developer. Generate clean, semantic, responsive HTML with inline CSS. Never use external resources. Output raw HTML only, no markdown formatting.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty content");
  }

  // Clean up markdown code block if present
  let html = content.trim();
  if (html.startsWith("```html")) {
    html = html.slice(7).trim();
  }
  if (html.startsWith("```")) {
    html = html.slice(3).trim();
  }
  if (html.endsWith("```")) {
    html = html.slice(0, -3).trim();
  }

  // Validate it's actual HTML
  if (!html.includes("<!DOCTYPE html>") && !html.includes("<html")) {
    throw new Error("AI output is not valid HTML");
  }

  return { html };
}
