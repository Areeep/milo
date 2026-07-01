import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "#/components/ui/dialog";

export function AddProjectMemberModal({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  onAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  workspaceId: string;
  onAdded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roleName, setRoleName] = useState("Member");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !workspaceId || !projectId) return;

    const fetchCandidates = async () => {
      try {
        const { data: workspaceMembers, error: wmError } = await supabase
          .from("workspace_members")
          .select("user_id, profiles!inner(username, email)")
          .eq("workspace_id", workspaceId);

        if (wmError) throw wmError;

        const { data: projectMembers, error: pmError } = await supabase
          .from("project_members")
          .select("user_id")
          .eq("project_id", projectId);

        if (pmError) throw pmError;

        const projectMemberIds = new Set(projectMembers.map((m) => m.user_id));

        const available = workspaceMembers
          .filter((wm) => !projectMemberIds.has(wm.user_id))
          .map((wm: any) => ({
            id: wm.user_id,
            email: wm.profiles?.email || wm.profiles?.[0]?.email,
            username: wm.profiles?.username || wm.profiles?.[0]?.username,
          }));

        setCandidates(available);
        if (available.length > 0) {
          setSelectedUserId(available[0].id);
        }
      } catch (err) {
        console.error("Error fetching candidates:", err);
      }
    };

    fetchCandidates();
  }, [isOpen, workspaceId, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !roleName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let roleId;
      const { data: existingRoles } = await supabase
        .from("project_roles")
        .select("id")
        .eq("project_id", projectId)
        .ilike("role_name", roleName);

      if (existingRoles && existingRoles.length > 0) {
        roleId = existingRoles[0].id;
      } else {
        const { data: newRole, error: roleError } = await supabase
          .from("project_roles")
          .insert({
            project_id: projectId,
            role_name: roleName,
          })
          .select("id")
          .single();

        if (roleError) throw roleError;
        roleId = newRole.id;
      }

      const { error: insertError } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: selectedUserId,
          role_id: roleId,
        });

      if (insertError) throw insertError;

      onAdded();
      onClose();
      setRoleName("Member"); // Reset
      toast.success("Anggota berhasil ditambahkan ke proyek");
    } catch (err: any) {
      console.error("Error adding project member:", err);
      setError(err.message || "Failed to add member.");
      toast.error(err.message || "Gagal menambahkan anggota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="lucide:user-plus" className="h-5 w-5" />
            Tambah Anggota Proyek
          </DialogTitle>
          <DialogDescription>
            Pilih anggota workspace untuk ditambahkan ke proyek ini.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Anggota Workspace</Label>
            {candidates.length > 0 ? (
              <Select value={selectedUserId} onValueChange={(val) => val && setSelectedUserId(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.email} ({c.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="border-border bg-muted/50 text-muted-foreground rounded-md border border-dashed p-2 text-sm italic">
                Tidak ada anggota yang tersedia.
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Role Proyek</Label>
            <Input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Frontend Developer, Team Lead"
            />
          </div>

          <div className="border-border flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || candidates.length === 0}>
              {loading ? "Menambahkan..." : "Tambah Anggota"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
