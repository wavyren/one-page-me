import { z } from "zod";

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+86${cleaned}`;
}

export const phoneSchema = z
  .string()
  .min(1, "请输入手机号")
  .transform((val: string) => normalizePhone(val))
  .refine(
    (val: string) => /^\+\d{10,15}$/.test(val),
    "手机号格式不正确"
  );

export const otpSchema = z
  .string()
  .length(6, "验证码为 6 位数字")
  .regex(/^\d{6}$/, "验证码为 6 位数字");

export type PhoneInput = z.infer<typeof phoneSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
