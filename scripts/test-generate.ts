/**
 * Test script for Phase 3 Increment 1
 * Run: npx tsx scripts/test-generate.ts
 */
import { loadEnvFile } from "node:process";

try {
  loadEnvFile(".env.local");
} catch {
  /* ignore if already loaded or missing */
}

import * as fs from "fs";
import * as path from "path";

const testData = {
  name: "李晓雨",
  tagline: "用数据和用户洞察驱动产品增长",
  bio: "3年全链路增长运营经验，擅长从0到1搭建用户增长体系。曾主导社区产品从0到1，首月留存率达62%。热爱用数据说话，相信好的产品是增长的前提。",
  skills: ["数据分析", "SQL · Python", "原型设计", "用户研究", "Axure"],
  highlights: [
    "用户增长：3个月 DAU 5万→18万（+260%）",
    "社区产品从0到1，首月留存率 62%",
    "3年全链路增长运营，熟悉完整产品流程",
  ],
  contact: { email: "lixiaoyu@example.com" },
  use_case: "job_seeking",
  tone: "professional",
  language: "zh",
};

async function main() {
  // Dynamic import to ensure env is loaded before module initialization
  const { generatePageHtml } = await import("../lib/ai/page-generator");

  console.log("🚀 Testing HTML generation...");
  console.log("API_KEY loaded:", !!process.env.DEEPSEEK_API_KEY);
  console.log("Input data:", JSON.stringify(testData, null, 2));

  try {
    const { html } = await generatePageHtml(testData);

    // Save to file
    const outputPath = path.join(__dirname, "test-output.html");
    fs.writeFileSync(outputPath, html, "utf-8");

    console.log("\n✅ HTML generated successfully!");
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`📏 HTML length: ${html.length} chars`);
    console.log(`🔖 Contains DOCTYPE: ${html.includes("<!DOCTYPE html>")}`);
    console.log(`🔖 Contains <html>: ${html.includes("<html")}`);
    console.log(`🔖 Contains <style>: ${html.includes("<style")}`);
    console.log(`🔖 Contains brand color: ${html.includes("#C9854A")}`);
    console.log("\n📝 Preview (first 500 chars):");
    console.log(html.slice(0, 500));
  } catch (error) {
    console.error("\n❌ Generation failed:", error);
    process.exit(1);
  }
}

main();
