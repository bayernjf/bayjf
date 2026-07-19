# Pull Request Workflow

本文档定义 Bayjf Portfolio 的强制交付流程。除非用户明确改变流程，否则所有功能、
修复和发布工作都必须遵循本文档。

## 长期分支

正常流程结束后，远程和本地只保留以下长期分支：

```text
feature/20260719
dev
main
```

- `feature/20260719`：当前功能开发分支。
- `dev`：集成和 Preview 部署分支。
- `main`：Production 部署分支。
- `fix/*`、`chore/sync-*` 等均为临时分支，闭环后必须删除。

## 通用前置步骤

任何分支操作前都必须同步远程状态：

```bash
git fetch origin --prune
git checkout <branch>
git pull --rebase origin <branch>
```

不得基于过期的本地分支创建修复分支、提交、PR 或部署。

提交前按改动范围完成验证。源码或配置至少运行：

```bash
npm run lint
npm test
npm run build
```

浏览器交互和用户流程改动还应本地运行 `npm run test:e2e`。GitHub E2E 工作流
保持手动触发，不作为自动 PR 门禁。

## 阶段一：完成 feature 分支

1. 在 `feature/20260719` 完成代码。
2. 完成本地验证。
3. 按 `.trae/rules/git-commit-message.md` 拆分原子 commit。
4. pull/rebase 当前远程 feature 分支。
5. push 到 `origin/feature/20260719`。

## 阶段二：feature 合并到 dev

1. 真实创建 `feature/20260719 → dev` PR。
2. PR 只触发 CI 检验和 Build，不触发部署。
3. 等待所有 required checks 成功。
4. 任一 Actions 失败时，停留在 feature 分支修复、验证、提交、推送并重新等待。
5. 全部成功后合并 PR。
6. 等待 dev 合并后 Actions 全部完成：
   - CI 成功；
   - Vercel API Preview 成功；
   - Cloudflare Pages Preview 成功。
7. 检查 Preview 页面和 API 健康状态。
8. 全部成功后才能进入 main 阶段。

## 阶段三：dev 合并到 main

1. 确认 dev CI 和双平台 Preview 均成功。
2. pull 最新 dev 和 main。
3. 真实创建 `dev → main` PR。
4. PR 只触发 CI 检验和 Build，不触发部署。
5. 等待所有 required checks 成功。
6. 全部成功后合并 PR。
7. 等待 main 合并后 Actions 全部完成：
   - CI 成功；
   - Vercel API Production 成功；
   - Cloudflare Pages Production 成功。
8. 检查生产页面、API 健康状态和关键用户流程。
9. 生产 Actions 与线上验证全部成功后才可报告完成。

## Actions 失败处理

### PR 合并前失败

- 不合并 PR。
- 在 PR head 分支修复。
- 验证、原子提交、推送后等待 Actions 重新运行。
- 重复直到全部成功。

### dev 合并后失败

1. pull 最新 `dev`。
2. 从 `dev` 创建临时 `fix/*` 分支。
3. 修复并验证。
4. 创建 `fix/* → dev` PR。
5. 等待 PR Actions 成功后合并。
6. 等待 dev CI 和双平台 Preview 成功。
7. 删除远程和本地 fix 分支。
8. 把最新 dev 同步到 `feature/20260719`，验证后推送 feature。

### main 合并后失败

1. pull 最新 `main`。
2. 从 main 创建临时 `fix/*` 分支。
3. 修复并验证。
4. 创建 `fix/* → main` PR。
5. 等待 PR Actions 成功后合并。
6. 等待 main CI 和双平台 Production 成功。
7. 删除远程和本地 fix 分支。
8. 按 `main → dev → feature/20260719` 的顺序回同步修复。
9. 受保护分支之间的回同步使用临时 `chore/sync-*` 分支和 PR；成功后删除。

## 临时分支清理

临时分支只有满足以下全部条件后才删除：

- 修复 PR 已合并；
- 目标分支 Actions 已成功；
- Preview 或 Production 部署已成功；
- 必要的线上验证已成功。

随后删除远程和本地分支，并执行：

```bash
git fetch origin --prune
git branch -a
```

确认没有遗留 `fix/*` 或 `chore/sync-*` 分支。

## 冲突规则

- 不自动解决 merge、rebase 或 cherry-pick 冲突。
- 出现冲突时停止，列出冲突文件和 Git 状态，等待用户决定。
- 不使用 `git reset --hard`、强制覆盖或丢弃用户改动来绕过冲突。

## 完成门槛

只有以下事项全部完成才能报告整个交付流程成功：

```text
feature 已提交并推送
feature → dev PR checks 成功并完成合并
dev CI、Vercel Preview、Cloudflare Preview 成功
dev → main PR checks 成功并完成合并
main CI、Vercel Production、Cloudflare Production 成功
线上页面和 API 验证成功
临时修复/同步分支已清理
main → dev → feature 回同步完成
最终只保留 feature、dev、main 三个长期分支
```
