import { cva  } from "class-variance-authority";
import type {VariantProps} from "class-variance-authority";
import { cn } from "#/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        // Project status
        active: "bg-blue-500/20 text-blue-400",
        completed: "bg-blue-100 text-blue-700",
        "on-hold": "bg-orange-100 text-orange-700",
        cancelled: "bg-rose-100 text-rose-700",
        // Priority
        high: "bg-rose-100 text-rose-700",
        medium: "bg-yellow-100 text-yellow-700",
        low: "bg-muted text-muted-foreground",
        // Task status
        todo: "bg-gray-100 text-gray-700",
        "in-progress": "bg-blue-100 text-blue-700",
        review: "bg-violet-100 text-violet-700",
        done: "bg-emerald-500/20 text-emerald-400",
      },
    },
  },
);

type ProjectStatus = "active" | "completed" | "on-hold" | "cancelled";
type TaskStatus = "todo" | "in-progress" | "review" | "done";
type Priority = "high" | "medium" | "low";

type BadgeProps = {
  variant: ProjectStatus | TaskStatus | Priority;
  className?: string;
  children: React.ReactNode;
};

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}
