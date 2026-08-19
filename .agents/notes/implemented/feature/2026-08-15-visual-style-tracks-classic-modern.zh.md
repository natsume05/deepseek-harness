# Agent Note：视觉风格双轨（经典／现代）与即时退回

状态：已实现

[English](2026-08-15-visual-style-tracks-classic-modern.md) | 中文

## 问题

Web UI 视觉升级需要一条不烧桥的路径：升级后用户必须保留改造前的观感（并能随时退回）。主题链路只拥有一个偏好维度（`light`／`dark`／`system`），token 样式表只有一套值，因此在"旧观感"与"新观感"之间切换若不重写组件，就必须维护两套组件树。

## 决策

**视觉风格成为与配色方案正交的第二个偏好维度。** `ui-theme.style` 接受 `classic`（改造前快照）或 `modern`（默认，进行中的新设计）。它通过同一个 settings scope 持久化（默认存于 `$DSH_HOME/settings.yaml`），走同一条 `theme/change` 事件，绝不进入模型请求。

**Token 双轨，而非组件分叉。** `design-platform.css` 的默认 `body` 块是 modern 轨道（值随各模块改造逐步演进）；`body[data-ds-visual-style="classic"]`（含 `[data-ds-dark-theme]` 交叠）在改造前的 alias／specific 值上冻结。静态色板两轨共用。一次风格切换只是一个属性开关：无 JS token 重算、无组件重挂载。

**运行时链路与配色方案同构。** `ThemeRuntime` 持有风格并随 `ThemeSnapshot.style` 发布；`ThemeRuntime.setStyle` 通过 settings scope 写入。ui-layout 的 `ThemePresenter` 切换 `body[data-ds-visual-style]`（属性缺省 = modern），并在 dispose 时撤销。Host 引导脚本同时嵌入两个持久化值，首帧即落在正确的轨道上。Appearance 行在主题立方块之下新增"视觉风格：经典／现代"选择器。

**尺度 token 只定义一次。** `scales.css`（圆角、间距、动效、层级、z-index、品牌渐变、玻璃）两轨共用；风格差异只体现在颜色／层级别名值上。`packages/client/web/src/base.css` 在 `design-platform.css` 之前导入它。

**退回范围承诺。** classic 覆盖改造前已存在的全部区域的 token 值；改造期间新增的区域（命令面板等后续）在两轨下共用新组件样式，仅通过 token 换色。

## 备选方案

**两套组件树（经典 UI 与现代 UI）。** 否决：每个组件的维护量翻倍，行为修复会分叉，也无法共享 slot／store 机制。

**用运行时 token 覆盖做切换。** `ThemeRuntime.overrideTokens` 已经能叠加图层，但它是给第三方主题做局部微调的扩展接缝；完整的观感快照需要每次切换推入一整本别名字典，且表达不了 CSS 双轨的继承关系。基于属性的 CSS 双轨在运行时零成本，classic 就是一份普通样式表快照。局部覆盖仍为第三方主题保留，原样不动。

**把风格做成主题偏好的第三个取值。** 否决：混淆了两条正交轴（`light`／`dark`／`system` × `classic`／`modern`），使 system 解析复杂化，将来还要重做偏好 schema。

## 后果

新安装默认 `modern`；两轨初始值相同，随改造模块落地逐步拉开差异，classic 一直冻结在改造前观感。settings schema 新增 `ui-theme.style`（schemastery 默认 `modern`；非法值在 settings 边界被拒，与 `preference` 相同）。风格切换只经 CSS 重绘，绝不改变会话日志输出，因此机制本身不改变任何快照 fixture。组件 CSS 保持零主题选择器；风格轨道按 [web 样式系统框架](../process/2026-07-19-web-styling-system.md) 归 ui-theme 样式表所有，持久化遵循 [Host 支撑的偏好边界](../bug-fix/2026-08-06-host-backed-web-preferences.md)。
