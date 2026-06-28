import { AuthForm } from "#/features/auth";
import { supabase } from "#/lib/supabase";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!username || !email || !password) {
      setError("Username, email, dan password wajib diisi.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setIsSubmitting(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    await router.navigate({ to: "/create-workspace" });
  };

  return (
    <AuthForm
      mode="register"
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleRegister}
    />
  );
}
