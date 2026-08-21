# Agent Note：鲸歌主题 —— 第三视觉轨道、星际元素、Travelers' Encore 音景

状态：已实现

[English](2026-08-21-whale-song-theme.md) | [中文](2026-08-21-whale-song-theme.zh.md)

## 问题

深空（`modern`）视觉风格把 DeepSeek 的鲸鱼做成了星云里一枚 34px 的 hero logo，却始终不是主角。用户希望以鲸鱼本体为蓝本、融合星际拓荒元素，做一版更大胆的专属主题，并预先定了三件事：主题命名为鲸歌 / Whale Song、默认视觉风格改为 `classic`、用本地 mp3（星际拓荒《Travelers' Encore》）做背景音景。现有双轨系统（`classic` / `modern`）没有第三轨的位置，主题插件也没有音频载体。

## 决策

**新增第三视觉风格 `whale-song`，默认改为 `classic`。** `ui-theme.style` 接受 `classic` / `modern` / `whale-song`（`VISUAL_STYLES` union，schema 校验）；`DEFAULT_VISUAL_STYLE` 改为 `classic`，新安装落在改造前的白纸快照，两个角色化轨道均为可选开启。切换仍是单属性 `body[data-ds-visual-style]` 翻转，零重渲染。

**在 modern 基础上叠加 token 双轨。** `design-platform.css` 新增 `body[data-ds-visual-style="whale-song"]` 及其 `[data-ds-dark-theme]` 交集：深渊夜航基座、生物荧光粒子、带荧光青的星云/星尘、远端"宇宙之眼"辉光、行星状态色（巨人之海荧光青 / 木炉镇森林绿 / 余烬双子琥珀 / 黑棘星暗红）、sonar 运行指示，以及亮轨控件 accent（`--dsw-leviathan-accent`，rgb(11,104,120)，在破晓底色 5.6:1）保证音量滑杆达到非文本对比度，暗轨保留高亮生物荧光青。`packages/client/web/src/base.css` 组合鲸歌氛围层；滚动条 elevated-surface 契约对新梯级成立（input-major/tip 落在鲸歌 rung 上）。

**鲸鱼成为 hero 主角（ui-conversation）。** 空会话 hero 在鲸歌轨下新增：星环（虚线环 + 三粒星点）与彗尾环绕放大的鲸鱼、更慢的巡游动画、宇宙之眼信号（右上脉冲）、篝火与飘升余烬（左下）、Nomai 环文 sigil 分隔纹样，以及 CSS 按轨道切换的口号（Follow the Signal / 循着信号，潜入未知）。所有装饰 `aria-hidden`、token 着色、仅 transform/opacity、轨道外隐藏、reduced-motion 门控。

**星际元素集。** ui-primitives 新增 `NomaiRing` 原语（12 刻度装饰环，currentColor）；StateDot 的 ongoing 增加 sonar 扩散环、实心态呈现行星环；运行中停止按钮外套暖橙"太阳"绕行轨道（22 分钟循环的抽象）。

**鲸歌音景（ui-ambience）。** 新增第二个持久化设置命名空间（`ui-ambience.enabled` / `.volume`，默认音量 0.4），Host 半注册、客户端绑定。`AmbienceRuntime` 拥有循环播放的 `/audio/travelers-encore.mp3` 元素（懒创建、1.5s 淡入、快速音量渐变、自动播放手势跟踪：持久化的 `enabled` 无法在无点击时自动播放，因此该行显示"点击续播"与提醒点）。控制器行位于设置-外观区（播放/暂停 + 音量滑杆），跨会话持久化。

**量子月坍缩与传送转场。** 外壳 body 在偏好/风格切换时 180ms 交叉淡化底色；对话区在每次会话切换时按会话 id 重放 160ms 极淡径向脉冲。

## 备选方案

**把 `modern` 加深为鲸鱼主题。** 否决：无回退、会吞掉已完成的深空轨道，且没有 opt-in 表面来表达"鲸鱼主角"。

**独立 `ui-ambience` 包 / 侧栏 footer slot。** 部分否决并适配：独立包需要 web-app profile 接线；从 ui-theme 注册侧栏 footer 动作会命中 TypeScript 项目引用环（ui-theme -> ui-sidebar -> ui-layout -> ui-theme）。因此控制器放在主题插件已拥有的设置-外观区。

**侧栏底部快捷开关。** 作为后续在 ui-sidebar 中基于现有 `ctx.ambience` 服务实现（footer slot 归 ui-sidebar 所有，不会新增环）。

## 后果

新安装默认 `classic`；`whale-song` 是拥有独立色板、氛围、hero 场景、星际元素与音景的完整第三轨。音景偏好以 `ui-ambience` 命名空间持久化到 `$DSH_HOME/settings.yaml`，绝不进入模型；自动播放受手势门控（WCAG 1.4.2 / 2.3.3）。`test:gui` 对全部改动包通过（本地仅剩沙箱环境性的 directory-picker 失败，且位于未改动包）；仓库 oxlint 对改动面干净。浏览器级 `test:web` replay 与三轨对比截图仍需装有 Playwright 的机器（按仓库 Windows 限制说明，Linux CI 为权威信号）。
