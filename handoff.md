# Handoff — bayjf

更新时间：2026-08-11

## 项目概况
BayJF 个人品牌站，是 14 个产品落地页的 hub（中枢）。Astro 7 + React 19，
中英双语。双平台部署：Cloudflare Pages 与 Vercel（Hono，经 _worker.js），
自定义域名 bayjf.com（canonical 已切到该域名）。

站点架构（用户定义的规则）：
- 14 个落地页均通过 Nav/Footer 链回 bayjf.com；
- bayjf 展示全部产品落地页卡片，落地页卡片链接指向各自落地页，落地页再链到真实产品；
- 落地页之间不直接互链，必须经 bayjf 中转。

## 项目卡喜欢（Like）功能（2026-08-11，已实现并推送）
- 需求：每个项目卡爱心按钮支持喜欢/取消（toggle）；防刷重点是防同一访客频繁
  "点赞/取消"连点；记录来源；暂不展示喜欢数，但表结构与接口预留。
- 防刷（已按 2026-08-11 重新定位，去掉 Turnstile）：按访客 `visitor_hash` 的 1.5s
  toggle 冷却（拦快速连点）+ DB `UNIQUE(project_id, visitor_hash)` + 长效匿名 cookie
  `bayjf_lid`（SHA-256，IP+UA+lid 合成，不存 PII）。前端爱心按钮不渲染 Turnstile 组件，
  故服务端不再对 like 强制校验（否则会一律 403）。联系表单仍保留 Turnstile。
- 数据：新增 `project_likes` 表（`is_active` 软删除，upsert on_conflict），RLS 全禁，
  经 Hono service-role 代理；预留 `project_like_counts` 视图（前端暂不调用）。
- API：`POST /api/projects/like`（toggle，like/unlike）、`GET /api/projects/likes/mine`
  （当前访客已喜欢列表，挂载时初始化）、预留 `GET /api/projects/likes/counts`。
- 前端：`LikeContext` 管理 `likedIds`，乐观更新 + 失败回滚 + Toast；`LikeButton`
  （Heart 图标、aria-pressed、Motion 弹跳、reduced-motion 降级）；source 记录
  grid/timeline/detail_modal（blind_box 系列因 `BlindBoxCard` 组件尚不存在而暂未接入）。
  埋点 `trackEvent('project_like_toggle', { project_id, source, action })`（不含 PII）。
- 完整方案见 `docs/LIKES_FEATURE_DESIGN.md`（已同步记录 Turnstile 撤销决定）。
- 提交（分支 feature/20260719，已推送）：`d60b6ef` feat(db) / `6c556c9` feat(api) /
  `6364a70` feat(likes) / `dc38cd0` feat(projects) / `81eb1ed` test /
  `10b9b54` fix(api) 去 Turnstile / `feca24e` docs(likes) / `94d09c5` docs(deployment)。

## Logo 社交链接树弹窗设计（2026-08-07，待实现）
- 需求：左上角 Logo 点击改为呼出社交链接树弹窗（不再直接回首页，首页入口保留在
  导航 Home tab 与弹窗内）；Logo 加呼吸光晕吸引点击；弹窗开合用 MacBook genie
  最小化动效——从 Logo 位置放大出现，关闭时缩小回 Logo。
- 动效：Logo 2.8s 呼吸光晕（scale/opacity，reduced-motion 降级）；弹窗用
  createPortal + getBoundingClientRect 以 Logo 为 transform-origin，spring 打开
  （stiffness 260/damping 26）+ 中段 scaleY squash overshoot；关闭 0.28s easeIn
  吸入；列表 stagger 0.04s；打开时锁 body 滚动。
- 内容：GitHub（github.com/bayernjf）、Email（b4yernjf@gmail.com）、复制邮箱、
  返回首页，其他社交待补；外部链接 noopener；中英双语。
- 可访问性：dialog/aria-modal、Esc 关闭、焦点陷阱与关闭后焦点返回 Logo、
  aria-haspopup/aria-expanded；呼吸光晕 aria-hidden。埋点 social_tree_open /
  social_tree_click（只记 target，不含 PII）。
- 完整方案见 `docs/SOCIAL_TREE_MODAL_DESIGN.md`。尚未写代码。

## 导航水珠动效（2026-08-11，已撤销）
- 本轮曾新增共享 `NavWaterTrail` 水珠流动层（spring/goo 双模式），但后续评审认为该动效
  增加视觉复杂度而无明确价值，已在 `54e883e` refactor(nav): remove water-trail nav effect
  中整体移除（同时删除 `NavWaterTrail.tsx`、`navEffect` 状态、`#nav-goo-filter`、Droplets
  切换按钮与 `bayjf_nav_effect` localStorage）。
- 当前导航只保留 hover tooltip（`NavTab` 内 Motion 进出场 + 标签 + active 态），无水滴/
  光斑动效。
- 历史记录（已删除的实现，供追溯）：水珠层挂在 Header 桌面 nav 容器，`pointerX` MotionValue
  驱动主水珠 + 3 颗拖尾，goo 模式经 `#nav-goo-filter`（feGaussianBlur + feColorMatrix）粘连；
  曾修复旧版 `NavTab` 在条件 JSX 内调用 `useTransform` 触发的 Rules of Hooks 崩溃。

## 已完成（已推送，分支 feature/20260719）
- `9042452` refactor(bayjf): remove project card hover overlay
- `019c637` refactor(projects): centralize dates and display order
- `54e883e` refactor(nav): remove water-trail nav effect（见上方「导航水珠动效」，已撤销）
- 点赞（Like）功能共 8 个提交 `d60b6ef`…`94d09c5`，见上方「项目卡喜欢」段。

## 落地页预览图自动化方案（2026-08-10）
- bayjf 14 个产品卡片引用各自落地页的 `https://<site>.pages.dev/preview.png`；现状仅
  soft-desk / tab-manager / word-base 三站有（手动放置），其余 11 站缺失 → 死链。
- 14 个落地页均为 **Cloudflare Pages 平台自动部署**（push 即发，无部署 Action），故预览图
  需在**构建命令内**用 Playwright 截图自动产出（方案 A），而非额外 GitHub Action。
- 完整方案见 `docs/PREVIEW_IMAGE_PIPELINE.md`。bayjf 自身零改动（URL 不变）。
- 下一步：先在 soft-desk-landing 试点，再全量推广到 14 站。

## 14 个落地页 taste-skill 设计审计（2026-08-08）
本工作区作为编排入口，对同级目录 14 个 `-landing` 项目完成反 AI-slop
设计 Tell 审计与修复（仅样式与文案，不动内容 IA/URL/功能）：
- scroll 监听 → IntersectionObserver：soft-desk（滚动深度埋点）、
  tab-manager（导航边框）、word-base（导航阴影），共 3 处。
- 去 AI 紫换 emerald 单色 accent：word-base、word-picker
  （word-picker Showcase 四色卡片为有意设计，保留）。
- 英文文案 em-dash 清扫：14 个项目共 135 处（SEO 标题改 `|`、
  404 改冒号、正文按语义换标点；中文“——”保留）。
- eyebrow 节制：tab-manager 降级 6 个区块级 eyebrow，其余项目达标。
- 验证：14/14 `npm run build` 全部通过。

状态：改动均在各 landing 项目工作区，尚未提交；各项目 handoff.md
已追加审计记录。bayjf 自身代码本次未改动，编排用临时脚本已清理。

## 项目卡片展示顺序集中化（2026-08-11）
- 新增 `src/data/projectOrder.ts`：`PROJECT_ORDER` ID 列表 + `sortProjectsByOrder`
  工具函数，en/zh 共用一份顺序表。调整卡片顺序只需挪本文件的 id，无需改
  `LanguageContext.tsx` 的数据数组。
- `LanguageContext.tsx` 配套改动：原 `PROJECTS_EN/ZH` 改为内部 `RAW_PROJECTS_EN/ZH`，
  导出时经 `sortProjectsByOrder` 派生同名 `PROJECTS_EN/ZH`，下游引用方零改动。
- 同期把 14 个项目的 release date 集中到 `PROJECT_DATES` 查找表（替换 28 处字面量），
  与展示顺序重构同属"项目元数据集中化"主题。
- DEV 环境 sanity check：`PROJECT_ORDER` 与 `RAW_*` 漂移会在 console 告警
  （prod 被 Vite 静态消除）。
- 删除项目卡片 hover 时显示的 Quick Look 磨砂浮层（含 VIEW CASE STUDY 链接）。
- 验证：`astro check` 0 错 0 警告；`npm test` 16 passed；`npm run build` 41 页。
- 提交：`9042452` refactor(bayjf): remove project card hover overlay；
  `019c637` refactor(projects): centralize dates and display order。已推送 origin。

## 简历 / CV 公网下载（2026-08-20，待办）
- 当前状态：bayjf 仓库内没有任何 `.pdf` / `.docx` 简历文件，`public/` 下也没有 CV 资源；代码中没有简历下载入口。现有中文简历和英文简历仅在本地：
  - 中文：`/Users/jiangfeng/000AAA-姜峰工作文件/姜峰简历202608版.docx`
  - 英文：`/Users/jiangfeng/000AAA-姜峰工作文件/JiangFeng_Resume_202608_EN.docx`
- 待确认：是否公开发布简历。简历包含手机号和邮箱；若放入公开仓库或 `public/`，即使页面不挂链接也可能被访问和抓取。
- 联系方式需先统一：网站社交弹窗当前使用 `b4yernjf@gmail.com`，简历中使用 `2467055074@qq.com` 和手机号；发布前确认最终公开邮箱/电话。
- 推荐方案：不要直接提供 `.docx`，将中英文简历各自导出为 PDF，放入 `public/cv/`，例如 `public/cv/jiang-feng-cv-zh.pdf`、`public/cv/jiang-feng-cv-en.pdf`；部署后通过 `https://bayjf.com/cv/jiang-feng-cv-zh.pdf` 和 `https://bayjf.com/cv/jiang-feng-cv-en.pdf` 下载。
- 页面改动：在社交弹窗/联系区域增加中英双语“下载简历 / Download CV”入口；外部或静态文件链接使用安全属性，增加埋点但不记录 PII。
- GEO/SEO：若公开，更新 `public/llms.txt`、`public/zh/llms.txt`，可直接列出简历 PDF 链接和一句话说明；确认 `robots.txt` 不拦截 `/cv/`。
- 发布前检查：PDF 排版预览、中英文数字口径一致（当前为 15 个产品/原型，其中 7 个已发布、8 个持续迭代），并运行 `npm run lint && npm test && npm run build`。

## 项目目录 /admin 管理（2026-08-21）
- 顺序与状态从「改代码 + 部署」改为「代码兜底 + Supabase 覆盖层」：日常排序/上下架在 `/admin` 页面完成，秒级生效（`Cache-Control: no-store`），无需部署。
- 新增项目仍需先在 `RAW_PROJECTS_EN/ZH` 加内容、在 `src/data/projectCatalog.ts` 的 `CATALOG` 加占位条目并部署；之后在 admin 里调顺序、改状态。
- 完整流程、合并/兜底规则、管理员环境变量与本地联调见 `docs/PROJECT_CATALOG_AND_ADMIN.md`。
- 后端：`server/catalog.ts`（Supabase 存取）、`server/admin.ts`（PBKDF2 + HMAC session）、`server/app.ts`（`/api/catalog`、`/api/admin/*`）；前端：`src/pages/admin.astro`、`src/components/AdminApp.tsx`、`LanguageContext` 运行时拉取 catalog。
- 迁移：`supabase/migrations/20260821000000_create_app_settings.sql`（app_settings 表，RLS 全禁，仅 service-role 访问）。
- 验证：`npm run lint` 0 errors、`npm test` 52 passed、`npm run build` 44 页。
