// The full set of commands every input source funnels into, plus the default
// keyboard map. Keeping this pure makes it unit-testable and lets the keyboard,
// gamepad, global remote, and on-screen buttons all share one vocabulary.

export const COMMANDS = [
  'playPause',
  'reset',
  'speedUp',
  'speedDown',
  'fontUp',
  'fontDown',
  'toggleMirror',
  'toggleGuide',
  'toggleClickThrough',
  'toggleFullscreen',
  'toggleHud',
  'toggleSettings',
  'toggleEdit',
  'toggleHelp',
  'openFile',
  'nudgeUp',
  'nudgeDown',
  'quit'
]

// KeyboardEvent.code -> command id. PageUp/PageDown are included because many
// Bluetooth presentation remotes emit them.
export const DEFAULT_KEYMAP = {
  Space: 'playPause',
  KeyR: 'reset',
  ArrowUp: 'speedUp',
  ArrowDown: 'speedDown',
  PageUp: 'speedUp',
  PageDown: 'speedDown',
  ArrowRight: 'fontUp',
  ArrowLeft: 'fontDown',
  KeyM: 'toggleMirror',
  KeyG: 'toggleGuide',
  KeyL: 'toggleClickThrough',
  KeyF: 'toggleFullscreen',
  KeyH: 'toggleHud',
  KeyS: 'toggleSettings',
  KeyE: 'toggleEdit',
  KeyO: 'openFile',
  Slash: 'toggleHelp'
}

// Don't hijack typing while the user edits the script.
export function isEditableTarget(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'TEXTAREA' || tag === 'INPUT' || target.isContentEditable === true
}

export function resolveCommand(code, keymap = DEFAULT_KEYMAP) {
  return keymap[code] || null
}
