import { describe, it, expect } from 'vitest'
import { resolveCommand, isEditableTarget, DEFAULT_KEYMAP, COMMANDS } from '../src/renderer/src/input/keymap.js'
import { CLICKER_KEYMAP } from '../src/shared/clicker-keys.js'

describe('resolveCommand', () => {
  it('maps known key codes to commands', () => {
    expect(resolveCommand('Space')).toBe('playPause')
    expect(resolveCommand('KeyR')).toBe('reset')
    expect(resolveCommand('ArrowUp')).toBe('speedUp')
    expect(resolveCommand('PageDown')).toBe('playPause')
    expect(resolveCommand('KeyL')).toBe('toggleClickThrough')
    expect(resolveCommand('KeyE')).toBe('toggleEdit')
    expect(resolveCommand('KeyO')).toBe('openFile')
    expect(resolveCommand('Slash')).toBe('toggleHelp')
  })

  it('returns null for unmapped keys', () => {
    expect(resolveCommand('KeyZ')).toBeNull()
  })

  it('honors a custom keymap', () => {
    expect(resolveCommand('KeyP', { KeyP: 'playPause' })).toBe('playPause')
    expect(resolveCommand('Space', { KeyP: 'playPause' })).toBeNull()
  })

  it('only maps to declared commands', () => {
    for (const command of Object.values(DEFAULT_KEYMAP)) {
      expect(COMMANDS).toContain(command)
    }
  })

  // A clicker button must not change meaning depending on which window has
  // focus, so the local map has to agree with the global one (shortcuts.js).
  it('honors the shared clicker keys', () => {
    for (const [code, command] of Object.entries(CLICKER_KEYMAP)) {
      expect(resolveCommand(code)).toBe(command)
    }
  })
})

describe('isEditableTarget', () => {
  it('detects text inputs and editable nodes', () => {
    expect(isEditableTarget({ tagName: 'TEXTAREA' })).toBe(true)
    expect(isEditableTarget({ tagName: 'INPUT' })).toBe(true)
    expect(isEditableTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true)
  })

  it('passes through non-editable targets', () => {
    expect(isEditableTarget({ tagName: 'DIV' })).toBe(false)
    expect(isEditableTarget(null)).toBe(false)
  })
})
