import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "#/components/layout/Sidebar";
import { getServerWorkspaces } from "#/lib/auth";

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

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar workspaces={workspaces} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
