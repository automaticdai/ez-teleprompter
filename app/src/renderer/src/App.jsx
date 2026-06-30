import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollEngine, clamp } from './engine/scroll-engine.js'
import { DEFAULT_KEYMAP, resolveCommand, isEditableTarget } from './input/keymap.js'
import { createGamepadController } from './input/gamepad.js'
import { useSettings } from './store/use-settings.js'
import { LIMITS, hexToRgba } from './theme.js'
import ReadingArea from './components/ReadingArea.jsx'
import SettingsDrawer from './components/SettingsDrawer.jsx'
import HelpPanel from './components/HelpPanel.jsx'
import { fileToText } from './engine/srt.js'

// The prompter window. The toolbar now lives in its own docked console window
// (ControlsApp); this window only paints the scrolling text plus the editor /
// settings / help overlays, which the console opens via the command channel.
export default function App() {
  const [settings, update] = useSettings()
  const engine = useMemo(() => new ScrollEngine(), [])

  const [playing, setPlaying] = useState(false)
  const [locked, setLocked] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [editing, setEditing] = useState(false)

  // Keep the engine speed in sync with settings.
  useEffect(() => {
    if (settings) engine.setSpeed(settings.speed)
  }, [engine, settings && settings.speed])

  // Apply persisted window opacity / always-on-top once settings load.
  const appliedWindowRef = useRef(false)
  useEffect(() => {
    if (!settings || appliedWindowRef.current) return
    appliedWindowRef.current = true
    if (Number.isFinite(settings.windowOpacity)) window.api.setOpacity(settings.windowOpacity)
    if (settings.alwaysOnTop === false) window.api.setAlwaysOnTop(false)
  }, [settings])

  const dispatch = useCallback(
    (command) => {
      switch (command) {
        case 'playPause':
          setPlaying((p) => {
            const next = !p
            if (next) engine.play()
            else engine.pause()
            return next
          })
          break
        case 'reset':
          engine.reset()
          break
        case 'speedUp':
          update((s) => ({ speed: clamp(s.speed + 2, ...LIMITS.speed) }))
          break
        case 'speedDown':
          update((s) => ({ speed: clamp(s.speed - 2, ...LIMITS.speed) }))
          break
        case 'fontUp':
          update((s) => ({ fontSize: clamp(s.fontSize + 2, ...LIMITS.fontSize) }))
          break
        case 'fontDown':
          update((s) => ({ fontSize: clamp(s.fontSize - 2, ...LIMITS.fontSize) }))
          break
        case 'toggleMirror':
          update((s) => ({ flipH: !s.flipH }))
          break
        case 'toggleGuide':
          update((s) => ({ showGuide: !s.showGuide }))
          break
        case 'toggleClickThrough':
          window.api.toggleClickThrough().then(setLocked)
          break
        case 'toggleFullscreen':
          window.api.toggleFullscreen().then(setFullscreen)
          break
        case 'toggleHud':
          // Show / hide the detached controls console.
          window.api.toggleControls()
          break
        case 'toggleSettings':
          setShowSettings((v) => !v)
          break
        case 'toggleHelp':
          setShowHelp((v) => !v)
          break
        case 'openFile':
          // Pick a .txt/.md/.srt file and load it as the script.
          window.api.importFile().then((file) => {
            if (!file) return
            update({ text: fileToText(file.name, file.content) })
            engine.reset()
          })
          break
        case 'toggleEdit':
          setEditing((v) => {
            const next = !v
            if (next) {
              // Stop scrolling so the text holds still while you edit it.
              engine.pause()
              setPlaying(false)
            }
            return next
          })
          break
        case 'nudgeUp':
          engine.nudge(-40)
          break
        case 'nudgeDown':
          engine.nudge(40)
          break
        case 'quit':
          window.api.quit()
          break
        default:
          break
      }
    },
    [engine, update]
  )

  // Local keyboard (active when the overlay is focused).
  useEffect(() => {
    const keymap = (settings && settings.keymap) || DEFAULT_KEYMAP
    const onKeyDown = (e) => {
      if (isEditableTarget(e.target)) return
      const command = resolveCommand(e.code, keymap)
      if (!command) return
      e.preventDefault()
      dispatch(command)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, settings && settings.keymap])

  // Global remote commands forwarded from the main process (also the channel
  // the docked console uses to drive this window).
  useEffect(() => window.api.onCommand(dispatch), [dispatch])

  // Main-process state sync (tray toggles, OS fullscreen, etc.).
  useEffect(() => {
    const off1 = window.api.onClickThroughState(setLocked)
    const off2 = window.api.onFullscreenState(setFullscreen)
    const off3 = window.api.onRemoteModeState((value) => update({ remoteMode: value }))
    return () => {
      off1()
      off2()
      off3()
    }
  }, [update])

  // Gamepad polling -> commands + analog jog.
  useEffect(() => {
    const gp = createGamepadController({ dispatch, onScroll: (px) => engine.nudge(px) })
    gp.start()
    return () => gp.stop()
  }, [dispatch, engine])

  // Push live button state to the docked console so its toolbar stays in sync.
  const hudStateRef = useRef({})
  useEffect(() => {
    if (!settings) return
    const state = { playing, locked, fullscreen, editing, speed: settings.speed, fontSize: settings.fontSize }
    hudStateRef.current = state
    window.api.sendHudState(state)
  }, [playing, locked, fullscreen, editing, settings && settings.speed, settings && settings.fontSize])

  // The console asks for a resync when it (re)loads — answer with current state.
  useEffect(() => window.api.onRequestHudSync(() => window.api.sendHudState(hudStateRef.current)), [])

  // Re-enable the mouse over interactive UI while the overlay is click-through.
  const interactiveProps = locked
    ? {
        onMouseEnter: () => window.api.setPassthrough(false),
        onMouseLeave: () => window.api.setPassthrough(true)
      }
    : {}

  if (!settings)
    return <div className="glass-card" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }} />

  const cardBg = hexToRgba(settings.bgColor, settings.bgOpacity / 100)

  return (
    <div
      className={`glass-card ${locked ? 'locked' : ''}`}
      style={{ background: cardBg, '--edge': hexToRgba(settings.textColor, 0.18) }}
    >
      <ReadingArea
        engine={engine}
        settings={settings}
        editing={editing}
        onChangeText={(text) => update({ text })}
        onExitEdit={() => dispatch('toggleEdit')}
        interactiveProps={interactiveProps}
      />

      {locked && <div className="lock-pill">🔒 已锁定 — 按 L 解锁</div>}

      {showSettings && (
        <SettingsDrawer
          settings={settings}
          update={update}
          onCommand={dispatch}
          onClose={() => setShowSettings(false)}
          interactiveProps={interactiveProps}
          locked={locked}
        />
      )}

      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} interactiveProps={interactiveProps} />}
    </div>
  )
}
