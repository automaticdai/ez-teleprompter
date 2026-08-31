// @vitest-environment jsdom
//
// Guards the DOM ordering that makes the frameless window draggable.
//
// Chromium collects `-webkit-app-region` rects by walking the layout tree in
// pre-order (parent, then children in DOM order) and Electron folds that list
// into one SkRegion sequentially: `drag` unions, `no-drag` subtracts. DOM
// order decides the winner — z-index and paint order are irrelevant.
//
// So the `.move-bar` grip must come *after* `.reading-viewport`: the viewport
// is `flex: 1` and covers the whole card, so its no-drag rect erases any drag
// rect declared before it (which is exactly how the grip stopped working when
// the viewport was made no-drag to unbreak wheel scrolling).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import App from '../src/renderer/src/App.jsx'

const SETTINGS = {
  text: 'line one\n\nline two',
  speed: 50,
  fontSize: 36,
  lineHeight: 1.8,
  textColor: '#ffffff',
  bgColor: '#000000',
  bgOpacity: 55,
  windowOpacity: 100,
  flipH: false,
  flipV: false,
  showGuide: false,
  skipEmptyLines: false,
  paragraphGap: 0.5,
  align: 'left',
  alwaysOnTop: true
}

const noop = () => {}
const unsubscribe = () => noop

beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.api = {
    loadSettings: vi.fn().mockResolvedValue({ ...SETTINGS }),
    saveSettings: vi.fn().mockResolvedValue(true),
    setOpacity: vi.fn(),
    setAlwaysOnTop: vi.fn(),
    sendHudState: vi.fn(),
    toggleControls: vi.fn(),
    onCommand: vi.fn(unsubscribe),
    onClickThroughState: vi.fn(unsubscribe),
    onFullscreenState: vi.fn(unsubscribe),
    onRemoteModeState: vi.fn(unsubscribe),
    onRequestHudSync: vi.fn(unsubscribe),
    // Touched by the settings drawer once it mounts.
    getDisplays: vi.fn().mockResolvedValue([]),
    moveToDisplay: vi.fn().mockResolvedValue(true),
    fitToDisplay: vi.fn().mockResolvedValue({}),
    setRemoteMode: vi.fn().mockResolvedValue(false),
    toggleClickThrough: vi.fn().mockResolvedValue(false),
    toggleFullscreen: vi.fn().mockResolvedValue(false),
    importFile: vi.fn().mockResolvedValue(null),
    quit: vi.fn()
  }
})

afterEach(cleanup)

function press(code) {
  window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }))
}

async function renderApp() {
  const { container } = render(<App />)
  await waitFor(() => expect(container.querySelector('.reading-viewport')).not.toBeNull())
  return container
}

describe('window drag region', () => {
  it('declares the move grip after the no-drag reading viewport', async () => {
    const container = await renderApp()
    const grip = container.querySelector('.move-bar')
    const viewport = container.querySelector('.reading-viewport')

    expect(grip).not.toBeNull()
    // Node.DOCUMENT_POSITION_FOLLOWING (4): the grip follows the viewport.
    expect(viewport.compareDocumentPosition(grip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('declares the move grip before the overlays that cover it', async () => {
    const container = await renderApp()

    press('KeyS') // settings drawer
    press('Slash') // help panel
    await waitFor(() => expect(container.querySelector('.drawer')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('.help-overlay')).not.toBeNull())

    const grip = container.querySelector('.move-bar')
    // The settings drawer and help panel paint over the grip, so their no-drag
    // rects must be able to subtract it — i.e. they come after it in the DOM.
    for (const el of container.querySelectorAll('.drawer, .help-overlay')) {
      expect(grip.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it('drops the grip while the editor overlay is open, so it cannot steal clicks', async () => {
    const container = await renderApp()
    expect(container.querySelector('.move-bar')).not.toBeNull()

    press('KeyE') // opens the in-place editor, whose overlay covers the grip

    await waitFor(() => expect(screen.getByRole('textbox')).toBeTruthy())
    expect(container.querySelector('.move-bar')).toBeNull()
  })
})
