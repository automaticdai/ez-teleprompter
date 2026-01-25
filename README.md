# 字幕飘窗 (HTML Version)

A vertical scrolling subtitle/teleprompter application that runs directly in your browser.

## Features

- 📜 **Vertical Scrolling** — Text scrolls from bottom to top
- ⚡ **Adjustable Speed** — Control scroll speed from very slow to fast
- 🎨 **Theme Options** — White or black background
- 📏 **Customizable** — Font size, line height, background opacity
- 🖱️ **Drag & Drop** — Reposition the subtitle window anywhere
- ↔️ **Resizable** — Drag the corner to resize
- 🔄 **Mouse Wheel** — Scroll through text manually
- 📝 **Skip Empty Lines** — Compact display with adjustable paragraph spacing
- ▶️ **Playback Controls** — Play, pause, reset

## Usage

1. **Open** — Double-click `subtitle-marquee.html` to open in your browser
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
| 背景颜色 | White or black background |

## Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for loading React libraries)

## Limitations

- The "Always on Top" (置顶) feature only affects z-index within the page, not actual window-level always-on-top (use the Electron version for true desktop-level always-on-top)
- Requires internet to load React from CDN

## Offline Use

To use offline, download these files and update the `<script>` tags in the HTML:
- https://unpkg.com/react@18/umd/react.production.min.js
- https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
- https://unpkg.com/@babel/standalone/babel.min.js

## License

MIT
