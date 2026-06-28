import { Link, useRouter } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Folder,
  LayoutDashboard,
  Plus,
  Users,
  CheckSquare,
  Calendar,
  BarChart,
  Settings,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "#/lib/supabase";

type Workspace = {
  id: string;
  name: string;
  avatar_url: string | null;
};

type Project = {
  id: string;
  name: string;
};

type SidebarProps = {
  workspaces: Workspace[];
};

export function Sidebar({ workspaces }: SidebarProps) {
  const router = useRouter();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    workspaces[0] || null
  );
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  // Sync activeWorkspace when workspaces prop changes (e.g. after creating the first workspace)
  useEffect(() => {
    if (!activeWorkspace && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, activeWorkspace]);

  // Fetch projects when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("workspace_id", activeWorkspace.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setProjects(data);
      }
    };

    fetchProjects();
  }, [activeWorkspace]);

  // Handle clicking outside floating menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        workspaceMenuRef.current &&
        !workspaceMenuRef.current.contains(event.target as Node)
      ) {
        setIsWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleProject = (projectId: string) => {
    setOpenProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  if (!activeWorkspace) return null;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="relative border-b border-slate-200 p-4" ref={workspaceMenuRef}>
        <div
          className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-slate-100"
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              {activeWorkspace.avatar_url ? (
                <img
                  src={activeWorkspace.avatar_url}
                  alt={activeWorkspace.name}
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-slate-900">
                {activeWorkspace.name}
              </span>
              <span className="text-xs text-slate-500">
                {projects.length} proyek
              </span>
            </div>
          </div>
          <div className="flex flex-col text-slate-400">
            <ChevronUp className="h-3 w-3" />
            <ChevronDown className="-mt-1 h-3 w-3" />
          </div>
        </div>

        {/* Floating Workspace Menu */}
        {isWorkspaceMenuOpen && (
          <div className="absolute left-4 right-4 top-full z-50 mt-1 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${
                  ws.id === activeWorkspace.id
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => {
                  setActiveWorkspace(ws);
                  setIsWorkspaceMenuOpen(false);
                }}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100">
                  <Building2 className="h-3 w-3" />
                </div>
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
            <div className="my-1 border-t border-slate-100"></div>
            <Link
              to="/create-workspace"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
              onClick={() => setIsWorkspaceMenuOpen(false)}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100">
                <Plus className="h-4 w-4" />
              </div>
              <span>Tambah ruang kerja</span>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        <nav className="space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 [&.active]:bg-emerald-50 [&.active]:text-emerald-700"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 [&.active]:bg-emerald-50 [&.active]:text-emerald-700"
          >
            <Folder className="h-4 w-4 shrink-0" />
            Proyek
          </Link>
          <Link
            to="/team"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 [&.active]:bg-emerald-50 [&.active]:text-emerald-700"
          >
            <Users className="h-4 w-4 shrink-0" />
            Tim
          </Link>
        </nav>

        {/* Projects Section */}
        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Daftar Proyek
            </span>
            <button className="text-slate-400 hover:text-slate-600">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.length === 0 ? (
              <div className="px-2 py-2 text-sm text-slate-500">
                Tidak ada Proyek
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id}>
                  <button
                    onClick={() => toggleProject(project.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {openProjects[project.id] ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <span className="truncate">{project.name}</span>
                  </button>

                  {/* Submenu Accordion */}
                  {openProjects[project.id] && (
                    <div className="mt-1 flex flex-col space-y-1 pl-8 pr-2">
                      <Link
                        to="/projects/$projectId/tasks"
                        params={{ projectId: project.id }}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 [&.active]:bg-slate-100 [&.active]:text-slate-900 [&.active]:font-medium"
                      >
                        <CheckSquare className="h-4 w-4 shrink-0" />
                        Tugas
                      </Link>
                      <Link
                        to="/projects/$projectId/calendar"
                        params={{ projectId: project.id }}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 [&.active]:bg-slate-100 [&.active]:text-slate-900 [&.active]:font-medium"
                      >
                        <Calendar className="h-4 w-4 shrink-0" />
                        Kalender
                      </Link>
                      <Link
                        to="/projects/$projectId/analytics"
                        params={{ projectId: project.id }}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 [&.active]:bg-slate-100 [&.active]:text-slate-900 [&.active]:font-medium"
                      >
                        <BarChart className="h-4 w-4 shrink-0" />
                        Analitik
                      </Link>
                      <Link
                        to="/projects/$projectId/settings"
                        params={{ projectId: project.id }}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 [&.active]:bg-slate-100 [&.active]:text-slate-900 [&.active]:font-medium"
                      >
                        <Settings className="h-4 w-4 shrink-0" />
                        Pengaturan
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
