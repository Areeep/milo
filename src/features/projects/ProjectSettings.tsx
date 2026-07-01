import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { AddProjectMemberModal } from "./AddProjectMemberModal";
import { toast } from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
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

export function ProjectSettings({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState<string>("");

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isAddingRole, setIsAddingRole] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Project Details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // 2. Fetch Project Members
      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select("*, profiles(username), project_roles(role_name)")
        .eq("project_id", projectId);

      if (membersError) throw membersError;

      // 3. Fetch Available Roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("project_roles")
        .select("*")
        .eq("project_id", projectId);

      if (rolesError) throw rolesError;
      setAvailableRoles(rolesData);

      const formattedMembers = membersData.map((m: any) => ({
        id: m.user_id,
        username: m.profiles?.username,
        role: m.project_roles?.role_name || "Anggota",
        role_id: m.role_id,
      }));

      setMembers(formattedMembers);
    } catch (err) {
      console.error("Error fetching project settings data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          start_date: project.start_date,
          deadline: project.deadline,
          progress: project.progress,
        })
        .eq("id", projectId);

      if (error) throw error;
      toast.success("Proyek berhasil diperbarui!");
      window.dispatchEvent(new Event("refresh-sidebar"));
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Gagal memperbarui proyek.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
      toast.success("Proyek berhasil dihapus.");
      window.dispatchEvent(new Event("refresh-sidebar"));
      navigate({ to: "/projects" });
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Gagal menghapus proyek.");
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsAddingRole(true);
    try {
      const { data: newRole, error } = await supabase
        .from("project_roles")
        .insert({
          role_name: newRoleName.trim(),
          project_id: projectId,
        })
        .select()
        .single();

      if (error) throw error;

      setAvailableRoles((prev) => [...prev, newRole]);
      toast.success("Role baru berhasil ditambahkan!");
      setIsAddRoleModalOpen(false);
      setNewRoleName("");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menambahkan role baru.");
    } finally {
      setIsAddingRole(false);
    }
  };

  const saveMemberRole = async (userId: string) => {
    if (!editRoleName) return;

    try {
      const { data: updatedMember, error } = await supabase
        .from("project_members")
        .update({ role_id: editRoleName })
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .select();

      if (error) throw error;
      if (updatedMember.length === 0) {
        throw new Error(
          "Update gagal: Anda tidak memiliki akses (RLS) untuk mengubah anggota ini.",
        );
      }
      toast.success("Role anggota berhasil diperbarui!");
      setEditingMemberId(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memperbarui role anggota.");
    }
  };

  if (loading) {
    return (
      <phantom-ui loading={true} count={1} count-gap={0}>
        <div className="flex flex-col gap-6 pb-8 md:items-start xl:flex-row">
          <div className="border-border bg-card h-[500px] w-full flex-1 rounded-lg border p-6" />
          <div className="border-border bg-card h-[400px] w-full self-start rounded-lg border p-6 xl:w-1/3" />
        </div>
      </phantom-ui>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col gap-6 pb-8 md:items-start xl:flex-row">
      {/* Left Column: Project Details */}
      <div className="border-border bg-card w-full flex-1 rounded-lg border p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Detail Proyek</h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1.5">
            <Label>Nama Proyek</Label>
            <Input
              type="text"
              required
              value={project.name || ""}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              rows={4}
              value={project.description || ""}
              onChange={(e) =>
                setProject({ ...project, description: e.target.value })
              }
              spellCheck={false}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={project.status || "active"}
                onValueChange={(val) => setProject({ ...project, status: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="on-hold">Ditunda</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Select
                value={project.priority || "medium"}
                onValueChange={(val) =>
                  setProject({ ...project, priority: val })
                }
              >
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
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={project.start_date || ""}
                onChange={(e) =>
                  setProject({ ...project, start_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tenggat</Label>
              <Input
                type="date"
                value={project.deadline || ""}
                onChange={(e) =>
                  setProject({ ...project, deadline: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-muted-foreground flex justify-between">
              <span>Kemajuan Proyek</span>
              <span>{project.progress || 0}%</span>
            </Label>
            <input
              type="range"
              min="0"
              max="100"
              value={project.progress || 0}
              onChange={(e) =>
                setProject({ ...project, progress: parseInt(e.target.value) })
              }
              style={{
                background: `linear-gradient(to right, oklch(0.623 0.214 259.815) ${
                  project.progress || 0
                }%, var(--muted) ${project.progress || 0}%)`,
              }}
              className="accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
            />
          </div>

          <div className="border-border mt-4 flex flex-col justify-end gap-3 border-t pt-6 sm:flex-row sm:items-center">
            <Button
              variant="destructive"
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={deleting}
              className="sm:mr-auto"
            >
              <Icon icon="lucide:trash-2" className="mr-2 h-4 w-4" />
              {deleting ? "Menghapus..." : "Hapus Proyek"}
            </Button>

            <Button type="submit" disabled={saving}>
              <Icon icon="lucide:save" className="mr-2 h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Column: Team Members */}
      <div className="border-border bg-card w-full self-start rounded-lg border p-6 shadow-sm xl:w-1/3">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Anggota Tim{" "}
            <span className="text-muted-foreground font-normal">
              ({members.length})
            </span>
          </h2>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAddRoleModalOpen(true)}
              title="Tambah Role Baru"
            >
              <Icon icon="lucide:shield-plus" className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsModalOpen(true)}
              title="Tambah Anggota"
            >
              <Icon icon="lucide:plus" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {members.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            Belum ada anggota.
          </p>
        ) : (
          <div className="space-y-2">
            {members.map((member, i) =>
              editingMemberId === member.id ? (
                <div
                  key={i}
                  className="border-border flex items-center gap-2 border-b py-2 last:border-0"
                >
                  <Input
                    type="text"
                    value={member.username}
                    disabled
                    className="bg-muted h-9 w-1/2 text-sm"
                  />
                  <Select value={editRoleName} onValueChange={(val) => val && setEditRoleName(val)}>
                    <SelectTrigger className="h-9 w-1/2 text-sm">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => saveMemberRole(member.id)}
                      className="h-8 w-8 text-white hover:bg-primary/20 hover:text-white"
                    >
                      <Icon icon="lucide:check" className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setEditingMemberId(null)}
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                    >
                      <Icon icon="lucide:x" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  onClick={() => {
                    setEditingMemberId(member.id);
                    setEditRoleName(member.role_id || "");
                  }}
                  className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors"
                >
                  <span className="truncate pr-4 text-sm font-medium">
                    {member.username}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs font-semibold">
                      {member.role}
                    </span>
                    <Icon
                      icon="lucide:edit-3"
                      className="text-muted-foreground h-3.5 w-3.5"
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddProjectMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        workspaceId={project.workspace_id}
        onAdded={() => {
          fetchData(); // reload members
        }}
      />

      {/* Add Role Modal */}
      <Dialog open={isAddRoleModalOpen} onOpenChange={setIsAddRoleModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Role Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRole} className="space-y-6">
            <div className="space-y-1.5">
              <Label>Nama Role</Label>
              <Input
                type="text"
                required
                autoFocus
                placeholder="Contoh: Designer, QA..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddRoleModalOpen(false)}
                disabled={isAddingRole}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isAddingRole || !newRoleName.trim()}
              >
                {isAddingRole ? "Menyimpan..." : "Simpan Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-destructive/10 text-destructive flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Icon icon="lucide:alert-triangle" className="h-5 w-5" />
              </div>
              Hapus Proyek
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Apakah Anda yakin ingin menghapus proyek{" "}
              <strong className="text-foreground">{project.name}</strong>? Semua
              data terkait seperti tugas dan anggota akan ikut terhapus secara
              permanen. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="border-border mt-2 flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Ya, Hapus Proyek"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
