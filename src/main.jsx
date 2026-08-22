import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function preventZoom(event) {
  event.preventDefault()
}

document.addEventListener('gesturestart', preventZoom, { passive: false })
document.addEventListener('gesturechange', preventZoom, { passive: false })
document.addEventListener('gestureend', preventZoom, { passive: false })
document.addEventListener(
  'touchmove',
  (event) => {
    if (event.touches.length > 1) event.preventDefault()
  },
  { passive: false },
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
