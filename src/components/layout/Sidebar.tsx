import { Link } from "@tanstack/react-router";
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
import { useWorkspace } from "#/contexts/WorkspaceContext";
import { Icon } from "@iconify/react";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import { cn } from "#/lib/utils";

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
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
};

export function Sidebar({
  workspaces,
  isOpen = false,
  setIsOpen,
}: SidebarProps) {
  const { activeWorkspace, setActiveWorkspaceId } = useWorkspace();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

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

    const handleRefresh = () => fetchProjects();
    window.addEventListener("refresh-sidebar", handleRefresh);

    return () => {
      window.removeEventListener("refresh-sidebar", handleRefresh);
    };
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "border-border bg-background fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r transition-transform duration-300 md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div
          className="border-border relative border-b p-4"
          ref={workspaceMenuRef}
        >
          <div
            className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md p-2"
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                  !activeWorkspace?.avatar_url &&
                  "bg-primary/10 text-primary",
                )}
              >
                {activeWorkspace?.avatar_url ? (
                  <img
                    src={activeWorkspace.avatar_url}
                    alt={activeWorkspace.name}
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <Icon
                    icon="material-symbols:home-work-outline-rounded"
                    className="h-5 w-5"
                  />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-foreground truncate text-sm font-semibold">
                  {activeWorkspace
                    ? activeWorkspace.name
                    : "Belum ada workspace"}
                </span>
                <span className="text-muted-foreground text-xs">
                  {activeWorkspace
                    ? `${projects.length} proyek`
                    : "Buat workspace baru"}
                </span>
              </div>
            </div>
            <div className="text-muted-foreground flex flex-col">
              <ChevronUp className="h-3 w-3" />
              <ChevronDown className="-mt-1 h-3 w-3" />
            </div>
          </div>

          {/* Floating Workspace Menu */}
          {isWorkspaceMenuOpen && (
            <div className="border-border bg-popover absolute top-full right-4 left-4 z-50 mt-1 rounded-md border p-1 shadow-lg">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                    ws.id === activeWorkspace?.id
                      ? "bg-muted font-semibold text-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setIsWorkspaceMenuOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded",
                      !ws.avatar_url && "bg-muted",
                    )}
                  >
                    {ws.avatar_url ? (
                      <img
                        src={ws.avatar_url}
                        alt={ws.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Icon
                        icon="material-symbols:home-work-outline-rounded"
                        className="h-3 w-3"
                      />
                    )}
                  </div>
                  <span className="truncate">{ws.name}</span>
                </button>
              ))}
              <Separator className="my-1" />
              <Link
                to="/create-workspace"
                className="text-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm"
                onClick={() => setIsWorkspaceMenuOpen(false)}
              >
                <div className="bg-muted flex h-6 w-6 shrink-0 items-center justify-center rounded">
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
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium [&.active]:bg-muted [&.active]:text-foreground [&.active]:font-semibold"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium [&.active]:bg-muted [&.active]:text-foreground [&.active]:font-semibold"
            >
              <Folder className="h-4 w-4 shrink-0" />
              Proyek
            </Link>
            <Link
              to="/team"
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium [&.active]:bg-muted [&.active]:text-foreground [&.active]:font-semibold"
            >
              <Users className="h-4 w-4 shrink-0" />
              Tim
            </Link>
          </nav>

          {/* Projects Section */}
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                Daftar Proyek
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1">
              {projects.length === 0 ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  Tidak ada Proyek
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project.id}>
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="text-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium"
                    >
                      {openProjects[project.id] ? (
                        <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">{project.name}</span>
                    </button>

                    {/* Submenu Accordion */}
                    {openProjects[project.id] && (
                      <div className="mt-1 flex flex-col space-y-1 pr-2 pl-8">
                        <Link
                          to="/projects/$projectId/tasks"
                          params={{ projectId: project.id }}
                          className="text-muted-foreground hover:bg-muted [&.active]:bg-muted [&.active]:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm [&.active]:font-medium"
                        >
                          <CheckSquare className="h-4 w-4 shrink-0" />
                          Tugas
                        </Link>
                        <Link
                          to="/projects/$projectId/calendar"
                          params={{ projectId: project.id }}
                          className="text-muted-foreground hover:bg-muted [&.active]:bg-muted [&.active]:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm [&.active]:font-medium"
                        >
                          <Calendar className="h-4 w-4 shrink-0" />
                          Kalender
                        </Link>
                        <Link
                          to="/projects/$projectId/analytics"
                          params={{ projectId: project.id }}
                          className="text-muted-foreground hover:bg-muted [&.active]:bg-muted [&.active]:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm [&.active]:font-medium"
                        >
                          <BarChart className="h-4 w-4 shrink-0" />
                          Analitik
                        </Link>
                        <Link
                          to="/projects/$projectId/settings"
                          params={{ projectId: project.id }}
                          className="text-muted-foreground hover:bg-muted [&.active]:bg-muted [&.active]:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm [&.active]:font-medium"
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
    </>
  );
}
