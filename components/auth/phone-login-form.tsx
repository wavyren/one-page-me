"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/actions/auth";
import { phoneSchema, otpSchema } from "@/lib/validations/auth";

export function PhoneLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setError("");
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0]?.message || "手机号格式不正确");
      return;
    }

    setIsLoading(true);
    const response = await sendPhoneOtp(result.data);
    setIsLoading(false);

    if (!response.success) {
      setError(response.error || "发送失败，请重试");
      return;
    }

    // Start countdown
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    setError("");
    const phoneResult = phoneSchema.safeParse(phone);
    const otpResult = otpSchema.safeParse(otp);

    if (!phoneResult.success) {
      setError(phoneResult.error.issues[0]?.message || "手机号格式不正确");
      return;
    }
    if (!otpResult.success) {
      setError(otpResult.error.issues[0]?.message || "验证码格式不正确");
      return;
    }

    setIsLoading(true);
    const response = await verifyPhoneOtp(phoneResult.data, otpResult.data);
    setIsLoading(false);

    if (!response.success) {
      setError(response.error || "验证失败，请重试");
      return;
    }

    router.push("/chat");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">登录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">手机号</Label>
          <div className="flex gap-2">
            <Input
              id="phone"
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendOtp}
              disabled={countdown > 0 || isLoading}
              variant="outline"
              className="shrink-0"
            >
              {countdown > 0 ? `${countdown}s` : "获取验证码"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp">验证码</Label>
          <Input
            id="otp"
            type="text"
            placeholder="请输入 6 位验证码"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          onClick={handleVerify}
          disabled={isLoading || !phone || !otp}
          className="w-full bg-brand hover:bg-brand-dark"
        >
          {isLoading ? "登录中..." : "登录"}
        </Button>
      </CardContent>
    </Card>
  );
}
