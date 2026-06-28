import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const user = context.auth.user;

    // kalau sudah login, jangan bisa akses login/register
    if (user) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Outlet />
    </div>
  );
}
