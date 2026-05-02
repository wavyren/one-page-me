"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  emailSignIn,
  emailSignUp,
  sendEmailOtp,
  verifyEmailOtp,
  syncAuthUser,
} from "@/lib/actions/auth";
import { AlertCircle, Mail, Lock, KeyRound } from "lucide-react";

type AuthMode = "login" | "register" | "otp";

export function EmailAuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setError("请输入邮箱");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError("邮箱格式不正确");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) return;

    setLoading(true);
    setError(null);

    const result = await sendEmailOtp(email);
    setLoading(false);

    if (!result.success) {
      setError(result.error?.message || "发送失败，请重试");
      return;
    }

    setOtpSent(true);
    setOtpCountdown(60);
    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateEmail(email)) return;

    if (mode === "login") {
      if (!password) {
        setError("请输入密码");
        return;
      }

      setLoading(true);
      const result = await emailSignIn(email, password);
      if (!result.success) {
        setLoading(false);
        setError(result.error?.message || "登录失败，请重试");
        return;
      }
    } else if (mode === "register") {
      if (!password) {
        setError("请输入密码");
        return;
      }
      if (password.length < 6) {
        setError("密码至少 6 位");
        return;
      }
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");
        return;
      }

      setLoading(true);
      const result = await emailSignUp(email, password);
      if (!result.success) {
        setLoading(false);
        setError(result.error?.message || "注册失败，请重试");
        return;
      }

      // Auto sign in after registration
      const signInResult = await emailSignIn(email, password);
      if (!signInResult.success) {
        setLoading(false);
        setError("注册成功，但自动登录失败，请手动登录");
        setMode("login");
        return;
      }
    } else if (mode === "otp") {
      if (!otp || otp.length !== 6) {
        setError("请输入 6 位验证码");
        return;
      }

      setLoading(true);
      const result = await verifyEmailOtp(email, otp);
      if (!result.success) {
        setLoading(false);
        setError(result.error?.message || "验证码错误，请重试");
        return;
      }
    }

    // Sync user and redirect
    const syncResult = await syncAuthUser();
    if (!syncResult.success) {
      setLoading(false);
      setError("登录成功，但用户信息同步失败");
      return;
    }

    window.location.href = "/chat";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const modeLabels: Record<AuthMode, string> = {
    login: "登录",
    register: "注册",
    otp: "验证码登录",
  };

  return (
    <div className="w-full space-y-4">
      {/* Mode tabs */}
      <div className="flex rounded-lg bg-muted p-1 gap-1">
        {(["login", "register", "otp"] as AuthMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === m
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={mode === m}
          >
            {m === "login" && "密码登录"}
            {m === "register" && "注册账号"}
            {m === "otp" && "验证码"}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="邮箱地址"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="邮箱"
            className="pl-9 h-10"
          />
        </div>

        {(mode === "login" || mode === "register") && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label="密码"
              className="pl-9 h-10"
            />
          </div>
        )}

        {mode === "register" && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label="确认密码"
              className="pl-9 h-10"
            />
          </div>
        )}

        {mode === "otp" && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                inputMode="numeric"
                placeholder="6 位验证码"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={handleKeyDown}
                disabled={loading}
                aria-label="验证码"
                className="pl-9 h-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-3 text-xs shrink-0"
              onClick={handleSendOtp}
              disabled={loading || otpCountdown > 0}
            >
              {otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? "重新发送" : "获取验证码"}
            </Button>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-10 bg-brand hover:bg-brand-dark text-white"
        >
          {loading
            ? "请稍候..."
            : mode === "register"
            ? "注册"
            : modeLabels[mode]}
        </Button>
      </div>
    </div>
  );
}
