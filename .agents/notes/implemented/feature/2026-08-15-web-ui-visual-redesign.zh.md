# Agent Note：Web UI 视觉升级实施记录

状态：已实现

[English](2026-08-15-web-ui-visual-redesign.md) | 中文

## 问题

Web GUI 的视觉语言停留在"功能正确"阶段：token 表缺少圆角／间距／动效／层级尺度，三栏框架平铺无层次，会话／输入／侧边栏表面缺少现代工作台质感，动效各自为政。[UI_REDESIGN_PLAN.md](../../../../UI_REDESIGN_PLAN.md) 规划了分阶段重设计；本笔记记录实际落地内容与有意裁剪项。

## 决策

**按 P1–P7 分阶段实施，token 体系先行，classic／modern 切换作为退回保证**（切换机制本身见[视觉风格双轨笔记](2026-08-15-visual-style-tracks-classic-modern.md)）。所有改动都留在展示层：功能 CSS 只消费 `--dsw-alias-*`／`--dsw-*` token，零数据层与会话日志改动，零新增模型可见输入，所有动画都受 `prefers-reduced-motion` 门控（组件级关闭 + `apps/web/src/base.css` 的全局兜底）。

已落地的视觉面：三栏卡片框架（8px 沟槽 + 增强拖拽手柄）；流式打字光标、仅尾部消息的挂载进入动画（挂载时捕获 `entering` + 忽略其变化的 memo 比较器，保持流式零 re-render 契约）、思考折叠的 chevron 旋转与展开 fade、Markdown 表格卡片化（表头底色 + 斑马纹）、引用块品牌蓝竖线、代码块细描边、hero 品牌渐变光晕与渐变口号、StateDot 状态过渡、队列坞 hover／列表 fade、统一的 DisclosureRow 展开动画、输入卡聚焦光环与停止红色调、菜单／模态进出场 + 品牌焦点环、侧边栏选中行品牌竖条与 nav-item-active 底色、New Session 品牌蓝主按钮。

**裁剪项（边际收益低或偏离品牌）**：⌘K 命令面板（现有 `ui-commands` popup 已 token 化且现代）、BrandWordmark 渐变（精确提取的 SVG 品牌资产）、图标逐枚网格统一、骨架屏 shimmer（当前无占位需求）。均已记录在计划书实施状态章节，可后续恢复。

## 备选方案

**全面引入组件库或 Tailwind。** 被既有[web 样式系统框架](../process/2026-07-19-web-styling-system.md)否决：CSS Modules + token 是约束，不是可选项。

**每个视觉改动都重写组件。** 否决：slot／props 纪律与 memo 边界（流式、工具行）是行为契约；重设计选择骑在其上而非推翻。

## 后果

GUI 现在使用统一的现代工作台语言，而 classic 快照（`ui-theme.style = classic`）始终一键可回退。`test:gui`（273 文件／3792 测试）、typecheck、lint 在每一阶段保持全绿；浏览器级 `test:web` replay 无 UI 结构回归——其在本 Windows 主机上的工具层失败是平台限制（bash／terminal 不可用），Linux CI 仍是 replay 的权威信号。全部工作已推送到用户个人 fork 的 `ui-redesign` 分支；计划书验收清单逐项记录了状态。
