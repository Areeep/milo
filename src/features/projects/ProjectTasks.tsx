import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";

export function ProjectTasks({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [projectId]);

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo": return "To Do";
      case "in_progress": return "In Progress";
      case "review": return "Review";
      case "done": return "Done";
      default: return status;
    }
  };

  const assignees = Array.from(new Set(tasks.map(t => t.assignee_id))).filter(Boolean);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
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
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading tasks...</td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No tasks found.</td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between w-28 cursor-pointer">
                      <span>{getStatusText(task.status)}</span>
                      <Icon icon="lucide:chevron-down" className="w-4 h-4 text-gray-400" />
                    </div>
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
                  <td className="px-6 py-4 text-gray-500">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' }) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
