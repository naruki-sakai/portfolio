-- ============================================
-- 004: projects に is_featured カラムを追加
-- ============================================

alter table public.projects
  add column if not exists is_featured boolean not null default false;

create index if not exists idx_projects_is_featured on public.projects (is_featured);
