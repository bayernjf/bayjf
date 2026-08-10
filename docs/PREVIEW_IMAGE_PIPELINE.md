# 落地页预览图自动化方案（Preview Image Pipeline）

更新时间：2026-08-10

## 背景与问题

bayjf 主站（`src/context/LanguageContext.tsx`）的 14 个产品卡片，每张都引用对应落地页的
`https://<site>.pages.dev/preview.png` 作为封面图。现状：

- **bayjf 主站**：通过 GitHub Actions `wrangler pages deploy` 部署
  （`.github/workflows/deploy-frontend-cloudflare.yml`），push 到 `dev`/`main` 触发。
- **14 个落地页**：**无部署 Action**，仅在 `.github/workflows/ci.yml` 做 lint/test/typecheck/build
  验证，实际发布由 **Cloudflare Pages 平台直接连 GitHub 自动部署**（push 即发，PR 自动生成
  Preview URL）。
- **preview.png 现状**：只有 `soft-desk-landing`、`tab-manager-landing`、`word-base-landing`
  三个站有 `public/preview.png`（且为**手动放置**，非 CI 产出）；其余 11 个站缺失，导致
  bayjf 上 11 张卡片是死链。

目标：让每次落地页部署后，bayjf 都能自动拿到该落地页**最新的首页预览图**，无需人工截图、手动放图、或手动改 URL。

## 方案选择

落地页是平台自动部署，Cloudflare 自带的部署流程里**插不进自定义 Action 步骤**，因此截图必须发生在
**Cloudflare 的构建阶段**（构建命令内完成）。据此给出两个候选：

### 方案 A（推荐）：构建命令内 Playwright 截图

在落地页的 `package.json` `build` 脚本里追加一步：先正常 `astro build`，再用 Playwright 对
本地构建产物起静态服务并截首页，把结果写入 `public/preview.png`（Astro 会把 `public/` 原样拷贝到
`dist/`）。Cloudflare 每次构建即自动产出最新图，URL 不变，bayjf 无需任何改动。

- 优点：零额外 Action、零额外部署步骤；完全契合平台自动部署；图随每次部署自动刷新。
- 缺点：Cloudflare 构建环境需安装 Playwright + 浏览器（增大构建时间、可能需
  `playwright install --with-deps` 或指定 chromium 包）。

落地页 build 改造示例（Astro 项目，根目录加 `scripts/shot.mjs`）：

```js
// scripts/shot.mjs
import { chromium } from 'playwright';
import { preview } from 'astro';
import { writeFile } from 'node:fs/promises';

const server = await preview({ outDir: './dist' });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
await page.goto(server.resolvedUrls.local.replace(/\/$/, '') + '/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'public/preview.png', fullPage: false });
await browser.close();
await server.stop();
console.log('preview.png written');
```

`package.json`：

```json
{
  "scripts": {
    "build": "astro build && node scripts/shot.mjs",
    "shot": "node scripts/shot.mjs"
  },
  "devDependencies": {
    "playwright": "^1.x"
  }
}
```

> 注意：截图脚本要在 `astro build` **之后**运行，因为 `public/preview.png` 会被拷贝进 `dist/`；
> 也可以直接写到 `dist/preview.png`（跳过 public 拷贝），效果相同。
> 视口建议 1280×800、deviceScaleFactor 2（生成 2560×1600 高清图），`fullPage: false` 只截首屏。

### 方案 B：轻量 GitHub Action 仅截图（不负责部署）

保留 Cloudflare 平台自动部署，另加一个 `.github/workflows/preview-shot.yml`，在 push 后用
`wrangler pages deploy` 之外的独立 job 起静态服务截图，再把 `preview.png` 提交回仓库（或单独
`wrangler pages deploy` 只传这张图）。

- 优点：不污染构建命令，构建环境无需装浏览器。
- 缺点：需额外 Action 配置 + 提交回仓库（触发二次 push）或额外一次 pages deploy；与平台自动
  部署并存时容易时序错乱（截图可能晚于页面部署）。**不推荐**用于平台自动部署的落地页。

### bayjf 主站（Action 部署）的处理

bayjf 自身没有"落地页预览图"需求（它消费别人的图）。但若未来需要自己的 `preview.png`，可在
`deploy-frontend-cloudflare.yml` 的 `npm run build` 之后、`wrangler pages deploy` 之前插入同样的
截图步骤，因为是 Action 驱动，方案 B 的缺点在这里不存在。

## 推荐落地步骤

1. **试点**：选 `soft-desk-landing`（已有 `preview.png` 可对比）按方案 A 改造，本地验证
   `npm run build` 后 `public/preview.png` 被刷新。
2. **逐个推广**：14 个落地页统一加 `scripts/shot.mjs` 与 build 改造。已手动放图的三站
   （soft-desk / tab-manager / word-base）改为自动产出，删除手动图（保留一份作 fallback 可选）。
3. **补齐缺失站**：其余 11 站首次构建后自动获得 `preview.png`，bayjf 死链消失。
4. **bayjf 无需改动**：`LanguageContext.tsx` 里的 `<site>.pages.dev/preview.png` URL 保持不变。

## 风险与注意

- Cloudflare Pages 构建默认超时与内存限制：Playwright 截图会拉长构建时间，需确认免费/付费额度。
- 字体/图片懒加载：截图用 `networkidle` + 适当 `waitForTimeout` 确保首屏渲染完成，避免截到空白。
- 动态内容（如 GitHub stars、下载计数）若首屏未 loaded 会导致图不稳定，建议截图前等特定选择器。
- 不要给 bayjf 的卡片 URL 加版本号戳（`?v=`）——平台自动部署每次 URL 不变，靠文件覆盖即可刷新；
  若出现缓存，可在 bayjf 引用处统一加 `?v=<部署日期>` 或依赖 Cloudflare 缓存策略。

## 结论

采用 **方案 A（构建命令内 Playwright 截图）**：契合 14 个落地页的平台自动部署模型，零额外 Action，
图随部署自动刷新，bayjf 零改动。先试点 soft-desk-landing，再全量推广。
