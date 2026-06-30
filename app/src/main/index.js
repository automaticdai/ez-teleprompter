import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import { readFile } from 'fs/promises'
import { basename } from 'path'
import { createOverlayWindow } from './overlay-window.js'
import { createControlsWindow } from './controls-window.js'
import { createClickThroughController } from './click-through.js'
import { createShortcutManager } from './shortcuts.js'
import { createTray } from './tray.js'
import { loadSettings, saveSettings } from './store.js'

let win = null
let controls = null
let tray = null
let clickThrough = null
let shortcuts = null
let currentSettings = loadSettings()

// Keep the console docked just below the prompter (or above / pinned to the
// bottom of the screen when there's no room, e.g. in fullscreen).
function dockControls() {
  if (!win || win.isDestroyed() || !controls || controls.isDestroyed()) return
  if (!controls.isVisible()) return
  const o = win.getBounds()
  const c = controls.getBounds()
  const { workArea: wa } = screen.getDisplayMatching(o)
  const gap = 8
  let x = Math.round(o.x + (o.width - c.width) / 2)
  x = Math.max(wa.x, Math.min(x, wa.x + wa.width - c.width))
  let y = o.y + o.height + gap
  if (y + c.height > wa.y + wa.height) y = o.y - c.height - gap // no room below → above
  if (y < wa.y) y = wa.y + wa.height - c.height - gap // still none → pin to screen bottom
  controls.setBounds({ x, y, width: c.width, height: c.height })
}

// Capture live window geometry + monitor so it is restored next launch.
function captureWindowState() {
  if (!win || win.isDestroyed()) return
  if (win.isFullScreen()) return
  const bounds = win.getBounds()
  const display = screen.getDisplayMatching(bounds)
  currentSettings = { ...currentSettings, bounds, displayId: display.id }
}

function flushSettings() {
  captureWindowState()
  saveSettings(currentSettings)
}

function dispatchToRenderer(command) {
  if (win && !win.isDestroyed()) win.webContents.send('command', command)
}

function registerIpc() {
  ipcMain.handle('settings:load', () => currentSettings)

  ipcMain.handle('settings:save', (_e, settings) => {
    currentSettings = { ...currentSettings, ...settings }
    captureWindowState()
    return saveSettings(currentSettings)
  })

  ipcMain.handle('window:setClickThrough', (_e, value) => clickThrough.setLocked(value))
  ipcMain.handle('window:toggleClickThrough', () => {
    const locked = clickThrough.toggle()
    win.webContents.send('state:clickThrough', locked)
    tray?.rebuild()
    return locked
  })
  // High-frequency hover events: use send (no round-trip) for passthrough.
  ipcMain.on('window:setPassthrough', (_e, passthrough) => clickThrough.setPassthrough(passthrough))

  ipcMain.handle('window:setOpacity', (_e, percent) => {
    const value = Math.max(0.1, Math.min(1, Number(percent) / 100))
    win.setOpacity(value)
    return true
  })

  ipcMain.handle('window:setAlwaysOnTop', (_e, value) => {
    win.setAlwaysOnTop(!!value, 'screen-saver')
    return win.isAlwaysOnTop()
  })

  ipcMain.handle('window:toggleFullscreen', () => {
    const next = !win.isFullScreen()
    win.setFullScreen(next)
    win.webContents.send('state:fullscreen', next)
    return next
  })

  ipcMain.handle('window:fitToDisplay', () => {
    const display = screen.getDisplayMatching(win.getBounds())
    win.setBounds(display.workArea)
    return win.getBounds()
  })

  ipcMain.handle('window:getDisplays', () => {
    const current = screen.getDisplayMatching(win.getBounds()).id
    return screen.getAllDisplays().map((d, i) => ({
      id: d.id,
      label: d.label || `Display ${i + 1}`,
      primary: d.id === screen.getPrimaryDisplay().id,
      current: d.id === current,
      bounds: d.bounds
    }))
  })

  ipcMain.handle('window:moveToDisplay', (_e, displayId) => {
    const display = screen.getAllDisplays().find((d) => d.id === displayId)
    if (!display) return false
    const b = win.getBounds()
    const { x, y, width, height } = display.workArea
    win.setBounds({
      x: Math.round(x + (width - b.width) / 2),
      y: Math.round(y + (height - b.height) / 2),
      width: b.width,
      height: b.height
    })
    return true
  })

  ipcMain.handle('remote:setEnabled', (_e, value) => {
    const enabled = shortcuts.setEnabled(value)
    tray?.rebuild()
    return enabled
  })

  ipcMain.handle('file:import', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: '导入文稿',
      filters: [
        { name: '文稿与文本', extensions: ['txt', 'md', 'markdown', 'script', 'text'] },
        { name: '字幕', extensions: ['srt'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    })
    if (canceled || !filePaths[0]) return null
    const content = await readFile(filePaths[0], 'utf-8')
    return { name: basename(filePaths[0]), content }
  })

  // ---- detached controls console ----
  ipcMain.on('controls:command', (_e, command) => dispatchToRenderer(command))

  ipcMain.on('hud:state', (_e, state) => {
    if (controls && !controls.isDestroyed()) controls.webContents.send('hud:state', state)
  })

  // Console asks the prompter to re-push its current state (on (re)load).
  ipcMain.on('hud:requestSync', () => {
    if (win && !win.isDestroyed()) win.webContents.send('hud:requestSync')
  })

  ipcMain.on('controls:resize', (_e, size) => {
    if (!controls || controls.isDestroyed() || !size) return
    const width = Math.max(120, Math.round(size.width))
    const height = Math.max(48, Math.round(size.height))
    controls.setSize(width, height)
    dockControls()
  })

  ipcMain.handle('controls:toggle', () => {
    if (!controls || controls.isDestroyed()) return false
    if (controls.isVisible()) {
      controls.hide()
      return false
    }
    controls.showInactive()
    dockControls()
    return true
  })

  ipcMain.handle('app:quit', () => {
    app.isQuiting = true
    app.quit()
  })
}

function createWindow() {
  win = createOverlayWindow(currentSettings)
  clickThrough = createClickThroughController(win)
  shortcuts = createShortcutManager(dispatchToRenderer)
  if (currentSettings.remoteMode) shortcuts.setEnabled(true)

  const trayApi = createTray({
    win,
    clickThrough,
    shortcuts,
    onQuit: () => {
      app.isQuiting = true
      app.quit()
    }
  })
  tray = trayApi

  // The detached controls console, docked under the prompter and following it.
  controls = createControlsWindow()
  controls.once('ready-to-show', () => {
    controls.showInactive()
    dockControls()
  })
  controls.webContents.on('did-finish-load', dockControls)
  controls.on('closed', () => {
    controls = null
  })

  // Persist geometry as the user moves/resizes (cheap; coalesced by the OS).
  win.on('moved', captureWindowState)
  win.on('resized', captureWindowState)

  // Keep the console glued to the prompter as it moves / resizes / goes full.
  win.on('move', dockControls)
  win.on('resize', dockControls)

  win.on('enter-full-screen', () => {
    win.webContents.send('state:fullscreen', true)
    dockControls()
  })
  win.on('leave-full-screen', () => {
    win.webContents.send('state:fullscreen', false)
    dockControls()
  })

  // Hide / restore the console alongside the prompter (tray show/hide).
  win.on('hide', () => controls && !controls.isDestroyed() && controls.hide())
  win.on('show', () => {
    if (controls && !controls.isDestroyed()) {
      controls.showInactive()
      dockControls()
    }
  })

  // Closing hides to tray; real exit goes through the quit flag.
  win.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault()
      win.hide()
    }
  })
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (win) {
      win.show()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    registerIpc()
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('before-quit', () => {
    app.isQuiting = true
    flushSettings()
    shortcuts?.dispose()
  })

  // Overlay app: keep running under the tray even with no visible window.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // window is hidden, not closed, so this rarely fires; quit if it does.
      app.quit()
    }
  })
}
