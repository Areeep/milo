import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
import { TaskDetailModal } from "./TaskDetailModal";
import { Button } from "#/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { cn } from "#/lib/utils";

export function ProjectTasks({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection & Details
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<
    any | null
  >(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*, assignee:profiles(username, avatar_url)")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchTasks();

    const handleRefresh = () => fetchTasks();
    window.addEventListener("refresh-tasks", handleRefresh);
    return () => window.removeEventListener("refresh-tasks", handleRefresh);
  }, [projectId]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
      toast.success("Status tugas diperbarui");
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Gagal memperbarui status");
    }
  };

  const handleToggleTask = (taskId: string) => {
    const newSet = new Set(selectedTaskIds);
    if (newSet.has(taskId)) newSet.delete(taskId);
    else newSet.add(taskId);
    setSelectedTaskIds(newSet);
  };

  const handleBulkToggleDone = async () => {
    try {
      const ids = Array.from(selectedTaskIds);
      const allDone = ids.every(
        (id) => tasks.find((t) => t.id === id)?.status === "done",
      );
      const newStatus = allDone ? "todo" : "done";

      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .in("id", ids);

      if (error) throw error;
      setTasks(
        tasks.map((t) =>
          selectedTaskIds.has(t.id) ? { ...t, status: newStatus } : t,
        ),
      );
      setSelectedTaskIds(new Set());
      toast.success("Status tugas diperbarui");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedTaskIds);
      const { error } = await supabase.from("tasks").delete().in("id", ids);

      if (error) throw error;
      setTasks(tasks.filter((t) => !selectedTaskIds.has(t.id)));
      setSelectedTaskIds(new Set());
      toast.success("Tugas berhasil dihapus");
    } catch (err: any) {
      console.error("Error deleting tasks:", err);
      toast.error(err.message || "Gagal menghapus tugas");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchStatus =
      statusFilter && statusFilter !== "all"
        ? task.status === statusFilter
        : true;
    const matchPriority =
      priorityFilter && priorityFilter !== "all"
        ? task.priority === priorityFilter
        : true;
    const matchAssignee =
      assigneeFilter && assigneeFilter !== "all"
        ? task.assignee_id === assigneeFilter
        : true;
    return matchStatus && matchPriority && matchAssignee;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 text-rose-600";
      case "medium":
        return "bg-blue-100 text-blue-600";
      case "low":
        return "bg-emerald-500/20 text-emerald-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const assignees = Array.from(new Set(tasks.map((t) => t.assignee_id))).filter(
    Boolean,
  );

  return (
    <div className="border-border bg-card rounded-lg border">
      {/* Action Bar (When Tasks Selected) */}
      {selectedTaskIds.size > 0 && (
        <div className="border-border bg-muted/30 flex items-center justify-between border-b p-4">
          <span className="text-foreground text-sm font-medium">
            {selectedTaskIds.size} task
            {selectedTaskIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-3">
            {(() => {
              const allDone = Array.from(selectedTaskIds).every(
                (id) => tasks.find((t) => t.id === id)?.status === "done",
              );
              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkToggleDone}
                >
                  {allDone ? (
                    <>
                      <Icon
                        icon="lucide:x-circle"
                        className="text-muted-foreground mr-2 h-4 w-4"
                      />
                      Tandai Belum Selesai
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="lucide:check-circle-2"
                        className="mr-2 h-4 w-4 text-white"
                      />
                      Tandai Selesai
                    </>
                  )}
                </Button>
              );
            })()}
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Icon icon="lucide:trash-2" className="mr-2 h-4 w-4" />
              Hapus
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="border-border flex flex-wrap gap-3 border-b p-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assignees.map((id) => {
              const user = tasks.find((t) => t.assignee_id === id)?.assignee;
              return (
                <SelectItem key={id} value={id}>
                  {user?.username || "Unknown"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <phantom-ui loading={true} count={5} count-gap="0px">
                <TableRow>
                  <TableCell>
                    <div className="bg-muted h-4 w-4 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted h-4 w-3/4 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted h-4 w-16 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted h-4 w-20 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted h-4 w-24 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted h-4 w-16 rounded" />
                  </TableCell>
                </TableRow>
              </phantom-ui>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground px-6 py-8 text-center"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === "done";
                return (
                  <TableRow
                    key={task.id}
                    onClick={() => setSelectedTaskForDetail(task)}
                    className={cn("cursor-pointer", isDone && "opacity-75")}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => handleToggleTask(task.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="border-input text-primary h-4 w-4 cursor-pointer rounded"
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-medium",
                        isDone
                          ? "text-muted-foreground line-through"
                          : "text-foreground",
                      )}
                    >
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-sm px-2 py-1 text-[10px] font-bold tracking-wider uppercase",
                          getPriorityColor(task.priority),
                        )}
                      >
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "hover:border-border focus:ring-ring focus:border-ring -ml-1 cursor-pointer rounded border border-transparent bg-transparent p-1 text-sm outline-none focus:ring-2",
                          isDone ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {task.assignee?.avatar_url ? (
                          <img
                            src={task.assignee.avatar_url}
                            alt=""
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="bg-muted border-border flex h-6 w-6 items-center justify-center rounded-full border">
                            <Icon
                              icon="lucide:user"
                              className="text-muted-foreground h-3 w-3"
                            />
                          </div>
                        )}
                        <span className="text-foreground text-sm">
                          {task.assignee?.username || "Unassigned"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={
                        isDone
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TaskDetailModal
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        task={selectedTaskForDetail}
        onDelete={async (taskId) => {
          try {
            const { error } = await supabase
              .from("tasks")
              .delete()
              .eq("id", taskId);
            if (error) throw error;
            setTasks(tasks.filter((t) => t.id !== taskId));
            setSelectedTaskForDetail(null);
          } catch (err) {
            console.error(err);
          }
        }}
      />
    </div>
  );
}
