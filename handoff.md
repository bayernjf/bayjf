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
