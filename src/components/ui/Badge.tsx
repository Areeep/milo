type ProjectStatus = "active" | "completed" | "on-hold" | "cancelled";

type TaskStatus = "todo" | "in-progress" | "review" | "done";

type Priority = "high" | "medium" | "low";

type BadgeProps = {
  variant: ProjectStatus | TaskStatus | Priority;
  children: React.ReactNode;
};

const variants = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  "on-hold": "bg-orange-100 text-orange-700",
  cancelled: "bg-rose-100 text-rose-700",

  high: "bg-rose-100 text-rose-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-emerald-100 text-emerald-700",

  todo: "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-violet-100 text-violet-700",
  done: "bg-emerald-100 text-emerald-700",
} as const;

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
