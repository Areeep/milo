import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const user = context.auth.user;

    // kalau sudah login, jangan bisa akses login/register
    if (user) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 py-8 lg:grid-cols-[0.9fr_1fr] lg:px-8">
        <section className="hidden lg:block">
          <div className="mb-10 flex items-center gap-3">
            <img
              src="/logo192.png"
              alt="Milo"
              className="h-11 w-11 rounded-md"
            />
            <span className="text-xl font-bold">Milo</span>
          </div>

          <div className="max-w-md">
            <p className="text-sm font-semibold text-primary">
              Project workspace
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-normal">
              Kelola kerja tim tanpa kehilangan konteks.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Milo membantu tim melihat proyek, tugas, dan prioritas harian di
              satu tempat yang tenang untuk dipakai setiap hari.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {[
              "Ringkasan proyek siap dipindai",
              "Akses aman dengan akun tim",
              "Tampilan responsif untuk kerja mobile",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-slate-700"
              >
                <CheckCircle2
                  className="h-5 w-5 text-primary"
                  aria-hidden
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex w-full justify-center">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
