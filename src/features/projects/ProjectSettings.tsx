import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { AddProjectMemberModal } from "./AddProjectMemberModal";

export function ProjectSettings({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        .select("*, profiles(email), project_roles(role_name)")
        .eq("project_id", projectId);

      if (membersError) throw membersError;
      
      const formattedMembers = membersData.map((m: any) => ({
        id: m.user_id,
        email: m.profiles?.email,
        role: m.project_roles?.role_name || "Member",
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
      alert("Project updated successfully!");
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500 animate-pulse">Loading settings...</div>;
  }

  if (!project) return null;

  return (
    <div className="flex gap-6 items-start">
      {/* Left Column: Project Details */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Project Details</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={project.name || ""}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={project.description || ""}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={project.status || "active"}
                onChange={(e) => setProject({ ...project, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={project.priority || "medium"}
                onChange={(e) => setProject({ ...project, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={project.start_date || ""}
                  onChange={(e) => setProject({ ...project, start_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={project.deadline || ""}
                  onChange={(e) => setProject({ ...project, deadline: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress: {project.progress || 0}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={project.progress || 0}
              onChange={(e) => setProject({ ...project, progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium flex items-center transition-colors disabled:opacity-50"
            >
              <Icon icon="lucide:save" className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Team Members */}
      <div className="w-1/3 bg-white rounded-lg border border-gray-200 p-6 shadow-sm self-start">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Team Members <span className="text-gray-500 text-lg font-normal">({members.length})</span></h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
          </button>
        </div>

        {members.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No members assigned to this project yet.</p>
        ) : (
          <div className="space-y-4">
            {members.map((member, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-700 truncate pr-4">{member.email}</span>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md whitespace-nowrap">
                  {member.role}
                </span>
              </div>
            ))}
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
    </div>
  );
}
