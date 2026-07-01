import { useState, useEffect } from "react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bikin Tugas Baru</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <form
          id="create-task-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-1.5">
            <Label>Nama Tugas</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Perbaiki bug login"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Select value={priority} onValueChange={(value) => { if (value !== null) setPriority(value); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="medium">Menengah</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Penanggung Jawab</Label>
              <Select value={assigneeId} onValueChange={(value) => setAssigneeId(value ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Belum ada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Belum ada</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.username} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => { if (value !== null) setStatus(value); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">Berlangsung</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tenggat</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              <Icon
                icon="carbon:task-add"
                className="hidden h-4 w-4 sm:block"
              />
              {loading ? "Membuat..." : "Bikin Tugas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
