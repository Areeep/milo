import { Link } from "@tanstack/react-router";
import { AlertCircle, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

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
    <section className="border-border bg-card w-full max-w-md rounded-lg border p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-primary text-sm font-semibold">{copy.eyebrow}</p>
        <h1 className="text-foreground mt-3 text-3xl font-bold tracking-normal">
          {copy.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {copy.description}
        </p>
      </div>

      {error ? (
        <div
          className="border-destructive/20 bg-destructive/10 text-destructive mb-5 flex gap-3 rounded-md border p-3 text-sm"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        {isRegister ? (
          <div className="space-y-1.5">
            <Label>Username</Label>
            <div className="relative">
              <User
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                name="username"
                type="text"
                autoComplete="username"
                placeholder="nama pengguna"
                required
                minLength={3}
                className="pl-9"
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label>Email</Label>
          <div className="relative">
            <Mail
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Password</Label>
          <div className="relative">
            <Lock
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="minimal 6 karakter"
              required
              minLength={6}
              className="pl-9"
            />
          </div>
        </div>

        <Button className="mt-2 w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {copy.submit}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {copy.switchText}{" "}
        <Link
          className="text-primary font-semibold hover:underline"
          to={copy.switchTo}
        >
          {copy.switchLabel}
        </Link>
      </p>
    </section>
  );
}
