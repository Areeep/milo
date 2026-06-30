import { useState, useEffect } from "react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import Button from "#/components/ui/Button";

type ProjectMember = {
  id: string;
  email: string;
  username: string;
};

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  onTaskCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onTaskCreated: () => void;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchMembers = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("project_members")
          .select("user_id, profiles(email, username)")
          .eq("project_id", projectId);

        if (fetchError) throw fetchError;

        const formatted = data.map((m: any) => ({
          id: m.user_id,
          email: m.profiles?.email,
          username: m.profiles?.username,
        }));
        setMembers(formatted);
      } catch (err) {
        console.error("Error fetching project members:", err);
      }
    };

    fetchMembers();
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("tasks").insert({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        assignee_id: assigneeId || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });

      if (insertError) throw insertError;

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("todo");
      setAssigneeId("");
      setDueDate("");

      onTaskCreated();
      onClose();
      toast.success("Tugas berhasil dibuat");

      // Navigate to tasks page
      navigate({ to: "/projects/$projectId/tasks", params: { projectId } });
    } catch (err: any) {
      console.error("Error creating task:", err);
      setError(err.message || "Failed to create task.");
      toast.error(err.message || "Gagal membuat tugas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex shrink-0 justify-between border-b border-gray-100 p-4 md:p-6">
          <h2 className="text-xl font-semibold">Bikin Tugas Baru</h2>

          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
          >
            <Icon icon="lucide:x" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            id="create-task-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-xs font-medium">
                Nama Tugas
              </label>

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Perbaiki bug login"
                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium">
                Deskripsi
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task"
                className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Note: Type dropdown is intentionally omitted based on previous DB schema decisions */}

              <div>
                <label className="mb-2 block text-xs font-medium">
                  Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Menengah</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium">
                  Penanggung Jawab
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Belum ada</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.username} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">Berlangsung</option>
                  <option value="review">Review</option>
                  <option value="done">Selesai</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium">
                  Tenggat
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-4 md:p-6">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
          >
            Batal
          </Button>

          <Button
            variant="primary"
            type="submit"
            form="create-task-form"
            disabled={loading}
            className="flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            <Icon icon="carbon:task-add" className="hidden h-4 w-4 sm:block" />
            {loading ? "Membuat..." : "Bikin Tugas"}
          </Button>
        </div>
      </div>
    </div>
  );
}
