import { useState, useEffect } from "react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";

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
  const [priority, setPriority] = useState("Menengah");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState("Belum");
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
      setPriority("Menengah");
      setStatus("Belum");
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
        <div className="shrink-0 border-b border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900">Bikin Tugas Baru</h2>
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nama Tugas"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task"
                className="w-full resize-none rounded-md border border-gray-300 px-4 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Note: Type dropdown is intentionally omitted based on previous DB schema decisions */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Penanggung Jawab
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500"
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
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Belum">Belum</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Menunggu Review">Menunggu Review</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tenggat
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex shrink-0 justify-end gap-3 rounded-b-xl border-t border-gray-100 bg-gray-50/50 p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Batal
          </button>
          <button
            type="submit"
            form="create-task-form"
            disabled={loading}
            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            {loading ? "Membuat..." : "Bikin Tugas"}
          </button>
        </div>
      </div>
    </div>
  );
}
