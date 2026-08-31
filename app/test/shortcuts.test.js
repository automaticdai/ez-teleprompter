import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CLICKER_KEYMAP } from '../src/shared/clicker-keys.js'

// Capture what the main process actually hands to Electron.
const registered = new Map()
vi.mock('electron', () => ({
  globalShortcut: {
    register: (accelerator, callback) => registered.set(accelerator, callback),
    unregister: (accelerator) => registered.delete(accelerator)
  }
}))

const { createShortcutManager } = await import('../src/main/shortcuts.js')

describe('remote-mode global shortcuts', () => {
  beforeEach(() => registered.clear())

  it('registers nothing until remote mode is switched on', () => {
    createShortcutManager(vi.fn())
    expect(registered.size).toBe(0)
  })

  // The whole point of the shared map: pressing a clicker button does the same
  // thing whether or not the prompter window is focused.
  it('binds the clicker keys to the same commands as the in-app keymap', () => {
    const dispatch = vi.fn()
    createShortcutManager(dispatch).setEnabled(true)

    for (const [accelerator, command] of Object.entries(CLICKER_KEYMAP)) {
      expect(registered.has(accelerator)).toBe(true)
      registered.get(accelerator)()
      expect(dispatch).toHaveBeenLastCalledWith(command)
    }
  })

  it('releases only its own accelerators when switched off', () => {
    const shortcuts = createShortcutManager(vi.fn())
    shortcuts.setEnabled(true)
    expect(registered.size).toBeGreaterThan(0)

    shortcuts.setEnabled(false)
    expect(registered.size).toBe(0)
    expect(shortcuts.isEnabled()).toBe(false)
  })
})
