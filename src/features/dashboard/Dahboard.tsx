import { supabase } from "#/lib/supabase";
import { Route as rootRoute } from "#/routes/__root";
import { Icon } from "@iconify/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
    <div className="flex justify-between rounded-md border border-gray-300 p-4">
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

export default function Dashboard() {
  const navigate = useNavigate();

  const { auth } = rootRoute.useRouteContext();
  const user = auth.user;

  console.log(auth);

  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<MetadataProps[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      setLoading(true);

      try {
        // Cari workspace milik user
        const { data: workspaceMember, error: workspaceError } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (workspaceError) throw workspaceError;

        if (!workspaceMember) {
          console.log("User belum punya workspace");
          return;
        }

        const workspaceId = workspaceMember.workspace_id;

        const [
          { data: projectStats },
          { count: assignedTasks },
          { count: overdueTasks },
        ] = await Promise.all([
          supabase
            .from("workspace_project_stats")
            .select("*")
            .eq("workspace_id", workspaceId)
            .maybeSingle(),

          supabase
            .from("my_assigned_tasks")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("assignee_id", user.id),

          supabase
            .from("my_overdue_tasks")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("assignee_id", user.id),
        ]);

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
            iconBg: "bg-green-100",
            iconColor: "text-green-500",
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
  }, [user]);

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-white px-5 py-10 text-black md:px-24">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">
            Selamat Datang, {auth.profile?.username ?? "Pengguna"}!
          </h1>
          <p>Ini ringkasan aktivitas proyekmu</p>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white md:w-fit">
          <Icon icon="ic:round-plus" className="" />
          Project Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-md bg-gray-100"
              />
            ))
          : metadata.map((item) => <MetadataCard key={item.title} {...item} />)}
      </div>
    </main>
  );
}
