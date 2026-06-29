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
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("milo_active_workspace");
      if (saved && workspaces.some(w => w.id === saved)) {
        return saved;
      }
    }
    return workspaces[0]?.id || null;
  });

  const setActiveWorkspaceId = (id: string | null) => {
    setActiveWorkspaceIdState(id);
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem("milo_active_workspace", id);
      } else {
        localStorage.removeItem("milo_active_workspace");
      }
    }
  };

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
