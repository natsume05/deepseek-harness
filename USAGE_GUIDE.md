# DeepSeek Harness Web GUI 使用指南：视觉风格切换

本文说明如何启动带视觉升级的 DeepSeek Harness Web GUI，以及如何开启、切换和验证"视觉风格（经典 / 现代）"功能。

## 1. 这个功能是什么

Web GUI 视觉升级（按 [UI_REDESIGN_PLAN.md](UI_REDESIGN_PLAN.md) 实施）引入了两个东西：

1. **一套现代视觉语言**（已生效）：三栏卡片化布局、消息流式打字光标、Markdown 精排、输入卡聚焦光环、侧边栏选中品牌竖条、菜单/模态进出场动画、品牌渐变 hero 等。
2. **视觉风格切换**（本期核心机制）：与明暗主题正交的第二个偏好维度——
   - **现代（modern）**：默认，进行中的新设计观感；
   - **经典（classic）**：升级前的观感快照，可随时一键退回。

> **重要**：该功能只存在于源码（`ui-redesign` 分支）。npm 上发布的 `@deepseek-ai/dsh`（当前 `0.1.0-rc.7`）**不含**视觉升级，必须从源码构建运行才能体验。

## 2. 前置条件

- Node.js `^22.19 || >=24`，pnpm `11.x`（仓库要求）
- 一个 GitHub 可访问的网络（克隆用）
- 可选：`DEEPSEEK_API_KEY`——**启动 GUI 不需要**，只有给模型发消息才需要

## 3. 获取源码（含视觉升级的分支）

```sh
git clone https://github.com/natsume05/deepseek-harness.git
cd deepseek-harness
git checkout ui-redesign
```

如果你已在本地已有仓库（例如当前工作目录），直接确认分支即可：

```sh
git status --short --branch   # 应显示 master 或 ui-redesign
git checkout ui-redesign     # 若在 master，切到含视觉升级的分支
```

## 4. 安装依赖并构建

```sh
pnpm install
pnpm run build
```

`build` 会编译全部包并构建 Web 前端（需要几分钟）。构建产物是 Web GUI 正常运行的前提——直接跑源码入口不会自动构建前端。

## 5. 启动 Web GUI

```sh
pnpm dsh web
```

启动成功后，浏览器打开：

```
http://127.0.0.1:3080
```

首次启动 `web` 模板会自动初始化。看到三栏界面（左侧边栏 + 中间会话区 + 右侧详情区，卡片化圆角布局）即说明视觉升级生效。

## 6. 找到视觉风格切换入口

切换入口在**设置页**：

1. 点击左侧边栏**底部**的**设置**图标（齿轮/设置入口，位于侧边栏最下方）。
2. 在设置页选择 **General（通用）** 分区。
3. 找到 **外观（Appearance）** 区域——它有两行：
   - 第一行：主题（浅色 / 深色 / 跟随系统）；
   - **第二行：视觉风格（Visual style）——经典（Classic）/ 现代（Modern）**，这就是切换功能。

点击"经典"或"现代"即完成切换，界面即时生效（纯 CSS 属性切换，无需刷新、无需重载）。

## 7. 验证切换是否真正生效

切换后可用三种方式验证机制在工作：

**① 页面 DOM 属性**

按 `F12` 打开开发者工具，在 Console 执行：

```js
document.body.getAttribute('data-ds-visual-style')
```

- 选"现代"→ 返回 `null`（modern 是默认轨，不写属性）；
- 选"经典"→ 返回 `"classic"`。

**② 设置持久化**

切换后设置会写入 Harness home 下的 `settings.yaml`（`$DSH_HOME` 未设置时位于用户主目录下的默认 harness home）：

```yaml
ui-theme:
  preference: system   # 或 light / dark
  style: classic       # 或 modern
```

**③ 刷新保持**

刷新页面（或完全重启 `pnpm dsh web`）后，视觉风格保持你上次的选择——它是持久化偏好，不是临时状态。

## 8. 当前视觉状态说明（务必了解）

- **机制已就绪，两轨值当前一致**：按照"机制先行、观感渐进"的设计，上线初期 `classic` 与 `modern` 的 token 值相同，因此**此刻切换两者看不出明显视觉差异**——切换主要用于验证机制（DOM 属性、持久化、即时性）。
- 差异将随后续模块改造逐步拉开：以后每次视觉打磨只改默认（modern）轨的值，`classic` 永远冻结在"升级前观感"，届时切换即可看到两套观感。
- **现有已生效的现代视觉**（不依赖切换，任何风格下都可见）：三栏卡片化（圆角 + 沟槽 + 轻阴影）、消息流式品牌蓝打字光标、消息进入动画、思考过程折叠动画、Markdown 表格卡片化/引用块品牌竖线、空状态 hero 品牌蓝紫渐变光晕与渐变口号、输入卡聚焦光环、运行中停止按钮红色调、侧边栏选中行品牌竖条与蓝色"新建会话"主按钮、菜单/模态进出场动画、统一深色模式提亮等。

## 9. 常见问题

| 现象 | 处理 |
|---|---|
| 打开 `http://127.0.0.1:3080` 白屏或旧样式 | 确认先执行了 `pnpm run build`；前端产物未构建时入口无法提供新界面 |
| 设置页找不到"视觉风格" | 确认运行的是 `ui-redesign` 分支（`git branch`）；npm 安装版无此功能 |
| 发消息报错/无模型 | 设置页 → 模型配置，填入 `DEEPSEEK_API_KEY`（GUI 启动本身不需要 key） |
| 想恢复官方版 | `git checkout master && pnpm run build && pnpm dsh web`（官方 rc.7，无视觉升级） |
| 端口被占用 | `pnpm dsh web --port 8080`（启动器参数在前，应用参数在后） |

## 10. 相关产物

- 计划书与验收：根目录 [UI_REDESIGN_PLAN.md](UI_REDESIGN_PLAN.md)（含实施状态、裁剪项、验收清单）
- 架构总结：根目录 [ARCHITECTURE_SUMMARY.md](ARCHITECTURE_SUMMARY.md)
- 机制说明：`.agents/notes/implemented/feature/2026-08-15-visual-style-tracks-classic-modern.md`（classic/modern 双轨）与 `2026-08-15-web-ui-visual-redesign.md`（视觉升级实施记录）
- 代码：`natsume05/deepseek-harness` 的 `ui-redesign` 分支（10 个功能 commit）
