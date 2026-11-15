import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EasterEgg } from './components/EasterEgg'
import { Header } from './components/Header'
import { EXECUTIVE_OFF_MS, ExecutiveContext, type ExecutiveState } from './motion/executive'
import { startRevealObserver } from './motion/reveal'
import { About } from './sections/About'
import { Awards } from './sections/Awards'
import { Contact } from './sections/Contact'
import { Education } from './sections/Education'
import { Experience } from './sections/Experience'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Incident } from './sections/Incident'
import { Space } from './sections/Space'
import { Work } from './sections/Work'

export default function App() {
  const [off, setOff] = useState(false)
  const timer = useRef(0)

  useEffect(() => startRevealObserver(), [])

  useEffect(() => {
    const root = document.documentElement
    if (off) root.dataset.exec = 'off'
    else delete root.dataset.exec
  }, [off])

  const restore = useCallback(() => {
    window.clearTimeout(timer.current)
    setOff(false)
  }, [])

  const disable = useCallback(() => {
    window.clearTimeout(timer.current)
    setOff(true)
    timer.current = window.setTimeout(() => setOff(false), EXECUTIVE_OFF_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const executive = useMemo<ExecutiveState>(() => ({ off, disable, restore }), [off, disable, restore])

  return (
    <ExecutiveContext.Provider value={executive}>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <Header />
      <main>
        <Hero />
        <About />
        <Experience />
        <Education />
        <Work />
        <Space />
        <Incident />
        <Awards />
        <Contact />
      </main>
      <Footer />
      <EasterEgg />
    </ExecutiveContext.Provider>
  )
}
