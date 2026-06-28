import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const authCopy = {
  login: {
    eyebrow: "Selamat datang kembali",
    title: "Masuk ke Milo",
    description: "Lanjutkan koordinasi proyek, tugas, dan ritme kerja timmu.",
    submit: "Masuk",
    switchText: "Belum punya akun?",
    switchLabel: "Daftar",
    switchTo: "/register",
  },
  register: {
    eyebrow: "Mulai lebih rapi",
    title: "Buat akun Milo",
    description:
      "Siapkan ruang kerja untuk menyatukan proyek dan tanggung jawab.",
    submit: "Buat akun",
    switchText: "Sudah punya akun?",
    switchLabel: "Masuk",
    switchTo: "/login",
  },
} as const;

export function AuthForm({
  mode,
  error,
  isSubmitting,
  onSubmit,
}: AuthFormProps) {
  const copy = authCopy[mode];
  const isRegister = mode === "register";

  return (
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-emerald-700">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
          {copy.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {copy.description}
        </p>
      </div>

      {error ? (
        <div
          className="mb-5 flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        {isRegister ? (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Username</span>
            <span className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
              <User className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="nama pengguna"
                required
                minLength={3}
              />
            </span>
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <span className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
            <Mail className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              required
            />
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <span className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
            <Lock className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="minimal 6 karakter"
              required
              minLength={6}
            />
          </span>
        </label>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden />
          )}
          {copy.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {copy.switchText}{" "}
        <Link
          className="font-semibold text-emerald-700 hover:text-emerald-800"
          to={copy.switchTo}
        >
          {copy.switchLabel}
        </Link>
      </p>
    </section>
  );
}
