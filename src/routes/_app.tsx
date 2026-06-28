import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "#/components/layout/Sidebar";
import { Header } from "#/components/layout/Header";
import { getServerWorkspaces } from "#/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async ({ context }) => {
    // Fetch all workspaces where the user is a member
    const workspaces = await getServerWorkspaces({ data: context.auth.user!.id });

    return {
      workspaces,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaces } = Route.useLoaderData();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      <Sidebar 
        workspaces={workspaces} 
        isOpen={isMobileSidebarOpen} 
        setIsOpen={setIsMobileSidebarOpen} 
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
