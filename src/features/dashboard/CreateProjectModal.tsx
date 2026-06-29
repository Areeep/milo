import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";

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
  const [status, setStatus] = useState("Aktif");
  const [priority, setPriority] = useState("Menengah");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectLeadId, setProjectLeadId] = useState("");
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);

  // Fetch workspace members when modal opens
  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("user_id, role, profiles!inner(id, username, email, avatar_url)")
        .eq("workspace_id", workspaceId);

      if (error) {
        console.error("Error fetching workspace members:", error);
        return;
      }

      const formattedMembers = (data as any[]).map(m => m.profiles);
      setMembers(formattedMembers);
    };

    fetchMembers();
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

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
      
      const ownerRole = defaultRoles?.find(r => r.role_name === "Owner");
      const anggotaRole = defaultRoles?.find(r => r.role_name === "Anggota");

      // 2. Insert into project_members
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;

      const allSelectedUserIds = new Set(selectedTeamMemberIds);
      if (projectLeadId) {
        allSelectedUserIds.add(projectLeadId);
      }
      if (currentUserId) {
        allSelectedUserIds.add(currentUserId);
      }

      if (allSelectedUserIds.size > 0) {
        const memberInserts = Array.from(allSelectedUserIds).map(userId => ({
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
    setStatus("Aktif");
    setPriority("Menengah");
    setStartDate("");
    setEndDate("");
    setProjectLeadId("");
    setSelectedTeamMemberIds([]);
  };

  const toggleTeamMember = (id: string) => {
    setSelectedTeamMemberIds(prev => 
      prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4">
      <div className="relative w-full max-w-xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
            <p className="mt-1 text-sm text-gray-500">
              In workspace: <span className="font-semibold text-blue-600">{workspaceName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <Icon icon="lucide:x" className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            
            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1.5 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project"
                className="mt-1.5 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Ditunda">Ditunda</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="Tinggi">Tinggi</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Project Lead */}
            <div>
              <label htmlFor="projectLead" className="block text-sm font-medium text-gray-700">
                Project Lead
              </label>
              <select
                id="projectLead"
                value={projectLeadId}
                onChange={(e) => setProjectLeadId(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">No lead</option>
                {members.map(member => (
                  <option key={`lead-${member.id}`} value={member.id}>
                    {member.username} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Team Members
              </label>
              <div className="max-h-32 overflow-y-auto rounded-md border border-gray-300 bg-white p-2">
                {members.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No members found</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <label key={`team-${member.id}`} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedTeamMemberIds.includes(member.id)}
                          onChange={() => toggleTeamMember(member.id)}
                        />
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              member.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{member.username}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Actions */}
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
              disabled={loading}
              className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
