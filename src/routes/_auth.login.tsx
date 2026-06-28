import { supabase } from "#/lib/supabase";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    // contoh: supabase / api login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // update context auth kamu (tergantung setup)
    await router.invalidate();

    // redirect setelah login
    router.navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={handleLogin} className="flex w-80 flex-col gap-3">
      <input name="email" placeholder="Email" className="border p-2" />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="border p-2"
      />
      <button className="bg-black p-2 text-white">Login</button>
    </form>
  );
}
