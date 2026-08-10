# Handoff — bayjf

更新时间：2026-08-08

## 项目概况
BayJF 个人品牌站，是 14 个产品落地页的 hub（中枢）。Astro 7 + React 19，
中英双语。双平台部署：Cloudflare Pages 与 Vercel（Hono，经 _worker.js），
自定义域名 bayjf.com（canonical 已切到该域名）。

站点架构（用户定义的规则）：
- 14 个落地页均通过 Nav/Footer 链回 bayjf.com；
- bayjf 展示全部产品落地页卡片，落地页卡片链接指向各自落地页，落地页再链到真实产品；
- 落地页之间不直接互链，必须经 bayjf 中转。

## 已完成（本地未推送，分支 feature/20260719，共 7 个提交）
- `a945774` fix(deps): pin motion to an exact version
- `f70ee46` chore(types): annotate Hono and event handler types
- `db6ee57` refactor(chart): replace recharts Cell with bar shape
- `6d76bf8` feat(legal): add privacy, terms and 404 pages
- `90145ac` refactor(footer): add legal links and refresh icons
- `a37aa85` feat(seo): switch canonical domain to bayjf.com
- `d05862d` feat(projects): link Tab Garden to landing page（Tab Garden 卡片改为
  https://tab-manager-landing.pages.dev/ 及其 preview.png；该落地页尚未部署）

## 注意点
- 提交前必须通过 `npm run lint && npm test && npm run build`（最近一次已全部通过，41 页 + _worker.js）。
- Tab Garden 卡片指向的 tab-manager-landing.pages.dev 目前 404（落地页未部署），部署前点击会 404。
- 遵守 AGENTS.md：英文 Conventional Commits、只用 npm、推送前 `git pull --rebase`、
  未经用户授权不建 PR / 不合并、向用户用中文汇报。

## 下一步
1. `git pull --rebase` 后 `git push`（分支 feature/20260719，勿动 main）。
2. 等待 tab-manager-landing 部署完成，验证 Tab Garden 卡片图片与链接。
3. （可选）部署后抽查 14 个落地页 → bayjf → 产品页的导航闭环。

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
