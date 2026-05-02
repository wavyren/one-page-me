import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Page Me — 你的个人介绍主页",
  description: "通过 AI 对话，生成专属于你的精美个人介绍主页",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
