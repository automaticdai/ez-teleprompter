import { describe, it, expect } from 'vitest'
import { resolveCommand, isEditableTarget, DEFAULT_KEYMAP, COMMANDS } from '../src/renderer/src/input/keymap.js'

describe('resolveCommand', () => {
  it('maps known key codes to commands', () => {
    expect(resolveCommand('Space')).toBe('playPause')
    expect(resolveCommand('KeyR')).toBe('reset')
    expect(resolveCommand('ArrowUp')).toBe('speedUp')
    expect(resolveCommand('PageDown')).toBe('speedDown')
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
