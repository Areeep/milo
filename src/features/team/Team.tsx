import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Route as appRoute } from "#/routes/_app";
import { supabase } from "#/lib/supabase";
import { InviteMemberModal } from "./InviteMemberModal";

type Member = {
  id: string;
  role: string;
  profile: {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
  };
};

export function Team() {
  const { workspaces } = appRoute.useLoaderData();
  const currentWorkspaceId = workspaces[0]?.id;
  const currentWorkspaceName = workspaces[0]?.name || "Workspace";

  const [members, setMembers] = useState<Member[]>([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (!currentWorkspaceId) return;

    const fetchTeamData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Members
        const { data: membersData, error: membersError } = await supabase
          .from("workspace_members")
          .select("user_id, role, profiles!inner(id, username, email, avatar_url)")
          .eq("workspace_id", currentWorkspaceId);

        if (membersError) throw membersError;
        
        // Map the joined data
        const formattedMembers = (membersData as any[]).map(m => ({
          id: m.user_id || m.profile.id,
          role: m.role,
          profile: m.profiles,
        }));
        setMembers(formattedMembers);

        // 2. Fetch Active Projects Count
        const { count: activeProjCount, error: activeProjError } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", currentWorkspaceId)
          .eq("status", "active");
        
        if (activeProjError) throw activeProjError;
        setActiveProjectsCount(activeProjCount || 0);

        // 3. Fetch Total Tasks Count
        // First get all project IDs for this workspace
        const { data: projData } = await supabase
          .from("projects")
          .select("id")
          .eq("workspace_id", currentWorkspaceId);
          
        const projectIds = projData?.map(p => p.id) || [];
        
        if (projectIds.length > 0) {
          const { count: tasksCount, error: tasksError } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .in("project_id", projectIds);
            
          if (tasksError) throw tasksError;
          setTotalTasksCount(tasksCount || 0);
        } else {
          setTotalTasksCount(0);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [currentWorkspaceId]);

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    return members.filter(member => 
      member.profile.username.toLowerCase().includes(search.toLowerCase()) ||
      member.profile.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Team</h1>
          <p className="text-sm text-gray-500">Manage team members and their contributions</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
        >
          <Icon icon="lucide:user-plus" className="w-4 h-4 mr-2" />
          Invite Member
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Total Members */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex items-center justify-between min-w-[240px]">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Members</p>
            <h2 className="text-2xl font-bold text-gray-900">{loading ? "-" : members.length}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Icon icon="lucide:users" className="w-5 h-5" />
          </div>
        </div>
        
        {/* Active Projects */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex items-center justify-between min-w-[240px]">
          <div>
            <p className="text-sm text-gray-500 mb-1">Active Projects</p>
            <h2 className="text-2xl font-bold text-gray-900">{loading ? "-" : activeProjectsCount}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Icon icon="lucide:activity" className="w-5 h-5" />
          </div>
        </div>

        {/* Total Tasks */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex items-center justify-between min-w-[240px]">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
            <h2 className="text-2xl font-bold text-gray-900">{loading ? "-" : totalTasksCount}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
            <Icon icon="lucide:shield" className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading members...
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
                        {member.profile.avatar_url ? (
                          <img src={member.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          member.profile.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{member.profile.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {member.profile.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100/70 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {member.role}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={currentWorkspaceId}
        workspaceName={currentWorkspaceName}
        onInvited={() => {
          // Reload page to reflect new member
          window.location.reload();
        }}
      />
    </div>
  );
}
