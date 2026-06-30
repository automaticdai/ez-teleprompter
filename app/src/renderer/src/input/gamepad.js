// Game controller support via the Gamepad API. Polls on rAF, fires commands on
// button *edges* (press, not hold) and maps the right stick to analog jog.
//
// Standard-mapping button indices:
//   0 A/✕   1 B/○   4 LB   5 RB   8 Back/Share   9 Start/Options
//   12 Dpad↑  13 Dpad↓  14 Dpad←  15 Dpad→
const BUTTON_COMMANDS = {
  0: 'playPause',
  1: 'reset',
  4: 'speedDown',
  5: 'speedUp',
  9: 'toggleSettings',
  8: 'toggleHud',
  12: 'speedUp',
  13: 'speedDown',
  14: 'fontDown',
  15: 'fontUp'
}

const STICK_DEADZONE = 0.18
const STICK_PIXELS_PER_FRAME = 14 // at full deflection

export function createGamepadController({ dispatch, onScroll }) {
  const prevPressed = {}
  let raf = null
  let running = false

  function poll() {
    if (!running) return
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : []
    for (const pad of pads) {
      if (!pad) continue

      pad.buttons.forEach((button, index) => {
        const key = `${pad.index}:${index}`
        const pressed = button.pressed || button.value > 0.5
        if (pressed && !prevPressed[key]) {
          const command = BUTTON_COMMANDS[index]
          if (command) dispatch(command)
        }
        prevPressed[key] = pressed
      })

      // Right stick Y (axis 3) jogs the script up/down.
      const stickY = pad.axes && pad.axes.length > 3 ? pad.axes[3] : 0
      if (Math.abs(stickY) > STICK_DEADZONE && onScroll) {
        onScroll(stickY * STICK_PIXELS_PER_FRAME)
      }
    }
    raf = requestAnimationFrame(poll)
  }

  return {
    start() {
      if (running) return
      running = true
      raf = requestAnimationFrame(poll)
    },
    stop() {
      running = false
      if (raf != null) cancelAnimationFrame(raf)
      raf = null
    }
  }
}
