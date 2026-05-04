import { createBrowserClient } from "@supabase/ssr";

export function createClient(options?: { detectSessionInUrl?: boolean }) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        detectSessionInUrl: options?.detectSessionInUrl ?? true,
        autoRefreshToken: true,
        persistSession: true,
      },
    }
  );
}
