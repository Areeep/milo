import { useState, useEffect } from "react";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { supabase } from "#/lib/supabase";
import { CreateTaskModal } from "./CreateTaskModal";
import { Button } from "#/components/ui/button";
import Badge from "#/components/ui/Badge";
import { PROJECT_STATUS } from "./constants/project";
import type { ProjectStatus, ProjectPriority } from "./constants/project";
import { Icon } from "@iconify/react";
import { Card, CardContent } from "#/components/ui/card";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
};

type MetadataCardProps = {
  title: string;
  value: number | string;
  description?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
};

function MetadataCard({
  title,
  value,
  description,
  icon,
  iconBg,
  iconColor,
}: MetadataCardProps) {
  return (
    <Card>
      <CardContent className="flex justify-between p-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        <div className={`h-fit rounded-xl p-3 ${iconBg}`}>
          <Icon icon={icon} className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectLayout({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      setLoading(true);
      try {
        // Fetch project info
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Fetch stats
        const { count: totalTasks } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId);

        const { count: completedTasks } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId)
          .eq("status", "done");

        const { count: inProgressTasks } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId)
          .eq("status", "in-progress");

        const { count: teamMembers } = await supabase
          .from("project_members")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId);

        setStats({
          totalTasks: totalTasks || 0,
          completedTasks: completedTasks || 0,
          inProgressTasks: inProgressTasks || 0,
          teamMembers: teamMembers || 0,
        });
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, refreshTrigger]);

  const handleTaskCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    window.dispatchEvent(new Event("refresh-tasks"));
  };

  if (loading) {
    return (
      <div className="min-h-full p-8">
        <phantom-ui loading={true}>
          <div className="bg-muted mb-8 h-8 w-1/4 rounded" />
          <div className="mb-8 flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border-border bg-card h-24 flex-1 rounded-lg border"
              />
            ))}
          </div>
        </phantom-ui>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-muted-foreground min-h-full p-8 text-center">
        Project tidak ditemukan.
      </div>
    );
  }

  const tabs = [
    { name: "Tugas", to: `/projects/${projectId}/tasks` },
    { name: "Kalendar", to: `/projects/${projectId}/calendar` },
    { name: "Analitik", to: `/projects/${projectId}/analytics` },
    { name: "Pengaturan", to: `/projects/${projectId}/settings` },
  ];

  const metadata = [
    {
      title: "Total Tugas",
      value: stats.totalTasks,
      description: `tugas di ${project.name}`,
      icon: "lucide:list-todo",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
    },
    {
      title: "Selesai",
      value: stats.completedTasks,
      description: `telah diselesaikan`,
      valueColor: "text-emerald-400",
      icon: "lucide:check-check",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      title: "Dalam Proses",
      value: stats.inProgressTasks,
      description: `sedang dikerjakan`,
      valueColor: "text-amber-600",
      icon: "lucide:clock-3",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
    {
      title: "Anggota Tim",
      description: `anggota tim di ${project.name}`,
      value: stats.teamMembers,
      valueColor: "text-blue-600",
      icon: "lucide:users",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="flex flex-1 flex-col pb-8">
      {/* Header */}
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Link
            to="/projects"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <h1 className="text-2xl font-semibold">{project.name}</h1>

          <Badge variant={project.status}>
            {PROJECT_STATUS[project.status]}
          </Badge>
        </div>

        <Button onClick={() => setIsTaskModalOpen(true)} className="sm:w-fit">
          <Plus className="h-4 w-4" />
          Tugas Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metadata.map((item) => (
          <MetadataCard key={item.title} {...item} />
        ))}
      </div>

      {/* Tabs */}
      <div className="border-border mb-6 flex gap-6 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.to}
            className="pb-3 text-sm font-medium transition-colors"
            activeProps={{
              className: "border-b-2 border-primary text-foreground",
            }}
            inactiveProps={{
              className: "text-muted-foreground hover:text-foreground",
            }}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={projectId}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
