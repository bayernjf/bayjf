create extension if not exists pgcrypto;

-- 通用键值设置表：当前用于存放管理员可在 /admin 维护的项目目录（顺序+状态）。
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- 与 contact_messages / project_likes 一致：全禁 anon/authenticated，只经 Hono service-role 代理读写。
revoke all on table public.app_settings from anon, authenticated;
