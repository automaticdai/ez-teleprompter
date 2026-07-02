// The detached "operator console": a small frameless window that holds the
// toolbar, so the controls never clip or sit on top of the reading text. It is
// docked just below the prompter window and follows it (see dockControls in
// index.js). It loads the same renderer bundle with a #controls hash.
import { BrowserWindow } from 'electron'
import { join } from 'path'

const isDev = !!process.env.ELECTRON_RENDERER_URL

export function createControlsWindow() {
  const win = new BrowserWindow({
    // Starting size is a guess; the renderer measures the bar and asks us to
    // resize to fit exactly (so every button is always visible).
    width: 760,
    height: 76,
    frame: false,
    transparent: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    show: false,
    alwaysOnTop: true,
    // Tool-palette behavior: clicking a button must NOT move OS focus here,
    // or the prompter would stop receiving keyboard shortcuts after every
    // toolbar click.
    focusable: false,
    title: 'EZ 提词器 · 控制台',
    icon: join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.setAlwaysOnTop(true, 'screen-saver')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  if (isDev) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}#controls`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'controls' })
  }

  return win
}
