import { supabase } from "#/lib/supabase";
import { Route as rootRoute } from "#/routes/__root";
import { Icon } from "@iconify/react";
import { useWorkspace } from "#/contexts/WorkspaceContext";

import { useEffect, useState } from "react";
import { CreateProjectModal } from "./CreateProjectModal";

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
    <div className="flex justify-between rounded-md border border-gray-200 bg-white p-4 shadow-sm">
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

function ProjectOverviewCard({ projects }: { projects: any[] }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800">Project Overview</h2>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">View all <Icon icon="lucide:arrow-right" className="w-4 h-4" /></a>
      </div>
      <div className="flex flex-col">
        {projects.map((project) => (
          <div key={project.id} className="p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <div>
                 <h3 className="font-bold text-gray-900">{project.name}</h3>
                 <p className="text-xs text-gray-500 mt-1">{project.description || 'No description'}</p>
               </div>
               <div className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${project.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                 {project.status.toUpperCase()}
               </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1.5"><Icon icon="lucide:users" className="w-4 h-4" /> {project.project_members?.[0]?.count || 0} members</span>
              <span className="flex items-center gap-1.5"><Icon icon="lucide:calendar" className="w-4 h-4" /> {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div className="p-8 text-sm text-gray-500 text-center">No projects found.</div>}
      </div>
    </div>
  );
}

function RecentActivityCard({ tasks }: { tasks: any[] }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800">Recent Activity</h2>
      </div>
      <div className="flex flex-col">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start justify-between p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">
              <div className={`p-2.5 rounded-lg h-fit ${task.priority === 'high' ? 'bg-red-50 text-red-500' : task.priority === 'low' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-400'}`}>
                <Icon icon={task.priority === 'high' ? 'lucide:alert-triangle' : 'lucide:square'} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>Task</span>
                  {task.profiles && (
                    <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded-full">
                      <div className="w-4 h-4 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white">
                        {task.profiles.avatar_url ? <img src={task.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : task.profiles.username?.charAt(0).toUpperCase()}
                      </div>
                      {task.profiles.username}
                    </span>
                  )}
                  <span>{new Date(task.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
              task.status === 'done' ? 'bg-emerald-100 text-emerald-600' :
              task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {task.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className="p-8 text-sm text-gray-500 text-center">No recent activity.</div>}
      </div>
    </div>
  );
}

function TaskListCard({ title, icon, iconColor, count, tasks, badgeBg, badgeColor, emptyText = "No tasks" }: any) {
  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Icon icon={icon} className={`w-4 h-4 ${iconColor}`} />
          {title}
        </div>
        <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${badgeBg} ${badgeColor}`}>
          {count}
        </div>
      </div>
      <div className="flex flex-col p-4 gap-3 flex-1">
        {tasks.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-6 h-full flex items-center justify-center">{emptyText}</div>
        ) : (
          tasks.map((task: any) => (
            <div key={task.task_id} className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
              <h3 className="font-medium text-gray-800 text-sm mb-1">{task.title}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide">TASK • {task.priority} Priority</p>
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
            .limit(3),

          supabase
            .from("my_overdue_tasks")
            .select("*", { count: "exact" })
            .eq("assignee_id", user.id)
            .limit(3),

          supabase
            .from("projects")
            .select("*, project_members(count)")
            .eq("workspace_id", currentWorkspaceId)
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        const projectIds = projectsData?.map(p => p.id) || [];
        const { data: recentTasks } = projectIds.length > 0 ? await supabase
          .from("tasks")
          .select("*, profiles:assignee_id(username, avatar_url)")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(5) : { data: [] };
          
        const { data: myInProgressList } = await supabase
          .from("my_assigned_tasks")
          .select("*")
          .eq("assignee_id", user.id)
          .eq("status", "in_progress")
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
            desc: "proyek di workspace",
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
            iconBg: "bg-rose-100",
            iconColor: "text-rose-500",
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
    <main className="flex min-h-screen flex-col gap-8 bg-white px-5 py-10 text-black md:px-24">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">
            Selamat Datang, {auth.profile?.username ?? "Pengguna"}!
          </h1>
          <p>Ini ringkasan aktivitas proyekmu</p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white md:w-fit"
        >
          <Icon icon="ic:round-plus" className="" />
          Project Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ProjectOverviewCard projects={dashboardData.projects} />
            <RecentActivityCard tasks={dashboardData.recentTasks} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <TaskListCard
              title="My Tasks"
              icon="lucide:user"
              iconColor="text-gray-500"
              count={metadata[2]?.num || 0}
              tasks={dashboardData.myTasksList}
              badgeBg="bg-emerald-100"
              badgeColor="text-emerald-700"
            />
            <TaskListCard
              title="Overdue"
              icon="lucide:triangle-alert"
              iconColor="text-gray-500"
              count={metadata[3]?.num || 0}
              tasks={dashboardData.myOverdueList}
              badgeBg="bg-rose-100"
              badgeColor="text-rose-700"
              emptyText="No overdue tasks"
            />
            <TaskListCard
              title="In Progress"
              icon="lucide:clock"
              iconColor="text-gray-500"
              count={dashboardData.myInProgressList.length}
              tasks={dashboardData.myInProgressList}
              badgeBg="bg-blue-100"
              badgeColor="text-blue-700"
              emptyText="No active tasks"
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
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </main>
  );
}
