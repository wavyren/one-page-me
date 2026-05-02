"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateMarkdown } from "@/lib/export/markdown-generator";
import { generateQRCodeDataUrl } from "@/lib/export/qrcode-generator";
import { PageData } from "@/lib/ai/page-generator";
import { Download, Copy, Check, AlertCircle, ArrowLeft } from "lucide-react";

interface PanelProps {
  extractedData: PageData;
  pageUrl: string;
  onBack: () => void;
}

export function QRCodePanel({ pageUrl, onBack }: PanelProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (qrCodeUrl || loading || error) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    generateQRCodeDataUrl(pageUrl)
      .then((url) => {
        if (!cancelled) setQrCodeUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("QR Code 生成失败，请重试");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageUrl, qrCodeUrl, loading, error]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = "qrcode.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="self-start -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        返回
      </Button>

      {error ? (
        <div
          className="flex items-center gap-2 text-red-600 text-sm px-4 py-3 bg-red-50 rounded-lg w-full"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : qrCodeUrl ? (
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-44 h-44 rounded-lg"
            />
          </div>
          <Button
            onClick={handleDownload}
            className="bg-brand hover:bg-brand-dark text-white w-full transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            下载 PNG
          </Button>
        </>
      ) : (
        <div
          className="w-44 h-44 bg-muted animate-pulse rounded-xl"
          aria-busy="true"
          aria-label="生成 QR Code 中"
        />
      )}
    </div>
  );
}

export function MarkdownPanel({ extractedData, onBack }: PanelProps) {
  const [copied, setCopied] = useState(false);
  const markdown = generateMarkdown(extractedData);

  const handleDownload = () => {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${extractedData.name || "page"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="self-start -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        返回
      </Button>

      <div className="bg-[#F8F8F8] rounded-xl border border-border overflow-hidden">
        <div className="px-3 py-2 bg-[#EEEEEE] border-b border-border flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <span className="text-[10px] text-muted-foreground ml-2 font-mono">
            {extractedData.name || "page"}.md
          </span>
        </div>
        <div className="p-4 max-h-56 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono text-[#333333] leading-relaxed">
            {markdown}
          </pre>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex-1 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              复制
            </>
          )}
        </Button>
        <Button
          onClick={handleDownload}
          className="flex-1 bg-brand hover:bg-brand-dark text-white transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          下载 .md
        </Button>
      </div>
    </div>
  );
}
