import type { PROJECT_STATUS } from "../constants/project";

type ProjectStatus = keyof typeof PROJECT_STATUS;

export type ProjectMember = {
  count: number;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  created_at: string;
  project_members?: ProjectMember[];
};
