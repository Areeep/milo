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
  DialogDescription,
} from "#/components/ui/dialog";

type Profile = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
};

export function CreateProjectModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  onProjectCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string | null;
  workspaceName: string;
  onProjectCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Profile[]>([]);

  // Form State
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [priority, setPriority] = useState("medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectLeadId, setProjectLeadId] = useState("");
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>(
    [],
  );

  // Fetch workspace members when modal opens
  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select(
          "user_id, role, profiles!inner(id, username, email, avatar_url)",
        )
        .eq("workspace_id", workspaceId);

      if (error) {
        console.error("Error fetching workspace members:", error);
        return;
      }

      const formattedMembers = (data as any[]).map((m) => m.profiles);
      setMembers(formattedMembers);
    };

    fetchMembers();
  }, [isOpen, workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !projectName) return;

    setLoading(true);
    try {
      // 1. Insert into projects
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          workspace_id: workspaceId,
          name: projectName,
          description: description || null,
          status: status,
          priority: priority,
          start_date: startDate || null,
          deadline: endDate || null,
        })
        .select("id")
        .single();

      if (projectError) throw projectError;

      const newProjectId = projectData.id;

      // 1.5 Create Default Roles
      const { data: defaultRoles, error: rolesError } = await supabase
        .from("project_roles")
        .insert([
          { project_id: newProjectId, role_name: "Owner" },
          { project_id: newProjectId, role_name: "Anggota" },
        ])
        .select();

      if (rolesError) throw rolesError;

      const ownerRole = defaultRoles.find((r) => r.role_name === "Owner");
      const anggotaRole = defaultRoles.find((r) => r.role_name === "Anggota");

      // 2. Insert into project_members
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      const allSelectedUserIds = new Set(selectedTeamMemberIds);
      if (projectLeadId) {
        allSelectedUserIds.add(projectLeadId);
      }
      if (currentUserId) {
        allSelectedUserIds.add(currentUserId);
      }

      if (allSelectedUserIds.size > 0) {
        const memberInserts = Array.from(allSelectedUserIds).map((userId) => ({
          project_id: newProjectId,
          user_id: userId,
          role_id: userId === currentUserId ? ownerRole?.id : anggotaRole?.id,
        }));

        const { error: membersError } = await supabase
          .from("project_members")
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      // Success
      resetForm();
      onProjectCreated();
      onClose();
      toast.success("Proyek berhasil dibuat");
      window.dispatchEvent(new Event("refresh-sidebar"));
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Gagal membuat proyek. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProjectName("");
    setDescription("");
    setStatus("active");
    setPriority("medium");
    setStartDate("");
    setEndDate("");
    setProjectLeadId("");
    setSelectedTeamMemberIds([]);
  };

  const toggleTeamMember = (id: string) => {
    setSelectedTeamMemberIds((prev) =>
      prev.includes(id)
        ? prev.filter((memberId) => memberId !== id)
        : [...prev, id],
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bikin Proyek Baru</DialogTitle>
          <DialogDescription>
            Di workspace:{" "}
            <span className="font-semibold text-primary">
              {workspaceName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="projectName">Nama Proyek</Label>
            <Input
              id="projectName"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="ex: Milo"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Platform manajemen proyek..."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="on-hold">Ditunda</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label htmlFor="priority">Prioritas</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="medium">Menengah</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <Label htmlFor="endDate">Tenggat</Label>
              <Input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Project Lead */}
          <div className="space-y-1.5">
            <Label htmlFor="projectLead">Manajer Proyek</Label>
            <Select value={projectLeadId} onValueChange={setProjectLeadId}>
              <SelectTrigger id="projectLead">
                <SelectValue placeholder="Tidak ada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {members.map((member) => (
                  <SelectItem key={`lead-${member.id}`} value={member.id}>
                    {member.username} ({member.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Members */}
          <div className="space-y-1.5">
            <Label>Anggota Tim</Label>
            <div className="border-input bg-background max-h-32 overflow-y-auto rounded-md border p-2">
              {members.length === 0 ? (
                <p className="text-muted-foreground py-2 text-center text-sm">
                  Tidak ada anggota
                </p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <label
                      key={`team-${member.id}`}
                      className="flex cursor-pointer items-center gap-3 rounded p-1"
                    >
                      <input
                        type="checkbox"
                        className="border-input text-primary h-4 w-4 rounded"
                        checked={selectedTeamMemberIds.includes(member.id)}
                        onChange={() => toggleTeamMember(member.id)}
                      />
                      <div className="flex items-center gap-2">
                        <div className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-xs font-bold">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            member.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-foreground text-sm">
                          {member.username}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              <Icon icon="ix:project-new" className="hidden h-4 w-4 md:block" />
              {loading ? "Membuat..." : "Buat Proyek"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
