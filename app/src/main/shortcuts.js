// Optional GLOBAL shortcuts for a Bluetooth remote that pairs as an HID
// keyboard. These fire even when another app is focused — which is exactly
// what you need while presenting — but registering them hijacks those keys
// system-wide, so this is gated behind an opt-in "Remote Mode" toggle.
//
// Keys here are chosen to minimize conflicts and to match what common
// presentation clickers emit. `dispatch(commandId)` forwards to the renderer.
import { globalShortcut } from 'electron'
import { CLICKER_KEYMAP } from '../shared/clicker-keys.js'

// Electron accelerator -> command id. The Page Up/Down pair is shared with the
// in-app keymap so a clicker does the same thing focused or not; the F-keys are
// low-conflict additions for speed and a second play/pause.
const GLOBAL_MAP = {
  ...CLICKER_KEYMAP,
  F6: 'speedDown',
  F7: 'speedUp',
  F8: 'playPause'
}

export function createShortcutManager(dispatch) {
  let enabled = false

  function register() {
    unregister()
    for (const [accel, command] of Object.entries(GLOBAL_MAP)) {
      try {
        globalShortcut.register(accel, () => dispatch(command))
      } catch {
        /* accelerator unavailable on this system — skip it */
      }
    }
  }

  function unregister() {
    // Only release our own accelerators — unregisterAll() would silently kill
    // any other global shortcut the app registers in the future.
    for (const accel of Object.keys(GLOBAL_MAP)) {
      try {
        globalShortcut.unregister(accel)
      } catch {
        /* already gone */
      }
    }
  }

  return {
    isEnabled: () => enabled,
    setEnabled(value) {
      enabled = !!value
      if (enabled) register()
      else unregister()
      return enabled
    },
    dispose: unregister
  }
}
