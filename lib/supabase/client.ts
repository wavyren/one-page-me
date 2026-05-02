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
            return { name: name.trim(), value: rest.join("=") };
          });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieParts = [`${name}=${value}`];
            if (options) {
              Object.entries(options).forEach(([key, val]) => {
                if (val === true) {
                  cookieParts.push(key);
                } else if (val !== false && val !== undefined && val !== null) {
                  cookieParts.push(`${key}=${val}`);
                }
              });
            }
            document.cookie = cookieParts.join("; ");
          });
        },
      },
    }
  );
}
