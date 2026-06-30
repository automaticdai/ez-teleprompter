import { useEffect, useRef, useLayoutEffect } from 'react'
import { hexToRgba } from '../theme.js'

// The scrolling reading surface. Owns the DOM wiring for the scroll engine
// (attach, viewport size, re-measure on layout change) plus wheel jog, mirror,
// edge fades and the reading guide. The engine writes the transform directly.
export default function ReadingArea({ engine, settings, editing, onChangeText, onExitEdit, interactiveProps }) {
  const viewportRef = useRef(null)
  const textRef = useRef(null)

  useLayoutEffect(() => {
    if (textRef.current) engine.attach(textRef.current)
  }, [engine])

  // Track the viewport height so scroll math stays correct as the window resizes.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(() => {
      engine.setViewportHeight(el.clientHeight)
      engine.remeasure()
    })
    ro.observe(el)
    engine.setViewportHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [engine])

  // Re-measure after any change that affects text height, then re-clamp.
  useLayoutEffect(() => {
    engine.remeasure()
  }, [
    engine,
    settings.text,
    settings.fontSize,
    settings.lineHeight,
    settings.skipEmptyLines,
    settings.paragraphGap,
    settings.align
  ])

  const onWheel = (e) => engine.nudge(e.deltaY * 0.5)

  const bg = hexToRgba(settings.bgColor, settings.bgOpacity / 100)
  const paragraphs = settings.skipEmptyLines
    ? settings.text.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean)
    : null

  return (
    <div className="reading-viewport" ref={viewportRef} onWheel={onWheel}>
      <div className="edge-fade" style={{ top: 0, background: `linear-gradient(${bg}, transparent)` }} />
      <div className="edge-fade" style={{ bottom: 0, background: `linear-gradient(to top, ${bg}, transparent)` }} />

      {settings.showGuide && (
        <div
          className="reading-guide"
          style={{
            borderTop: `2px solid ${hexToRgba(settings.textColor, 0.55)}`,
            boxShadow: `0 0 8px ${hexToRgba(settings.textColor, 0.5)}`
          }}
        />
      )}

      <div
        className="reading-mirror"
        style={{ transform: `scaleX(${settings.flipH ? -1 : 1}) scaleY(${settings.flipV ? -1 : 1})` }}
      >
        <div
          className="reading-text"
          ref={textRef}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            color: settings.textColor,
            textAlign: settings.align || 'left',
            fontWeight: 500,
            textShadow: `0 0 20px ${hexToRgba(settings.textColor, 0.35)}`
          }}
        >
          {paragraphs
            ? paragraphs.map((p, i) => (
                <div key={i} style={{ marginBottom: i < paragraphs.length - 1 ? `${settings.paragraphGap}em` : 0 }}>
                  {p}
                </div>
              ))
            : settings.text}
        </div>
      </div>

      {editing && (
        <div
          className="editor-overlay"
          style={{ background: hexToRgba(settings.bgColor, Math.max(0.92, settings.bgOpacity / 100)) }}
          {...interactiveProps}
        >
          <textarea
            className="editor-area"
            autoFocus
            spellCheck={false}
            value={settings.text}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                onExitEdit()
              }
            }}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              color: settings.textColor,
              textAlign: settings.align || 'left'
            }}
          />
          <button className="editor-done" onClick={onExitEdit} title="完成（Esc / E）">
            ✓ 完成
          </button>
        </div>
      )}
    </div>
  )
}
