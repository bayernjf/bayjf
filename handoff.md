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

## 导航水珠动效（2026-08-11，本次新增 + 修复）
- 架构：水珠动效上移到**共享层**，跨导航标签连续流动，不再在单个标签内计算。
  - 新增 `src/components/NavWaterTrail.tsx`：导航栏共享的"水珠流动"层，挂在 Header 的
    桌面 nav 容器上。鼠标 X 由 `Header` 的 `onMouseMove` 以 px 写入共享 `pointerX`
    `MotionValue`，`NavWaterTrail` 用 `useSpring` 驱动主水珠 + 3 颗刚度/阻尼递减的拖尾水珠，
    通过 `motion.g` 的 `style.x`（支持 MotionValue）平移，形成滞后液体尾迹。
    - spring：仅主水珠单颗弹簧光斑，跟手、有惯性滞后。
    - goo：4 颗水珠重叠，经 Header 已有的 `#nav-goo-filter`（feGaussianBlur +
      feColorMatrix）粘连成水银/水珠流动感。
    - `prefers-reduced-motion` 时 `NavWaterTrail` 直接返回 `null` 完全降级。
  - `NavTab.tsx`：只保留 hover tooltip（Motion AnimatePresence 进出场）+ 标签 + active 态，
    不再渲染 per-tab 光斑、不再持有 `effectMode`。
- 修复的严重 bug：旧版 `NavTab` 在条件渲染的 JSX 里调用 `useTransform`（违反 React
  Rules of Hooks），hover 时直接崩溃（`Rendered more hooks than during the previous render`，
  默认 spring 模式必崩）。现所有 Hook 都在 `NavWaterTrail` 顶层无条件调用，崩溃消失。
- `Header.tsx`：`nav` 容器加 `ref` + `onMouseMove`/`onMouseEnter`/`onMouseLeave` 接入共享层，
  保留 Droplets 切换按钮（Droplets 图标），`localStorage` 键名 `bayjf_nav_effect` 持久化偏好。
- `translations.ts` 新增 `nav.tip.*` 中英双语 tooltip 文案（Home / Projects / Experience / Contact）。
- 验证：`astro check` 0 错 0 警告（仅 1 个无关的 `FormEvent` 弃用提示，来自既有文件）；
  `npm test` 16 passed；`npm run build` 41 页。

## 已完成（已推送，分支 feature/20260719）
- `9042452` refactor(bayjf): remove project card hover overlay
- `019c637` refactor(projects): centralize dates and display order

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
