import { useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "#/lib/supabase";
import { toast } from "react-hot-toast";

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
      // 1. Find user by email
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

      // 2. Check if already in workspace
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

      // 3. Add to workspace
      const { error: inviteError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role: role,
        });

      if (inviteError) throw inviteError;

      // Success
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h2 className="flex items-center text-xl font-bold text-gray-900">
              <Icon icon="lucide:user-plus" className="mr-2 h-5 w-5" />
              Invite Team Member
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Inviting to workspace: <span className="font-medium text-blue-600">{workspaceName}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Icon icon="lucide:mail" className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 pl-10 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm placeholder:text-gray-400"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Inviting..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
