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

    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!user) {
      return { user: null, session, profile: null };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[getServerSession] Profile fetch failed:", error.message);
      return { user, session, profile: null };
    }

    return { user, session, profile };
  },
);

export const getServerWorkspaces = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
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

    const { data: memberWorkspaces } = await supabase
      .from("workspace_members")
      .select(`
        workspace_id,
        workspaces (
          id,
          name,
          avatar_url
        )
      `)
      .eq("user_id", userId);

    return (
      memberWorkspaces
        ?.map((w) => w.workspaces)
        .flat()
        .filter(Boolean) || []
    );
  });
