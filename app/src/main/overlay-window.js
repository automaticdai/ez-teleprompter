// Creates the single frameless, transparent, always-on-top overlay window —
// the heart of the "floating glass" desktop experience.
import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'

const isDev = !!process.env.ELECTRON_RENDERER_URL

export function createOverlayWindow(settings) {
  const saved = settings.bounds || {}

  const win = new BrowserWindow({
    width: saved.width || 720,
    height: saved.height || 420,
    x: Number.isFinite(saved.x) ? saved.x : undefined,
    y: Number.isFinite(saved.y) ? saved.y : undefined,
    minWidth: 320,
    minHeight: 180,
    frame: false,
    transparent: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    resizable: true,
    maximizable: false,
    fullscreenable: true,
    skipTaskbar: false,
    alwaysOnTop: settings.alwaysOnTop !== false,
    // 'screen-saver' floats above most other always-on-top windows.
    title: 'EZ 提词器',
    // Runtime icon for the taskbar/window. The .exe file icon is set at
    // package time; this keeps the app looking right even when packaged
    // without an embedded icon (e.g. wine-free Linux builds).
    icon: join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (settings.alwaysOnTop !== false) {
    win.setAlwaysOnTop(true, 'screen-saver')
  }
  // Keep the overlay visible as you switch virtual desktops / full-screen apps.
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // Best-effort Windows 11 acrylic for real desktop blur behind the glass.
  // Harmless no-op / throw-guarded elsewhere.
  try {
    win.setBackgroundMaterial?.('acrylic')
  } catch {
    /* not supported on this OS build — CSS frosted panel is the fallback */
  }

  if (Number.isFinite(settings.windowOpacity)) {
    win.setOpacity(Math.max(0.1, Math.min(1, settings.windowOpacity / 100)))
  }

  // Move onto the previously-used monitor if it still exists.
  if (settings.displayId != null) {
    const display = screen.getAllDisplays().find((d) => d.id === settings.displayId)
    if (display && !Number.isFinite(saved.x)) {
      const { x, y, width, height } = display.workArea
      win.setBounds({
        x: Math.round(x + (width - win.getBounds().width) / 2),
        y: Math.round(y + (height - win.getBounds().height) / 2),
        width: win.getBounds().width,
        height: win.getBounds().height
      })
    }
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}
