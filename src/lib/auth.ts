import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

import { env } from "./env";

export const getServerSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = createServerClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return getCookie(name);
          },
          set(name: string, value: string, options: CookieOptions) {
            setCookie(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            setCookie(name, "", { ...options, maxAge: 0 });
          },
        },
      },
    );

    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session?.user) {
      return { session, profile: null };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("[getServerSession] Profile fetch failed:", error.message);
      return { session, profile: null };
    }

    return { session, profile };
  },
);
