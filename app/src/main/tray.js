// System-tray entry: quick toggles plus show/quit, so the overlay is reachable
// even when it is click-through and you can't click it directly.
import { Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'

function loadIcon() {
  // Packaged icon lives in build/; fall back to an empty image so the tray
  // still appears if the asset is missing during development.
  try {
    const img = nativeImage.createFromPath(join(__dirname, '../../build/icon.png'))
    if (!img.isEmpty()) return img.resize({ width: 16, height: 16 })
  } catch {
    /* ignore */
  }
  return nativeImage.createEmpty()
}

export function createTray({ win, clickThrough, shortcuts, onQuit }) {
  const tray = new Tray(loadIcon())
  tray.setToolTip('EZ Teleprompter')

  function rebuild() {
    const menu = Menu.buildFromTemplate([
      {
        label: '显示 / 聚焦',
        click: () => {
          win.show()
          win.focus()
        }
      },
      {
        label: '锁定（穿透点击）',
        type: 'checkbox',
        checked: clickThrough.isLocked(),
        click: () => {
          const locked = clickThrough.toggle()
          win.webContents.send('state:clickThrough', locked)
          rebuild()
        }
      },
      {
        label: '遥控模式（全局按键）',
        type: 'checkbox',
        checked: shortcuts.isEnabled(),
        click: () => {
          const enabled = shortcuts.setEnabled(!shortcuts.isEnabled())
          win.webContents.send('state:remoteMode', enabled)
          rebuild()
        }
      },
      { type: 'separator' },
      { label: '退出', click: onQuit }
    ])
    tray.setContextMenu(menu)
  }

  rebuild()
  tray.on('click', () => {
    win.show()
    win.focus()
  })

  return { tray, rebuild }
}
