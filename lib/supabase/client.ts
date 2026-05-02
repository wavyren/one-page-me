import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie.split(";").map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            return { name: name?.trim() || "", value: rest.join("=").trim() };
          });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (!name) return;
            let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

            if (options) {
              if (options.path) cookie += `; Path=${options.path}`;
              if (options.maxAge !== undefined && options.maxAge !== null)
                cookie += `; Max-Age=${options.maxAge}`;
              if (options.expires)
                cookie += `; Expires=${
                  typeof options.expires === "number"
                    ? new Date(options.expires).toUTCString()
                    : options.expires.toUTCString()
                }`;
              if (options.domain) cookie += `; Domain=${options.domain}`;
              if (options.sameSite)
                cookie += `; SameSite=${options.sameSite}`;
              if (options.secure) cookie += `; Secure`;
              if (options.httpOnly) cookie += `; HttpOnly`;
            }

            document.cookie = cookie;
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
