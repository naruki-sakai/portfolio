-- ============================================
-- 001: projects テーブル + trigger + index
-- ============================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('official', 'ec', 'lp')),
  thumbnail_url text,
  site_url text,
  role text,
  overview text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 自動更新トリガー
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

-- インデックス
create index if not exists idx_projects_category on public.projects (category);
create index if not exists idx_projects_is_published on public.projects (is_published);
create index if not exists idx_projects_sort_order on public.projects (sort_order);
create index if not exists idx_projects_updated_at on public.projects (updated_at desc);
