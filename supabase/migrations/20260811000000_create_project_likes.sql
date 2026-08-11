create extension if not exists pgcrypto;

-- 项目卡「喜欢」：一人一项目一条记录，is_active 软删除（取消喜欢置 false）。
create table if not exists public.project_likes (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  visitor_hash char(64) not null,
  source text not null check (char_length(source) between 1 and 40),
  is_active boolean not null default true,
  ip_hash char(64),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, visitor_hash)
);

create index if not exists project_likes_project_idx
  on public.project_likes (project_id) where is_active = true;
create index if not exists project_likes_visitor_idx
  on public.project_likes (visitor_hash);

alter table public.project_likes enable row level security;

-- 与 contact_messages 一致：全禁 anon/authenticated，只经 Hono service-role 代理写入。
revoke all on table public.project_likes from anon, authenticated;

-- 预留计数视图：当前前端不展示数字，但表与视图已就绪，未来零迁移开启。
create or replace view public.project_like_counts as
select project_id, count(*)::int as count
from public.project_likes
where is_active = true
group by project_id;
