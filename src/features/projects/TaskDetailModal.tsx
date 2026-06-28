import { Icon } from "@iconify/react";

type TaskDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: any; // Using any for simplicity here to match existing data structure, could be properly typed
  onDelete?: (taskId: string) => void;
};

export function TaskDetailModal({ isOpen, onClose, task, onDelete }: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 text-rose-600";
      case "medium":
        return "bg-blue-100 text-blue-600";
      case "low":
        return "bg-emerald-100 text-emerald-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "review":
        return "Review";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h3>
            <div className="flex items-center gap-3">
              <span className={`text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </span>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {getStatusText(task.status)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
              Description
            </h4>
            <div className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100 min-h-[100px]">
              {task.description || "No description provided."}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                Assignee
              </h4>
              <div className="flex items-center gap-3">
                {task.assignee?.avatar_url ? (
                  <img
                    src={task.assignee.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <Icon icon="lucide:user" className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {task.assignee?.username || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                Due Date
              </h4>
              <div className="flex items-center gap-2 text-gray-600">
                <Icon icon="lucide:calendar" className="w-5 h-5 text-gray-400" />
                <span>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "No due date"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex-shrink-0 flex justify-between bg-gray-50/50 rounded-b-xl">
          {onDelete ? (
            <button
              onClick={() => onDelete(task.id)}
              className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <Icon icon="lucide:trash-2" className="w-4 h-4" />
              Delete Task
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
