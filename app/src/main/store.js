// Tiny dependency-free JSON store living in Electron's per-user data dir.
// Keeps the whole settings object in one file; debounced writes from the
// renderer plus a synchronous flush on quit.
import { app } from 'electron'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const SETTINGS_PATH = join(app.getPath('userData'), 'settings.json')

const SAMPLE_TEXT = [
  'Welcome to EZ Teleprompter',
  '欢迎使用 EZ 提词器',
  '',
  'A transparent, always-on-top teleprompter that floats over your other apps.',
  '一个悬浮在其它应用之上的透明提词器。',
  '',
  'Press Space to play or pause.',
  'Use the arrow keys to change speed and font size.',
  'Press L to lock click-through, F for fullscreen.',
  '',
  'Pair a Bluetooth remote or a game controller to scroll hands-free.',
  '',
  'Open settings (gear icon) to paste your own script. ✨'
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
    writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

export { SETTINGS_PATH }
