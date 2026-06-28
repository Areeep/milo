import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "#/lib/supabase";

import { getServerSession } from "#/lib/auth";

export type Profile = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
};

export type AuthContext = {
  auth: {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
  };
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Milo",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,

  context: (): AuthContext => ({
    auth: {
      user: null,
      session: null,
      profile: null,
    },
  }),

  beforeLoad: async () => {
    const { session, profile } = await getServerSession();
    return {
      auth: {
        user: session?.user ?? null,
        session: session ?? null,
        profile: profile ?? null,
      },
    };
  },

  notFoundComponent: () => (
    <div className="flex h-screen items-center justify-center">
      <h1>404 - Halaman tidak ditemukan</h1>
    </div>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
