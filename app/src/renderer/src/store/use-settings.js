import { useState, useEffect, useRef, useCallback } from 'react'

// Loads settings from the main process once, then persists changes back with a
// debounce (so dragging sliders doesn't write on every frame) plus a flush on
// unload. Returns [settings, update]; settings is null until the first load.
export function useSettings() {
  const [settings, setSettings] = useState(null)
  const settingsRef = useRef(null)

  useEffect(() => {
    let mounted = true
    window.api.loadSettings().then((loaded) => {
      if (mounted) {
        settingsRef.current = loaded
        setSettings(loaded)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    settingsRef.current = settings
    if (!settings) return undefined
    const id = setTimeout(() => window.api.saveSettings(settings), 400)
    return () => clearTimeout(id)
  }, [settings])

  useEffect(() => {
    const flush = () => {
      if (settingsRef.current) window.api.saveSettings(settingsRef.current)
    }
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [])

  const update = useCallback((patch) => {
    setSettings((prev) => {
      if (!prev) return prev
      const next = typeof patch === 'function' ? patch(prev) : patch
      return { ...prev, ...next }
    })
  }, [])

  return [settings, update]
}
