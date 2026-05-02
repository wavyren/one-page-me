"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateEmbedCode } from "@/lib/export/embed-generator";
import { Code2, Copy, Check } from "lucide-react";

interface EmbedModalProps {
  pageId: string;
  appUrl: string;
}

export function EmbedModal({ pageId, appUrl }: EmbedModalProps) {
  const [copied, setCopied] = useState(false);
  const embedCode = generateEmbedCode({ pageId, appUrl });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          aria-label="嵌入代码"
        >
          <Code2 className="w-3.5 h-3.5" />
          嵌入
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            嵌入到网站
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            复制以下代码，粘贴到你的博客或网站 HTML 中即可嵌入主页。
          </p>

          <div className="bg-[#F8F8F8] rounded-xl border border-border overflow-hidden">
            <div className="px-3 py-2 bg-[#EEEEEE] border-b border-border flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                embed.html
              </span>
            </div>
            <div className="p-4 max-h-48 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono text-[#333333] leading-relaxed">
                {embedCode}
              </pre>
            </div>
          </div>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                复制嵌入代码
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
