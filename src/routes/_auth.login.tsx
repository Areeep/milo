import { AuthForm } from "#/features/auth";
import { supabase } from "#/lib/supabase";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      setIsSubmitting(false);
      return;
    }

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    const { data: workspaces } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", authData.user.id)
      .limit(1);

    await router.invalidate();

    if (workspaces && workspaces.length > 0) {
      await router.navigate({ to: "/dashboard" });
    } else {
      await router.navigate({ to: "/create-workspace" });
    }
  };

  return (
    <AuthForm
      mode="login"
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleLogin}
    />
  );
}
