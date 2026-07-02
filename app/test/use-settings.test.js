// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor, cleanup } from '@testing-library/react'
import { useSettings } from '../src/renderer/src/store/use-settings.js'

const LOADED = { text: 'hello', speed: 50, fontSize: 36 }

describe('useSettings', () => {
  beforeEach(() => {
    window.api = {
      loadSettings: vi.fn().mockResolvedValue({ ...LOADED }),
      saveSettings: vi.fn().mockResolvedValue(true)
    }
  })

  // Unmount between tests, or a previous hook's pending debounce timer would
  // leak into the next test's saveSettings mock (no RTL auto-cleanup without
  // vitest `globals: true`).
  afterEach(cleanup)

  it('is null until the main process responds, then holds the loaded settings', async () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current[0]).toBeNull()
    await waitFor(() => expect(result.current[0]).toEqual(LOADED))
  })

  it('merges object patches and functional patches', async () => {
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current[0]).not.toBeNull())

    act(() => result.current[1]({ speed: 60 }))
    expect(result.current[0].speed).toBe(60)
    expect(result.current[0].text).toBe('hello') // untouched keys survive

    act(() => result.current[1]((s) => ({ speed: s.speed + 2 })))
    expect(result.current[0].speed).toBe(62)
  })

  it('persists changes after the debounce window, not per keystroke', async () => {
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current[0]).not.toBeNull())
    window.api.saveSettings.mockClear() // ignore the initial post-load save

    act(() => result.current[1]({ text: 'a' }))
    act(() => result.current[1]({ text: 'ab' }))
    act(() => result.current[1]({ text: 'abc' }))
    expect(window.api.saveSettings).not.toHaveBeenCalled() // still inside debounce

    await waitFor(() => expect(window.api.saveSettings).toHaveBeenCalledTimes(1), { timeout: 1500 })
    expect(window.api.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ text: 'abc' }))
  })

  it('flushes pending settings on beforeunload', async () => {
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current[0]).not.toBeNull())

    act(() => result.current[1]({ text: 'unsaved' }))
    window.api.saveSettings.mockClear()
    window.dispatchEvent(new Event('beforeunload'))
    expect(window.api.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ text: 'unsaved' }))
  })
})
