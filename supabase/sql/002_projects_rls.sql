-- ============================================
-- 002: projects RLS ポリシー
-- ============================================

alter table public.projects enable row level security;

-- anon: 公開済みのみ閲覧可
create policy "anon can select published projects"
  on public.projects
  for select
  to anon
  using (is_published = true);

-- authenticated: 全件閲覧可
create policy "authenticated can select all projects"
  on public.projects
  for select
  to authenticated
  using (true);

-- authenticated: 作成可
create policy "authenticated can insert projects"
  on public.projects
  for insert
  to authenticated
  with check (true);

-- authenticated: 更新可
create policy "authenticated can update projects"
  on public.projects
  for update
  to authenticated
  using (true)
  with check (true);

-- authenticated: 削除可
create policy "authenticated can delete projects"
  on public.projects
  for delete
  to authenticated
  using (true);
