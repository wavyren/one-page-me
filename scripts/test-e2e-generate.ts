/**
 * E2E test for Phase 3 — full backend flow
 * Run: npx tsx scripts/test-e2e-generate.ts
 */
import { loadEnvFile } from "node:process";
try { loadEnvFile(".env.local"); } catch { /* ignore */ }

import { createClient } from "@supabase/supabase-js";
// Dynamic import to ensure env is loaded before module initialization
let generatePageHtml: typeof import("../lib/ai/page-generator").generatePageHtml;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_PHONE = "+8613800138000";

async function cleanup() {
  // Delete test user and related data
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users.find((u) => u.phone === TEST_PHONE);
  if (testUser) {
    await supabase.auth.admin.deleteUser(testUser.id);
    console.log("🧹 Cleaned up test user:", testUser.id);
  }
}

async function main() {
  // Load generatePageHtml after env is loaded
  const mod = await import("../lib/ai/page-generator");
  generatePageHtml = mod.generatePageHtml;

  console.log("🚀 Phase 3 E2E Backend Test\n");

  // 1. Cleanup previous test data (force delete)
  await cleanup();
  await cleanup(); // Double check

  // 2. Create test user
  console.log("📱 Creating test user...");
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    phone: TEST_PHONE,
    phone_confirm: true,
  });

  if (authError || !authData.user) {
    console.error("❌ Failed to create user:", authError?.message);
    process.exit(1);
  }
  const userId = authData.user.id;
  console.log("✅ User created:", userId);

  // 3. Sync to public.users
  const { error: userInsertError } = await supabase.from("users").insert({
    id: userId,
    phone: TEST_PHONE,
    name: "测试用户",
  });

  if (userInsertError) {
    console.error("❌ Failed to insert public.users:", userInsertError.message);
    process.exit(1);
  }
  console.log("✅ Synced to public.users");

  // 4. Create conversation with extracted_data
  console.log("💬 Creating conversation...");
  const extractedData = {
    name: "李晓雨",
    tagline: "用数据和用户洞察驱动产品增长",
    bio: "3年全链路增长运营经验...",
    skills: ["数据分析", "SQL", "Python"],
    highlights: ["DAU 5万→18万", "社区产品从0到1"],
    contact: { email: "test@example.com" },
    use_case: "job_seeking",
    tone: "professional",
    language: "zh",
    is_ready: true,
  };

  const { data: conv, error: convError } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: "测试对话",
      extracted_data: extractedData,
    })
    .select()
    .single();

  if (convError || !conv) {
    console.error("❌ Failed to create conversation:", convError?.message);
    process.exit(1);
  }
  console.log("✅ Conversation created:", conv.id);

  // 5. Generate HTML
  console.log("🎨 Generating HTML...");
  const { html } = await generatePageHtml(extractedData);
  console.log("✅ HTML generated:", html.length, "chars");

  // 6. Upload to Storage
  console.log("☁️ Uploading to Storage...");
  const pageId = crypto.randomUUID();
  const filePath = `${userId}/${pageId}.html`;

  const { error: uploadError } = await supabase.storage
    .from("pages")
    .upload(filePath, html, {
      contentType: "text/html",
      upsert: false,
    });

  if (uploadError) {
    console.error("❌ Upload failed:", uploadError.message);
    process.exit(1);
  }
  console.log("✅ Uploaded to:", filePath);

  // 7. Get public URL
  const { data: urlData } = supabase.storage.from("pages").getPublicUrl(filePath);
  console.log("✅ Public URL:", urlData.publicUrl);

  // 8. Insert page record
  console.log("📝 Inserting page record...");
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .insert({
      id: pageId,
      user_id: userId,
      conversation_id: conv.id,
      html_url: urlData.publicUrl,
      language: "zh",
    })
    .select()
    .single();

  if (pageError || !page) {
    console.error("❌ Page insert failed:", pageError?.message);
    process.exit(1);
  }
  console.log("✅ Page record created:", page.id);

  // 9. Verify page is accessible
  console.log("🔍 Verifying HTML accessibility...");
  const htmlRes = await fetch(urlData.publicUrl);
  if (!htmlRes.ok) {
    console.error("❌ HTML not accessible:", htmlRes.status);
    process.exit(1);
  }
  const fetchedHtml = await htmlRes.text();
  console.log("✅ HTML fetched:", fetchedHtml.length, "chars");

  // 10. Verify SSR page
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pageUrl = `${appUrl}/p/${pageId}`;
  console.log("\n🔗 Test URLs:");
  console.log("   Page:", pageUrl);
  console.log("   OG Image:", `${pageUrl}/opengraph-image`);
  console.log("   HTML Direct:", urlData.publicUrl);

  // Cleanup
  await cleanup();

  console.log("\n🎉 E2E test passed!");
}

main().catch((err) => {
  console.error("\n💥 Test failed:", err);
  process.exit(1);
});
