import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ControlsApp from './ControlsApp.jsx'
import './styles.css'

// One bundle, two windows: the prompter (default) and the detached controls
// console (loaded with a #controls hash by the main process).
const isControls = window.location.hash === '#controls'
if (isControls) document.body.classList.add('controls')

createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isControls ? <ControlsApp /> : <App />}</React.StrictMode>
)
