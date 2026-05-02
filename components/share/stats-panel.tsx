"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Link, Lock, Globe, ArrowUpRight, Check } from "lucide-react";

interface PageStat {
  id: string;
  customSlug: string | null;
  viewCount: number;
  todayCount: number;
  createdAt: string;
  isPublic: boolean;
}

interface StatsPanelProps {
  pages: PageStat[];
}

export function StatsPanel({ pages }: StatsPanelProps) {
  if (pages.length === 0) {
    return (
      <div className="bg-background rounded-xl border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          还没有生成主页，去聊天页创建一个吧
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">我的主页</h2>
      </div>
      <div className="divide-y divide-border">
        {pages.map((page) => (
          <PageStatItem key={page.id} page={page} />
        ))}
      </div>
    </div>
  );
}

function PageStatItem({ page }: { page: PageStat }) {
  const [copied, setCopied] = useState(false);
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://one-page-me.vercel.app";
  const pageUrl = page.customSlug
    ? `${appUrl}/p/${page.customSlug}`
    : `${appUrl}/p/${page.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {page.isPublic ? (
            <Globe className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {page.customSlug || page.id.slice(0, 8)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="w-3 h-3" />
          {page.viewCount}
          {page.todayCount > 0 && (
            <span className="text-brand ml-1">+{page.todayCount}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={pageUrl}
          readOnly
          className="h-8 text-xs bg-muted border-0"
          aria-label="主页链接"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 shrink-0"
          onClick={handleCopy}
          aria-label="复制链接"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Link className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 shrink-0"
          asChild
          aria-label="打开主页"
        >
          <a href={pageUrl} target="_blank" rel="noopener noreferrer">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
