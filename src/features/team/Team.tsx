import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { InviteMemberModal } from "./InviteMemberModal";
import { useWorkspace } from "#/contexts/WorkspaceContext";
import Button from "#/components/ui/Button";

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
  const { activeWorkspace } = useWorkspace();
  const currentWorkspaceId = activeWorkspace?.id;
  const currentWorkspaceName = activeWorkspace?.name || "Workspace";

  const [members, setMembers] = useState<Member[]>([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
          .select(
            "user_id, role, profiles!inner(id, username, email, avatar_url)",
          )
          .eq("workspace_id", currentWorkspaceId);

        if (membersError) throw membersError;

        // Map the joined data
        const formattedMembers = (membersData as any[]).map((m) => ({
          id: m.user_id || m.profile.id,
          role: m.role,
          profile: m.profiles,
        }));
        setMembers(formattedMembers);

        // 2. Fetch Active Projects Count
        const { count: activeProjCount, error: activeProjError } =
          await supabase
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

        const projectIds = projData?.map((p) => p.id) || [];

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
  }, [currentWorkspaceId, refreshTrigger]);

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    return members.filter(
      (member) =>
        member.profile.username.toLowerCase().includes(search.toLowerCase()) ||
        member.profile.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [members, search]);

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Tim</h1>
          <p className="text-sm text-gray-500">
            Kelola anggota tim dan kontribusi mereka
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsInviteModalOpen(true)}
          className=""
        >
          <Icon icon="lucide:user-plus" className="mr-2 h-4 w-4" />
          Undang Anggota
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 flex flex-wrap gap-4">
        {/* Total Members */}
        <div className="flex min-w-[240px] items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <p className="mb-1 text-sm text-gray-500">Total Members</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? "-" : members.length}
            </h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
            <Icon icon="lucide:users" className="h-5 w-5" />
          </div>
        </div>

        {/* Active Projects */}
        <div className="flex min-w-[240px] items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <p className="mb-1 text-sm text-gray-500">Active Projects</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? "-" : activeProjectsCount}
            </h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <Icon icon="lucide:activity" className="h-5 w-5" />
          </div>
        </div>

        {/* Total Tasks */}
        <div className="flex min-w-[240px] items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <p className="mb-1 text-sm text-gray-500">Total Tasks</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? "-" : totalTasksCount}
            </h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
            <Icon icon="lucide:shield" className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Icon
            icon="lucide:search"
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                      <div className="h-4 w-24 rounded bg-gray-200"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 rounded bg-gray-200"></div>
                  </td>
                </tr>
              ))
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-bold text-emerald-700">
                        {member.profile.avatar_url ? (
                          <img
                            src={member.profile.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          member.profile.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {member.profile.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {member.profile.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-purple-100/70 px-2 py-1 text-[10px] font-bold tracking-wider text-purple-700 uppercase">
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
        workspaceId={currentWorkspaceId ?? null}
        workspaceName={currentWorkspaceName}
        onInvited={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
}
