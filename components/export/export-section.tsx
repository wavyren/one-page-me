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
import { QRCodePanel, MarkdownPanel } from "./export-panels";
import { PageData } from "@/lib/ai/page-generator";
import {
  Download,
  QrCode,
  FileText,
  ImageIcon,
  FileDown,
  ArrowRight,
  Link2,
  Check,
} from "lucide-react";
import { EmbedModal } from "@/components/share/embed-modal";

interface ExportSectionProps {
  pageId: string;
  extractedData: PageData;
}

type ExportTab = "qr" | "markdown" | null;

interface ExportOption {
  id: ExportTab | "image" | "pdf";
  icon: React.ReactNode;
  title: string;
  description: string;
  bgClass: string;
  iconClass: string;
  action: "tab" | "link";
}

export function ExportSection({ pageId, extractedData }: ExportSectionProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ExportTab>(null);
  const [copied, setCopied] = useState(false);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://one-page-me.vercel.app";
  const pageUrl = `${appUrl}/p/${pageId}`;

  const handleBack = () => setActiveTab(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const options: ExportOption[] = [
    {
      id: "qr",
      icon: <QrCode className="w-5 h-5" strokeWidth={1.8} />,
      title: "QR Code",
      description: "生成扫码分享图",
      bgClass: "bg-orange-50",
      iconClass: "text-orange-600",
      action: "tab",
    },
    {
      id: "markdown",
      icon: <FileText className="w-5 h-5" strokeWidth={1.8} />,
      title: "Markdown",
      description: "纯文本，适合导入其他平台",
      bgClass: "bg-emerald-50",
      iconClass: "text-emerald-600",
      action: "tab",
    },
    {
      id: "image",
      icon: <ImageIcon className="w-5 h-5" strokeWidth={1.8} />,
      title: "图片",
      description: "1080×1080 海报",
      bgClass: "bg-sky-50",
      iconClass: "text-sky-600",
      action: "link",
    },
    {
      id: "pdf",
      icon: <FileDown className="w-5 h-5" strokeWidth={1.8} />,
      title: "PDF",
      description: "高清打印版",
      bgClass: "bg-rose-50",
      iconClass: "text-rose-600",
      action: "link",
    },
  ];

  const handleOptionClick = (opt: ExportOption) => {
    if (opt.action === "tab" && (opt.id === "qr" || opt.id === "markdown")) {
      setActiveTab(opt.id);
    } else if (opt.action === "link") {
      window.open(`/p/${pageId}/export/${opt.id}`, "_blank");
    }
  };

  return (
    <section className="w-full py-12 px-4 bg-preview-bg border-t border-preview-border">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          导出你的主页
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          选择格式，分享给更多人
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {copied ? "已复制" : "复制链接"}
          </Button>

          <EmbedModal pageId={pageId} appUrl={appUrl} />

          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) setActiveTab(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-brand hover:bg-brand-dark text-white h-9">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </DialogTrigger>

          <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-5 pb-0">
              <DialogTitle className="text-base font-semibold">
                选择导出格式
              </DialogTitle>
            </DialogHeader>

            {activeTab === null ? (
              <div className="px-6 py-5 space-y-3">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg border border-border/80 bg-background hover:border-brand/30 hover:bg-stone-50/80 transition-all duration-150 group text-left"
                    aria-label={`导出 ${opt.title}`}
                  >
                    <div
                      className={`shrink-0 w-10 h-10 rounded-lg ${opt.bgClass} flex items-center justify-center ${opt.iconClass}`}
                    >
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground leading-tight">
                        {opt.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                        {opt.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-brand/60 transition-colors duration-150 shrink-0" />
                  </button>
                ))}
              </div>
            ) : activeTab === "qr" ? (
              <div className="px-6 py-5">
                <QRCodePanel
                  extractedData={extractedData}
                  pageUrl={pageUrl}
                  onBack={handleBack}
                />
              </div>
            ) : (
              <div className="px-6 py-5">
                <MarkdownPanel
                  extractedData={extractedData}
                  pageUrl={pageUrl}
                  onBack={handleBack}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </section>
  );
}
