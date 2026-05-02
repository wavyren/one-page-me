import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "请输入邮箱")
  .email("邮箱格式不正确");

export const passwordSchema = z
  .string()
  .min(6, "密码至少 6 位字符")
  .max(100, "密码最多 100 位字符");

export const otpSchema = z
  .string()
  .length(6, "验证码为 6 位数字")
  .regex(/^\d{6}$/, "验证码为 6 位数字");

export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
