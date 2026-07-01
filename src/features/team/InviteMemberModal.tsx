import { useState } from "react";
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

export function InviteMemberModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  onInvited,
}: {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string | null;
  workspaceName: string;
  onInvited: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !email) return;

    setLoading(true);
    setError(null);
    try {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email);

      if (profileError) throw profileError;

      if (profiles.length === 0) {
        setError("User with this email not found.");
        return;
      }

      const userId = profiles[0].id;

      const { data: existingMember } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingMember) {
        setError("User is already a member of this workspace.");
        return;
      }

      const { error: inviteError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role: role,
        });

      if (inviteError) throw inviteError;

      setEmail("");
      setRole("member");
      onInvited();
      onClose();
      toast.success("Anggota berhasil diundang");
    } catch (err: any) {
      console.error("Error inviting member:", err);
      setError(err.message || "Failed to invite member. Please try again.");
      toast.error(err.message || "Gagal mengundang anggota");
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
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Mengundang ke workspace:{" "}
            <span className="text-primary font-semibold">{workspaceName}</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Icon
                icon="lucide:mail"
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              />
              <Input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-border mt-2 flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Inviting..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
