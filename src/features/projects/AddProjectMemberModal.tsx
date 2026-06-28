import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";

export function AddProjectMemberModal({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  onAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  workspaceId: string;
  onAdded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roleName, setRoleName] = useState("Member");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !workspaceId || !projectId) return;

    const fetchCandidates = async () => {
      try {
        // Fetch all members in this workspace
        const { data: workspaceMembers, error: wmError } = await supabase
          .from("workspace_members")
          .select("user_id, profiles!inner(username, email)")
          .eq("workspace_id", workspaceId);

        if (wmError) throw wmError;

        // Fetch members already in the project
        const { data: projectMembers, error: pmError } = await supabase
          .from("project_members")
          .select("user_id")
          .eq("project_id", projectId);

        if (pmError) throw pmError;

        const projectMemberIds = new Set(projectMembers.map(m => m.user_id));

        // Filter out those already in the project
        const available = workspaceMembers
          .filter(wm => !projectMemberIds.has(wm.user_id))
          .map((wm: any) => ({
            id: wm.user_id,
            email: wm.profiles?.email || wm.profiles?.[0]?.email,
            username: wm.profiles?.username || wm.profiles?.[0]?.username,
          }));

        setCandidates(available);
        if (available.length > 0) {
          setSelectedUserId(available[0].id);
        }
      } catch (err) {
        console.error("Error fetching candidates:", err);
      }
    };

    fetchCandidates();
  }, [isOpen, workspaceId, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !roleName.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      // 1. Create a project role for this user
      // Note: in a more complex setup, you'd check if role exists. We'll just create a new one or use existing
      let roleId;
      const { data: existingRoles } = await supabase
        .from("project_roles")
        .select("id")
        .eq("project_id", projectId)
        .ilike("role_name", roleName);

      if (existingRoles && existingRoles.length > 0) {
        roleId = existingRoles[0].id;
      } else {
        const { data: newRole, error: roleError } = await supabase
          .from("project_roles")
          .insert({
            project_id: projectId,
            role_name: roleName,
          })
          .select("id")
          .single();

        if (roleError) throw roleError;
        roleId = newRole.id;
      }

      // 2. Add to project_members
      const { error: insertError } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: selectedUserId,
          role_id: roleId,
        });

      if (insertError) throw insertError;

      onAdded();
      onClose();
      setRoleName("Member"); // Reset
      toast.success("Anggota berhasil ditambahkan ke proyek");
    } catch (err: any) {
      console.error("Error adding project member:", err);
      setError(err.message || "Failed to add member.");
      toast.error(err.message || "Gagal menambahkan anggota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h2 className="flex items-center text-xl font-bold text-gray-900">
              <Icon icon="lucide:user-plus" className="mr-2 h-5 w-5" />
              Add Project Member
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Select a workspace member to add to this project.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                Workspace Member
              </label>
              {candidates.length > 0 ? (
                <select
                  id="user"
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.email} ({c.username})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1 text-sm text-gray-500 italic p-2 border border-dashed border-gray-300 rounded-md bg-gray-50">
                  No other workspace members available to add.
                </div>
              )}
            </div>

            <div>
              <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                Project Role
              </label>
              <input
                type="text"
                id="roleName"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Frontend Developer, Team Lead"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || candidates.length === 0}
              className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
