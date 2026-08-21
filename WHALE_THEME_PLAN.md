# 鲸歌 · Whale Song（星鲸航线）视觉设计方案

版本：v2（定稿）
状态：**方案定稿，待实施**。本文只定义概念、范围、路线与验收，不动任何代码。配套现状参见 [DEEP_SPACE_THEME_PLAN.md](DEEP_SPACE_THEME_PLAN.md) 与 [UI_REDESIGN_PLAN.md](UI_REDESIGN_PLAN.md)。

> **v1 → v2 变更（用户拍板）**
> 1. 主题名定为 **鲸歌 / Whale Song**，风格 id 定为 `whale-song`。
> 2. **默认视觉风格改为经典（`classic`）**——当前代码 `DEFAULT_VISUAL_STYLE = 'modern'`，实施时改回 `classic`；已显式选择 `modern` 的持久化用户不受影响，新用户看到白纸经典，深空/鲸歌均为可选开启。
> 3. 新增 **背景音乐（鲸歌音景）**：使用本仓库根目录 mp3 —— `Andrew Prahlow - Travelers' encore_EM (online-audio-converter.com).mp3`（星际拓荒《Travelers' Encore》），纳入 v1 实施范围（原方案建议 v2，现提前到 v1）。

## 0. 一句话概念

> **经典（classic）是白纸，深空（modern）是风景，鲸歌（whale-song）是主角叙事。**
> 你是一头星鲸——DeepSeek 的鲸鱼本体——身负 harness（dsh 本就是 harness），在 22 分钟的太阳循环里一次次潜入星海，循着"未知的信号"（宇宙之眼）航行。每一次提问都是一次深潜，每一次思考都是一声鲸歌，每一次工具调用都是途经一颗行星。

## 1. 设计叙事

### 1.1 为什么是"鲸鱼本体"

现有深空轨已经把品牌蓝、星云、暖橙太阳、鲸鱼漂移做成了**氛围**，但鲸鱼只是 hero 里一枚 34px 的 logo。本轮要做的，是让鲸鱼从"标志"升级为**主角**：

- **鲸鱼 = 探索者 + 飞船**：星际拓荒里你驾驶小飞船探索太阳系；在这里，星鲸本身就是飞船。它背上的 harness（dsh）就是你的驾驶舱与仪表盘。
- **鲸鱼 = 深度求索的具象**：深海的鲸下潜到万米深渊，深空的鲸飞向未知星系——"DeepSeek" 的字面意思就是这条航线。
- **鲸鱼 = 信号与共鸣**：鲸歌跨越整个大洋传递信息；模型的思考、流式输出、工具调用，都是星鲸在星海中的回声。

### 1.2 为什么是"星际拓荒"

星际拓荒（Outer Wilds）的美学核心不是"科幻酷炫"，而是**深邈、宁静、好奇、暖橙的太阳光穿过蓝紫星云**，以及"循着信号走向未知"的叙事驱动。它与 DeepSeek 鲸鱼天然同构：一个在太空中循信号航行，一个在数据深海中循问题航行。我们**只借用其氛围语言与意象，不复制其美术资产**（版权红线，见 §8；用户自备的官方原声 mp3 仅作本地个人使用）。

### 1.3 故事线（用户可感知的隐喻）

| 产品时刻 | 星际拓荒隐喻 | 鲸歌轨道的呈现 |
|---|---|---|
| 新会话 | 在量子月面前校准罗盘 | hero：星鲸 + 远处"宇宙之眼"的极淡辉光 + 篝火 |
| 输入问题 | 调谐信号望远镜 | 输入卡 = 信号调谐器，聚焦时光谱环收紧 |
| 模型思考 | 鲸歌吟唱 | 从星鲸/头像发出 sonar 脉冲环；流式光标如回声涟漪 |
| 工具调用 | 途经一颗行星 | 工具卡按行星色相点亮；队列 dock 如行星轨道 |
| 运行中 | 22 分钟太阳循环 | 运行指示 = 一段被太阳逐格点亮的弧线，循环往复 |
| 完成 | 抵达宇宙之眼 | 成功态 = 恒星新生（浅金白爆发后归于平静） |
| 出错/危险 | 黑棘星 | 暗红 + 警示纹样，不单靠颜色 |
| 切换明暗 | 量子月 | "观察即坍缩"——切换瞬间做一次色彩坍缩过渡 |
| 切换会话/面板 | 黑洞传送 | 缩放 + 淡入的传送式转场（尊重 reduced-motion） |
| 侧栏折叠 | 收起舷窗 | rail 态 = 量子月暗面，仅留星鲸徽记 |
| **背景音乐** | **篝火边的旅人合奏** | 侧栏底部的"鲸歌音景"开关：播放/暂停/音量；默认关闭，用户开启后跨会话保持 |

## 2. 定位与范围

### 2.1 与现有轨道的关系

| 轨道 | id | 定位 | 意象 |
|---|---|---|---|
| 经典 | `classic` | **默认**回退快照 | 原版白纸观感 |
| 深空 | `modern` | 进行中的新设计 | 星云、星尘、暖橙太阳、鲸鱼漂移 |
| **鲸歌（新增）** | `whale-song` | 本轮大胆创作 | 鲸鱼本体叙事 + 星际拓荒意象全集 |

**决策：新增独立第三轨道 `whale-song`，与 classic/modern 并列；默认风格改为 `classic`。** 理由：

1. **可回退**：沿用"快照轨"纪律，classic 永远白纸、modern 不受扰动、whale-song 独立演化，三者随时一键切换（ui-layout 只切 `body[data-ds-visual-style]` 属性，零组件重渲染）。
2. **schema 向后兼容**：`VISUAL_STYLES` 是 `z.union([...])`，向末尾追加新值不会破坏已持久化的 `classic`/`modern`。
3. **默认求稳**：用户决定默认回到经典，把鲸歌/深空做成可发现、可开启的体验，产品冲击最小。

> 备选方案（记录，不推荐）：把 `modern` 继续加深为鲸歌。缺点：默认面变化过大、无回退、会吞掉刚完成的深空成果。

### 2.2 范围

- **做**：第三轨道 `whale-song` 的 token 层、背景层、hero 星鲸场景、星际元素组件化、动效与文案；**背景音乐控制器**（启用/音量持久化、自动播放策略、可访问性）。
- **不做**：改数据层/会话日志；改组件行为契约（memo、slot、input machine）；引入 UI 框架或 Tailwind；引入 canvas/大图粒子；对 mp3 做版权再分发。

## 3. 星际拓荒元素 → UI 特征映射表

| 元素 | 隐喻 | UI 落地 | 载体 |
|---|---|---|---|
| 星鲸（鲸鱼本体） | 探索者 + 飞船 | hero 主角场景、侧栏徽记、rail 折叠态 | ui-conversation / ui-sidebar / ui-primitives |
| 宇宙之眼（信号） | 用户的问题/目标 | hero 远端极淡辉光目标；输入卡=信号调谐器；toast="收到信号" | EmptyHero / InputBar / Toast |
| Nomai 环形文字 | 古老知识 | 时间戳、加载器、分隔线、badge、选中态上的环形纹样（纯装饰，aria-hidden） | ui-primitives 新增 NomaiRing |
| 22 分钟太阳循环 | 任务生命周期 | 运行指示=太阳逐格点亮的弧线；turn/step 计数=循环节拍 | QueueDock / StateDot / 遥测数字 |
| 篝火（拓荒者） | 等待与归家 | 空状态场景中的篝火与飘升余烬；待机动画 | EmptyHero |
| 行星色相 | 状态语义 | 状态色=行星色板（见 §4.1） | design-platform.css token |
| 量子月 | 明暗/观察态 | 明暗切换的"坍缩"色彩过渡；侧栏折叠=量子月暗面 | ui-layout / ui-sidebar |
| 信号望远镜 | 搜索/调谐 | 搜索框/模型选择=频率调谐（频谱环） | ui-primitives / 现有组件 token 化 |
| 黑洞/传送门 | 会话切换 | 面板/会话切换的传送式转场（scale+fade，仅 transform/opacity） | scales.css 动效 token |
| 拓荒者乐器 | 多 agent/工具协作 | 工具卡=合奏乐器，思考时依次点亮 | GenericCommandCard / 工具卡 |
| **旅人合奏（Travelers）** | **背景音乐** | 侧栏"鲸歌音景"开关，播放官方原声 | 新增 ui-ambience 控制器 |

## 4. 视觉语言

### 4.1 色彩（行星色板）

深海 + 深空融合：暗轨基座 = **深渊蓝黑**（深海底 → 深空的连续渐变），在星尘之外叠加**生物荧光粒子**（荧光青，鲸与磷光生物的家），暖橙太阳仍作能量语言。

| 语义 | 行星 | 色值建议（暗轨） | 用途 |
|---|---|---|---|
| 品牌/星海 | DeepSeek 蓝 | 沿用 `--dsw-static-deepseek-450` 系 | 主色、选中、渐变 |
| 思考/运行 | 巨人之海 Giant's Deep（深海荧光） | 荧光青 `#3EC9C7` 系 | sonar 脉冲、运行指示、链接悬停 |
| 发送/成功 | 木炉镇 Timber Hearth | 森林绿 `#43B581` 系 | 成功态、发送 |
| 警告 | 余烬双子 Ember Twin | 琥珀橙 `#E8A33D` 系 | 警告、上下文计量临近上限 |
| 错误/危险 | 黑棘星 Dark Bramble | 暗红 `#E5484D` 系 | 错误、停止、危险确认 |
| 能量/太阳 | 太阳 | 沿用 `--dsw-specific-solar` 暖橙 | 运行灯、hero 太阳、待机余烬 |
| 静默/冷色 | 冰彗星 Interloper | 冰蓝 `#8AB4F8` 系 | 次要信息、disabled、旁注 |
| 明暗双态 | 量子月 | 暗=深渊夜航；亮=破晓大气层 | 明暗主题各自完整 |

- 亮色轨与暗色轨**同构降强度**：荧光青/冰蓝在亮轨压淡，正文对比度始终 ≥ 4.5:1（大字 ≥ 3:1）。
- 状态色**不单靠颜色**：错误/警告等必须伴随图标或文字（现有 StateDot/icon 惯例保持）。

### 4.2 字体与文字

- 保留现有字体栈（`--dsw-font-family` / code 栈）与等宽遥测数字（tabular meter 已存在，用于 turn/step、token 计量）。
- 新增**环文（Nomai Ring）装饰体系**：用纯 CSS/SVG 生成的环形刻度纹样（圆环 + 刻度 + 断笔），**刻意不造真实文字**——只做装饰性"古代铭文"质感，避免与游戏字库/字形撞车。用在：时间戳前缀、加载态、分隔线、badge 边饰、radio/checkbox 选中环。
- hero 口号沿用双语文案位：中文「探索未至之境」可演化为「循着信号，潜入未知」，英文 "Into the Unknown" 可演化为 "Follow the Signal"（实现时走 `locales.ts`，不写死）。

### 4.3 图形与图标

- **星鲸徽记**：在现有 FishLogo 的精确 SVG 路径基础上，加一层极简"星轨/光环"（圆环 + 三点星），保留轮廓可识别性；hero 用放大版（约 56–72px），侧栏 rail 用 24px。
- **行星状态图标集**：小尺寸圆点 + 环（可与 StateDot 融合），不新增 16px 以上复杂图标。
- **信号频谱**：输入卡聚焦时的底部 1px 频谱环/刻度线（纯 CSS），表达"正在调谐"。
- **音景图标**：播放/暂停/音量沿用现有图标体系（icon 组件），不做新美术。

### 4.4 动效（全部 `prefers-reduced-motion` 门控，只 transform/opacity）

| 动效 | 时长/节奏 | 说明 |
|---|---|---|
| 星鲸巡游 | 12–16s 缓动循环 | 在现有 9s drift 上升级：缓慢巡游 + 尾部光点尾迹（SVG dash 动画，仅 opacity/stroke-dashoffset） |
| 思考 sonar 脉冲 | 2.4s 循环 | 从星鲸/头像外扩 1–2 圈淡环（scale + fade） |
| 太阳循环弧线 | 与运行态同步 | 一段弧线被暖橙逐格点亮后淡出重来，隐喻 22 分钟循环 |
| 篝火余烬 | 4–6s 循环 | 3–5 粒光点上浮 + 淡出（纯 CSS，数量极少） |
| 量子月坍缩 | 180–240ms | 明暗切换时背景层一次快速 color/opacity 过渡（不改布局） |
| 传送式转场 | 120–160ms | 面板/会话切换：scale(0.985→1) + fade |
| 环文加载 | 1.2s 循环 | 环形刻度旋转/呼吸（不影响任何数据可读性） |

- 全局兜底已在 `apps/web/src/base.css` 存在；每个组件级动效仍按惯例单独加 `@media (prefers-reduced-motion: reduce)` 或复用全局兜底。
- 音频动效是听觉维度，与视觉 reduced-motion 正交：提供独立"音景开关"，默认关闭（尊重 WCAG 1.4.2 / 2.3.3，不未经同意自动播放有声内容）。

## 5. Token 与架构方案

### 5.1 主题扩展（ui-theme）

1. `packages/client/ui-theme/src/theme-settings.ts`：`VISUAL_STYLES = ['classic', 'modern', 'whale-song'] as const`；**`DEFAULT_VISUAL_STYLE` 改为 `'classic'`**（v2 用户决定）。schema 的 `z.union` 自动纳入新值，Host 侧注册无需额外改动。
2. `packages/client/ui-theme/src/client/locales.ts`：新增 `'appearance.style.whale-song': '鲸歌'`（en: `'Whale Song'`），并同步补齐 en 字典（key-set 完整性有测试约束）。
3. `packages/client/ui-theme/src/client/AppearanceRow.tsx`：`STYLES` 数组追加 `{ id: 'whale-song', labelKey: 'appearance.style.whale-song' }`。
4. `packages/client/ui-theme/src/styles/design-platform.css`：新增 `body[data-ds-visual-style="whale-song"]` 与 `body[data-ds-visual-style="whale-song"][data-ds-dark-theme]` 两块，**只重定义 token 值**；复用 alias 语义层（`--dsw-alias-*` 全部继续消费），新增静态色板：

   ```css
   --dsw-static-leviathan-abyss-900/950: 深渊蓝黑基座（暗轨）
   --dsw-static-leviathan-glow-cyan: 荧光青
   --dsw-static-leviathan-ember: 余烬暖橙（复用 solar 语义）
   --dsw-static-leviathan-ice: 冰蓝
   --dsw-static-leviathan-bramble: 黑棘暗红
   --dsw-static-leviathan-forest: 森林绿
   ```
5. `packages/client/ui-theme/src/styles/scales.css`：如需，给鲸歌轨道补 1–2 条专属动效曲线/时长 token（默认复用现有，控制新增面）。
6. `packages/client/ui-theme/src/styles/scrollbar.css`：不改结构；hover 色由 alias token 驱动（荧光青）。

### 5.2 背景层（apps/web/src/base.css）

`body` 背景由现有 `var(--dsw-nebula-glow), var(--dsw-stardust)` 扩展为鲸歌轨专用组合（classic 轨仍解析为 none）：

```css
body[data-ds-visual-style="whale-song"] {
  /* 深渊渐变（深海底 → 深空）+ 生物荧光粒子 + 星尘 + 远端"宇宙之眼"极淡辉光 */
  background-image:
    var(--dsw-leviathan-abyss),
    var(--dsw-leviathan-biolum),
    var(--dsw-stardust),
    var(--dsw-leviathan-eye-glow);
  background-attachment: fixed;
}
```

- 粒子全部为多层 `radial-gradient`/少量 data-URI SVG，**无 canvas、无大图**；背景层不做位移动画（或仅极慢 opacity 呼吸，reduced-motion 下静止）。

### 5.3 组件层纪律

- 与既有红线一致：feature 组件只消费 `--dsw-alias-*`/`--dsw-*` token，grep 不允许字面色值（除既有豁免）；样式切换零 JS 重算、零重渲染。
- 新增原语放 `ui-primitives`（NomaiRing、行星状态图标、星鲸徽记变体），经现有 slot 注册；不重写业务组件行为。

### 5.4 背景音乐（鲸歌音景，v2 新增）

**目标**：侧栏底部提供一个"鲸歌音景"控制器，播放本机 mp3（星际拓荒《Travelers' Encore》），营造篝火旅人合奏的沉浸氛围；默认关闭、可发现、可持久化、可访问。

**资源与部署**：
- 源文件：`D:\Deepseek_harness\Andrew Prahlow - Travelers' encore_EM (online-audio-converter.com).mp3`（8.82 MB）。
- 复制为 `apps/web/public/audio/travelers-encore.mp3`（清理文件名），Vite 会把 `public/` 原样拷入 `dist/`，开发与生产（`apps/cli` 的 `dsh web` 服务 dist）统一以 `/audio/travelers-encore.mp3` 访问；`<audio preload="metadata" loop>` 按需加载，不阻塞首屏。
- 体积 8.82 MB 对本地回环应用可接受；后续可选优化（压缩转码）不阻塞 v1。

**交互与策略**：
1. **默认关闭**：首次进入不自动播放（浏览器自动播放策略 + WCAG 1.4.2/2.3.3）。侧栏底部显示"鲸歌音景"按钮（音符图标 + 状态灯）。
2. **首次启用**：点击后开始播放并淡入（约 1.5s）；再次点击暂停并淡出。播放/暂停与音量持久化到 Host settings（新命名空间 `ui-ambience`：`enabled`、`volume`，默认 volume 0.4）。
3. **跨会话保持**：enabled/volume 经 Host settings API 写入 `$DSH_HOME/settings.yaml`，重连/刷新后恢复；若浏览器拦截自动恢复播放（无用户手势），则保持"已启用但待手势"状态，按钮高亮提示"点击续播"。
4. **音量**：0–100% 滑杆或按档位；切换时 150ms 淡变，避免爆音。
5. **可访问性**：按钮带 `aria-pressed`/`aria-label`；提供暂停机制；音频不承载任何任务信息（纯氛围）；播放不影响朗读/焦点。
6. **实现形态**：新增轻量插件包 `packages/client/ui-ambience`（或先并入 `ui-theme` 的 settings namespace 以缩范围——实施时二选一，倾向独立小包，遵循 "everything is a plugin" 原则）。

## 6. 组件落地清单

| 文件 | 改动 |
|---|---|
| `packages/client/ui-theme/src/theme-settings.ts` | VISUAL_STYLES 追加 `whale-song`；DEFAULT_VISUAL_STYLE → `'classic'` |
| `packages/client/ui-theme/src/client/locales.ts` | zh/en 文案（鲸歌 / Whale Song） |
| `packages/client/ui-theme/src/client/AppearanceRow.tsx` | STYLES 数组 |
| `packages/client/ui-theme/src/styles/design-platform.css` | 鲸歌双轨 token 块 + 静态色板 |
| `apps/web/src/base.css` | 鲸歌背景层（深渊+荧光粒子+星尘+眼辉光） |
| `packages/client/ui-primitives/src/` | NomaiRing、行星状态图标、星鲸徽记、频谱环 |
| `packages/client/ui-conversation/src/client/skeleton/EmptyHero.tsx` | hero 星鲸场景 + 信号目标 + 篝火 + 口号 |
| `packages/client/ui-conversation/src/client/skeleton/HeroShell.module.css` | 巡游动效、尾迹、篝火余烬、眼辉光 |
| `packages/client/ui-conversation/src/client/chat/MessageItem.tsx` 等 | 经 token 自动继承行星状态色（组件尽量零改动） |
| `packages/client/ui-conversation/src/client/queue/QueueDock` | 太阳循环弧线运行指示 |
| `packages/client/ui-sidebar/src/client/*` | 品牌区星鲸、会话行星标记、rail 量子月暗面、底部音景控制器入口 |
| `packages/client/ui-theme/src/styles/scrollbar.css` | hover 荧光青（token 驱动） |
| `packages/client/ui-ambience/`（新增） | 背景音乐控制器：enabled/volume 持久化、audio 元素管理、淡入淡出 |
| `apps/web/public/audio/travelers-encore.mp3` | 资源落位（复制自根目录 mp3） |

## 7. 实施阶段与验收

| 阶段 | 内容 | 验收 |
|---|---|---|
| **P0 定稿准备** | 复制 mp3 到 `apps/web/public/audio/`；确认 dist 可访问 | `/audio/travelers-encore.mp3` 在 dev 与产线均返回 200 |
| **P1 轨道与底色** | 新 id + DEFAULT→classic + token 块 + 背景层 + AppearanceRow 开关 | 三轨（经典/深空/鲸歌）× 明暗均可见；默认新用户落经典；切换零重渲染 |
| **P2 鲸鱼本体** | hero 星鲸场景、信号目标、篝火、口号双语 | 空会话截图达标；reduced-motion 下静态可读 |
| **P3 星际元素** | Nomai 环文、行星状态色、sonar 脉冲、太阳循环弧线 | 运行/思考/错误/警告四态在鲸歌轨截图达标 |
| **P4 音景控制器** | ui-ambience：播放/暂停/音量/持久化/自动播放策略/可访问性 | 默认关闭；开启后跨会话保持；无手势拦截时提示续播；`test:gui` 覆盖 |
| **P5 转场与可访问性** | 量子月坍缩、传送转场、对比度复校、键盘焦点环 | 正文对比度 ≥4.5:1、大字 ≥3:1；无单色传达 |
| **P6 全量回归** | `test:gui` 全绿；`test:web`（replay）无回归；对比截图；性能热路径无新增 layout thrash | 全部门禁通过，UI_REDESIGN 纪律保持 |

每阶段独立提交（沿用 `ui-redesign` 分支纪律），全部门禁（typecheck/lint/test:gui）阶段内保持全绿。

## 8. 风险与不变式

- **版权**：只借鉴星际拓荒的"氛围语言与意象"（星云、环文质感、篝火、行星色彩语义），**不复制其任何美术资产、字体、标志、文案**；Nomai 环文为原创装饰纹样，非真实文字。mp3 为**用户自备的本地个人文件**，仅在本机回环应用内播放，不做任何分发/再发布。
- **品牌**：鲸鱼是 DeepSeek 本体形象，主色仍以品牌蓝为锚，荧光青/暖橙为点缀，装饰不喧宾夺主。
- **可回退**：`whale-song` 是独立轨道，任何时刻一键回到 `classic`/`modern`；默认值=经典，冲击最小。
- **性能**：无 canvas、无大图、无滚动区 backdrop-filter；动效仅 transform/opacity；粒子数量可控（< 10 层 gradient）；音频 `preload="metadata"` 不阻塞首屏。
- **可访问性**：所有动效 reduced-motion 门控；状态不单靠颜色；装饰纹样 aria-hidden 且不承载信息；音频默认关闭、有暂停机制、不承载任务信息（WCAG 1.4.2 / 2.3.3）。
- **架构纪律**：token 唯一权威、CSS Modules、零组件行为改动、grep 无色值。

## 9. 已定稿决策与遗留小项

**已定稿**
1. 主题名：**鲸歌 / Whale Song**，风格 id `whale-song`。
2. 默认视觉风格：**经典（classic）**；深空/鲸歌为可选开启。
3. 背景音乐：**纳入 v1**，使用根目录 mp3（Travelers' Encore），实现为"鲸歌音景"控制器，默认关闭。

**遗留小项（实施时定，不阻塞）**
- `ui-ambience` 独立包 vs 并入 `ui-theme` settings namespace（倾向独立小包）。
- mp3 是否做体积优化（转码/裁剪静音头尾），当前 8.82 MB 可用。
- 鲸歌 hero 口号最终文案（zh/en 各一句，走 locales）。