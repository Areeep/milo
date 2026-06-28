import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
import { TaskDetailModal } from "./TaskDetailModal";

export function ProjectTasks({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection & Details
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<any | null>(null);

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
    window.addEventListener('refresh-tasks', handleRefresh);
    return () => window.removeEventListener('refresh-tasks', handleRefresh);
  }, [projectId]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
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
      const allDone = ids.every(id => tasks.find(t => t.id === id)?.status === "done");
      const newStatus = allDone ? "todo" : "done";

      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .in("id", ids);

      if (error) throw error;
      setTasks(tasks.map(t => selectedTaskIds.has(t.id) ? { ...t, status: newStatus } : t));
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
      const { error } = await supabase
        .from("tasks")
        .delete()
        .in("id", ids);

      if (error) throw error;
      setTasks(tasks.filter(t => !selectedTaskIds.has(t.id)));
      setSelectedTaskIds(new Set());
      toast.success("Tugas berhasil dihapus");
    } catch (err: any) {
      console.error("Error deleting tasks:", err);
      toast.error(err.message || "Gagal menghapus tugas");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchStatus = statusFilter ? task.status === statusFilter : true;
    const matchPriority = priorityFilter ? task.priority === priorityFilter : true;
    const matchAssignee = assigneeFilter ? task.assignee_id === assigneeFilter : true;
    return matchStatus && matchPriority && matchAssignee;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-rose-100 text-rose-600";
      case "medium": return "bg-blue-100 text-blue-600";
      case "low": return "bg-emerald-100 text-emerald-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const assignees = Array.from(new Set(tasks.map(t => t.assignee_id))).filter(Boolean);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Action Bar (When Tasks Selected) */}
      {selectedTaskIds.size > 0 && (
        <div className="bg-blue-50/50 p-4 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-3">
            {(() => {
              const allDone = Array.from(selectedTaskIds).every(id => tasks.find(t => t.id === id)?.status === "done");
              return (
                <button
                  onClick={handleBulkToggleDone}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {allDone ? (
                    <>
                      <Icon icon="lucide:x-circle" className="w-4 h-4 text-gray-500" />
                      Tandai Belum Selesai
                    </>
                  ) : (
                    <>
                      <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-emerald-500" />
                      Tandai Selesai
                    </>
                  )}
                </button>
              );
            })()}
            <button
              onClick={handleBulkDelete}
              className="bg-white border border-gray-300 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Icon icon="lucide:trash-2" className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex gap-4">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select 
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Assignees</option>
          {assignees.map((id) => {
            const user = tasks.find(t => t.assignee_id === id)?.assignee;
            return <option key={id} value={id}>{user?.username || "Unknown"}</option>;
          })}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-8"></th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assignee</th>
              <th className="px-6 py-4">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  <td className="px-6 py-4"><div className="w-4 h-4 rounded bg-gray-200"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                </tr>
              ))
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No tasks found.</td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === "done";
                return (
                  <tr 
                    key={task.id} 
                    onClick={() => setSelectedTaskForDetail(task)}
                    className={`border-b border-gray-100 transition-colors cursor-pointer hover:bg-gray-50 ${isDone ? 'bg-gray-50 opacity-75' : ''}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => handleToggleTask(task.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className={`px-6 py-4 font-medium ${isDone ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{task.title}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-sm bg-transparent border border-transparent hover:border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer p-1 -ml-1 ${isDone ? 'text-gray-500' : 'text-gray-900'}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {task.assignee?.avatar_url ? (
                        <img src={task.assignee.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <Icon icon="lucide:user" className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span>{task.assignee?.username || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' }) : "-"}
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
            const { error } = await supabase.from("tasks").delete().eq("id", taskId);
            if (error) throw error;
            setTasks(tasks.filter(t => t.id !== taskId));
            setSelectedTaskForDetail(null);
          } catch (err) {
            console.error(err);
          }
        }}
      />
    </div>
  );
}
