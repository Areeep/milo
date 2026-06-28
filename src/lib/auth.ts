import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';
import { createServerClient } from '@supabase/ssr';
import { env } from './env';

export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return getCookie(name);
      },
      set(name: string, value: string, options: any) {
        setCookie(name, value, options);
      },
      remove(name: string, options: any) {
        setCookie(name, "", { ...options, maxAge: 0 });
      }
    }
  });

  const { data } = await supabase.auth.getSession();
  return data.session;
});
