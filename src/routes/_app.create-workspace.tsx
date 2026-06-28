import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "#/lib/supabase";
import { Loader2, Building2, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/_app/create-workspace")({
  component: CreateWorkspacePage,
});

function CreateWorkspacePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    
    if (!name) {
      setError("Nama ruang kerja wajib diisi.");
      setIsSubmitting(false);
      return;
    }

    // 1. Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      setError("Gagal mendapatkan data pengguna. Pastikan Anda sudah login.");
      setIsSubmitting(false);
      return;
    }
    
    // 2. Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({ name, avatar_url: null })
      .select()
      .single();

    if (workspaceError || !workspace) {
      setError(workspaceError?.message || "Gagal membuat ruang kerja.");
      setIsSubmitting(false);
      return;
    }

    // 3. Create workspace member (owner)
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: userData.user.id,
        role: "owner"
      });

    if (memberError) {
      setError(memberError.message);
      setIsSubmitting(false);
      return;
    }

    await router.invalidate();
    await router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Building2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Buat Ruang Kerja</h1>
          <p className="mt-2 text-sm text-slate-600">
            Mulai kelola proyek dan tim Anda dengan membuat ruang kerja baru.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Logo Ruang Kerja</span>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-8">
              <div className="text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                <div className="mt-4 flex text-sm leading-6 text-slate-600">
                  <span className="relative cursor-pointer rounded-md bg-white font-semibold text-emerald-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 hover:text-emerald-500">
                    Upload file
                    <input id="logo" name="logo" type="file" className="sr-only" accept="image/*" />
                  </span>
                  <p className="pl-1">atau drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-slate-500">PNG, JPG hingga 2MB (opsional)</p>
              </div>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nama Ruang Kerja</span>
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: Milo Team, Acutest, dll."
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Buat Ruang Kerja
          </button>
        </form>
      </div>
    </div>
  );
}
