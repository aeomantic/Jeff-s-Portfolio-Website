/**
 * Scroll reveals with one shared IntersectionObserver.
 *
 * Elements opt in with `data-reveal` (or the `.running-head` class). When they
 * enter the viewport they receive `data-in`, which the CSS in global.css
 * transitions to. A data attribute (not a class) is used so React re-renders
 * that change `className` can never strip the revealed state.
 *
 * Content is only hidden when <html> has `.js-reveal`, which main.tsx adds
 * when IntersectionObserver exists and the visitor has not asked for reduced
 * motion. Without it, everything renders visible.
 */

const SELECTOR = '[data-reveal], .running-head'

export function startRevealObserver(root: HTMLElement = document.body): () => void {
  const reveal = (el: Element) => el.setAttribute('data-in', '')

  if (!document.documentElement.classList.contains('js-reveal')) {
    return () => {}
  }

  // Elements that start fully clipped have no visible area, so the observer
  // would never report them. They are watched through their parent instead.
  const proxies = new Map<Element, Element[]>()

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        proxies.get(entry.target)?.forEach(reveal)
        if (entry.target.matches(SELECTOR)) reveal(entry.target)
        proxies.delete(entry.target)
        io.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  )

  const observe = (el: Element) => {
    if (el.hasAttribute('data-in')) return
    const kind = el.getAttribute('data-reveal')
    const watch = (kind === 'image' || kind === 'map') && el.parentElement ? el.parentElement : el
    if (watch !== el) proxies.set(watch, [...(proxies.get(watch) ?? []), el])
    io.observe(watch)
  }

  const observeWithin = (node: ParentNode) => {
    node.querySelectorAll(SELECTOR).forEach(observe)
  }

  // Anything already on the first screen plays its entrance immediately, even
  // if it sits inside the observer's bottom margin.
  root.querySelectorAll(SELECTOR).forEach((el) => {
    const kind = el.getAttribute('data-reveal')
    const box = ((kind === 'image' || kind === 'map') && el.parentElement ? el.parentElement : el).getBoundingClientRect()
    if (box.top < window.innerHeight && box.bottom > 0) reveal(el)
  })

  observeWithin(root)

  // Pick up anything mounted later (expanded panels, dialogs, etc.).
  const mo = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        if (node.matches(SELECTOR)) observe(node)
        observeWithin(node)
      })
    }
  })
  mo.observe(root, { childList: true, subtree: true })

  // Never let print or a failed observer leave content hidden.
  const revealAll = () => root.querySelectorAll(SELECTOR).forEach(reveal)
  window.addEventListener('beforeprint', revealAll)

  return () => {
    io.disconnect()
    mo.disconnect()
    window.removeEventListener('beforeprint', revealAll)
  }
}
