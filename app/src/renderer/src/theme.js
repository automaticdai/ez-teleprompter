// Color helpers + preset palettes shared across components.

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function hexToRgba(hex, alpha) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return `rgba(0,0,0,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const COLOR_PRESETS = [
  { text: '#ffffff', bg: '#000000', name: '黑白' },
  { text: '#00ff88', bg: '#0a0a0f', name: '霓虹' },
  { text: '#ff6b6b', bg: '#1a0a0a', name: '余烬' },
  { text: '#4ecdc4', bg: '#0a1a1a', name: '青绿' },
  { text: '#ffd93d', bg: '#1a1a0a', name: '金色' },
  { text: '#ff5cf4', bg: '#0f0a1a', name: '赛博' }
]

export const LIMITS = {
  speed: [1, 100],
  fontSize: [16, 96],
  lineHeight: [1.2, 3.0],
  bgOpacity: [0, 100],
  windowOpacity: [20, 100],
  paragraphGap: [0.2, 3.0]
}
