# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主要访问者是潜在雇主、合作方与技术同行：他们在评估"我"作为 AI 工程化
交付者的能力与作品可信度，使用场景通常是招聘/合作前的快速浏览（桌面与
移动端均有）。次要受众是被落地页子产品（*-landing 站）回流到主站的访问者。

## Product Purpose

BayJF 是蒋枫的个人作品集网站：展示 AI Agent 产品交付案例、职业经历、技能
与联系方式。成功的含义是访问者能快速建立"这个人能把 AI 想法变成可交付
产品"的认知，并通过联系表单或社交链接发起接触。

## Positioning

与"简历式"作品集不同，BayJF 的核心主张是 AI Native + AI Agent Delivery：
项目不只是展示截图，而是完整的"从需求到交付"的工程化案例（含落地的
子产品落地页矩阵）。母品牌 BayJF 统领一组子产品落地页（agent-dev、
pr-helper、tab-manager、termana 等），形成品牌家族。

## Operating Context

- 双语内容：英文在根路径，中文在 `/zh/*`，URL 驱动语言切换。
- 明暗双主题，默认跟随系统。
- 访问入口包括直接访问、搜索引擎、社交分享（og 卡片）和子产品站回流。

## Capabilities and Constraints

- Astro 5 静态输出 + React island；纯系统字体栈（无 Web Font）。
- 品牌 accent 根源色为 sage 绿（light `#54615b` / dark `#8fae9d`），
  页面主色为纯黑白。
- 导航栏标签支持 spring / goo 双模式水珠动效（`motion/react`），
  用户可通过水滴按钮切换，`localStorage` 持久化，`prefers-reduced-motion` 自动降级。
- 联系表单经 Hono API 写入 Supabase，浏览器不持有密钥。

## Brand Commitments

- 名称：BayJF（bayjf.com）；GitHub 为 bayernjf。
- 主品牌标：**岸钩 JF（Shoreline Hook）**——一根竖笔立成岸，向右伸出的
  两道浪形横臂构成 F，笔尾向左弯出潮钩构成 J；字母即浪、浪即字母。
- 主配色：**海湾深蓝（Deep Bay）**——深海蓝黑渐变底（`#12354f → #08131d`）
  + 海沫蓝渐变图案（`#7dd3fc → #38bdf8 → #0284c7`）。
- 浅色场景变体：纸白底（`#f5f5f7`）+ 深 sage 渐变图案（`#54615b → #39433e`）。
- 子产品落地页 logo 使用各自的暗夜渐变家族配色；母品牌用海湾蓝保持层级区分。

## Evidence on Hand

- 项目数据在 `src/context/LanguageContext.tsx`（真实案例，不得虚构）。
- 品牌资产：`public/favicon.svg`、`public/og.svg`、`src/components/LogoMark.tsx`。
- 品牌规范：`DESIGN.md`。

## Product Principles

1. 克制优先：装饰必须服务内容，苹果式的留白与层级是默认语气。
2. 品牌家族一致：母品牌与子产品共享"暗夜底 + 渐变图案"的图标语言。
3. 工程可信：所有展示内容必须真实可查，不虚构数据与评价。
4. 双语同权：中英文内容同步维护，不做单边更新。
