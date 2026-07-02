import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createGamepadController } from '../src/renderer/src/input/gamepad.js'

// Drive the controller's rAF poll loop by hand: each pump() runs exactly the
// frames queued so far, so button edges and stick jog are fully deterministic.
function makeHarness() {
  let queue = []
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    queue.push(cb)
    return queue.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})

  const pad = {
    index: 0,
    buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
    axes: [0, 0, 0, 0]
  }
  vi.stubGlobal('navigator', { getGamepads: () => [pad] })

  return {
    pad,
    pump() {
      const frames = queue
      queue = []
      frames.forEach((cb) => cb())
    }
  }
}

describe('createGamepadController', () => {
  let harness
  beforeEach(() => {
    harness = makeHarness()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fires a command once on button press edge, not while held', () => {
    const dispatch = vi.fn()
    const gp = createGamepadController({ dispatch, onScroll: vi.fn() })
    gp.start()

    harness.pad.buttons[0].pressed = true // A -> playPause
    harness.pump()
    harness.pump() // still held
    harness.pump()
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith('playPause')

    gp.stop()
  })

  it('fires again after release and re-press', () => {
    const dispatch = vi.fn()
    const gp = createGamepadController({ dispatch, onScroll: vi.fn() })
    gp.start()

    harness.pad.buttons[5].pressed = true // RB -> speedUp
    harness.pump()
    harness.pad.buttons[5].pressed = false
    harness.pump()
    harness.pad.buttons[5].pressed = true
    harness.pump()

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenNthCalledWith(2, 'speedUp')
    gp.stop()
  })

  it('treats analog value > 0.5 as pressed', () => {
    const dispatch = vi.fn()
    const gp = createGamepadController({ dispatch, onScroll: vi.fn() })
    gp.start()

    harness.pad.buttons[1].value = 0.4
    harness.pump()
    expect(dispatch).not.toHaveBeenCalled()
    harness.pad.buttons[1].value = 0.8
    harness.pump()
    expect(dispatch).toHaveBeenCalledWith('reset')
    gp.stop()
  })

  it('jogs via the right stick outside the deadzone only', () => {
    const onScroll = vi.fn()
    const gp = createGamepadController({ dispatch: vi.fn(), onScroll })
    gp.start()

    harness.pad.axes[3] = 0.1 // inside deadzone
    harness.pump()
    expect(onScroll).not.toHaveBeenCalled()

    harness.pad.axes[3] = 0.5
    harness.pump()
    expect(onScroll).toHaveBeenCalledWith(0.5 * 14)
    gp.stop()
  })

  it('stops polling after stop()', () => {
    const dispatch = vi.fn()
    const gp = createGamepadController({ dispatch, onScroll: vi.fn() })
    gp.start()
    gp.stop()

    harness.pad.buttons[0].pressed = true
    harness.pump()
    expect(dispatch).not.toHaveBeenCalled()
  })
})
