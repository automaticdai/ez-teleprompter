// The only bridge between the sandboxed renderer and the main process.
// Exposes a small, explicit `window.api` — no raw ipcRenderer, no Node.
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // ---- settings persistence ----
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),

  // ---- window / overlay control ----
  setClickThrough: (value) => ipcRenderer.invoke('window:setClickThrough', value),
  toggleClickThrough: () => ipcRenderer.invoke('window:toggleClickThrough'),
  setPassthrough: (passthrough) => ipcRenderer.send('window:setPassthrough', passthrough),
  setOpacity: (percent) => ipcRenderer.invoke('window:setOpacity', percent),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('window:setAlwaysOnTop', value),
  toggleFullscreen: () => ipcRenderer.invoke('window:toggleFullscreen'),
  fitToDisplay: () => ipcRenderer.invoke('window:fitToDisplay'),
  getDisplays: () => ipcRenderer.invoke('window:getDisplays'),
  moveToDisplay: (id) => ipcRenderer.invoke('window:moveToDisplay', id),

  // ---- input / remote ----
  setRemoteMode: (value) => ipcRenderer.invoke('remote:setEnabled', value),

  // ---- files ----
  importFile: () => ipcRenderer.invoke('file:import'),

  // ---- detached controls console ----
  // console -> prompter: forward a toolbar command to the reading window.
  sendCommand: (command) => ipcRenderer.send('controls:command', command),
  // prompter -> console: broadcast live button state (play/lock/speed/…).
  sendHudState: (state) => ipcRenderer.send('hud:state', state),
  onHudState: (cb) => subscribe('hud:state', cb),
  // console -> prompter: ask for a fresh state push once the console subscribes.
  requestHudSync: () => ipcRenderer.send('hud:requestSync'),
  onRequestHudSync: (cb) => subscribe('hud:requestSync', cb),
  // console -> main: size the console window to fit its toolbar exactly.
  resizeControls: (size) => ipcRenderer.send('controls:resize', size),
  // show/hide the console window (H).
  toggleControls: () => ipcRenderer.invoke('controls:toggle'),

  // ---- lifecycle ----
  quit: () => ipcRenderer.invoke('app:quit'),

  // ---- main -> renderer events. Each returns an unsubscribe fn. ----
  onCommand: (cb) => subscribe('command', cb),
  onClickThroughState: (cb) => subscribe('state:clickThrough', cb),
  onRemoteModeState: (cb) => subscribe('state:remoteMode', cb),
  onFullscreenState: (cb) => subscribe('state:fullscreen', cb)
}

function subscribe(channel, cb) {
  const listener = (_e, payload) => cb(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

contextBridge.exposeInMainWorld('api', api)
