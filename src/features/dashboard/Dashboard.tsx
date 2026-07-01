import { supabase } from "#/lib/supabase";
import { Route as rootRoute } from "#/routes/__root";
import { Icon } from "@iconify/react";
import { useWorkspace } from "#/contexts/WorkspaceContext";
import { useEffect, useState } from "react";
import { CreateProjectModal } from "./CreateProjectModal";
import { Link } from "@tanstack/react-router";
import Badge from "#/components/ui/Badge";
import {
  PRIORITY,
  PROJECT_STATUS,
  TASK_STATUS,
} from "../projects/constants/project";
import type { Project } from "../projects/types/status";
import type {
  RecentTask,
  Task,
  TaskListCardProps,
} from "../projects/types/task";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type MetadataProps = {
  title: string;
  num: number;
  desc: string;
  icon: string;
  iconBg: string;
  iconColor: string;
};

function MetadataCard({
  title,
  num,
  desc,
  icon,
  iconBg,
  iconColor,
}: MetadataProps) {
  return (
    <Card>
      <CardContent className="flex justify-between p-4">
        <div className="space-y-1">
          <p className="text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-black">{num}</p>
          <p className="text-muted-foreground text-sm">{desc}</p>
        </div>
        <div className={`h-fit rounded-xl p-3 ${iconBg}`}>
          <Icon icon={icon} className={`${iconColor} h-5 w-5`} />
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectOverviewCard({ projects }: { projects: Project[] }) {
  return (
    <Card>
      <CardHeader className="border-border flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-base font-semibold">
          Ringkasan Proyek
        </CardTitle>
        <Link
          to="/projects"
          className="group text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs md:text-sm"
        >
          Lihat Semua{" "}
          <Icon
            icon="lucide:arrow-right"
            className="aspect-square h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-col p-0">
        {projects.map((project) => (
          <Link
            to="/projects/$projectId"
            params={{ projectId: project.id }}
            key={project.id}
            className="border-border hover:bg-muted/50 border-b p-5 transition-colors last:border-0"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-muted-foreground mt-1 max-w-[20ch] truncate text-xs md:max-w-none md:overflow-visible md:whitespace-normal">
                  {project.description || "Belum ada deskripsi."}
                </p>
              </div>

              <Badge variant={project.status}>
                {PROJECT_STATUS[project.status]}
              </Badge>
            </div>

            <div className="text-muted-foreground mb-4 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:users" className="h-4 w-4" />{" "}
                {project.project_members?.[0]?.count || 0} anggota
              </span>

              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="h-4 w-4" />{" "}
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="w-full">
              <div className="text-muted-foreground mb-1.5 flex justify-between text-xs">
                <span>Progres</span>
                <span>{project.progress}%</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="text-muted-foreground p-8 text-center text-sm">
            Belum ada proyek.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityCard({ tasks }: { tasks: RecentTask[] }) {
  return (
    <Card>
      <CardHeader className="border-border border-b pb-4">
        <CardTitle className="text-base font-semibold">
          Aktifitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col p-0">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border-border hover:bg-muted/50 flex items-start justify-between border-b p-5 transition-colors last:border-0"
          >
            <div className="flex gap-4">
              <div
                className={`h-fit rounded-lg p-2.5 ${task.priority === "high" ? "bg-red-50 text-red-500" : task.priority === "low" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-50 text-orange-400"}`}
              >
                <Icon
                  icon={
                    task.priority === "high"
                      ? "lucide:alert-triangle"
                      : "lucide:feather"
                  }
                  className="h-4 w-4"
                />
              </div>

              <div>
                <h3 className="text-foreground text-sm font-medium md:text-base">
                  {task.title}
                </h3>

                <div className="text-muted-foreground mt-2 flex flex-col gap-2 text-xs">
                  {task.profiles && (
                    <span className="bg-muted flex w-fit items-center gap-1.5 rounded-full px-2 py-1">
                      <div className="bg-muted-foreground/20 text-foreground flex h-4 w-4 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold">
                        {task.profiles.avatar_url ? (
                          <img
                            src={task.profiles.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          task.profiles.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      {task.profiles.username}
                    </span>
                  )}

                  <Badge
                    variant={task.status}
                    className="inline-flex w-fit md:hidden"
                  >
                    {TASK_STATUS[task.status]}
                  </Badge>

                  <span>
                    {new Date(task.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <Badge variant={task.status} className="hidden md:inline-flex">
              {TASK_STATUS[task.status]}
            </Badge>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-muted-foreground p-8 text-center text-sm">
            No recent activity.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskListCard({
  title,
  icon,
  count,
  tasks,
  badgeBg,
  badgeColor,
  emptyText = "Tidak ada tugas",
}: TaskListCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="border-border flex flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2 font-semibold">
          <Icon icon={icon} className={`h-4 w-4 ${badgeColor}`} />
          {title}
        </div>

        <span
          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${badgeBg} ${badgeColor}`}
        >
          {count}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-4">
        {tasks.length === 0 ? (
          <div className="text-muted-foreground flex items-center justify-center py-6 text-center text-sm">
            {emptyText}
          </div>
        ) : (
          tasks.map((task: Task) => (
            <div
              key={task.task_id}
              className="border-border bg-muted/30 hover:border-border/80 rounded-lg border p-3 transition-colors"
            >
              <h3 className="text-foreground mb-1 text-sm font-medium">
                {task.title}
              </h3>
              <p className="text-muted-foreground text-xs capitalize">
                Tugas • Prioritas {PRIORITY[task.priority]}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { auth } = rootRoute.useRouteContext();
  const user = auth.user;
  const { activeWorkspace } = useWorkspace();
  const currentWorkspaceName = activeWorkspace?.name || "Workspace";

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [metadata, setMetadata] = useState<MetadataProps[]>([]);
  const [dashboardData, setDashboardData] = useState<any>({
    projects: [],
    recentTasks: [],
    myTasksList: [],
    myOverdueList: [],
    myInProgressList: [],
  });

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      setLoading(true);

      try {
        const currentWorkspaceId = activeWorkspace?.id;

        if (!currentWorkspaceId) {
          console.log("User belum punya workspace");
          return;
        }

        setWorkspaceId(currentWorkspaceId);

        const [
          { data: projectStats },
          { data: myTasksList, count: assignedTasks },
          { data: myOverdueList, count: overdueTasks },
          { data: projectsData },
        ] = await Promise.all([
          supabase
            .from("workspace_project_stats")
            .select("*")
            .eq("workspace_id", currentWorkspaceId)
            .maybeSingle(),

          supabase
            .from("my_assigned_tasks")
            .select("*", { count: "exact" })
            .eq("assignee_id", user.id)
            .eq("workspace_id", currentWorkspaceId)
            .limit(3),

          supabase
            .from("my_overdue_tasks")
            .select("*", { count: "exact" })
            .eq("assignee_id", user.id)
            .eq("workspace_id", currentWorkspaceId)
            .limit(3),

          supabase
            .from("projects")
            .select("*, project_members(count)")
            .eq("workspace_id", currentWorkspaceId)
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        const projectIds = projectsData?.map((p) => p.id) || [];
        const { data: recentTasks } =
          projectIds.length > 0
            ? await supabase
                .from("tasks")
                .select("*, profiles:assignee_id(username, avatar_url)")
                .in("project_id", projectIds)
                .order("created_at", { ascending: false })
                .limit(5)
            : { data: [] };

        const { data: myInProgressList } = await supabase
          .from("my_assigned_tasks")
          .select("*")
          .eq("assignee_id", user.id)
          .eq("status", "in-progress")
          .eq("workspace_id", currentWorkspaceId)
          .limit(3);

        setDashboardData({
          projects: projectsData || [],
          recentTasks: recentTasks || [],
          myTasksList: myTasksList || [],
          myOverdueList: myOverdueList || [],
          myInProgressList: myInProgressList || [],
        });

        setMetadata([
          {
            title: "Total Proyek",
            num: projectStats?.total_projects ?? 0,
            desc: `proyek di ${currentWorkspaceName}`,
            icon: "lucide:folder-open",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-500",
          },
          {
            title: "Proyek Selesai",
            num: projectStats?.completed_projects ?? 0,
            desc: `dari ${projectStats?.total_projects ?? 0} proyek`,
            icon: "lucide:check-circle",
            iconBg: "bg-emerald-500/20",
            iconColor: "text-emerald-400",
          },
          {
            title: "Tugas",
            num: assignedTasks ?? 0,
            desc: "ditugaskan kepadamu",
            icon: "lucide:clipboard-pen",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-500",
          },
          {
            title: "Terlambat",
            num: overdueTasks ?? 0,
            desc: "perlu diperhatikan",
            icon: "lucide:triangle-alert",
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-500",
          },
        ]);
      } catch (error) {
        console.error("[Dashboard Error]", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, activeWorkspace, refreshTrigger]);

  return (
    <main className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">
            Selamat Datang, {auth.profile?.username ?? "Pengguna"}!
          </h1>
          <p className="text-muted-foreground">
            Ini ringkasan aktivitas proyekmu
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full md:w-fit"
        >
          <Icon icon="ic:round-plus" className="h-4 w-4" />
          Proyek Baru
        </Button>
      </div>

      {/* Metadata Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex justify-between p-4">
                  <div className="flex flex-col gap-2 py-1">
                    <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                    <div className="bg-muted my-1 h-8 w-12 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-32 animate-pulse rounded" />
                  </div>
                  <div className="bg-muted h-[52px] w-[52px] animate-pulse rounded-xl" />
                </CardContent>
              </Card>
            ))
          : metadata.map((item) => <MetadataCard key={item.title} {...item} />)}
      </div>

      {!loading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-3 xl:col-span-2">
            <ProjectOverviewCard projects={dashboardData.projects} />
            <RecentActivityCard tasks={dashboardData.recentTasks} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-3 xl:col-span-1">
            <TaskListCard
              title="Tugas Anda"
              icon="lucide:feather"
              count={metadata[2]?.num || 0}
              tasks={dashboardData.myTasksList}
              badgeBg="bg-violet-100"
              badgeColor="text-violet-700"
            />
            <TaskListCard
              title="Terlambat"
              icon="lucide:triangle-alert"
              count={metadata[3]?.num || 0}
              tasks={dashboardData.myOverdueList}
              badgeBg="bg-yellow-100"
              badgeColor="text-yellow-700"
              emptyText="Tidak ada tugas terlambat"
            />
            <TaskListCard
              title="Berlangsung"
              icon="lucide:clock"
              count={dashboardData.myInProgressList.length}
              tasks={dashboardData.myInProgressList}
              badgeBg="bg-blue-100"
              badgeColor="text-blue-700"
              emptyText="Tidak ada tugas yang berlangsung"
            />
          </div>
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={workspaceId}
        workspaceName={currentWorkspaceName}
        onProjectCreated={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </main>
  );
}
