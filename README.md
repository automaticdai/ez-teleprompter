# EZ字幕提词器 / EZ Teleprompter

一个垂直滚动提词器工具，提供两种形态：

1. **桌面应用（Windows）** — 透明、可置顶、可穿透点击的悬浮提词器，支持蓝牙遥控器/手柄滚动。📁 [`app/`](app/)
2. **HTML 网页版** — 单文件、双击即用的浏览器提词器。📄 [`ez-teleprompter.html`](ez-teleprompter.html)

---

## 🖥️ 桌面应用（Windows Desktop App）

基于 **Electron** 的悬浮提词器，把台词钉在所有窗口之上，并可在录制/直播时让鼠标点击**穿透**到下层应用。

### ▶️ 运行方式（无需每次跑 npm）

选一种即可，都是「构建一次，之后双击 `.exe` 启动」：

**方式 A — 直接用打包好的可执行程序（最省事）**

仓库构建后会在 `app/dist/` 生成一个绿色版文件夹与压缩包：

- 文件夹：`app/dist/EZ Teleprompter-win32-x64/` → 双击里面的 **`EZ Teleprompter.exe`** 即可运行
- 压缩包：`app/dist/EZ-Teleprompter-win-x64.zip` → 解压后同样双击 `EZ Teleprompter.exe`

把文件夹（或解压后的内容）复制到 Windows 任意位置，右键 `EZ Teleprompter.exe` → 「发送到 → 桌面快捷方式」，以后双击快捷方式即可，**不再需要 npm**。

> 在 WSL 中可运行 `explorer.exe app/dist` 直接在 Windows 资源管理器里打开该目录，再把文件复制到 Windows 磁盘。

**方式 B — 生成单文件便携版 / 安装包（推荐分发）**

想要**单个 `.exe`**（自解压便携版）或标准安装包时，在 **Windows** 上双击 [`app/build-windows.bat`](app/build-windows.bat) 一键构建（需先安装 [Node.js 18+](https://nodejs.org)）。完成后 `app/dist/` 会生成：

- `EZ Teleprompter-1.0.0-portable.exe` — 单文件便携版，免安装、双击即用
- `EZ Teleprompter-1.0.0-x64.exe` — NSIS 安装包

之后日常使用都只是双击那个 `.exe`，无需再碰命令行。

### 核心特性

- 🪟 **真透明悬浮窗** — 无边框、毛玻璃质感的悬浮卡片，背景真正透明，可叠在任意应用之上
- 📌 **始终置顶** — 以 `screen-saver` 层级置顶，全屏其它程序时依然可见
- 👻 **穿透点击（锁定模式）** — 一键锁定后鼠标点击穿透到下层应用，悬停到控件上时自动恢复可操作
- 🖥️ **真·全屏** — 操作系统级全屏，并可一键贴合当前显示器
- 🎮 **蓝牙遥控器 / 手柄控制** — 多数蓝牙翻页器以 HID 键盘方式工作，开启「遥控模式」即可全局控制；同时支持游戏手柄（按键 + 右摇杆微调）
- 🌫️ **可调窗口/面板透明度** — 分别控制悬浮窗整体透明度与文字面板透明度
- 🖥️ **多显示器** — 可将悬浮窗移动到指定显示器
- 🪞 **镜像翻转** — 水平/垂直镜像，适配提词器反射玻璃
- 📏 **阅读基准线** + **边缘渐隐**
- 🎛️ **独立控制台** — 工具栏是一个停靠在提词窗下方的独立小窗口，自动跟随、按内容自适应大小，不遮挡台词，也不会抢走键盘焦点
- 📂 **导入文件** — 支持 `.txt` / `.md`（自动去除 Markdown 标记）/ `.srt`（自动去除序号与时间轴），自动识别 UTF-8 / GBK / UTF-16 编码
- ✏️ **就地编辑** — 按 `E` 直接在页面上修改台词，Esc 退出
- 🀄 **中文界面** — 全部按钮提示、设置项与帮助均为中文
- 💾 **自动保存** — 文本、设置与窗口位置保存到用户数据目录 `settings.json`（原子写入，崩溃不丢稿）
- 🧰 **系统托盘** — 关闭即最小化到托盘，可从托盘切换锁定/遥控模式

### 环境要求

- **Node.js 18+**（开发/打包）
- **Windows 10 / 11**（运行与打包目标）

### 开发运行

```bash
cd app
npm install
npm run dev          # 启动 electron-vite 开发模式（热更新）
```

### 打包可执行程序

| 命令 | 产物 | 需要 wine？ |
|------|------|:----------:|
| `npm run package:win` | `app/dist/EZ Teleprompter-win32-x64/`（绿色版文件夹 + `EZ Teleprompter.exe`） | 否 ✅ |
| `npm run dist` | NSIS 安装包 **+** 单文件便携版 exe | 是 / 在 Windows 上跑 |
| `npm run dist:portable` | 仅单文件便携版 exe | 是 / 在 Windows 上跑 |

- **`package:win`** 基于 `@electron/packager`，**可在 Linux/WSL 上直接打包**（无需 wine），产出一个可双击运行的文件夹版应用——本仓库默认用它。
- **`dist` / `dist:portable`** 基于 `electron-builder`，能生成更精致的**单文件**便携版与安装包，但需要在 **Windows**（或装有 wine 的环境）上执行。Windows 用户可直接双击 [`app/build-windows.bat`](app/build-windows.bat) 一键完成。

所有产物均位于 `app/dist/`。

### 测试

```bash
cd app
npm test             # Vitest 单元测试（滚动引擎 / SRT + Markdown 解析 / 键位映射 / 手柄 / 设置持久化）
```

### 持续集成（GitHub Actions）

推送到 `main` 会自动运行测试与构建；在 **Windows runner** 上用 electron-builder 产出带图标的单文件便携版与安装包（工件可在 Actions 页面下载）。给提交打 `v*` 标签会自动创建 GitHub Release 并附上 exe。配置见 [`.github/workflows/build.yml`](.github/workflows/build.yml)。

### 快捷键（应用窗口聚焦时）

| 操作 | 快捷键 |
|------|--------|
| 播放 / 暂停 | `Space` |
| 重置到开头 | `R` |
| 加快 / 减慢速度 | `↑` / `↓`（或 `PageUp` / `PageDown`） |
| 增大 / 减小字号 | `→` / `←` |
| 打开文件（.txt / .md / .srt） | `O` |
| 就地编辑文本（Esc 退出） | `E` |
| 切换设置抽屉 | `S` |
| 帮助与快捷键 | `?` |
| 显示 / 隐藏控制台 | `H` |
| 切换全屏 | `F` |
| 切换锁定（穿透点击） | `L` |
| 水平镜像 | `M` |
| 阅读基准线 | `G` |

> 在编辑台词文本框时，以上快捷键自动失效，避免误触。

### 遥控模式（全局快捷键）

开启设置中的「遥控模式」后，以下按键**即使应用未聚焦**也会生效——非常适合演讲时用蓝牙翻页器控制。默认关闭，避免在系统范围内劫持按键。

| 操作 | 全局按键 |
|------|----------|
| 播放 / 暂停 | `PageDown` / `F8` |
| 重置 | `PageUp` |
| 加快 / 减慢速度 | `F7` / `F6` |

### 手柄控制（Gamepad）

连接游戏手柄即可使用（标准布局）：

| 操作 | 按键 |
|------|------|
| 播放 / 暂停 | `A` |
| 重置 | `B` |
| 加快 / 减慢速度 | `RB` / `LB`，或方向键 `↑` / `↓` |
| 增大 / 减小字号 | 方向键 `→` / `←` |
| 切换设置 | `Start` |
| 显示/隐藏控制台 | `Select` |
| 微调滚动位置 | 右摇杆上下 |

### 架构概览

```
app/
├── electron.vite.config.js     # main / preload / renderer 三段构建
├── electron-builder.yml        # Windows NSIS + 便携版打包配置
├── src/
│   ├── main/                   # 主进程：提词窗 + 停靠控制台窗、穿透、全局快捷键、托盘、持久化
│   ├── preload/                # contextBridge 暴露最小化 window.api
│   └── renderer/               # React 渲染层：滚动引擎、控制台、设置抽屉、帮助、输入
└── test/                       # Vitest 单元测试
```

- **进程分离**：主进程管理窗口/系统集成，渲染层用 React 绘制玻璃 UI，preload 通过 `contextBridge` 暴露受限 API。
- **双窗口**：提词窗只画滚动文本与浮层；工具栏在独立的控制台窗口中（`#controls` 哈希加载同一份渲染包），由主进程负责停靠跟随，且不可获得焦点、不抢键盘。
- **统一命令分发**：键盘、手柄、全局遥控、控制台按钮全部汇入同一个 `dispatch(command)`。
- **滚动引擎**：基于 `requestAnimationFrame` 的时间增量滚动，缓存文本高度避免逐帧重排，时钟可注入以便单元测试。

设计决策与取舍详见 [`docs/superpowers/specs/2026-06-28-teleprompter-desktop-app-design.md`](docs/superpowers/specs/2026-06-28-teleprompter-desktop-app-design.md)。

---

## 📄 HTML 网页版（轻量版）

一个可直接在浏览器中运行的垂直滚动提词器工具，单文件、零安装。

> 网页版与桌面版**独立实现**：桌面版是主力维护版本（新功能会先出现在桌面版），网页版适合临时使用或无法安装软件的场合。

### 功能特点

- 📜 垂直滚动：文本从下向上平滑滚动
- ⚡ 速度可调：支持 1%~100% 滚动速度
- 🎨 颜色方案：内置多套文字/背景配色
- 🌗 明暗模式：支持浅色模式与深色模式切换
- 📏 显示可调：字体大小、行高、背景透明度可调
- 🖱️ 拖拽定位：可自由拖动飘窗位置
- ↔️ 尺寸调整：可拖动右下角调整大小
- 📱 触控支持：支持触摸拖拽与拖动右下角缩放
- 🪞 镜像翻转：支持水平/垂直镜像（适配提词器反射玻璃）
- 🖥️ 全屏模式：一键进入/退出全屏
- 📐 阅读基准线：可显示一条阅读参考线
- 📂 文件导入：支持导入 `.txt` / `.srt` 字幕文件
- 🔄 滚轮浏览：可用鼠标滚轮手动浏览文本
- 📝 跳过空行：可压缩段落并设置段落间距
- ▶️ 播放控制：播放/暂停/重置
- 💾 自动保存：文本与设置会保存到 localStorage

### 使用方法

1. 双击打开 `ez-teleprompter.html`
2. 在设置面板输入或粘贴台词文本
3. 按需调整速度、字体、配色等参数
4. 拖动字幕窗口到合适位置
5. 点击播放开始滚动（或使用快捷键）

### 操作说明

| 操作 | 方式 |
|------|------|
| 移动飘窗 | 拖拽字幕窗口 |
| 调整大小 | 拖拽右下角 |
| 手动浏览 | 在字幕区滚动鼠标滚轮 |
| 打开/关闭设置 | 点击右下角 ⚙ 按钮 |
| 播放/暂停 | 点击 ⏸/▶ 按钮 |
| 重置到开头 | 点击 ↺ 按钮 |
| 切换明暗模式 | 设置面板中的“明暗模式”开关 |
| 水平/垂直镜像 | 设置面板中的“水平镜像 / 垂直镜像”开关 |
| 阅读基准线 | 设置面板中的“阅读基准线”开关 |
| 进入/退出全屏 | 点击“全屏”按钮 |
| 导入字幕文件 | 点击“导入文件”按钮，选择 `.txt` / `.srt` |

### 键盘快捷键

| 操作 | 快捷键 |
|------|--------|
| 播放/暂停 | `Space` |
| 重置 | `R` |
| 加快/减慢速度 | `↑` / `↓` |
| 增大/减小字号 | `→` / `←` |
| 开关设置面板 | `S` |
| 切换明暗模式 | `D` |
| 进入/退出全屏 | `F` |
| 水平镜像 | `M` |
| 阅读基准线 | `G` |

### 运行要求

- 现代浏览器（Chrome / Firefox / Edge / Safari）
- 需要联网加载 CDN 资源（React / ReactDOM / Babel，以及 Noto Sans SC 字体）

CDN 资源均已**锁定具体版本**并附带 [SRI](https://developer.mozilla.org/docs/Web/Security/Subresource_Integrity) `integrity` 校验，避免上游版本变动导致行为变化或被篡改。
> 注意：Babel 锁定在 **7.x**。Babel 8 的 `preset-react` 默认改用 automatic runtime，会生成 `import "react/jsx-runtime"`，在这种「全局 React、无打包器」的页面中无法运行。
字体使用 `display=swap`，离线时会自动回退到系统字体。

### 离线使用

若需离线运行，请下载以下文件，放到本地，并把 HTML 中对应的 `<script>` 地址改为本地路径。
改为本地路径后，请**移除对应 `<script>` 上的 `integrity` 与 `crossorigin` 属性**（本地文件无需、也无法做跨域 SRI 校验）：

- https://unpkg.com/react@18.3.1/umd/react.production.min.js
- https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js
- https://unpkg.com/@babel/standalone@7.29.7/babel.min.js

---

## 许可证

[MIT](LICENSE)
