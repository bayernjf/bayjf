# 项目卡喜欢（Like）功能设计方案

> 状态：**设计完成，待实现**
> 创建：2026-08-07
> 适用：BayJF 作品集站（feature/20260719）

## 一、需求

1. 每个项目卡有爱心按钮，支持喜欢 / 取消喜欢（toggle）。
2. 爱心防刷：同一身份不能反复刷、不能批量刷，不要求登录。
3. 每次喜欢要记录来源（哪个项目、从哪个视图触发）。
4. 当前 **不展示** 每个项目的喜欢数，但表结构和接口要为此预留，未来零迁移开启。

## 二、防刷策略（多层叠加）

不登录场景没有完美方案，采用多层叠加把刷的成本拉高：

1. **身份指纹（不存 PII，只存哈希）**
   组合 `CF-Connecting-IP` + `User-Agent` + 长效匿名 cookie（`bayjf_lid`，UUID，365 天）做 SHA-256，得 `visitor_hash`。与现有 contact 表的 `ip_hash` 模式一致，只存哈希不存明文。
2. **Turnstile 人机验证**：~~复用现有 Cloudflare Turnstile，首次喜欢要求 token~~。**已撤销**：2026-08-11 实现时决定点赞不再要求 Turnstile（前端爱心按钮无验证组件，强制校验会导致所有 like 一律 403）。点赞防刷改由「按访客 1.5s toggle 冷却 + `UNIQUE(project_id, visitor_hash)` + `bayjf_lid` cookie 指纹」三层兜底，契合「防频繁点赞/取消」的重新定位。联系表单仍保留 Turnstile。
3. **服务端限流**：单 IP 每分钟最多 10 次喜欢；每小时最多对 30 个不同项目喜欢。先用内存 LRU，后续可迁 Cloudflare KV。
4. **数据库唯一约束兜底**：`UNIQUE(project_id, visitor_hash)`，一人一项目仅一条记录。
5. **审计字段**：`created_at`、`updated_at`、`source`、`user_agent`、`ip_hash`，便于识别异常。

## 三、数据库设计

新增 migration `supabase/migrations/<timestamp>_create_project_likes.sql`：

```sql
create extension if not exists pgcrypto;

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
revoke all on table public.project_likes from anon, authenticated;
```

- `is_active` 软删除：取消喜欢置 `false`，保留审计，支持分析"喜欢后取消"行为。
- toggle 用 `INSERT ... ON CONFLICT (project_id, visitor_hash) DO UPDATE`。
- RLS 与 contact_messages 一致：完全禁止 anon/authenticated 直连，全部经 Hono service-role 代理。

### 计数视图（预留，不暴露）

```sql
create or replace view public.project_like_counts as
select project_id, count(*)::int as count
from public.project_likes
where is_active = true
group by project_id;
```

## 四、API 设计

在 `server/app.ts` 新增路由，复用现有 CORS / secureHeaders / `/api/*` 前缀。

### `POST /api/projects/like` — toggle

请求体：
```json
{ "projectId": "soft-desk", "source": "blind_box_open", "turnstileToken": "xxxx", "action": "like" }
```

逻辑：
1. 校验 `projectId`（必须是已知项目）、`source`、`action`（`like`/`unlike`）。
2. 按访客 `visitor_hash` 的 1.5s toggle 冷却（拦掉快速连点）；`like`/`unlike` 同等适用。
3. 合成 `visitor_hash`（IP + UA + `bayjf_lid` cookie）。
4. IP 限流检查。
5. upsert（like → `is_active=true`；unlike → `is_active=false`）。
6. 必要时 `Set-Cookie: bayjf_lid`。
7. 返回 `{ "ok": true, "liked": true, "projectId": "soft-desk" }`（不返回 count，但预留字段）。

### `GET /api/projects/likes/mine` — 当前访客已喜欢列表

返回：
```json
{ "liked": ["soft-desk", "termana", "vfx-todo"] }
```

页面加载时调用一次，初始化爱心状态。

### `GET /api/projects/likes/counts?ids=...`（预留，当前不接前端）

批量返回 `{ "soft-desk": 42, ... }`，未来开启计数展示时使用。

## 五、前端设计

- 新建 `LikeContext`（或并入 LanguageContext）维护 `likedIds: Set<string>`，加载时调 `/mine`。
- 点击爱心：乐观更新 → 调 toggle → 失败回滚 + Toast。
- 爱心只显图标不显数字；实心 = 已喜欢。
- 来源 `source` 取值：

  | 场景 | source |
  |---|---|
  | 网格普通卡片 | `grid` |
  | 时间线 | `timeline` |
  | 盲盒封箱点击 | `blind_box` |
  | 盲盒打开后点击 | `blind_box_open` |
  | 详情弹窗 | `detail_modal` |
  | 搜索结果 | `search` |

- 同时 `trackEvent('project_like_toggle', { project_id, source, action })`，不含 PII。
- 盲盒封箱时不显示爱心（保持神秘感），开盒后显示在右上角。
- 按钮：`aria-label`、`aria-pressed`、键盘可操作、Motion 弹跳并尊重 reduced-motion。

## 六、新增/修改文件

| 文件 | 作用 |
|---|---|
| `supabase/migrations/<ts>_create_project_likes.sql` | 建表 + RLS + 索引 |
| `server/likes.ts` | 校验、visitor_hash、upsert 逻辑 |
| `server/likes.test.ts` | toggle / 防重复 / source 校验 / 限流单测 |
| `src/api/likes.ts` | 浏览器 client |
| `src/context/LikeContext.tsx` | 喜欢状态 + Provider + hook |
| `src/components/LikeButton.tsx` | 爱心按钮 |
| `src/i18n/translations.ts` | like/unlike 中英文案 |
| `server/app.ts` | 注册新路由 + 限流中间件 |
| `server/types.ts` | Like 相关类型 |

修改：`BayjfScreen.tsx`、`BlindBoxCard.tsx`、`ProjectDetailModal.tsx` 挂载按钮；`SiteIsland.tsx`/`App.tsx` 包裹 Provider。

## 七、安全与隐私

- 不存 PII：仅存 `ip_hash`、`user_agent`（截断）、`visitor_hash`（三者组合哈希），无法反向定位个人。
- service-role key 仅服务端，客户端不直连 Supabase。
- `bayjf_lid` 只是随机 UUID 指纹盐值，不做跨站追踪。
- RLS 全禁；埋点只记 `project_id` + `source`，符合现有"不含邮箱/姓名"约定。

## 八、提交拆分（实现时按原子规则）

1. `feat(db)`: migration 建表
2. `feat(api)`: server likes 逻辑 + 路由 + 单测
3. `feat(likes)`: 前端 LikeContext + LikeButton
4. `feat(projects)`: 卡片/盲盒/详情页集成
5. `test`: 组件测试
