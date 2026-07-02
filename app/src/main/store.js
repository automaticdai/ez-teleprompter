// Tiny dependency-free JSON store living in Electron's per-user data dir.
// Keeps the whole settings object in one file; debounced writes from the
// renderer plus a synchronous flush on quit.
import { app } from 'electron'
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'fs'
import { join, dirname } from 'path'

const SETTINGS_PATH = join(app.getPath('userData'), 'settings.json')

const SAMPLE_TEXT = [
  '欢迎使用 EZ 提词器',
  'Welcome to EZ Teleprompter',
  '',
  '一个悬浮在其它应用之上、始终置顶的透明提词器。',
  'A transparent, always-on-top teleprompter that floats over your other apps.',
  '',
  '点击下方控制台的 📂（或按 O）打开 .txt / .md / .srt 文稿；',
  '点击 ✏️（或按 E）直接在页面上编辑文本。',
  '',
  '空格 播放 / 暂停 · ↑↓ 调速 · ←→ 调字号',
  'L 锁定穿透点击 · F 全屏 · ? 查看全部快捷键',
  '',
  '配对蓝牙翻页器或游戏手柄即可免手滚动。✨'
].join('\n')

export const DEFAULT_SETTINGS = {
  text: SAMPLE_TEXT,
  speed: 50,
  fontSize: 36,
  lineHeight: 1.8,
  textColor: '#ffffff',
  bgColor: '#000000',
  bgOpacity: 55,
  windowOpacity: 100,
  flipH: false,
  flipV: false,
  showGuide: false,
  skipEmptyLines: false,
  paragraphGap: 0.5,
  align: 'left',
  bounds: { x: null, y: null, width: 720, height: 420 },
  displayId: null,
  remoteMode: false,
  alwaysOnTop: true
}

export function loadSettings() {
  try {
    const raw = readFileSync(SETTINGS_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    mkdirSync(dirname(SETTINGS_PATH), { recursive: true })
    // Atomic write: the user's whole script lives in this file, so a crash
    // mid-write must never leave a truncated JSON behind (loadSettings would
    // silently fall back to defaults and the script would be lost).
    const tmpPath = `${SETTINGS_PATH}.tmp`
    writeFileSync(tmpPath, JSON.stringify(settings, null, 2), 'utf-8')
    renameSync(tmpPath, SETTINGS_PATH)
    return true
  } catch {
    return false
  }
}

export { SETTINGS_PATH }
