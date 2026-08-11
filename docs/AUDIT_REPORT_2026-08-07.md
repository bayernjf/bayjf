# BayJF 项目审计报告

**审计时间**：2026-08-07
**分支**：`feature/20260719`
**规模**：56 个源文件，约 7800 行代码（src/server/worker），14 个产品落地页外链

---

## 一、总评分

| 维度 | 权重 | 得分 | 说明 |
|---|---:|---:|---|
| 架构与技术选型 | 15% | **92** | Astro 静态 + React Island + Edge API 分离，设计成熟 |
| 代码质量 | 12% | **85** | 0 类型错误，但有未使用变量和少量 `any` |
| 测试质量 | 13% | **62** | 18 个测试全过，但覆盖率偏低，组件几乎无测试 |
| 安全性 | 15% | **88** | 多层防护到位，依赖审计有高危项 |
| SEO / GEO | 15% | **95** | 传统 SEO 与 AI 大模型优化都很完整 |
| 可访问性 | 8% | **78** | 基础 a11y 良好，部分按钮缺语义 |
| 性能 | 10% | **83** | 分包与图片优化到位，Recharts 偏重 |
| DevOps / 工作流 | 7% | **90** | 双平台 CI/CD 与 PR 门禁完整 |
| 可维护性 / 文档 | 5% | **80** | 文档详尽，但有超大组件文件 |

### 综合得分：**84 / 100（A−）**

项目整体处于**生产就绪且工程化程度较高**的水平。架构清晰、安全意识强、SEO/GEO 做得超出一般个人作品集；主要短板在测试覆盖率、少量代码卫生问题和一个构建依赖的高危漏洞。

---

## 二、各维度详情

### 1. 架构与技术选型 — 92/100 ✅

**亮点：**

- Astro 5 静态输出 + 单一 `client:load` React Island（`src/components/SiteIsland.tsx`），首屏 HTML 完整可读，利于 SEO
- 前端 Cloudflare Pages / 后端 Vercel Edge Function 独立部署，职责清晰
- Hono API 边缘运行，Supabase 作为数据层，RLS 严格
- i18n 通过 URL 路由（en 根路径，zh `/zh/*`），不依赖 `localStorage`
- 页面组件 `React.lazy` 懒加载，Recharts/Motion/Lucide/React 独立 vendor chunk
- `astro:assets` 在 `.astro` 层优化 19 张大图为 WebP，不在 `.tsx` 中直接 import
- Worker 同源代理 `_worker.js` 仅 1.9KB，解决跨域

**建议：**

- `src/components/BayjfScreen.tsx` 已达 870 行，建议拆分 filter、timeline、grid 子组件
- `src/context/LanguageContext.tsx` 承载全部 14 个产品中英数据，后续可考虑 Content Collections 管理

### 2. 代码质量 — 85/100 ✅

**检查结果：**

- `astro check` + `tsc`：**0 errors，0 warnings**
- 27 个 hints，主要是未使用的 import/变量：
  - `src/components/Header.tsx`：`Globe`、`lang`、`setLanguage`
  - `src/components/HomeScreen.tsx`：`ArrowRight`
  - `src/components/SkillsGrid.tsx`：`isHovered`
  - `src/context/LanguageContext.tsx`：`useEffect`
- `any` 使用 4 处，均可接受：
  - `window.webkitAudioContext` 类型补丁（2 处）
  - `behavior: 'instant' as any`
  - `icon: any` in SkillsGrid（建议改为 Lucide 图标类型）

**建议：** 清理未使用 import，将 `icon: any` 改为 `LucideIcon` 类型。

### 3. 测试质量 — 62/100 ⚠️

**结果：**

- 7 个测试文件，**18/18 全部通过**
- 总体覆盖率：**Statements 23.89% / Branches 60.6% / Functions 44%**
- 服务端覆盖较好：
  - `server/contact.ts`：94.28%
  - `server/app.ts`：82.82%
- **组件覆盖几乎为 0**：BayjfScreen、BlindBoxCard、HomeScreen、ContactScreen、ProjectDetailModal 等核心交互组件无测试
- E2E 测试存在 `e2e/bayjf.spec.ts`，但 GitHub workflow 仅手动触发，不作为 PR 门禁

**建议：**

- 优先为 BlindBoxCard（开盒/键盘/触屏）、ContactScreen（校验/Turnstile）、ProjectDetailModal 加组件测试
- 将 E2E 中不依赖凭证的冒烟用例纳入 PR 必跑
- 当前 23% 覆盖率对个人作品集可接受，但要承接更多产品时应提升到 50%+

### 4. 安全性 — 88/100 ✅

**亮点：**

- `secureHeaders()` 中间件全局启用
- CORS 严格白名单（`ALLOWED_ORIGINS`），仅允许 POST/OPTIONS
- Cloudflare Turnstile 人机验证 + honeypot 字段
- 请求体大小限制 16KB，防止滥用
- IP 仅存 **SHA-256 哈希**，不存明文
- User-Agent 截断到 500 字符
- `SUPABASE_SERVICE_ROLE_KEY` 仅在 server/api 层引用，未进入客户端
- RLS：`contact_messages` 不对 anon/authenticated 开放
- `.gitignore` 正确排除 `.env*`、`.vercel/`、`.wrangler/`
- 错误信息不泄露数据库细节

**问题：**

- `npm audit`：**10 个漏洞（1 low / 3 moderate / 6 high）**
  - 6 个 high 均来自 `sharp` 继承的 `libvips` CVE（CVE-2026-33327 等）
  - 这是构建期图片处理依赖，运行时风险较低，但应更新
- `/api/contact` 无服务端速率限制（Turnstile 提供了基础 bot 防护，但建议加 IP hash 维度的限流）

**建议：** 运行 `npm update sharp` 或等待 Astro 上游升级；为 contact 接口加简单的内存/KV 限流。

### 5. SEO / GEO — 95/100 🏆

这是项目最突出的维度。

**传统 SEO：**

- 每页独立 title/description（en/zh）
- canonical URL + hreflang 三向互指
- Open Graph + Twitter Card
- `@astrojs/sitemap` 自动生成带 i18n 的 sitemap
- robots.txt 禁止 `/api/` 和 `/en/` 重复路径
- 语义化 HTML，首屏含完整内容

**GEO（AI 大模型优化）：**

- `public/llms.txt` 中英双语，遵循 llmstxt.org 规范
- robots.txt 显式允许 GPTBot、ClaudeBot、PerplexityBot、Google-Extended、CCBot、Bytespider、Amazonbot 等
- `src/i18n/schema.ts` 注入 4 类 JSON-LD：
  - Person（含 sameAs、knowsAbout、knowsLanguage）
  - WebSite（含 SearchAction）
  - BreadcrumbList
  - FAQPage（首页/联系页双语 Q&A）
- 14 个产品在 llms.txt 中以"名称—描述—URL"清晰映射
- 静态 HTML 首屏可读，不依赖 JS hydrate

**小建议：** BayJF 主域切换到 `bayjf.com` 后，记得更新 robots.txt 中的 `Sitemap` 和 llms.txt 中的 `bayjf.pages.dev` 引用。

### 6. 可访问性 — 78/100 ✅

**亮点：**

- 19 处 `aria-label`，4 处 `role`，图片均有 alt
- BlindBoxCard 支持键盘 Enter/Space、`tabIndex`、`aria-expanded`
- 检测 `prefers-reduced-motion`，触屏设备自动常开
- 语言切换、主题切换有 aria 状态
- 联系表单有 label 和错误提示

**待改进：**

- 27 个 `<button>` 中部分未显式声明 `type="button"`（在无 form 的页面影响小，但属最佳实践）
- 部分纯图标按钮依赖 aria-label，建议抽查
- 自定义光标组件可能影响触屏/辅助设备体验（已有 reduced-motion 处理）

### 7. 性能 — 83/100 ✅

**构建产物：**

```
vendor-recharts.js   340K   （图表库，仅 Experience 页用）
vendor-react.js      197K
vendor-motion.js     133K
SiteIsland.js         47K   （主 island）
BayjfScreen.js        39K
vendor-lucide.js      18K
```

- 首屏 HTML 37KB（首页），projects 页 135KB（含 14 个产品服务端渲染内容，SEO 权衡）
- 19 张 AI Agent 大图全部转为 WebP 并构建期压缩
- 屏幕级代码分割，Recharts 只在需要时加载
- 无大包警告

**建议：**

- Recharts 340KB 是最大单项，若未来图表不复杂可考虑用轻量 SVG 手写或换 `visx`/`uPlot`
- 可考虑给 vendor-react 加上 `React.lazy` 的预加载策略

### 8. DevOps / 工作流 — 90/100 ✅

- 4 个 GitHub Actions：
  - `.github/workflows/ci.yml`：类型检查 + 测试 + 构建
  - `.github/workflows/deploy-api-vercel.yml`：Vercel API 预览/生产
  - `.github/workflows/deploy-frontend-cloudflare.yml`：Cloudflare 预览/生产
  - `.github/workflows/e2e-manual.yml`：手动 E2E
- PR → dev → main 两阶段门禁，Preview/Production 环境分离
- `PULL_REQUEST_WORKFLOW.md` 和 `DEPLOYMENT.md` 详尽
- 数据库 migration 规范（只增不改）

**建议：** E2E 冒烟测试可在 dev PR 自动跑一次，减少人工触发遗漏。

### 9. 可维护性 / 文档 — 80/100 ✅

- `AGENTS.md` 极其详尽，覆盖架构、约定、命令、安全、发布流程
- `.trae/rules/` 有明确的 commit 规范
- `.env.example` 完整，区分公开/私密/部署变量
- 代码风格统一：serif/sans 字体 token、颜色变量、组件命名一致
- 待改进：BayjfScreen 870 行、LanguageContext 600+ 行，建议拆分

---

## 三、优先修复建议

按优先级排序：

| 优先级 | 事项 | 工作量 |
|---|---|---|
| 🔴 高 | 更新 `sharp` / libvips 修复 6 个 high CVE | 小 |
| 🔴 高 | 将 bayjf.com 替换 llms.txt / robots.txt / BaseLayout 中残留的 `bayjf.pages.dev` | 小 |
| 🟡 中 | 清理 27 个未使用 import/变量，修复 lint hints | 小 |
| 🟡 中 | 为 BlindBoxCard、ContactScreen 加组件测试 | 中 |
| 🟡 中 | 给 `/api/contact` 加基于 IP hash 的速率限制 | 中 |
| 🟢 低 | 拆分 BayjfScreen（870 行）为子组件 | 中 |
| 🟢 低 | 将 `icon: any` 改为 `LucideIcon` 类型 | 小 |
| 🟢 低 | 给所有按钮补 `type="button"` | 小 |

---

## 四、结论

BayJF 是一个**工程素养很高的个人作品集项目**。架构选型现代且克制（Astro 静态 + 单 Island + Edge API），安全防护层层到位，SEO/GEO 做到了超越大多数商业站点的水平，CI/CD 和文档规范完整。

最值得肯定的是：**没有为了技术炫技过度工程化**，每个选型都服务于"作品集 + 产品矩阵入口"这个实际目标。当前最需要补的是测试覆盖率和依赖安全更新，这两项做好后可以稳定达到 A 级（90+）。
