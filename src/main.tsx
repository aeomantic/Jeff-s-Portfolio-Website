import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource-variable/inter-tight/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import './styles/global.css'
import App from './App'

// Scroll reveals only hide content when they can be guaranteed to reveal it.
const canReveal =
  'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (canReveal) document.documentElement.classList.add('js-reveal')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
