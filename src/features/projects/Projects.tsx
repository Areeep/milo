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
  }, [currentWorkspaceId]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchSearch = project.name.toLowerCase().includes(search.toLowerCase()) || 
                          (project.description && project.description.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter ? project.status === statusFilter : true;
      const matchPriority = priorityFilter ? project.priority === priorityFilter : true;
      
      return matchSearch && matchStatus && matchPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100/80 text-emerald-600';
      case 'on_hold': return 'bg-amber-100/80 text-amber-600';
      case 'completed': return 'bg-blue-100/80 text-blue-600';
      case 'cancelled': return 'bg-rose-100/80 text-rose-600';
      default: return 'bg-gray-100/80 text-gray-600';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Projects</h1>
          <p className="text-sm text-gray-500">Manage and track your projects</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none pr-8 relative"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="on_hold">Planning / On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none pr-8 relative"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm h-48 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-8"></div>
              <div className="flex justify-between items-center mb-6">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-100 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <Link to={'/projects/' + project.id + '/tasks'} key={project.id} className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-8 flex-1 line-clamp-2">{project.description || "No description"}</p>
              
              <div className="flex justify-between items-center mb-6">
                <span className={`${getStatusColor(project.status)} text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wider`}>
                  {project.status.replace("_", " ")}
                </span>
                {project.priority && (
                  <span className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">
                    {project.priority} Priority
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                  <span>Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                 <span className="text-xs text-gray-500 font-medium">{project.tasks[0]?.count || 0} Tasks</span>
                 <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Project &rarr;</span>
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
          window.location.reload(); 
        }}
      />
    </div>
  );
}
