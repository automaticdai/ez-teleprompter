// Click-through ("locked") state for the overlay.
//
// When locked, mouse events pass straight through to whatever is behind the
// window so you can keep using other apps. `forward: true` still delivers
// mouse-move to the renderer so the HUD can wake and so hovering an
// interactive control can momentarily re-enable interaction.
export function createClickThroughController(win) {
  let locked = false

  function apply() {
    if (locked) {
      win.setIgnoreMouseEvents(true, { forward: true })
    } else {
      win.setIgnoreMouseEvents(false)
    }
  }

  return {
    isLocked: () => locked,
    setLocked(value) {
      locked = !!value
      apply()
      return locked
    },
    toggle() {
      locked = !locked
      apply()
      return locked
    },
    // While locked, the renderer calls this on hover-enter (passthrough=false)
    // of an interactive control and hover-leave (passthrough=true) so the HUD
    // stays usable without unlocking the whole window.
    setPassthrough(passthrough) {
      if (!locked) return
      win.setIgnoreMouseEvents(!!passthrough, { forward: true })
    }
  }
}
