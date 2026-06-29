import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Route as appRoute } from "#/routes/_app";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "#/contexts/WorkspaceContext";
import { supabase } from "#/lib/supabase";
import { CreateProjectModal } from "../dashboard/CreateProjectModal";

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  tasks: { count: number }[];
};

export function Projects() {
  const { activeWorkspace } = useWorkspace();
  const currentWorkspaceId = activeWorkspace?.id;
  const currentWorkspaceName = activeWorkspace?.name || "Workspace";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!currentWorkspaceId) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*, tasks(count)")
          .eq("workspace_id", currentWorkspaceId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentWorkspaceId, refreshTrigger]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        (project.description &&
          project.description.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter ? project.status === statusFilter : true;
      const matchPriority = priorityFilter
        ? project.priority === priorityFilter
        : true;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif":
        return "bg-emerald-100/80 text-emerald-600";
      case "Ditunda":
        return "bg-amber-100/80 text-amber-600";
      case "Selesai":
        return "bg-blue-100/80 text-blue-600";
      case "Dibatalkan":
        return "bg-rose-100/80 text-rose-600";
      default:
        return "bg-gray-100/80 text-gray-600";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            Daftar Proyek
          </h1>
          <p className="text-sm text-gray-500">
            Manage and track your projects
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Proyek Baru
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 flex gap-4">
        <div className="relative w-80">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="relative cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-sm text-gray-600 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Ditunda">Ditunda</option>
          <option value="Selesai">Selesai</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="relative cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-sm text-gray-600 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        >
          <option value="">Semua Prioritas</option>
          <option value="Tinggi">Tinggi</option>
          <option value="Menengah">Menengah</option>
          <option value="Rendah">Rendah</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 h-5 w-1/2 rounded bg-gray-200"></div>
              <div className="mb-8 h-4 w-full rounded bg-gray-100"></div>
              <div className="mb-6 flex items-center justify-between">
                <div className="h-5 w-16 rounded bg-gray-200"></div>
                <div className="h-4 w-24 rounded bg-gray-100"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-100"></div>
                <div className="h-1.5 w-full rounded-full bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <Link
              to={"/projects/" + project.id + "/tasks"}
              key={project.id}
              className="group flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                {project.name}
              </h3>
              <p className="mb-8 line-clamp-2 flex-1 text-sm text-gray-500">
                {project.description || "No description"}
              </p>

              <div className="mb-6 flex items-center justify-between">
                <span
                  className={`${getStatusColor(project.status)} rounded px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase`}
                >
                  {project.status.replace("_", " ")}
                </span>
                {project.priority && (
                  <span className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                    {project.priority} Priority
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-medium text-gray-500">
                  <span>Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                <span className="text-xs font-medium text-gray-500">
                  {project.tasks[0]?.count || 0} Tasks
                </span>
                <span className="text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                  View Project &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={currentWorkspaceId || null}
        workspaceName={currentWorkspaceName}
        onProjectCreated={() => {
          // Instead of a full page reload, we can just reload the data
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
