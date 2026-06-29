// constants/project.ts

export const PROJECT_STATUS = {
  active: "Aktif",
  completed: "Selesai",
  "on-hold": "Ditunda",
  cancelled: "Dibatalkan",
} as const;

export const TASK_STATUS = {
  todo: "To do",
  "in-progress": "Berlangsung",
  review: "Review",
  done: "Selesai",
} as const;

export const PRIORITY = {
  high: "Tinggi",
  medium: "Menengah",
  low: "Rendah",
} as const;
