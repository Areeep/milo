import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "#/lib/supabase";
import { Loader2, Building2, UploadCloud } from "lucide-react";
import { useWorkspace } from "#/contexts/WorkspaceContext";
import { toast } from "react-hot-toast";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

export const Route = createFileRoute("/_app/create-workspace")({
  component: CreateWorkspacePage,
});

function CreateWorkspacePage() {
  const router = useRouter();
  const { setActiveWorkspaceId } = useWorkspace();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

    // 2. Upload Avatar if selected
    let finalAvatarUrl = null;
    const fileInput = document.getElementById("logo") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `workspace-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Failed to upload avatar:", uploadError);
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;
      }
    }

    // 3. Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({ name, avatar_url: finalAvatarUrl })
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
        role: "owner",
      });

    if (memberError) {
      setError(memberError.message);
      setIsSubmitting(false);
      return;
    }

    setActiveWorkspaceId(workspace.id);
    toast.success("Ruang kerja berhasil dibuat");
    await router.invalidate();
    await router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="border-border bg-card w-full max-w-md rounded-lg border p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/15">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Workspace Icon"
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-white" />
            )}
          </div>
          <h1 className="text-foreground text-2xl font-bold">
            Buat Ruang Kerja
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Mulai kelola proyek dan tim Anda dengan membuat ruang kerja baru.
          </p>
        </div>

        {error && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive mb-5 rounded-md border p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-1.5">
            <Label>Logo Ruang Kerja</Label>
            <div className="border-border bg-muted/50 mt-2 flex justify-center rounded-lg border border-dashed px-6 py-8">
              <div className="text-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="mx-auto mb-4 h-20 w-20 rounded-md object-cover shadow-sm"
                  />
                ) : (
                  <UploadCloud className="text-muted-foreground mx-auto h-8 w-8" />
                )}
                <div className="text-muted-foreground mt-4 flex justify-center text-sm leading-6">
                  <span className="text-primary relative cursor-pointer rounded-md font-semibold focus-within:outline-none hover:underline">
                    {logoPreview ? "Ganti file" : "Upload file"}
                    <input
                      id="logo"
                      name="logo"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </span>
                  <p className="pl-1">atau drag and drop</p>
                </div>
                <p className="text-muted-foreground text-xs leading-5">
                  PNG, JPG hingga 2MB (opsional)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Nama Ruang Kerja</Label>
            <Input
              type="text"
              name="name"
              required
              placeholder="Contoh: Milo Team, Acutest, dll."
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Buat Ruang Kerja
          </Button>
        </form>
      </div>
    </div>
  );
}
