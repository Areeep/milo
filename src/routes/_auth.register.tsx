import { supabase } from "#/lib/supabase";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.navigate({ to: "/login" });
  };

  return (
    <form onSubmit={handleRegister} className="flex w-80 flex-col gap-3">
      <input name="username" placeholder="Username" className="border p-2" />
      <input name="email" placeholder="Email" className="border p-2" />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="border p-2"
      />
      <button className="bg-black p-2 text-white">Register</button>
    </form>
  );
}
