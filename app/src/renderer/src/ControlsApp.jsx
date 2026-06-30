import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Hud from './components/Hud.jsx'

// The renderer for the detached controls console window. It mirrors the
// prompter's live state (pushed over `hud:state`) and forwards every button
// press back as a command. It also measures the toolbar and asks the main
// process to size the window to fit, so no control is ever clipped.
const INITIAL = { playing: false, locked: false, fullscreen: false, editing: false, speed: 30, fontSize: 48 }

export default function ControlsApp() {
  const [state, setState] = useState(INITIAL)
  const fitRef = useRef(null)

  useEffect(() => {
    const off = window.api.onHudState((s) => setState((prev) => ({ ...prev, ...s })))
    // Subscribed now — ask the prompter to push its current state.
    window.api.requestHudSync()
    return off
  }, [])

  useLayoutEffect(() => {
    const el = fitRef.current
    if (!el) return undefined
    const report = () => {
      const r = el.getBoundingClientRect()
      // +24px leaves room for the bar's drop shadow so it isn't clipped.
      window.api.resizeControls({ width: Math.ceil(r.width) + 24, height: Math.ceil(r.height) + 24 })
    }
    report()
    const ro = new ResizeObserver(report)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="controls-root">
      <div className="controls-fit" ref={fitRef}>
        <Hud
          docked
          visible
          playing={state.playing}
          locked={state.locked}
          fullscreen={state.fullscreen}
          editing={state.editing}
          speed={state.speed}
          fontSize={state.fontSize}
          onCommand={(command) => window.api.sendCommand(command)}
          interactiveProps={{}}
        />
      </div>
    </div>
  )
}
