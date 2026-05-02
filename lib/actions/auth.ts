"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

export async function emailSignUp(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: email.split("@")[0] },
    },
  });

  if (error) {
    return {
      success: false,
      error: { code: "SIGNUP_FAILED", message: error.message },
    };
  }

  return { success: true };
}

export async function emailSignIn(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: { code: "LOGIN_FAILED", message: error.message },
    };
  }

  return { success: true };
}

export async function sendEmailOtp(
  email: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      success: false,
      error: { code: "OTP_SEND_FAILED", message: error.message },
    };
  }

  return { success: true };
}

export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<ActionResult<{ user?: unknown }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
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
