# AGENTS.md — Bayjf Portfolio 项目指令

本文档供在本仓库工作的 AI coding agents 使用。修改代码前应先阅读本文件，
并同时遵循 `.trae/rules/` 下的提交规则。

## 项目概览

Bayjf Portfolio 是一个双语个人作品集网站，包含作品展示、职业经历、技能和
联系表单。前后端独立部署：

- 前端：React 19、TypeScript、Vite 6、Tailwind CSS 4
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
├── e2e/                     # Playwright 端到端测试
├── server/                  # Hono API、校验和 Supabase repository
├── src/
│   ├── api/                 # 浏览器 API client
│   ├── components/          # 页面与共享组件
│   ├── context/             # Language、Toast context
│   ├── test/                # Vitest 全局测试设置
│   ├── utils/               # Analytics、声音工具
│   ├── App.tsx
│   └── main.tsx
├── supabase/migrations/     # 数据库迁移
├── DEPLOYMENT.md            # 发布配置说明
├── playwright.config.ts
├── vercel.json
├── vite.config.ts
├── vitest.config.ts
└── wrangler.toml
```

## 常用命令

所有命令在仓库根目录执行。

```bash
npm ci                     # 按锁文件安装依赖
npm run dev                # Vite 前端：http://localhost:3000
npm run dev:api            # Vercel 本地 API：http://localhost:8787
npm run lint               # TypeScript 类型检查
npm test                   # 单元、组件和 API 测试
npm run test:coverage      # 覆盖率报告
npm run test:e2e           # Playwright 桌面和移动端测试
npm run build              # Vite 生产构建
npm run deploy:frontend    # 发布 dist 到 Cloudflare Pages
```

提交前至少运行：

```bash
npm run lint && npm test && npm run build
```

涉及交互或页面流程时，还应运行 `npm run test:e2e`。

## 前端约定

- 当前应用使用内部 `ScreenType` 状态切换页面，不使用 React Router。
- 页面组件通过 `React.lazy` 按需加载；不要重新改为同步静态导入。
- Recharts、Motion、Lucide 和 React 已配置独立 vendor chunk。
- 用户可见文本应同时维护中英文翻译。
- 新增交互应考虑键盘操作、ARIA、移动端和深色模式。
- 不要将 Supabase service-role key 或其他服务端密钥引入浏览器代码。

## Hono 与 Supabase 约定

- API 路由统一放在 `/api/*` 下。
- 联系表单端点为 `POST /api/contact`。
- 健康检查端点为 `GET /api/health`。
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
VITE_API_URL
VITE_GA_MEASUREMENT_ID
VITE_CLARITY_PROJECT_ID
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
- React 前端：Cloudflare Pages 项目 `bayjf`，正式地址
  `https://bayjf.pages.dev`。
- GitHub Environment：`production-vercel-api`、
  `production-cloudflare-pages`。
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
- Vite 生产构建无大包警告。
- 前端 Cloudflare Pages 和后端 Vercel 配置保持独立。
- Supabase service-role key 永不进入客户端或 Git。
