import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { InviteMemberModal } from "./InviteMemberModal";
import { useWorkspace } from "#/contexts/WorkspaceContext";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Card, CardContent } from "#/components/ui/card";

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
        const { data: membersData, error: membersError } = await supabase
          .from("workspace_members")
          .select(
            "user_id, role, profiles!inner(id, username, email, avatar_url)",
          )
          .eq("workspace_id", currentWorkspaceId);

        if (membersError) throw membersError;

        const formattedMembers = (membersData as any[]).map((m) => ({
          id: m.user_id || m.profile.id,
          role: m.role,
          profile: m.profiles,
        }));
        setMembers(formattedMembers);

        const { count: activeProjCount, error: activeProjError } =
          await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", currentWorkspaceId)
            .eq("status", "active");

        if (activeProjError) throw activeProjError;
        setActiveProjectsCount(activeProjCount || 0);

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
      <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground mb-1 text-2xl font-bold">Tim</h1>
          <p className="text-muted-foreground text-sm">
            Kelola anggota tim dan kontribusi mereka
          </p>
        </div>

        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Icon icon="lucide:user-plus" className="mr-2 h-4 w-4" />
          Undang Anggota
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <phantom-ui
          loading={loading}
          count={3}
          count-gap="16px"
          data-shimmer-width="100%"
        >
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  Total Members
                </p>
                <h2 className="text-foreground text-2xl font-bold">
                  {members.length}
                </h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
                <Icon icon="lucide:users" className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </phantom-ui>

        {!loading && (
          <>
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">
                    Active Projects
                  </p>
                  <h2 className="text-foreground text-2xl font-bold">
                    {activeProjectsCount}
                  </h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Icon icon="lucide:activity" className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">
                    Total Tasks
                  </p>
                  <h2 className="text-foreground text-2xl font-bold">
                    {totalTasksCount}
                  </h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                  <Icon icon="lucide:shield" className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Icon
          icon="lucide:search"
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <Input
          type="text"
          placeholder="Cari anggota tim..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border-border bg-card overflow-x-auto rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <phantom-ui loading={true} count={4} count-gap="0px">
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted h-8 w-8 rounded-full" />
                      <div className="bg-muted h-4 w-24 rounded" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted h-4 w-32 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted h-4 w-16 rounded" />
                  </TableCell>
                </TableRow>
              </phantom-ui>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-muted-foreground px-6 py-8 text-center"
                >
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.profile.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground font-medium">
                        {member.profile.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.profile.email}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-sm bg-purple-100 px-2 py-1 text-[10px] font-bold tracking-wider text-purple-700 uppercase">
                      {member.role}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
