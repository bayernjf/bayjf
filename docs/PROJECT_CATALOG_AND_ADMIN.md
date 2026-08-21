# 项目目录与 /admin 管理说明

项目的**展示顺序**和**上线状态**有两层来源：代码里的默认目录（兜底）+ Supabase 里的管理员覆盖层（优先）。日常排序、上下架在 `/admin` 页面完成，无需提交代码或部署；只有**新增/删除项目内容**才需要改代码。

## 概念

- `src/data/projectCatalog.ts`：编译期默认目录。一个有序数组 `CATALOG`，每项可以是：
  - `'soft-desk'`：纯字符串，状态默认 `launch`。
  - `{ id: 'agent-dev', s: 'soon' }`：显式状态，`s` 取值 `launch | soon | delist`。
- Supabase `app_settings` 表：管理员在 `/admin` 保存的覆盖层，单行 `key = 'project_catalog'`，value 为 `{ order, status }`。
- 状态语义：
  - `launch`：正常展示卡片并打开详情。
  - `soon`：展示卡片，点击翻转到 “Coming soon...” 面板，不开详情。
  - `delist`：从列表、图表、计数、深链中完全隐藏（数据仍在代码里，便于恢复）。

## 合并与兜底规则

`mergeCatalog` 在读取覆盖层时与默认目录合并：

- **顺序**：以数据库的 `order` 为基准；代码里有、但数据库没有的新 id 自动追加到末尾；数据库里的未知 id 被丢弃。
- **状态**：先取代码默认状态，再用数据库状态逐项覆盖。
- **兜底**：Supabase 不可用或 `/api/catalog` 失败时，服务端返回、前端使用 `DEFAULT_CATALOG`，站点永不白屏。

因此：一旦在 `/admin` 保存过，数据库即为事实来源；代码里的重排或状态改动不会自动覆盖已有覆盖层。

## 日常：调整顺序或上下架（无需部署）

1. 打开 `/admin`（线上 `https://bayjf.com/admin`，本地 `http://localhost:3000/admin`），用管理员账号登录。
2. 用 ↑/↓ 调整顺序，用下拉框切换 `已上线 / 即将上线 / 已下架`。
3. 点“保存”。`GET /api/catalog` 为 `no-store`，之后任何新访问立即生效；已打开页面的访客刷新即可看到。
4. 想恢复到代码默认顺序：删除 Supabase `app_settings` 中 `key = 'project_catalog'` 的行（或使用后续的“重置为默认”按钮）。

## 新增项目：代码先行，admin 微调

项目“内容”（文案、图片、链接、tags）必须在代码里加；顺序和状态可之后在 admin 调整。

1. 在 `src/context/LanguageContext.tsx` 的 `RAW_PROJECTS_EN` 和 `RAW_PROJECTS_ZH` 里各加一条项目数据（id、title、category、description、image、tags、link、date）。
2. 在 `src/data/projectCatalog.ts` 的 `CATALOG` 数组里加一个占位条目，建议先标为即将上线：
   ```ts
   { id: 'new-id', s: 'soon' },
   ```
3. （可选）在 `PROJECT_DATES` 里补该项目的日期。
4. 运行 `npm run lint && npm test && npm run build`，然后提交、部署。
5. 部署后项目会以“末尾 + 代码里的状态”自动出现。登录 `/admin` 把它挪到目标位置、改成 `launch`，保存即立即生效。

## 彻底删除项目

1. 从 `RAW_PROJECTS_EN/ZH` 删除数据。
2. 从 `CATALOG` 删除对应条目。
3. 若数据库覆盖层里还残留该 id，`mergeCatalog` 会自动忽略；也可在 `/admin` 重新保存一次以清理。

## 管理员账号与环境变量

- 不开放注册，单一管理员，密码以 PBKDF2-SHA256 哈希存储，登录用 HttpOnly + HMAC 签名 cookie（7 天）。
- 需在 Vercel 配置（本地放在 `.env.local`）：
  - `ADMIN_USERNAME`：管理员用户名（当前为 `bayjf`）。
  - `ADMIN_PASSWORD_HASH`：`pbkdf2-sha256$<iterations>$<salt>$<hash>`。
  - `ADMIN_SESSION_SECRET`：HMAC 签名用的长随机串。
- 未配置这些变量时，公开页面正常（走默认目录），但 `/admin` 登录返回 503。

## 本地联调

管理接口在 Hono（默认 8787），前端 3000 经 Vite 代理到它：

```bash
npm run dev        # 前端 :3000
npm run dev:api    # 本地 API :8787（需要 .env.local 里的 ADMIN_* 与 Supabase 变量）
```

只开前端时，`/api/catalog` 失败会静默回退到默认目录，公开页面正常，但无法登录管理。

## 相关文件

- `src/data/projectCatalog.ts`：默认目录、`mergeCatalog`、`applyCatalog`。
- `src/context/LanguageContext.tsx`：运行时拉取 `/api/catalog` 并派生 projects。
- `src/pages/admin.astro` + `src/components/AdminApp.tsx`：管理页。
- `server/app.ts`：`/api/catalog`、`/api/admin/*` 路由。
- `server/catalog.ts`、`server/admin.ts`：目录存取与鉴权。
- `worker/index.ts`：为 `/api/admin/*` 保留 `Set-Cookie`。
- `supabase/migrations/20260821000000_create_app_settings.sql`：建表迁移。

## 使用方法（日常速查）

### 登录

- 线上地址：`https://bayjf.com/admin/`（注意末尾带 `/`，`/admin` 会 308 跳转到 `/admin/`）。
- 本地：同时启动 `npm run dev`（前端 :3000）和 `npm run dev:api`（API :8787，需 `.env.local` 配置 `ADMIN_*`），访问 `http://localhost:3000/admin/`。
- 用户名：`ADMIN_USERNAME` 的值（当前为 `bayjf`）。
- 登录成功后下发 HttpOnly + HMAC 签名的会话 cookie，有效期 7 天；到期需重新登录。点“退出”会立即清除 cookie。

### 调整项目

1. 登录后看到项目列表，每行显示序号、标题、id、状态和上/下移按钮。
2. 排序：点 ↑ / ↓ 逐行移动（也可后续扩展为拖拽）。
3. 状态：用下拉框切换：
   - `已上线 (launch)`：正常展示，点击打开项目详情。
   - `即将上线 (soon)`：展示卡片，点击只翻转到 “Coming soon...” 面板。
   - `已下架 (delist)`：从列表/图表/计数/深链完全隐藏。
4. 点“保存”写入 Supabase，`/api/catalog` 为 `no-store`，保存后任何新访问立即生效；已经打开页面的访客刷新一次即可看到。
5. 页面顶部显示 `上线 / 即将上线 / 下架` 的数量统计，底部“有未保存的改动”提示在保存前不要离开。

### 忘记密码 / 修改密码

服务端只存 PBKDF2 哈希，无法找回原密码，只能重置：

1. 用以下命令生成新密码和哈希（bundled Node 即可）：
   ```bash
   node -e "const c=crypto;(async()=>{const p='新密码';const s=c.getRandomValues(new Uint8Array(16));const k=await c.subtle.importKey('raw',new TextEncoder().encode(p),{name:'PBKDF2'},false,['deriveBits']);const b=new Uint8Array(await c.subtle.deriveBits({name:'PBKDF2',salt:s,iterations:100000,hash:'SHA-256'},k,256));console.log('pbkdf2-sha256$100000$'+Buffer.from(s).toString('base64')+'$'+Buffer.from(b).toString('base64'))})()"
   ```
   也可以让 Codex 生成随机强密码并只显示一次。
2. Vercel → bayjf → Settings → Environment Variables，把 `ADMIN_PASSWORD_HASH` 更新为新哈希（Production 与 Preview 都改）。
3. 保存后重新部署（Vercel 会自动部署，或在 Deployments 手动 Redeploy）。
4. 用新密码登录；旧 cookie 会因签名密钥不变而仍有效到自然过期，想强制所有会话失效，同步轮换 `ADMIN_SESSION_SECRET`。

### 重置为代码默认顺序

- 方法一：在 Supabase Table Editor 删除 `app_settings` 表中 `key = 'project_catalog'` 的行，下次访问即回退到 `projectCatalog.ts` 的默认目录。
- 方法二（推荐后续补充）：在 `/admin` 增加“重置为默认”按钮，调用删除覆盖层的接口。
