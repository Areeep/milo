import { supabase } from "#/lib/supabase";
import { Route as rootRoute } from "#/routes/__root";
import { Icon } from "@iconify/react";
import { useNavigate } from "@tanstack/react-router";

type metadataProps = {
  title: string;
  num: number;
  desc: string;
  icon: string;
  iconBg: string;
  iconColor: string;
};

const metadata = [
  {
    title: "Total Proyek",
    num: 2,
    desc: "proyek di workspace",
    icon: "lucide:folder-open",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    title: "Proyek Selesai",
    num: 2,
    desc: "dari total num proyek",
    icon: "lucide:check-circle",
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
  },
  {
    title: "Tugas",
    num: 2,
    icon: "lucide:clipboard-pen",
    desc: "yang ditugaskan",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
  },
  {
    title: "Terlambat",
    num: 2,
    icon: "lucide:triangle-alert",
    desc: "perlu diperhatikan",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
];

function MetadataCard({
  title,
  num,
  desc,
  icon,
  iconBg,
  iconColor,
}: metadataProps) {
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
  const userEmail = user?.email ?? "Pengguna";

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      await navigate({ to: "/login" });
    } catch (error) {
      console.error("[Logout Error]: Gagal melakukan sign out", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-white px-5 py-10 text-black *:font-sans md:px-24">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Selamat Datang, user!</h1>
          <p>Ini ringkasan aktivitas proyekmu</p>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white md:w-fit">
          <Icon icon="ic:round-plus" className="" />
          Project Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {metadata.map((item, index) => (
          <MetadataCard key={index} {...item} />
        ))}
      </div>
    </main>
  );
}
