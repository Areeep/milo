import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Route as appRoute } from "#/routes/_app";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "#/contexts/WorkspaceContext";
import { supabase } from "#/lib/supabase";
import { CreateProjectModal } from "../dashboard/CreateProjectModal";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import Badge from "#/components/ui/Badge";
import { PROJECT_STATUS, PRIORITY } from "./constants/project";
import type { ProjectStatus, ProjectPriority } from "./constants/project";
import { Icon } from "@iconify/react";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

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
      const matchStatus =
        statusFilter && statusFilter !== "all"
          ? project.status === statusFilter
          : true;
      const matchPriority =
        priorityFilter && priorityFilter !== "all"
          ? project.priority === priorityFilter
          : true;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground mb-1 text-2xl font-bold">
            Daftar Proyek
          </h1>
          <p className="text-muted-foreground text-sm">
            Kelola dan pantau proyek Anda
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="md:w-fit">
          <Plus className="h-4 w-4" />
          Proyek Baru
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col-reverse gap-4 md:flex-row">
        <div className="relative md:w-80">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Cari proyek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="on-hold">Ditunda</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Semua Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value="high">Tinggi</SelectItem>
            <SelectItem value="medium">Menengah</SelectItem>
            <SelectItem value="low">Rendah</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <phantom-ui loading={true} count={4} count-gap="24px">
            <div className="border-border bg-card h-48 rounded-xl border p-5">
              <div className="bg-muted mb-3 h-5 w-1/2 rounded" />
              <div className="bg-muted mb-8 h-4 w-full rounded" />
              <div className="mb-6 flex items-center justify-between">
                <div className="bg-muted h-5 w-16 rounded" />
                <div className="bg-muted h-4 w-24 rounded" />
              </div>
              <div className="space-y-2">
                <div className="bg-muted h-3 w-full rounded" />
                <div className="bg-muted h-1.5 w-full rounded-full" />
              </div>
            </div>
          </phantom-ui>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-muted-foreground py-20 text-center">
          <p>No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              to={"/projects/" + project.id + "/tasks"}
              key={project.id}
              className="group border-border bg-card hover:border-border/80 flex h-full flex-col gap-4 rounded-xl border p-5 shadow-xs transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-foreground mb-1 text-lg font-semibold">
                  {project.name}
                </h3>

                <div className="flex gap-2">
                  <Badge variant={project.status}>
                    {PROJECT_STATUS[project.status]}
                  </Badge>

                  <Badge variant={project.priority}>
                    {PRIORITY[project.priority]}
                  </Badge>
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-2 flex-1 text-xs md:line-clamp-3 md:text-sm">
                {project.description || "Tidak ada deskripsi"}
              </p>

              <div className="space-y-2">
                <div className="text-muted-foreground flex justify-between text-xs font-medium">
                  <span>Kemajuan Proyek</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground text-xs font-medium">
                  {project.tasks[0]?.count || 0} Tugas
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-medium text-white">
                  Lihat Detail{" "}
                  <Icon
                    icon="formkit:arrowright"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  />
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
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
