import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
import { TaskDetailModal } from "./TaskDetailModal";
import Button from "#/components/ui/Button";
import Badge from "#/components/ui/Badge";
import type { TaskStatus } from "./constants/project";
import { PRIORITY } from "./constants/project";
import type { ProjectTask } from "./types/task";

export function ProjectTasks({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection & Details
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<ProjectTask | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

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

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
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
      console.error("Error toggling tasks done status:", err);
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
    const matchStatus = statusFilter ? task.status === statusFilter : true;
    const matchPriority = priorityFilter
      ? task.priority === priorityFilter
      : true;
    const matchAssignee = assigneeFilter
      ? task.assignee_id === assigneeFilter
      : true;
    return matchStatus && matchPriority && matchAssignee;
  });

  const assignees = Array.from(new Set(tasks.map((t) => t.assignee_id))).filter(
    (id): id is string => id !== null,
  );

  return (
    <div className="">
      {/* Action Bar (When Tasks Selected) */}
      {selectedTaskIds.size > 0 && (
        <div className="flex flex-col justify-between gap-2 border-b border-gray-200 py-4 md:flex-row md:items-center">
          <span className="text-sm font-medium text-emerald-800">
            {selectedTaskIds.size} tugas{selectedTaskIds.size > 1 ? "s" : ""}{" "}
            dipilih
          </span>

          <div className="flex flex-col gap-3 sm:flex-row">
            {(() => {
              const allDone = Array.from(selectedTaskIds).every(
                (id) => tasks.find((t) => t.id === id)?.status === "done",
              );
              return (
                <Button
                  variant="outline"
                  onClick={handleBulkToggleDone}
                  className=""
                >
                  {allDone ? (
                    <>
                      <Icon
                        icon="lucide:x-circle"
                        className="h-4 w-4 text-gray-500"
                      />
                      Tandai Belum Selesai
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="lucide:check-circle-2"
                        className="h-4 w-4 text-emerald-500"
                      />
                      Tandai Selesai
                    </>
                  )}
                </Button>
              );
            })()}

            <Button variant="danger" onClick={handleBulkDelete} className="">
              <Icon icon="lucide:trash-2" className="h-4 w-4" />
              Hapus Tugas
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 border-b border-gray-200 py-4 md:grid-cols-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">Berlangsung</option>
          <option value="review">Review</option>
          <option value="done">Selesai</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
        >
          <option value="">Semua Prioritas</option>
          <option value="high">Tinggi</option>
          <option value="medium">Menengah</option>
          <option value="low">Rendah</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
        >
          <option value="">Semua Anggota</option>
          {assignees.map((id) => {
            const user = tasks.find((t) => t.assignee_id === id)?.assignee;
            return (
              <option key={id} value={id}>
                {user?.username || "Tidak tersedia"}
              </option>
            );
          })}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-gray-200 text-xs font-medium text-gray-500">
            <tr>
              <th className="w-8 px-4 py-4 md:px-6"></th>
              <th className="px-4 py-4 md:px-6">Nama</th>
              <th className="px-4 py-4 md:px-6">Prioritas</th>
              <th className="px-4 py-4 md:px-6">Status</th>
              <th className="px-4 py-4 md:px-6">Ditugaskan</th>
              <th className="px-4 py-4 md:px-6">Tenggat</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-100">
                  <td className="px-4 py-4 md:px-6">
                    <div className="h-4 w-4 rounded bg-gray-200"></div>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <div className="h-4 w-16 rounded bg-gray-200"></div>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <div className="h-4 w-16 rounded bg-gray-200"></div>
                  </td>
                </tr>
              ))
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Tidak ada tugas.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === "done";
                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTaskForDetail(task)}
                    className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 ${isDone ? "bg-gray-50 opacity-75" : ""}`}
                  >
                    <td className="px-4 py-4 md:px-6">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => handleToggleTask(task.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td
                      className={`px-4 py-4 font-medium md:px-6 ${isDone ? "text-gray-500 line-through" : "text-gray-900"}`}
                    >
                      {task.title}
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <Badge variant={task.priority}>
                        {PRIORITY[task.priority]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(
                            task.id,
                            e.target.value as TaskStatus,
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        className={`-ml-1 cursor-pointer rounded border border-transparent bg-transparent p-1 text-sm hover:border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 ${isDone ? "text-gray-500" : "text-gray-900"}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">Berlangsung</option>
                        <option value="review">Review</option>
                        <option value="done">Selesai</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-center gap-2">
                        {task.assignee?.avatar_url ? (
                          <img
                            src={task.assignee.avatar_url}
                            alt=""
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                            <Icon
                              icon="lucide:user"
                              className="h-3 w-3 text-gray-400"
                            />
                          </div>
                        )}
                        <span>{task.assignee?.username || "Unassigned"}</span>
                      </div>
                    </td>
                    <td
                      className={`px-4 py-4 md:px-6 ${isDone ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
