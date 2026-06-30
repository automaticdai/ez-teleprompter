// Framework-agnostic vertical scroll engine (ported from the original app).
//
// Time-delta integration over requestAnimationFrame so scroll speed is
// independent of frame rate. The text height is cached and only re-measured
// when layout changes, so the per-frame path never forces a reflow.

export const SPEED_MIN_PPS = 5
export const SPEED_MAX_PPS = 240

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// speed: 1..100  ->  pixels per second (5..240)
export function speedToPps(speed) {
  const s = clamp(speed, 1, 100)
  return SPEED_MIN_PPS + ((s - 1) / 99) * (SPEED_MAX_PPS - SPEED_MIN_PPS)
}

export class ScrollEngine {
  constructor(options = {}) {
    this.textEl = null
    this.position = 0
    this.speed = 50
    this.viewportHeight = 0
    this.textHeight = 0
    this.paused = true
    this._raf = null
    this._lastTs = null
    // Injectable for tests; defaults to the browser clock/raf.
    this._now = options.now || ((ts) => ts)
    this._requestFrame =
      options.requestFrame ||
      ((cb) => (typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(cb) : null))
    this._cancelFrame =
      options.cancelFrame ||
      ((id) => (typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame(id) : undefined))
  }

  attach(textEl) {
    this.textEl = textEl
    this.measure()
    this.apply()
  }

  setViewportHeight(height) {
    this.viewportHeight = Math.max(0, height || 0)
    this.position = clamp(this.position, 0, this.totalScroll())
    this.apply()
  }

  setSpeed(speed) {
    this.speed = clamp(speed, 1, 100)
  }

  measure() {
    if (this.textEl) this.textHeight = this.textEl.scrollHeight
    return this.textHeight
  }

  // Re-measure after a layout change, then keep the position in range.
  remeasure() {
    this.measure()
    this.position = clamp(this.position, 0, this.totalScroll())
    this.apply()
  }

  totalScroll() {
    return this.textHeight + this.viewportHeight
  }

  // The text starts just below the viewport and scrolls upward as position grows.
  apply(position = this.position) {
    if (this.textEl) {
      this.textEl.style.transform = `translateY(${this.viewportHeight - position}px)`
    }
  }

  // Advance by `dtSeconds`, wrapping smoothly so looping keeps a constant speed.
  step(dtSeconds) {
    const total = this.totalScroll()
    let next = this.position + speedToPps(this.speed) * dtSeconds
    if (total > 0 && next > total) {
      next -= total
    }
    this.position = next
    this.apply(next)
    return next
  }

  // Manual jog (wheel, gamepad stick, nudge commands). Clamped, no wrap.
  nudge(deltaPx) {
    this.position = clamp(this.position + deltaPx, 0, this.totalScroll())
    this.apply()
    return this.position
  }

  reset() {
    this.position = 0
    this._lastTs = null
    this.apply(0)
  }

  play() {
    if (!this.paused) return
    this.paused = false
    this._lastTs = null
    this._loop = this._loop.bind(this)
    this._raf = this._requestFrame(this._loop)
  }

  pause() {
    this.paused = true
    if (this._raf != null) this._cancelFrame(this._raf)
    this._raf = null
    this._lastTs = null
  }

  toggle() {
    if (this.paused) this.play()
    else this.pause()
    return !this.paused
  }

  _loop(timestamp) {
    if (this.paused) return
    const ts = this._now(timestamp)
    if (this._lastTs === null) this._lastTs = ts
    const dt = (ts - this._lastTs) / 1000
    this._lastTs = ts
    this.step(dt)
    this._raf = this._requestFrame(this._loop)
  }

  destroy() {
    this.pause()
    this.textEl = null
  }
}
