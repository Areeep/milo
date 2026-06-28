import { createContext, useContext, useState, useEffect } from "react";

type Workspace = {
  id: string;
  name: string;
  avatar_url: string | null;
};

type WorkspaceContextType = {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  activeWorkspace: Workspace | null;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children, workspaces }: { children: React.ReactNode, workspaces: Workspace[] }) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(workspaces[0]?.id || null);

  useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId]);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || null;

  return (
    <WorkspaceContext.Provider value={{ activeWorkspaceId, setActiveWorkspaceId, activeWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
