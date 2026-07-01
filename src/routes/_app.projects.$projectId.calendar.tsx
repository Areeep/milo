import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/projects/$projectId/calendar")({
  component: () => <div className="p-8">Halaman Kalender</div>,
});
