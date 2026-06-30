import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
import Button from "#/components/ui/Button";

type TaskDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onDelete?: (taskId: string) => void;
};

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onDelete,
}: TaskDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "Menengah");
      setStatus(task.status || "todo");
      setAssigneeId(task.assignee_id || "");
      setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    }
  }, [task]);

  useEffect(() => {
    if (!isOpen || !task?.project_id) return;
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("user_id, profiles(username, avatar_url)")
        .eq("project_id", task.project_id);
      if (!error) {
        setMembers(data);
      }
    };
    fetchMembers();
  }, [isOpen, task?.project_id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status,
          assignee_id: assigneeId || null,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
        })
        .eq("id", task.id);

      if (error) throw error;
      toast.success("Tugas berhasil diperbarui");
      window.dispatchEvent(new Event("refresh-tasks"));
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memperbarui tugas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/50 p-4">
      <div
        ref={modalRef}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-4 md:p-6">
          <h2 className="text-xl font-semibold">Detail Tugas</h2>

          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
          >
            <Icon icon="lucide:x" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-xs font-medium">
              Judul Tugas
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Prioritas
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="high">Tinggi</option>
                <option value="medium">Menengah</option>
                <option value="low">Rendah</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">Berlangsung</option>
                <option value="review">Review</option>
                <option value="done">Selesai</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="Deskripsi tugas..."
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            {/* Assignee */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Anggota
              </label>

              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Pilih Anggota --</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profiles?.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Tenggat
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-2 p-6 md:flex-row">
          {onDelete ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
              className=""
            >
              <Icon icon="lucide:trash-2" className="h-4 w-4" />
              Hapus Tugas
            </Button>
          ) : (
            <div></div>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            className=""
          >
            <Icon icon="lucide:save" className="h-4 w-4" />
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
