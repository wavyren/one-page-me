import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (!document.cookie) {
            console.log("[SupabaseCookie] getAll: no cookies");
            return [];
          }
          const cookies = document.cookie
            .split(";")
            .map((cookie) => {
              const [name, ...rest] = cookie.split("=");
              return {
                name: name?.trim() || "",
                value: rest.join("=").trim(),
              };
            })
            .filter((c) => c.name);
          console.log("[SupabaseCookie] getAll:", cookies.map((c) => c.name));
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log(
            "[SupabaseCookie] setAll:",
            cookiesToSet.map((c) => c.name)
          );
          cookiesToSet.forEach(({ name, value, options }) => {
            if (!name) return;

            const cookieParts: string[] = [`${name}=${value}`];
            cookieParts.push("Path=/");

            if (options) {
              if (options.maxAge !== undefined && options.maxAge !== null)
                cookieParts.push(`Max-Age=${options.maxAge}`);
              if (options.expires)
                cookieParts.push(
                  `Expires=${
                    typeof options.expires === "number"
                      ? new Date(options.expires).toUTCString()
                      : options.expires.toUTCString()
                  }`
                );
              if (options.domain) cookieParts.push(`Domain=${options.domain}`);
              if (options.sameSite)
                cookieParts.push(`SameSite=${options.sameSite}`);
              if (options.secure) cookieParts.push("Secure");
              if (options.httpOnly) cookieParts.push("HttpOnly");
            }

            const cookieString = cookieParts.join("; ");
            console.log("[SupabaseCookie] setting:", cookieString);
            document.cookie = cookieString;
          });
        },
      },
      auth: {
        flowType: "pkce",
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    }
  );
}
