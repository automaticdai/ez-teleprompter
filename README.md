# 字幕飘窗 (HTML Version)

A vertical scrolling subtitle/teleprompter application that runs directly in your browser.

## Features

- 📜 **Vertical Scrolling** — Text scrolls from bottom to top
- ⚡ **Adjustable Speed** — Control scroll speed from very slow to fast
- 🎨 **Theme Options** — Multiple preset color themes
- 🌗 **Dark/Light Mode** — Switch app UI between dark and light appearance
- 📏 **Customizable** — Font size, line height, background opacity
- 🖱️ **Drag & Drop** — Reposition the subtitle window anywhere
- ↔️ **Resizable** — Drag the corner to resize
- 📱 **Touch Support** — Drag and resize on touch devices
- 🔄 **Mouse Wheel** — Scroll through text manually
- ⌨️ **Keyboard Shortcuts** — Control playback and settings quickly
- 📝 **Skip Empty Lines** — Compact display with adjustable paragraph spacing
- ▶️ **Playback Controls** — Play, pause, reset
- 💾 **Auto Save** — Remembers text and settings via localStorage

## Usage

1. **Open** — Double-click `ez-teleprompter.html` to open in your browser
2. **Enter Text** — Paste or type your script in the settings panel
3. **Adjust Settings** — Configure speed, font size, colors as needed
4. **Position** — Drag the subtitle box to your preferred location
5. **Start** — Text will auto-scroll; use pause/play as needed

## Controls

| Action | How |
|--------|-----|
| Move subtitle | Drag the subtitle box |
| Resize | Drag bottom-right corner |
| Browse text | Mouse wheel on subtitle |
| Open/close settings | Click ⚙ button |
| Pause/Play | Click ⏸/▶ button |
| Reset to start | Click ↺ button |

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Pause/Play | `Space` |
| Reset | `R` |
| Speed up/down | `↑` / `↓` |
| Font size up/down | `→` / `←` |
| Toggle settings panel | `S` |
| Toggle dark/light mode | `D` |

## Settings

| Setting | Description |
|---------|-------------|
| 字幕文本 | Enter your subtitle text (supports long text) |
| 滚动速度 | Scroll speed (1% = very slow, 100% = fast) |
| 字体大小 | Font size (16px - 72px) |
| 行高 | Line height (1.2 - 3.0) |
| 背景透明度 | Background opacity (0% - 100%) |
| 跳过空行 | Skip empty lines in display |
| 段落间距 | Paragraph gap when skipping empty lines |
| 颜色方案 | Select from preset text/background color themes |
| 明暗模式 | Toggle app interface between dark and light mode |

## Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for loading React libraries)

## Limitations

- Requires internet to load React from CDN

## Offline Use

To use offline, download these files and update the `<script>` tags in the HTML:
- https://unpkg.com/react@18/umd/react.production.min.js
- https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
- https://unpkg.com/@babel/standalone/babel.min.js

## License

MIT
