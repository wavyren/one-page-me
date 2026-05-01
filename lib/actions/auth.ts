"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

const MOCK_OTP_ENABLED = process.env.MOCK_OTP_ENABLED === "true";
const MOCK_OTP_CODE = process.env.MOCK_OTP_CODE || "123456";

export interface ActionError {
  code: string;
  message: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ActionError;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function sendPhoneOtp(
  phone: string
): Promise<ActionResult<{ mock?: boolean; mockCode?: string }>> {
  if (MOCK_OTP_ENABLED) {
    return { success: true, data: { mock: true, mockCode: MOCK_OTP_CODE } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) {
    return {
      success: false,
      error: { code: "OTP_SEND_FAILED", message: error.message },
    };
  }

  return { success: true };
}

export async function verifyPhoneOtp(
  phone: string,
  token: string
): Promise<ActionResult<{ user?: unknown }>> {
  if (MOCK_OTP_ENABLED && token === MOCK_OTP_CODE) {
    const admin = createAdminClient();

    const { data: listData, error: listError } =
      await admin.auth.admin.listUsers();
    if (listError) {
      return {
        success: false,
        error: { code: "OTP_VERIFY_FAILED", message: listError.message },
      };
    }

    const existingUser = listData.users.find((u) => u.phone === phone);

    if (existingUser) {
      const { error: updateError } = await admin.auth.admin.updateUserById(
        existingUser.id,
        { password: MOCK_OTP_CODE }
      );
      if (updateError) {
        return {
          success: false,
          error: { code: "OTP_VERIFY_FAILED", message: updateError.message },
        };
      }
    } else {
      const { error: createError } = await admin.auth.admin.createUser({
        phone,
        phone_confirm: true,
        password: MOCK_OTP_CODE,
      });
      if (createError) {
        return {
          success: false,
          error: { code: "OTP_VERIFY_FAILED", message: createError.message },
        };
      }
    }

    const supabase = await createClient();
    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        phone,
        password: MOCK_OTP_CODE,
      });

    if (signInError) {
      return {
        success: false,
        error: { code: "OTP_VERIFY_FAILED", message: signInError.message },
      };
    }

    return { success: true, data: { user: data.user } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    return {
      success: false,
      error: { code: "OTP_VERIFY_FAILED", message: error.message },
    };
  }

  return { success: true, data: { user: data.user } };
}

export async function syncAuthUser(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: { code: "AUTH_NOT_FOUND", message: authError?.message || "未登录" },
    };
  }

  const name =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.user_name ||
    null;

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, name")
    .eq("id", user.id)
    .single();

  if (existingUser) {
    const { error: updateError } = await supabase
      .from("users")
      .update({
        phone: user.phone,
        email: user.email,
        name: name || existingUser.name,
      })
      .eq("id", user.id);

    if (updateError) {
      return {
        success: false,
        error: { code: "USER_SYNC_FAILED", message: updateError.message },
      };
    }
  } else {
    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      phone: user.phone,
      email: user.email,
      name,
      preferred_language: "zh",
    });

    if (insertError) {
      return {
        success: false,
        error: { code: "USER_SYNC_FAILED", message: insertError.message },
      };
    }
  }

  return { success: true };
}
