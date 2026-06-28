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
CREATE OR REPLACE VIEW workspace_project_stats AS
SELECT 
  workspace_id,
  COUNT(id) AS total_projects,
  COUNT(id) FILTER (WHERE status = 'completed') AS completed_projects
FROM projects
GROUP BY workspace_id;

-- VIEW 2: Tugas yang ditugaskan ke saya (Lintas Proyek)
CREATE OR REPLACE VIEW my_assigned_tasks AS
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
CREATE OR REPLACE VIEW my_overdue_tasks AS
SELECT * 
FROM my_assigned_tasks
WHERE due_date < NOW() AND status != 'done';
