import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
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
      setPriority(task.priority || "medium");
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

  if (!isOpen || !task) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Tugas</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1.5">
            <Label>Judul Tugas</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Tugas..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="medium">Menengah</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
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
          </div>

          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi tugas..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Anggota</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Belum ada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Belum ada</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.profiles?.username}
                    </SelectItem>
                  ))}
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

          <div className="flex flex-col justify-end gap-2 pt-2 sm:flex-row sm:items-center">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
              >
                <Icon icon="lucide:trash-2" className="mr-2 h-4 w-4" />
                Hapus Tugas
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              <Icon icon="lucide:save" className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
