import { createFileRoute } from "@tanstack/react-router";
import { Projects } from "#/features/projects/Projects";
import { useWorkspace } from "#/contexts/WorkspaceContext";

export const Route = createFileRoute("/_app/projects/")({
  component: Projects,
});
