import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-preview-bg p-4" aria-label="登录页面">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand">One Page Me</h1>
        <p className="mt-2 text-muted-foreground">登录后开始创建你的个人主页</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <PhoneLoginForm />
        <OAuthButtons />
      </div>
    </main>
  );
}
