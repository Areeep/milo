import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { AddProjectMemberModal } from "./AddProjectMemberModal";
import { toast } from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import Button from "#/components/ui/Button";

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

      // 3. Fetch Available Roles (khusus untuk proyek ini)
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
      <div className="animate-pulse p-8 text-gray-500">
        Memuat Pengaturan...
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col gap-6 pb-8 md:items-start xl:flex-row">
      {/* Left Column: Project Details */}
      <div className="w-full flex-1 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold">Detail Proyek</h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col gap-1">
            <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
              Nama Proyek
            </label>

            <input
              type="text"
              required
              value={project.name || ""}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
              Deskripsi
            </label>

            <textarea
              rows={4}
              value={project.description || ""}
              onChange={(e) =>
                setProject({ ...project, description: e.target.value })
              }
              spellCheck={false}
              className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                Status
              </label>
              <select
                value={project.status || "Aktif"}
                onChange={(e) =>
                  setProject({ ...project, status: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditunda">Ditunda</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                Prioritas
              </label>
              <select
                value={project.priority || "Menengah"}
                onChange={(e) =>
                  setProject({ ...project, priority: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="Rendah">Rendah</option>
                <option value="Menengah">Menengah</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                Tanggal Mulai
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={project.start_date || ""}
                  onChange={(e) =>
                    setProject({ ...project, start_date: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                Tenggat
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={project.deadline || ""}
                  onChange={(e) =>
                    setProject({ ...project, deadline: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 md:text-sm">
              Progres: {project.progress || 0}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={project.progress || 0}
              onChange={(e) =>
                setProject({ ...project, progress: parseInt(e.target.value) })
              }
              style={{
                background: `linear-gradient(to right, oklch(69.6% 0.17 162.48) ${project.progress || 0}%, #e5e7eb ${project.progress || 0}%)`,
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-emerald-400"
            />
          </div>

          <div className="mt-4 flex flex-col justify-end gap-2 border-t border-gray-100 pt-6 md:flex-row md:items-center">
            <Button
              variant="danger"
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={deleting}
              className=""
            >
              <Icon icon="lucide:trash-2" className="mr-2 h-4 w-4 pb-0.5" />
              {deleting ? "Menghapus..." : "Hapus Proyek"}
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={saving}
              className=""
            >
              <Icon icon="lucide:save" className="mr-2 h-4 w-4 pb-0.5" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Column: Team Members */}
      <div className="w-full self-start rounded-lg border border-gray-200 bg-white p-6 xl:w-1/3">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Anggota Tim{" "}
            <span className="text-lg font-normal text-gray-500">
              ({members.length})
            </span>
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAddRoleModalOpen(true)}
              title="Tambah Role Baru"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Icon icon="lucide:shield-plus" className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              title="Tambah Anggota"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Icon icon="lucide:plus" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {members.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">
            Belum ada anggota.
          </p>
        ) : (
          <div className="space-y-4">
            {members.map((member, i) =>
              editingMemberId === member.id ? (
                <div
                  key={i}
                  className="flex items-center gap-2 border-b border-gray-50 py-2 last:border-0"
                >
                  <input
                    type="text"
                    value={member.username}
                    disabled
                    className="w-1/2 rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-sm text-gray-500"
                  />
                  <select
                    value={editRoleName}
                    onChange={(e) => setEditRoleName(e.target.value)}
                    className="w-1/2 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="" disabled>
                      Pilih role...
                    </option>
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => saveMemberRole(member.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                    title="Simpan"
                  >
                    <Icon icon="lucide:check" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingMemberId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                    title="Batal"
                  >
                    <Icon icon="lucide:x" className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  key={i}
                  onClick={() => {
                    setEditingMemberId(member.id);
                    setEditRoleName(member.role_id || "");
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-md border-b border-gray-50 p-2 transition-colors last:border-0 hover:bg-gray-50"
                >
                  <span className="truncate pr-4 text-sm font-medium text-gray-700">
                    {member.username}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold whitespace-nowrap text-gray-600">
                      {member.role}
                    </span>
                    <Icon
                      icon="lucide:edit-3"
                      className="h-3.5 w-3.5 text-gray-400"
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
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Tambah Role Baru
              </h3>
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddRole}>
              <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nama Role
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: Designer, QA..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  disabled={isAddingRole}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddingRole || !newRoleName.trim()}
                  className="flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isAddingRole ? "Menyimpan..." : "Simpan Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Icon icon="lucide:alert-triangle" className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Hapus Proyek</h3>
            </div>
            <p className="mb-6 text-sm text-gray-500">
              Apakah Anda yakin ingin menghapus proyek{" "}
              <span className="font-semibold text-gray-700">
                {project.name}
              </span>
              ? Semua data terkait seperti tugas dan anggota akan ikut terhapus
              secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                disabled={deleting}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus Proyek"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
