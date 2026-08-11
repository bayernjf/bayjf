# AGENTS.md — BayJF 项目指令

本文档供在本仓库工作的 AI coding agents 使用。修改代码前应先阅读本文件，
并同时遵循 `.trae/rules/` 下的提交规则和 `PULL_REQUEST_WORKFLOW.md`。

`PULL_REQUEST_WORKFLOW.md` 是提交、PR、Actions 等待、Preview/Production
发布、失败修复、临时分支清理和必要的长期分支回同步的强制流程。不得只完成其中一段
就报告整个任务完成。

## 项目概览

BayJF 是一个双语个人作品集网站，包含作品展示、职业经历、技能和
联系表单。前后端独立部署：

- 前端：Astro 5（静态输出）、React 19、TypeScript、Tailwind CSS 4
- 动效：Motion
- 图表：Recharts
- 图标：Lucide React
- API：Hono，部署为 Vercel Edge Function
- 数据库：Supabase Postgres
- 前端托管：Cloudflare Pages
- 分析：Google Analytics 4、Microsoft Clarity
- 包管理器：npm
- Node.js：22 LTS

不要引入 pnpm、Yarn 或 Bun 锁文件。依赖变更必须同步更新 `package-lock.json`。

## 目录结构

```text
bayjf/
├── .github/workflows/       # CI、Vercel API、Cloudflare Pages 部署
├── .trae/rules/             # Git 与提交规则
├── api/index.ts             # Vercel Function 入口
├── astro.config.mjs         # Astro 配置（i18n、React 集成、Tailwind、vendor chunk、/api proxy）
├── e2e/                     # Playwright 端到端测试
├── public/                  # 静态资源（favicon 等，原样拷贝）
├── server/                  # Hono API、校验和 Supabase repository
├── src/
│   ├── api/                 # 浏览器 API client
│   ├── assets/              # 图片等静态资源（经 Astro 资源管线处理）
│   ├── components/          # 页面与共享组件（含 SiteIsland）
│   ├── context/             # Language、Toast context
│   ├── data/                # 项目展示顺序等纯数据配置（projectOrder.ts）
│   ├── i18n/                # 翻译字典与 URL 语言路由工具
│   ├── layouts/             # Astro 布局（BaseLayout：SEO、主题防闪、埋点）
│   ├── pages/               # Astro 路由：en 顶层 + [lang] 仅 zh
│   ├── test/                # Vitest 全局测试设置
│   ├── utils/               # Analytics、声音工具
│   ├── App.tsx              # 路由感知的屏幕切换（client:load island 内）
│   └── vite-env.d.ts        # 仅前端 VITE_* 变量类型声明
├── supabase/migrations/     # 数据库迁移
├── worker/                  # Cloudflare Pages _worker.js（同源代理到 Vercel Hono）
├── DEPLOYMENT.md            # 发布配置说明
├── PULL_REQUEST_WORKFLOW.md # PR、Actions 和分支同步强制流程
├── playwright.config.ts
├── tsconfig.json            # 继承 astro/tsconfigs/base
├── vercel.json
├── vitest.config.ts
└── wrangler.toml
```

## 常用命令

所有命令在仓库根目录执行。

```bash
npm ci                     # 按锁文件安装依赖
npm run dev                # Astro 前端：http://localhost:3000
npm run dev:api            # Vercel 本地 API：http://localhost:8787
npm run lint               # astro check + tsc 类型检查
npm test                   # 单元、组件和 API 测试
npm run test:coverage      # 覆盖率报告
npm run test:e2e           # Playwright 桌面和移动端测试
npm run build              # astro build + 构建 _worker.js 到 dist
npm run deploy:frontend    # 发布 dist 到 Cloudflare Pages
```

提交前至少运行：

```bash
npm run lint && npm test && npm run build
```

涉及交互或页面流程时，本地还应运行 `npm run test:e2e`。GitHub E2E 工作流
仅允许手动触发，不作为 PR 自动检查。

验证应与改动范围匹配：文档改动至少执行 `git diff --check`；配置和源码改动
必须执行类型检查、单测和构建；浏览器交互、路由或表单流程改动还必须执行
Playwright（或说明当前环境无法执行的原因）。任一必需检查失败时停止提交或部署
并报告错误，不得把失败描述为通过。

## 前端约定

- 前端由 Astro 驱动（静态输出），交互式应用作为单一 `client:load` island
  （`src/components/SiteIsland.tsx`）挂载到各路由页面；不要移除该 island 或
  把整站重新改回纯 SPA。
- 当前应用使用内部 `ScreenType` 状态切换页面，不使用 React Router。
- 页面组件通过 `React.lazy` 按需加载；不要重新改为同步静态导入。
- Recharts、Motion、Lucide 和 React 已配置独立 vendor chunk（见
  `astro.config.mjs` 的 `manualChunks`）。
- 语言通过 URL 路由：en 在根路径（`/`、`/projects` 等），zh 在 `/zh/*`。
  语言切换走整页导航（`Header` 的 `swapLocale`），不依赖 `localStorage`。
- 用户可见文本应同时维护中英文翻译，统一放在 `src/i18n/translations.ts`。
- 新增交互应考虑键盘操作、ARIA、移动端和深色模式。
- 本地图片必须经 `astro:assets` 优化（构建期压缩 + WebP 转换）。`astro:assets`
  只能在 `.astro` 中调用，因此首页轮播的 19 张 `src/assets/ai-agent/*` 图片在
  `src/components/IslandRoot.astro` 里用 `getImage()` 生成优化 URL，再作为
  `agentImages` prop 经 `SiteIsland → App → HomeScreen` 下发；不要在 `.tsx` 里
  直接 `import` 这些原始大图。远程 `project.image` 仍由 `BlurUpImage` 处理。
- **客户端组件不要直接读取 `import.meta.env.VITE_*`**：`astro dev` 不会把这些变量
  注入到 React island 的客户端 bundle（生产构建会内联，故仅 dev 受影响），直接在
  `.tsx` 里读取会得到 `undefined`，导致 Turnstile 组件不渲染、埋点 ID 缺失，并引发
  hydrate 不匹配。需要在客户端使用的 `VITE_*` 变量（如 `VITE_TURNSTILE_SITE_KEY`）
  应在 `.astro` 层读取后经 prop 下发（参考 `turnstileSiteKey` 的传递链）。
- 不要将 Supabase service-role key 或其他服务端密钥引入浏览器代码。

## Hono 与 Supabase 约定

- API 路由统一放在 `/api/*` 下。
- 联系表单端点为 `POST /api/contact`。
- 健康检查端点为 `GET /api/health`。
- 项目卡喜欢（like）功能尚在设计阶段，方案见
  `docs/LIKES_FEATURE_DESIGN.md`：`POST /api/projects/like`（toggle）、
  `GET /api/projects/likes/mine`，表 `project_likes` 与 contact 表共用相同的
  RLS/哈希/service-role 模式。实现前先读该文档。
- 浏览器只访问 Hono API，不允许使用 service-role key 直连 Supabase。
- `contact_messages` 表启用 RLS，不向 `anon` 或 `authenticated` 开放策略。
- 所有输入必须在服务端校验；数据库错误不得返回给浏览器。
- 修改表结构时新增 migration，不要覆写已经部署的 migration。
- CORS 来源通过 `ALLOWED_ORIGINS` 配置，多个域名使用逗号分隔。

## 环境变量

`.env.local` 被 Git 忽略，只用于本地开发。新增变量时同步更新
`.env.example` 和 `src/vite-env.d.ts`（仅前端变量需要类型声明）。

### 浏览器公开变量

```text
VITE_GA_MEASUREMENT_ID
VITE_CLARITY_PROJECT_ID
VITE_TURNSTILE_SITE_KEY
```

所有 `VITE_` 变量都会进入公开构建产物，不能存放密钥。

### Vercel API 私密变量

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ALLOWED_ORIGINS
```

### 部署凭证

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

真实凭证只能存放在本地忽略文件、Vercel 环境变量或 GitHub Secrets 中，
不得写入源码、文档、日志或提交历史。

## 埋点约定

埋点实现位于 `src/utils/analytics.ts`。

- GA4 与 Clarity ID 缺失时不得加载对应脚本。
- 事件名使用 `snake_case`。
- 页面切换调用 `trackPageView`。
- 产品交互使用 `trackEvent`，事件属性不得包含邮箱、姓名、留言等个人信息。
- 当前联系表单事件为 `contact_form_submit`，只记录 `success`/`error` 状态。

## 测试约定

- `server/*.test.ts`：Hono API 和纯函数单元测试。
- `src/**/*.test.tsx`：React Context 和组件测试。
- `e2e/*.spec.ts`：Playwright 用户流程测试。
- 修复 bug 时应增加能够复现问题的测试。
- 测试不得请求真实 Supabase，不得写入生产数据。
- 预期的错误日志应使用 mock，避免污染测试输出。

## 部署架构

- Hono API：Vercel 项目 `bayjf`，正式地址 `https://bayjf.vercel.app/api`。
- Astro 前端（静态）：Cloudflare Pages 项目 `bayjf`，自定义域名
  `https://bayjf.com`（alias `bayjf.pages.dev`）。
- GitHub Environment：`production-vercel-api`、`preview-vercel-api`、
  `production-cloudflare-pages`、`preview-cloudflare-pages`。
- PR 到 `dev`/`main`：只运行验证和构建，不部署。
- 合并到 `dev`：部署 Vercel API Preview 和 Cloudflare Pages dev Preview。
- 合并到 `main`：部署 Vercel API 和 Cloudflare Pages Production。
- 完整发布顺序和变量说明见 `DEPLOYMENT.md`。

修改部署配置时必须同步检查：

- `.github/workflows/`
- `vercel.json`
- `wrangler.toml`
- `DEPLOYMENT.md`
- `.env.example`

## Git 工作流

- 禁止直接向 `main` 或 `dev` 提交。
- 当前工作分支为 `feature/20260719`；除非用户另有指定，改动推送到当前分支。
- Push 前必须执行 `git pull --rebase`。
- 保留用户已有的未提交改动，不得使用破坏性 reset 或 checkout。
- `.env.local`、`.vercel/`、`.wrangler/`、测试报告和构建产物不得提交。

### 语言约定

- 向用户汇报、解释、提问和交付总结默认使用中文，除非用户明确要求其他语言。
- 项目内面向中文维护者的 Markdown 文档可以使用中文，不要求统一翻译成英文。
- 写入 GitHub 协作界面的元数据使用英文，包括 branch 名、commit message、PR
  标题与正文、PR 评论、review、release 标题与说明，以及 Actions workflow/job/step
  的显示名称。
- 源码标识符遵循项目既有英文命名；用户可见内容继续同时维护中英文翻译。
- “GitHub 内容使用英文”不适用于项目内中文文档，也不改变向用户使用中文汇报的约定。

### 用户指令语义

当用户使用以下指令时，按固定含义执行：

#### “提交代码”或“搞好后直接推送”

1. 检查工作区，区分本次改动与用户已有改动。
2. 按改动范围完成必要验证；失败则停止并报告。
3. 根据原子规则拆分 commit，不使用笼统的单一提交。
4. 执行 `git pull --rebase origin <当前分支>`。
5. 只推送当前分支，不创建 PR，不合并其他分支。

#### “创建 PR”

1. 完成验证、原子提交和当前分支推送。
2. 收集目标分支尚未包含的 commits，生成简洁的 PR 标题和说明。
3. 使用 `gh pr create` 创建 PR 后停止，等待 review；除非用户另外明确授权，
   不在本地或远程执行合并。

#### “提交并合并”

这是独立授权，不能从“提交代码”推断。执行合并前必须明确目标分支，并先进行
冲突预检。`main` 仍要求通过 PR 和人工 review，不得直接推送。

### 冲突处理

- 不自动解决 rebase、merge 或 cherry-pick 冲突。
- 出现冲突时停止操作，列出冲突文件和当前 Git 状态，等待用户决定。
- 不得为了消除冲突使用 `git reset --hard`、覆盖用户文件或丢弃未提交改动。

### 发布流程硬门槛

- 完整流程必须依次经过 `feature/20260719 → dev → main` 两个真实 PR。
- PR 阶段只运行检验和 Build，不部署；Actions 全绿后才允许合并。
- dev 合并后必须等待 CI、Vercel Preview、Cloudflare Preview 全绿。
- main 合并后必须等待 CI、Vercel Production、Cloudflare Production 全绿。
- Actions 失败必须修复到成功，不能跳过、忽略或提前进入下一阶段。
- 正常 `feature → dev → main` 发布后不创建 `main → dev` 回同步 PR；各长期分支
  只需 pull 自己的远程分支。
- 仅当 dev 或 main 产生子分支不包含的修复时，才向下同步修复：dev 修复同步到
  feature；main 专属修复按 `main → dev → feature` 同步。
- 临时 `fix/*`、`chore/sync-*` 分支在修复闭环后必须删除。
- 最终只保留 `feature/20260719`、`dev`、`main` 三个长期分支。
- 详细步骤以 `PULL_REQUEST_WORKFLOW.md` 为准。

提交必须遵循 `.trae/rules/git-commit-message.md`：

- 使用英文 Conventional Commits。
- 每个提交只处理一个独立目的。
- 配置、功能、测试和文档分别提交。
- Subject 不超过 50 个字符。
- 每个提交必须包含说明目的的 body。

## 当前基线

完成改动时不应降低以下基线：

- TypeScript 类型检查通过。
- Vitest 单元、组件和 API 测试通过。
- Astro 生产构建无大包警告。
- 前端 Cloudflare Pages 和后端 Vercel 配置保持独立。
- Supabase service-role key 永不进入客户端或 Git。

## 关键文件索引

| 文件 | 用途 |
|------|------|
| `src/App.tsx` | 路由感知的屏幕切换、懒加载和全局页面访问埋点 |
| `src/components/SiteIsland.tsx` | 挂载到各路由的 client:load 交互 island |
| `src/components/IslandRoot.astro` | 在 Astro 层用 `astro:assets` 优化本地图片并下发 `agentImages` prop |
| `src/context/LanguageContext.tsx` | 中英文内容、项目数据（`PROJECTS_EN/ZH`、`PROJECT_DATES`）与全局搜索状态 |
| `src/data/projectOrder.ts` | 项目卡片展示顺序单一来源；调整顺序只改本文件 |
| `src/components/ContactScreen.tsx` | 联系表单 UI、校验和提交状态 |
| `src/components/BottomNav.tsx` | 桌面端底部悬浮导航：滚动到底部时浮现，复用 `NavTab`，动态定位在页脚上方避免遮挡 |
| `src/api/contact.ts` | 浏览器端联系 API client |
| `src/utils/analytics.ts` | GA4 与 Clarity 初始化和事件上报 |
| `src/i18n/translations.ts` | 中英文字典与翻译函数 |
| `src/i18n/routing.ts` | URL 语言切换与屏幕↔路径映射 |
| `src/layouts/BaseLayout.astro` | SEO、主题防闪脚本与埋点注入 |
| `src/pages/*.astro` | Astro 路由（en 顶层 + `[lang]` 仅 zh） |
| `astro.config.mjs` | Astro 配置、i18n、vendor chunk、本地 `/api` proxy |
| `server/app.ts` | Hono 中间件、CORS 和 API 路由 |
| `server/contact.ts` | 联系表单服务端校验 |
| `server/supabase.ts` | Supabase REST repository |
| `api/index.ts` | Vercel Edge Function 适配入口 |
| `worker/index.ts` | Cloudflare Pages `_worker.js` 同源代理到 Vercel Hono |
| `supabase/migrations/` | 已部署数据库 schema 的增量迁移 |
| `vercel.json` | Vercel `/api/*` rewrite |
| `wrangler.toml` | Cloudflare Pages 项目配置 |
| `.github/workflows/` | CI 和双平台部署流程 |
| `PULL_REQUEST_WORKFLOW.md` | 两阶段 PR、Actions 门禁、修复和分支回同步流程 |
| `docs/LIKES_FEATURE_DESIGN.md` | 项目卡喜欢（like）功能设计：防刷、数据模型、API、前端 |
| `docs/SOCIAL_TREE_MODAL_DESIGN.md` | Logo 社交链接树弹窗设计：呼吸光晕、genie 开合动效、可访问性 |

## 不要做的事

- 不要使用 pnpm、Yarn 或 Bun；只使用 npm 和 `package-lock.json`。
- 不要提交 `.env`、`.env.local`、平台临时目录或任何真实凭证。
- 不要把 `SUPABASE_SERVICE_ROLE_KEY` 放入 `VITE_*` 变量或浏览器代码。
- 不要让客户端绕过 Hono 直接写入受保护的 Supabase 表。
- 不要修改已经上线的 migration；通过新 migration 演进 schema。
- 不要在埋点属性中发送姓名、邮箱、留言正文或其他个人信息。
- 不要创建文本伪装的图片、空壳资源或无法使用的占位文件。
- 不要移除页面懒加载或把大型 vendor 重新合并进主 bundle。
- 不要在没有明确授权时创建 PR、合并分支、直接推送 `main`/`dev` 或执行部署。
- 不要自动解决 Git 冲突，也不要通过破坏性命令隐藏冲突。
