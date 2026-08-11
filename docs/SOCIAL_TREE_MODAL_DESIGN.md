# Logo 社交链接树弹窗设计方案

> 状态：**设计完成，待实现**
> 创建：2026-08-07
> 适用：BayJF 作品集站（feature/20260719）

## 一、需求

1. 左上角 Logo 点击后弹出社交媒体链接树，而不是直接回首页。
2. 给 Logo 加呼吸光晕特效，吸引用户点击。
3. 弹窗开合使用类似 MacBook 应用最小化（genie effect）的动效：从 Logo 位置放大出现，关闭时缩小回 Logo。

## 二、交互设计

### Logo 区改造
- 左上角 Logo（`LogoMark + BayJF` 文字）从“回首页链接”改为社交链接树触发器。
- Logo 持续呼吸光晕吸引点击。
- 点击 Logo 呼出社交弹窗（从 Logo 位置 genie 放大）。
- 首页入口不丢失：导航栏第一个 tab “Home” 仍负责回首页；弹窗内也提供“返回首页”入口，保留“点 logo 回首页”的肌肉记忆替代路径。
- 桌面端长按 800ms / 移动端双击可作为回首页快捷方式（可选，tooltip 提示）。

### 弹窗内容
纵向居中毛玻璃卡片，包含：

| 入口 | 链接 | 图标 |
|---|---|---|
| GitHub | https://github.com/bayernjf | Github |
| Email | mailto:b4yernjf@gmail.com | Mail |
| 复制邮箱 | 点击复制到剪贴板 | Copy |
| 回到首页 | 首页路由 | Home |
| 其他社交 | 待补充（Twitter/X、即刻、知乎、掘金等） | 对应品牌图标 |

- 外部链接统一 `target="_blank" rel="noopener noreferrer"`。
- 顶部引导文案（中/英）：“在这些地方找到我 / Find me elsewhere”。
- 邮箱与 Footer 保持一致：`b4yernjf@gmail.com`。

### 关闭方式
- 点击遮罩、按 `Esc`、点关闭按钮（×）。
- 关闭时弹窗 genie 缩小回 Logo。

## 三、动效设计

### 1. Logo 呼吸光晕（待机）
- LogoMark 外加一圈 sage/mint 色光环。
- CSS/Motion keyframes，2.8s 无限循环：
  - opacity 0.35 → 0.75 → 0.35
  - scale 1.0 → 1.18 → 1.0
  - 轻微 blur(4px) 形成光晕
- `prefers-reduced-motion` 时关闭动画，保留静态环。
- 弹窗打开时暂停呼吸（opacity 降到 0.15），焦点交给弹窗。

### 2. Genie 开合（核心）
模拟 Mac 应用最小化：窗口沿曲线“吸入”图标，伴随缩放形变。

**打开动画：**
- 用 `createPortal` 把弹窗挂到 `body`，坐标基于 viewport。
- 打开瞬间用 `logoRef.current.getBoundingClientRect()` 取 Logo 实时位置作为原点。
- `transform-origin` 动态设为 Logo 中心。
- 从 `{ scale: 0.15, scaleY: 0.3, opacity: 0, y: logoY-centerY, x: logoX-centerX }`
  到 `{ scale: 1, scaleY: 1, opacity: 1, y: 0, x: 0 }`。
- 缓动 spring `{ stiffness: 260, damping: 26, mass: 0.9 }`。
- 中段加 squash：scaleY 0.82 → 回弹 1（overshoot），增强 genie 感。

**关闭动画（反向）：**
- 到 `{ scale: 0.12, scaleY: 0.25, opacity: 0, y/x 到 Logo 位置 }`。
- tween 0.28s easeIn，模拟吸入加速。
- 列表项反向 stagger 收起（先图标后文字）。

**遮罩：**
- 打开 opacity 0→1（0.2s），关闭 1→0（0.2s）。
- `backdrop-blur-md` + 半透明 night/paper。

**列表项：**
- 打开时图标从中心依次弹出，stagger 0.04s（spring）。
- 关闭时反向快速收起。

**性能与降级：**
- `will-change: transform, opacity`。
- `useReducedMotion()` 检测：降级为简单 opacity 淡入淡出，无位移/形变。
- 弹窗打开时 `document.body.style.overflow='hidden'` 锁定滚动，避免 Logo 位置漂移。

## 四、技术实现

### 新增文件
- `src/components/SocialTreeModal.tsx`：弹窗本体，`createPortal` 挂到 `body`，避免 header overflow/z-index 裁剪。
- `src/hooks/useElementPosition.ts`（可选）：获取 Logo rect 作为 genie 原点。

### 修改文件
- `src/components/Header.tsx`：
  - Logo 外包呼吸光晕容器。
  - 触发器改为 `<button>`，`aria-haspopup="dialog"`、`aria-expanded`。
  - 管理 `socialOpen` 状态，渲染 `SocialTreeModal`。
- `src/i18n/translations.ts`：新增中英文案
  - `social.title`、`social.subtitle`、`social.backHome`、`social.copyEmail`、`social.copied`、`nav.tip.social`。
- Footer 的 GitHub/Email 保留，弹窗是补充而非替代。

### 可访问性
- 弹窗 `role="dialog"` `aria-modal="true"` `aria-labelledby`。
- 打开时焦点移到弹窗内第一个链接；关闭后焦点返回 Logo 按钮（genie 动画结束后）。
- `Esc` 关闭；遮罩点击关闭，内容区阻止冒泡。
- 呼吸光晕 `aria-hidden="true"` 纯装饰。

### 埋点
- `trackEvent('social_tree_open')`。
- `trackEvent('social_tree_click', { target: 'github' | 'email' | 'home' | ... })`。
- 不含 PII，符合现有埋点约定。

### 视觉风格
- 颜色用现有 token：呼吸光晕用 `sage`（亮）/`mint`（暗）。
- 弹窗毛玻璃复用 header 风格：`backdrop-blur-xl bg-paper/70 dark:bg-night/70`。
- 图标用 Lucide，不引入新依赖。

## 五、动效参数

```text
呼吸：2.8s ease-in-out infinite, scale 1→1.18, opacity 0.35→0.75
打开 spring：stiffness 260, damping 26, mass 0.9
关闭：tween 0.28s easeIn, scale to 0.12
squash：scaleY 中段 0.82 → 1（overshoot）
stagger：0.04s
```

## 六、提交拆分（实现时）

1. `feat(social)`: SocialTreeModal 组件 + 中英文案
2. `feat(header)`: Logo 呼吸光晕 + 弹窗触发集成
3. （可选）`style(social)`: genie 动效参数微调
