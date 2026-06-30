# EZ Teleprompter — Desktop App Redesign (Design Spec)

Date: 2026-06-28
Status: Approved ("just do it")

## Goal

Turn the existing single-file browser teleprompter (`ez-teleprompter.html`) into a
real **Windows desktop app** with capabilities a browser tab cannot offer:

- **True transparent glass overlay** that floats over other apps ("pin on top").
- **Real OS fullscreen** / fit-to-monitor, multi-monitor aware.
- **Click-through** ("locked") mode so you can present/record and still use the apps behind it.
- **Hardware remote control**: a Bluetooth remote that pairs as an HID **keyboard**,
  plus a **game controller** (Gamepad API) — neither needs Web Bluetooth.
- A **completely new, minimal floating-glass UI** with an auto-hiding control HUD.

## Decisions

| Topic | Decision |
|-------|----------|
| Framework | **Electron** (reuses the React engine, full Web/Gamepad APIs, transparent + always-on-top + click-through on Windows). |
| Build tool | **electron-vite** (main/preload/renderer), packaged with **electron-builder** → NSIS installer + portable exe. |
| Language | Plain modern **JavaScript + JSX** (matches existing repo). |
| Platform | **Windows only** (acrylic/window behaviors tuned for Win32; code stays portable). |
| Window model | **A — single glass overlay + auto-hiding HUD** with a click-through toggle. |
| Controller | **BT remote-as-keyboard** + **gamepad**. No Web Bluetooth / no custom BLE. |
| Persistence | Tiny dependency-free **JSON store** in Electron `userData`. |

## Repo layout

```
ez-teleprompter/
  ez-teleprompter.html          # existing WEB version stays (runs in a browser)
  README.md
  app/                          # NEW Electron desktop app
    package.json
    electron.vite.config.js
    electron-builder.yml
    src/
      main/
        index.js                # app lifecycle + creates overlay window
        overlay-window.js       # frameless/transparent/always-on-top/acrylic window
        click-through.js        # setIgnoreMouseEvents toggling (+ hover passthrough)
        shortcuts.js            # optional GLOBAL remote shortcuts -> commands
        tray.js                 # system-tray menu
        store.js                # JSON persistence in userData
        commands.js             # shared command id list
      preload/
        index.js                # contextBridge: window.api (invoke + onCommand)
      renderer/
        index.html
        src/
          main.jsx
          App.jsx
          engine/
            scroll-engine.js    # rAF time-delta scroll (ported), framework-agnostic
            srt.js              # SRT/txt parsing (ported)
          input/
            keymap.js           # default command<-key map + command list
            gamepad.js          # gamepad polling -> command callback
          store/
            use-settings.js     # load + debounced save via window.api
          components/
            ReadingArea.jsx     # scrolling text, mirror, reading guide, edge fades
            Hud.jsx             # auto-hiding glass control bar
            SettingsDrawer.jsx  # editor, sliders, presets, import, window controls
          styles.css
  test/
    scroll-engine.test.js
    srt.test.js
    keymap.test.js
```

## Architecture

### Process split
- **Main process** owns the OS-level powers: window creation, transparency, always-on-top,
  click-through, fullscreen/fit-to-display, multi-monitor, global remote shortcuts, tray,
  and persistence. It never touches React.
- **Preload** exposes a minimal, safe `window.api` over `contextBridge`:
  - invoke-style methods: `setClickThrough(bool)`, `setMousePassthrough(bool)`,
    `setOpacity(n)`, `toggleFullscreen()`, `fitToDisplay()`, `getDisplays()`,
    `moveToDisplay(id)`, `setAlwaysOnTop(bool)`, `setRemoteMode(bool)`,
    `loadSettings()`, `saveSettings(obj)`, `importFile()`, `quit()`.
  - event subscription: `onCommand(cb)` — main forwards global-remote commands here.
- **Renderer** is the React glass UI + the scroll engine + the local input layer.

### Command layer (the unifier)
All inputs funnel into one `dispatch(commandId)`:
- on-screen HUD buttons,
- local keyboard (when the overlay is focused),
- gamepad polling loop (renderer),
- global remote shortcuts (main → IPC `onCommand`).

Commands: `playPause, reset, speedUp, speedDown, fontUp, fontDown, toggleMirror,
toggleGuide, toggleClickThrough, toggleFullscreen, toggleHud, toggleSettings,
nudgeUp, nudgeDown, quit`.

### Scroll engine (ported)
Reuse the proven logic from `ez-teleprompter.html`:
- rAF time-delta integration: `pos += pxPerSec * dt`, speed 1–100 → 5–240 px/s.
- Cached text height (no per-frame `scrollHeight` reflow).
- Smooth loop wrap (carry overflow across the wrap).
- Mirror via `scaleX/scaleY`; skip-empty-lines + paragraph gap; wheel scrub.
Refactored into a small framework-agnostic module with `play/pause/reset/setSpeed/
nudge/measure/setViewport/attach(el)` so it is unit-testable.

### Window behavior (Win32)
- `BrowserWindow`: `frame:false`, `transparent:true`, `hasShadow:false`,
  `backgroundColor:'#00000000'`, `alwaysOnTop:true` at `'screen-saver'` level,
  `backgroundMaterial:'acrylic'` for real desktop blur (CSS tint fallback).
- **Click-through**: `setIgnoreMouseEvents(true,{forward:true})` toggled by command.
  In locked mode the renderer still gets `mousemove`; hovering an interactive control
  momentarily calls `setMousePassthrough(false)` so the HUD/buttons remain usable
  (standard Electron partial-passthrough pattern), restored on mouse-leave.
- **Fullscreen / fit-to-display**: `setFullScreen` toggle + a "fit to current monitor
  work-area" sizing; **multi-monitor** picker via `screen.getAllDisplays()`.
- **Opacity** slider via `win.setOpacity(n)`.
- Window bounds + monitor persisted and restored on launch.

### Input specifics
- **Keyboard (local)**: works whenever the overlay is focused. Default map mirrors the
  current app (Space/R/arrows/M/G/F/S) plus `L` = lock/click-through, `H` = hide HUD.
- **BT remote (global)**: a remote pairs as an HID keyboard, so to react while another
  app is focused we register **global shortcuts** in main. Because global registration
  hijacks those keys system-wide, it is gated behind an opt-in **Remote Mode** toggle
  (default off). Default global keys chosen to minimize conflicts (PageUp/PageDown +
  F6/F7); remappable.
- **Gamepad**: renderer polls `navigator.getGamepads()` on a loop, dispatching commands
  on button edges (A=play/pause, B=reset, bumpers/d-pad=speed & font, right-stick Y=nudge).

### Persistence
Dependency-free JSON file in `app.getPath('userData')/settings.json`. Stores script
text, speed, font, line height, colors, opacity, mirror flags, guide, skip-empty/gap,
window bounds + monitor, remote-mode, keymap. Debounced writes (400 ms) + flush on quit.

## New UI (minimal floating glass)
- Frameless translucent panel, rounded corners, hairline border, acrylic/blur backdrop,
  top+bottom edge gradient fades so text dissolves at the edges.
- **HUD**: a slim glass control bar that fades in on mouse-move/keypress and fades away
  while playing; shows play/pause, speed, font, mirror, lock indicator, settings gear.
- **Settings drawer**: slides over for script editing, sliders, color presets, file
  import, opacity, monitor select, remote-mode toggle.
- **Locked vs unlocked** visual states: locked = click-through + minimal + glowing lock;
  unlocked = drag handle + interactive controls.

## Testing
- **Unit (Vitest, headless)**: scroll-engine math (speed mapping, wrap, clamp), SRT/txt
  parser, keymap resolution, command reducer.
- **Build check**: `npm install` + `electron-vite build` to verify main/preload/renderer
  compile and bundle.
- **Manual (real Windows desktop, can't be automated here)**: transparency + acrylic,
  always-on-top over other apps, click-through + hover passthrough, fullscreen/fit/monitor
  move, BT-remote Remote Mode, gamepad. A manual checklist ships in the README.

## Out of scope (v1)
Auto-update, code signing, macOS/Linux packaging, custom BLE/GATT devices, phone remote,
in-app keymap editor UI (keymap is configurable in the store; editor UI is later).
