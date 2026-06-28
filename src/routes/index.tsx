import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const features = [
  {
    title: "Portfolio proyek",
    description: "Lihat total proyek, progres selesai, dan pekerjaan aktif.",
    icon: FolderKanban,
  },
  {
    title: "Tugas personal",
    description: "Pantau tugas yang ditugaskan ke setiap anggota tim.",
    icon: ClipboardList,
  },
  {
    title: "Prioritas terlihat",
    description: "Tandai pekerjaan yang terlambat sebelum menghambat tim.",
    icon: BarChart3,
  },
] as const;

const workflow = [
  "Buat workspace untuk tim",
  "Petakan proyek dan pemilik tugas",
  "Pantau ringkasan harian dari dashboard",
] as const;

function Home() {
  const {
    auth: { user },
  } = Route.useRouteContext();
  const primaryLink = user ? "/dashboard" : "/register";
  const primaryLabel = user ? "Buka dashboard" : "Mulai sekarang";

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link className="flex items-center gap-3" to="/">
          <img src="/logo192.png" alt="Milo" className="h-10 w-10 rounded-md" />
          <span className="text-xl font-bold">Milo</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? null : (
            <Link
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              to="/login"
            >
              Masuk
            </Link>
          )}
          <Link
            className="flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            to={primaryLink}
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-5 pt-8 pb-16 md:px-8 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:pt-14 lg:pb-20">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Project management untuk tim kecil
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-normal text-slate-950 md:text-6xl">
            Milo
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Workspace ringan untuk mengatur proyek, tugas, dan prioritas tim
            tanpa membuat pekerjaan harian terasa ramai.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              to={primaryLink}
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              className="flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-emerald-600 hover:text-emerald-700"
              to={user ? "/dashboard" : "/login"}
            >
              {user ? "Lihat ringkasan" : "Masuk ke akun"}
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["4", "metrik utama"],
              ["1", "dashboard kerja"],
              ["24/7", "akses aman"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-sm text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute top-8 -left-5 hidden h-28 w-28 rounded-lg bg-amber-100 lg:block" />
          <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo512.png"
                  alt=""
                  className="h-12 w-12 rounded-md"
                  aria-hidden
                />
                <div>
                  <p className="font-semibold text-slate-950">Dashboard Milo</p>
                  <p className="text-sm text-slate-500">Ringkasan workspace</p>
                </div>
              </div>
              <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Total Proyek", "12", "bg-sky-50 text-sky-700"],
                ["Selesai", "8", "bg-emerald-50 text-emerald-700"],
                ["Tugas", "34", "bg-violet-50 text-violet-700"],
                ["Terlambat", "3", "bg-amber-50 text-amber-700"],
              ].map(([label, value, tone]) => (
                <div
                  key={label}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {value}
                  </p>
                  <span
                    className={`mt-4 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${tone}`}
                  >
                    Live
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Sprint produk</p>
                <span className="text-sm text-emerald-700">68%</span>
              </div>
              <div className="mt-3 h-2 rounded-md bg-slate-100">
                <div className="h-2 w-2/3 rounded-md bg-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-5 py-10 md:grid-cols-3 md:px-8">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="rounded-md border border-slate-200 bg-white p-5"
                key={feature.title}
              >
                <Icon className="h-6 w-6 text-emerald-700" aria-hidden />
                <h2 className="mt-4 text-lg font-bold">{feature.title}</h2>
                <p className="mt-2 leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-5 py-14 md:grid-cols-[0.8fr_1fr] md:px-8">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Alur sederhana
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal">
            Dari rencana ke eksekusi tanpa banyak tab.
          </h2>
        </div>
        <div className="space-y-4">
          {workflow.map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-4 rounded-md border border-slate-200 p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-sm font-bold text-emerald-700">
                {index + 1}
              </span>
              <span className="font-medium text-slate-800">{item}</span>
              <CheckCircle2
                className="ml-auto h-5 w-5 text-emerald-600"
                aria-hidden
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
