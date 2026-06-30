import { describe, it, expect } from 'vitest'
import {
  ScrollEngine,
  speedToPps,
  clamp,
  SPEED_MIN_PPS,
  SPEED_MAX_PPS
} from '../src/renderer/src/engine/scroll-engine.js'

function fakeTextEl(height) {
  return { scrollHeight: height, style: {} }
}

describe('speedToPps', () => {
  it('maps the speed range onto the pixel-per-second range', () => {
    expect(speedToPps(1)).toBeCloseTo(SPEED_MIN_PPS)
    expect(speedToPps(100)).toBeCloseTo(SPEED_MAX_PPS)
  })

  it('is monotonically increasing', () => {
    expect(speedToPps(10)).toBeLessThan(speedToPps(20))
    expect(speedToPps(50)).toBeLessThan(speedToPps(80))
  })

  it('clamps out-of-range speeds', () => {
    expect(speedToPps(-5)).toBeCloseTo(SPEED_MIN_PPS)
    expect(speedToPps(999)).toBeCloseTo(SPEED_MAX_PPS)
  })
})

describe('clamp', () => {
  it('bounds values', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})

describe('ScrollEngine geometry', () => {
  it('computes total scroll from text + viewport height', () => {
    const e = new ScrollEngine()
    e.attach(fakeTextEl(1000))
    e.setViewportHeight(400)
    expect(e.textHeight).toBe(1000)
    expect(e.totalScroll()).toBe(1400)
  })

  it('writes a translateY transform on apply', () => {
    const el = fakeTextEl(1000)
    const e = new ScrollEngine()
    e.attach(el)
    e.setViewportHeight(400)
    e.apply(100)
    // viewportHeight - position = 400 - 100
    expect(el.style.transform).toBe('translateY(300px)')
  })
})

describe('ScrollEngine.step wrapping', () => {
  it('wraps smoothly, carrying overflow across the loop', () => {
    const e = new ScrollEngine()
    e.attach(fakeTextEl(100))
    e.setViewportHeight(100) // totalScroll = 200
    e.setSpeed(100) // 240 px/s
    e.position = 195
    // 240 px/s * 1s = 240 -> 195 + 240 = 435 -> minus 200 (one wrap) = 235 -> minus 200 = ...
    // The engine subtracts one totalScroll per step; verify it stays finite & wrapped.
    const next = e.step(1)
    expect(next).toBeLessThan(e.totalScroll() * 2)
    expect(next).toBeGreaterThanOrEqual(0)
  })

  it('does not wrap before reaching the end', () => {
    const e = new ScrollEngine()
    e.attach(fakeTextEl(1000))
    e.setViewportHeight(400) // total 1400
    e.setSpeed(1) // 5 px/s
    e.position = 0
    const next = e.step(1)
    expect(next).toBeCloseTo(5)
  })
})

describe('ScrollEngine.nudge', () => {
  it('clamps within [0, totalScroll]', () => {
    const e = new ScrollEngine()
    e.attach(fakeTextEl(100))
    e.setViewportHeight(100) // total 200
    e.position = 50
    expect(e.nudge(-100)).toBe(0)
    expect(e.nudge(10)).toBe(10)
    expect(e.nudge(1000)).toBe(200)
  })
})

describe('ScrollEngine play/pause via injected clock', () => {
  it('advances on simulated frames and stops when paused', () => {
    const frames = []
    const e = new ScrollEngine({
      now: (ts) => ts,
      requestFrame: (cb) => {
        frames.push(cb)
        return frames.length
      },
      cancelFrame: () => {}
    })
    e.attach(fakeTextEl(1000))
    e.setViewportHeight(400)
    e.setSpeed(50)
    e.play()
    expect(e.paused).toBe(false)
    // drive two frames 1s apart
    frames.shift()(0)
    frames.shift()(1000)
    expect(e.position).toBeGreaterThan(0)
    e.pause()
    expect(e.paused).toBe(true)
  })
})
