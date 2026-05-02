import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-preview-bg">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-sm mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI 对话生成
        </div>

        <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
          One Page Me
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          你的个人介绍主页生成器
        </p>
        <p className="text-sm text-muted-foreground/70 mb-10 max-w-sm mx-auto">
          跟 AI 聊聊天，自动生成精美的个人主页
          <br />
          适合求职、接单、社交分享
        </p>

        <Link href="/chat">
          <Button
            size="lg"
            className="bg-brand hover:bg-brand-dark text-white h-12 px-8 text-base gap-2"
          >
            开始创建
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
          <span>✓ 免费使用</span>
          <span>✓ 无需设计基础</span>
          <span>✓ 一键分享</span>
        </div>
      </div>
    </main>
  );
}
