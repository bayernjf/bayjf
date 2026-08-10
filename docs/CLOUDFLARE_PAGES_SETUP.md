# Cloudflare Pages 批量创建指南

更新时间：2026-08-11

## 概述

14 个 landing 落地页项目中，soft-desk-landing 已通过 Cloudflare Dashboard 手动创建。
其余 13 个需要通过 Cloudflare API 批量创建，参数与 soft-desk-landing 保持一致。

## 前置条件

1. Cloudflare 账户已通过 Dashboard 连接 GitHub（soft-desk-landing 创建时已授权）
2. 需要以下凭证（存储在本地 `.env.local` 或终端环境变量中）：
   - `CLOUDFLARE_API_TOKEN` — Cloudflare API Token（权限：Pages Edit）
   - `CLOUDFLARE_ACCOUNT_ID` — Cloudflare Account ID

## 统一配置参数

所有 13 个项目使用完全相同的配置，仅项目名和 GitHub 仓库名不同：

| 配置项 | 值 |
|--------|-----|
| Framework preset | Astro |
| Build command | `npx playwright install chromium && npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |
| Preview branches | `dev` 及所有 PR 分支 |
| Node.js version | `22`（环境变量 `NODE_VERSION`，Astro 7 要求 >=22.12.0） |
| Playwright 浏览器路径 | `0`（环境变量 `PLAYWRIGHT_BROWSERS_PATH`，安装到 node_modules） |

### Build command 说明

`npx playwright install chromium && npm run build` 分两步：

1. `npx playwright install chromium` — 显式下载 Chromium 二进制文件到 `node_modules`
  （Cloudflare 的 `npm install` 不一定触发 Playwright postinstall 下载浏览器）
2. `npm run build` — 执行 `astro check && astro build && node scripts/shot.mjs`
   （构建完成后自动截图生成 `dist/preview-zh.png` + `dist/preview-en.png`）

### 环境变量说明

| 变量名 | 值 | 作用域 | 说明 |
|--------|-----|--------|------|
| `NODE_VERSION` | `22` | Production + Preview | Node.js 运行时版本（Astro 7 要求 >=22.12.0，不要使用 20） |
| `PLAYWRIGHT_BROWSERS_PATH` | `0` | Production + Preview | 让 Chromium 安装到 `node_modules` 而非系统目录，避免路径权限问题 |

## 需要创建的 13 个项目

| # | Cloudflare 项目名 | GitHub 仓库 | 生产域名 |
|---|---|---|---|
| 1 | `agent-dev-landing` | `bayernjf/agent-dev-landing` | `agent-dev-landing.pages.dev` |
| 2 | `know-collect-landing` | `bayernjf/know-collect-landing` | `know-collect-landing.pages.dev` |
| 3 | `one-code-landing` | `bayernjf/one-code-landing` | `one-code-landing.pages.dev` |
| 4 | `one-world-landing` | `bayernjf/one-world-landing` | `one-world-landing.pages.dev` |
| 5 | `pr-helper-landing` | `bayernjf/pr-helper-landing` | `pr-helper-landing.pages.dev` |
| 6 | `shareit-landing` | `bayernjf/shareit-landing` | `shareit-landing.pages.dev` |
| 7 | `splity-landing` | `bayernjf/splity-landing` | `splity-landing.pages.dev` |
| 8 | `tab-manager-landing` | `bayernjf/tab-manager-landing` | `tab-manager-landing.pages.dev` |
| 9 | `termana-landing` | `bayernjf/termana-landing` | `termana-landing.pages.dev` |
| 10 | `toclick-landing` | `bayernjf/toclick-landing` | `toclick-landing.pages.dev` |
| 11 | `vfx-todo-landing` | `bayernjf/vfx-todo-landing` | `vfx-todo-landing.pages.dev` |
| 12 | `word-base-landing` | `bayernjf/word-base-landing` | `word-base-landing.pages.dev` |
| 13 | `word-picker-landing` | `bayernjf/word-picker-landing` | `word-picker-landing.pages.dev` |

> soft-desk-landing 已创建，不在本次范围内。
> bayjf 主站通过 `wrangler pages deploy` 部署，不走 Git 集成。

## API 创建方案

### API 端点

```
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects
```

### 请求头

```
Authorization: Bearer {CLOUDFLARE_API_TOKEN}
Content-Type: application/json
```

### 请求体模板（与 soft-desk-landing 实际配置一致）

以下是从 soft-desk-landing 项目 API 读取的真实配置，13 个新项目仅替换 `name` 和 `repo_name`：

```json
{
  "name": "soft-desk-landing",
  "production_branch": "main",
  "source": {
    "type": "github",
    "config": {
      "owner": "bayernjf",
      "repo_name": "soft-desk-landing",
      "production_branch": "main",
      "pr_comments_enabled": true,
      "deployments_enabled": true,
      "production_deployments_enabled": true,
      "preview_branch_includes": ["dev"],
      "preview_branch_excludes": [],
      "path_includes": ["*"],
      "path_excludes": []
    }
  },
  "build_config": {
    "build_command": "npx playwright install chromium && npm run build",
    "destination_dir": "dist",
    "build_caching": true,
    "root_dir": ""
  },
  "deployment_configs": {
    "production": {
      "env_vars": {
        "NODE_VERSION": { "type": "plain_text", "value": "22" },
        "PLAYWRIGHT_BROWSERS_PATH": { "type": "plain_text", "value": "0" }
      },
      "fail_open": true,
      "compatibility_date": "2026-07-08",
      "build_image_major_version": 3,
      "usage_model": "standard"
    },
    "preview": {
      "env_vars": {
        "NODE_VERSION": { "type": "plain_text", "value": "22" },
        "PLAYWRIGHT_BROWSERS_PATH": { "type": "plain_text", "value": "0" }
      },
      "fail_open": true,
      "compatibility_date": "2026-07-08",
      "build_image_major_version": 3,
      "usage_model": "standard"
    }
  }
}
```

> 注：soft-desk-landing 还有两个 secret_text 类型的环境变量（`VITE_GA_MEASUREMENT_ID`、
> `VITE_CLARITY_PROJECT_ID`），各项目按需自行在 Dashboard 添加。

### 创建后验证

每个项目创建后，Cloudflare 会自动触发首次构建（从 `main` 分支）。验证步骤：

1. 构建状态：Cloudflare Dashboard → Pages → 项目 → Deployments，确认构建成功
2. 预览图可访问：
   - `https://{项目名}.pages.dev/preview-zh.png`
   - `https://{项目名}.pages.dev/preview-en.png`
3. 预览图内容：图片应包含完整 hero 区域（导航栏、标题、副标题、按钮、统计数字），
   不应只显示一个巨大的 Logo

### 首次构建注意事项

- 首次构建会较慢（Playwright 下载 Chromium 约 2-4 分钟），后续有缓存约 10-15 秒
- `main` 分支必须有代码（已推送 shot.mjs + package.json 改动到 dev 分支）
- 如果 `main` 分支为空或不存在，需要先将 dev 合并到 main

### 常见踩坑

| 症状 | 根因 | 解决 |
|------|------|------|
| 站点返回 522 | 项目创建后从未触发首次部署（Cloudflare 不回溯历史代码） | 用 API `POST /pages/projects/{name}/deployments` 手动触发，或推送一次新 commit |
| 构建失败：`npm ci` 报 lock 文件与 package.json 不同步 | 修改 package.json 加 playwright 依赖后未运行 `npm install` 更新 package-lock.json | 本地 `npm install` 后提交 lock 文件 |
| 构建失败：`Node.js v20.x is not supported by Astro! Please upgrade Node.js to a supported version: ">=22.12.0"` | `NODE_VERSION=20`，Astro 7 要求 Node >=22.12.0 | 把环境变量 `NODE_VERSION` 改为 `22`（production + preview 都要改） |

### 分支部署映射

| 分支 | 部署目标 | URL 格式 |
|------|---------|---------|
| `main` | 生产 | `https://{项目名}.pages.dev` |
| `dev` | 预览 | `https://dev.{项目名}.pages.dev` |

> Cloudflare Pages 连接 GitHub 后会自动为 PR 生成临时预览 URL（`pr-{N}.{项目名}.pages.dev`），
> 无需额外配置。
