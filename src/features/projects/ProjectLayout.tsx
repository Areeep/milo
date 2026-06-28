import { useState, useEffect } from "react";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { supabase } from "#/lib/supabase";
import { CreateTaskModal } from "./CreateTaskModal";

export function ProjectLayout({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

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
          .eq("status", "in_progress");

        // Assuming team members might come from workspace_members if project_members is empty
        // For simplicity, we just count project_members. 
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
  }, [projectId]);

  const handleTaskCreated = () => {
    // We can reload the page or re-fetch data. Reloading for simplicity.
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse bg-[#f8fafc] min-h-full">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="flex gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-24 bg-gray-100 rounded-lg border border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-gray-500 bg-[#f8fafc] min-h-full">
        Project not found.
      </div>
    );
  }

  const tabs = [
    { name: "Tasks", to: `/projects/${projectId}/tasks` },
    { name: "Calendar", to: `/projects/${projectId}/calendar` },
    { name: "Analytics", to: `/projects/${projectId}/analytics` },
    { name: "Settings", to: `/projects/${projectId}/settings` },
  ];

  return (
    <div className="p-8 flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.history.back()}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
            {project.status.replace("_", " ")}
          </span>
        </div>
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-500">Total Tasks</span>
            <span className="text-gray-400">⚡</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.totalTasks}</span>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-500">Completed</span>
            <span className="text-emerald-500">⚡</span>
          </div>
          <span className="text-3xl font-bold text-emerald-600">{stats.completedTasks}</span>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-500">In Progress</span>
            <span className="text-amber-500">⚡</span>
          </div>
          <span className="text-3xl font-bold text-amber-600">{stats.inProgressTasks}</span>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-500">Team Members</span>
            <span className="text-blue-500">⚡</span>
          </div>
          <span className="text-3xl font-bold text-blue-600">{stats.teamMembers}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.to}
            className="pb-3 text-sm font-medium transition-colors"
            activeProps={{ className: "border-b-2 border-blue-600 text-gray-900" }}
            inactiveProps={{ className: "text-gray-500 hover:text-gray-700" }}
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
