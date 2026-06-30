import type { PRIORITY, TASK_STATUS } from "../constants/project";

export type TaskStatus = keyof typeof TASK_STATUS;

export type Task = {
  task_id: string;
  title: string;
  priority: keyof typeof PRIORITY;
};

export type ProjectTask = {
  id: string;
  title: string;
  priority: keyof typeof PRIORITY;
  status: TaskStatus;
  assignee_id: string | null;
  due_date: string | null;
  assignee: {
    username: string | null;
    avatar_url: string | null;
  } | null;
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
