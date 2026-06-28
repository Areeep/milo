import Dashboard from "#/features/dashboard/Dashboard";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: Dashboard,
});
