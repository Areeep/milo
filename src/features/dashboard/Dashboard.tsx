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
    <div className="flex justify-between rounded-md border border-gray-200 bg-white p-4">
      <div className="space-y-1">
        <p className="font-medium text-gray-700">{title}</p>
        <p className="text-2xl font-black">{num}</p>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>

      <div className={`h-fit rounded-xl p-3 ${iconBg}`}>
        <Icon icon={icon} className={`${iconColor} h-5 w-5`} />
      </div>
    </div>
  );
}

function ProjectOverviewCard({ projects }: { projects: Project[] }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800">Ringkasan Proyek</h2>
        <Link
          to="/projects"
          className="group flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
        >
          Lihat Semua{" "}
          <Icon
            icon="lucide:arrow-right"
            className="aspect-square h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="flex flex-col">
        {projects.map((project) => (
          <Link
            to="/projects/$projectId"
            params={{ projectId: project.id }}
            key={project.id}
            className="border-b border-gray-100 p-5 transition-colors last:border-0 hover:bg-gray-50"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="mt-1 max-w-[20ch] truncate text-xs text-gray-500 md:max-w-none md:overflow-visible md:whitespace-normal">
                  {project.description || "Belum ada deskripsi."}
                </p>
              </div>

              <Badge variant={project.status}>
                {PROJECT_STATUS[project.status]}
              </Badge>
            </div>

            <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
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
              <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                <span>Progres</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full bg-emerald-500"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            Belum ada proyek.
          </div>
        )}
      </div>
    </div>
  );
}

function RecentActivityCard({ tasks }: { tasks: RecentTask[] }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800">Aktifitas Terbaru</h2>
      </div>
      <div className="flex flex-col">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start justify-between border-b border-gray-100 p-5 transition-colors last:border-0 hover:bg-gray-50"
          >
            <div className="flex gap-4">
              <div
                className={`h-fit rounded-lg p-2.5 ${task.priority === "high" ? "bg-red-50 text-red-500" : task.priority === "low" ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-400"}`}
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
                <h3 className="text-sm font-medium text-gray-900 md:text-base">
                  {task.title}
                </h3>

                <div className="mt-2 flex flex-col gap-2 text-xs text-gray-500">
                  {task.profiles && (
                    <span className="flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1">
                      <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-[10px] font-bold text-white">
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
          <div className="p-8 text-center text-sm text-gray-500">
            No recent activity.
          </div>
        )}
      </div>
    </div>
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
    <div className="flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Icon icon={icon} className={`h-4 w-4 ${badgeColor}`} />
          {title}
        </div>

        <span
          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${badgeBg} ${badgeColor}`}
        >
          {count}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-center text-sm text-gray-400">
            {emptyText}
          </div>
        ) : (
          tasks.map((task: Task) => (
            <div
              key={task.task_id}
              className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 transition-colors hover:border-gray-300"
            >
              <h3 className="mb-1 text-sm font-medium text-gray-800">
                {task.title}
              </h3>
              <p className="Capitalize text-xs text-gray-500">
                Tugas • Prioritas {PRIORITY[task.priority]}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
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
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-500",
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
          <p>Ini ringkasan aktivitas proyekmu</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 md:w-fit"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            <Icon icon="ic:round-plus" className="h-4 w-4" />
          </span>
          Proyek Baru
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-md bg-gray-100"
              />
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
