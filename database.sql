-- ==========================================
-- MILO DATABASE SCHEMA (SUPABASE / POSTGRES)
-- ==========================================

-- 1. ENUMS (Tipe Data Kustom untuk Status & Prioritas)
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on_hold', 'cancelled');
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');

-- 2. PROFILES
-- Menyimpan data publik user. Terhubung dengan auth.users bawaan Supabase.
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL, -- Memudahkan pencarian user berdasarkan email tanpa harus join ke auth.users
  avatar_url TEXT
);

-- 3. WORKSPACES
-- Tempat utama pengelompokkan proyek.
CREATE TABLE workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKSPACE MEMBERS
-- Tim yang mengelola workspace.
CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- Misal: 'owner', 'admin', 'member'
  PRIMARY KEY (workspace_id, user_id)
);

-- 5. PROJECTS
-- Detail dari setiap proyek di dalam workspace.
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'active',
  priority priority_level DEFAULT 'medium',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROJECT ROLES
-- User dapat membuat role baru kustom khusus untuk setiap proyek.
CREATE TABLE project_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL, -- Contoh: 'Backend Developer', 'Project Manager'
  permissions JSONB DEFAULT '{}'::jsonb -- Bisa menyimpan detail akses role ini
);

-- 7. PROJECT MEMBERS (Tim Proyek)
-- Siapa saja yang mengelola proyek ini dan apa role mereka.
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES project_roles(id) ON DELETE SET NULL, -- Role kustom user di proyek ini
  PRIMARY KEY (project_id, user_id)
);

-- 8. TASKS
-- Tugas spesifik di dalam suatu proyek.
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority priority_level DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Orang yang di-assign tugas (bisa get username & email)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- VIEWS: FUNGSI AGREGASI (Untuk Dashboard)
-- ==========================================

-- VIEW 1: Total Proyek dan Proyek Selesai per Workspace
CREATE OR REPLACE VIEW workspace_project_stats WITH (security_invoker = on) AS
SELECT 
  workspace_id,
  COUNT(id) AS total_projects,
  COUNT(id) FILTER (WHERE status = 'completed') AS completed_projects
FROM projects
GROUP BY workspace_id;

-- VIEW 2: Tugas yang ditugaskan ke saya (Lintas Proyek)
CREATE OR REPLACE VIEW my_assigned_tasks WITH (security_invoker = on) AS
SELECT 
  t.id AS task_id,
  t.title,
  t.status,
  t.priority,
  t.due_date,
  t.assignee_id,
  p.name AS project_name,
  p.workspace_id
FROM tasks t
JOIN projects p ON t.project_id = p.id;

-- VIEW 3: Tugas Overdue (Lintas Proyek)
CREATE OR REPLACE VIEW my_overdue_tasks WITH (security_invoker = on) AS
SELECT * 
FROM my_assigned_tasks
WHERE due_date < NOW() AND status != 'done';

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Fungsi Helper untuk mendapatkan daftar workspace milik user (menghindari infinite recursion)
CREATE OR REPLACE FUNCTION get_user_workspaces()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. WORKSPACES
CREATE POLICY "Users can view workspaces they are members of." 
ON workspaces FOR SELECT USING (
  id IN (SELECT get_user_workspaces())
);

CREATE POLICY "Users can create workspaces." 
ON workspaces FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Workspace members can update workspace." 
ON workspaces FOR UPDATE USING (
  id IN (SELECT get_user_workspaces())
);

-- 3. WORKSPACE MEMBERS
CREATE POLICY "Users can view members of their workspaces." 
ON workspace_members FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspaces())
);

CREATE POLICY "Workspace members can invite others." 
ON workspace_members FOR INSERT WITH CHECK (
  workspace_id IN (SELECT get_user_workspaces())
);

CREATE POLICY "Workspace members can delete members." 
ON workspace_members FOR DELETE USING (
  workspace_id IN (SELECT get_user_workspaces())
);

-- 4. PROJECTS
CREATE POLICY "Users can view projects in their workspaces." 
ON projects FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspaces())
);

CREATE POLICY "Workspace members can create projects." 
ON projects FOR INSERT WITH CHECK (
  workspace_id IN (SELECT get_user_workspaces())
);

CREATE POLICY "Workspace members can update projects." 
ON projects FOR UPDATE USING (
  workspace_id IN (SELECT get_user_workspaces())
);

CREATE POLICY "Workspace members can delete projects." 
ON projects FOR DELETE USING (
  workspace_id IN (SELECT get_user_workspaces())
);

CREATE POLICY "Users can view roles for their projects." 
ON project_roles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_roles.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

CREATE POLICY "Workspace members can insert project roles." 
ON project_roles FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_roles.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

CREATE POLICY "Workspace members can update project roles." 
ON project_roles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_roles.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

CREATE POLICY "Workspace members can delete project roles." 
ON project_roles FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_roles.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

-- 6. PROJECT MEMBERS
CREATE POLICY "Users can view members of their projects." 
ON project_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_members.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

CREATE POLICY "Workspace members can add project members." 
ON project_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_members.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

-- 7. TASKS
CREATE POLICY "Users can view tasks in their projects." 
ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = tasks.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

CREATE POLICY "Workspace members can insert tasks." 
ON tasks FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = tasks.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

CREATE POLICY "Workspace members can update tasks." 
ON tasks FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = tasks.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);

CREATE POLICY "Workspace members can delete tasks." 
ON tasks FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = tasks.project_id AND p.workspace_id IN (SELECT get_user_workspaces())
  )
);
