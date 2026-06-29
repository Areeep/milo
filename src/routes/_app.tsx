import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { Sidebar } from "#/components/layout/Sidebar";
import { Header } from "#/components/layout/Header";
import { getServerWorkspaces } from "#/lib/auth";
import { useState, useEffect } from "react";
import { WorkspaceProvider } from "#/contexts/WorkspaceContext";
import { supabase } from "#/lib/supabase";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async ({ context }) => {
    // Fetch all workspaces where the user is a member
    const workspaces = await getServerWorkspaces({
      data: context.auth.user!.id,
    });

    return {
      workspaces,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaces } = Route.useLoaderData();
  const { auth } = Route.useRouteContext();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth.user) return;

    const channel = supabase
      .channel("workspace_invites")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workspace_members",
          filter: `user_id=eq.${auth.user.id}`,
        },
        () => {
          // When invited, invalidate router to refetch workspaces
          router.invalidate();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auth.user, router]);

  return (
    <WorkspaceProvider workspaces={workspaces}>
      <div className="relative flex h-screen w-full overflow-hidden bg-white">
        <Sidebar
          workspaces={workspaces}
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto px-5 py-10 md:px-12 lg:px-24">
            <Outlet />
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
