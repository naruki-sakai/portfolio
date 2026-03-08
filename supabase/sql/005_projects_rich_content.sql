-- ============================================
-- 005: projects に rich_content カラムを追加
-- リッチエディタ（Tiptap / ProseMirror JSON）用
-- ============================================

alter table public.projects
  add column if not exists rich_content jsonb;
