import type { PRIORITY, TASK_STATUS } from "../constants/project";

export type Task = {
  task_id: string;
  title: string;
  priority: keyof typeof PRIORITY;
};

export type TaskListCardProps = {
  title: string;
  icon: string;
  iconColor?: string;
  count: number;
  tasks: Task[];
  badgeBg: string;
  badgeColor: string;
  emptyText?: string;
};

export type RecentTask = {
  id: string;
  title: string;
  priority: keyof typeof PRIORITY;
  status: keyof typeof TASK_STATUS;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};
