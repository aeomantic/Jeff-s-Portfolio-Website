# JEFF. — Executive, Scientist, Visionary, Astronaut, Cat

A single-page portfolio for Jeff: five doctorates, one orbital expedition, and an
unscheduled demonstration of rotational excellence. Everything about Jeff's career is
fictional. The site is a parody, and it says so in the footer.

Vite + React 19 + TypeScript. No animation or UI libraries: motion is CSS, a shared
IntersectionObserver, and two small canvas/SVG pieces.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

The build uses a relative base (`./`), so `dist/` works from any sub-path (e.g. GitHub Pages).

## Structure

| Path | What it holds |
|---|---|
| `src/content/site.ts` | All copy and data: hero, biography, roles, doctorates, projects, mission, awards, contact config, asset paths. |
| `src/sections/` | One component + stylesheet per section: Hero, About, Experience, Education, Work, Space, Incident, Awards, Contact, Footer. |
| `src/components/` | Header (with mobile menu and scroll progress), VideoPlayer, CoffeeDialog, DotGlobe (canvas), ProjectVisual (SVG diagrams), worldDots (dotted map generator), CountUp, Executive Mode toggle and Easter egg. |
| `src/motion/` | `reveal.ts` (shared scroll-reveal observer) and the Executive Mode context. |
| `src/styles/global.css` | Design tokens (colour, type scale, spacing, easing), grid, buttons, reveal system. |

## Design system

- **Palette:** near-black `#0d0e10`, warm ivory `#f4f1e9`, muted gold `#baa17c` (used sparingly),
  and one signal red `#c8281e` taken from Jeff's tie, used only for small dots.
- **Type:** Instrument Serif (display, credentials), Inter Tight (body), JetBrains Mono (metadata).
- **Layout:** 12-column grid, editorial running heads above each section, alternating dark and ivory sections.

## Behaviour notes

- **Reveals** only hide content when `<html>` has `.js-reveal`, which is added when
  IntersectionObserver exists *and* the visitor has not asked for reduced motion. Anything on
  the first screen reveals immediately.
- **Reduced motion:** no reveals, no globe rotation (one still frame), no muted video preview,
  no orbit/diagram animation; counters show final values; the coffee ceremony is skipped.
- **The Incident video** (`public/assets/the-incident.mp4`): one `<video>` element. A muted
  preview loops only while on screen; sound starts only from the play button. Playback pauses
  when scrolled away or when the tab is hidden. Custom controls: play/pause, replay, seek, mute,
  fullscreen (with an iOS fallback). If the file fails to load, a fallback with a direct link appears.
- **Executive Mode: Off** (in the Incident caption, footer and mobile menu) swaps the accents,
  spins the portrait, changes the headline, and restores itself after 9 seconds.
- **Contact:** no real address is configured. Set `CONTACT.email` in `src/content/site.ts` to
  show a mailto link; otherwise the coffee interaction is the contact.

## Assets

| File | Used for |
|---|---|
| `public/assets/jeff-portrait.webp` / `.jpg` | Hero portrait (from `assets-src/jeff-portrait-original.png`) |
| `public/assets/jeff-coffee.webp` / `.jpg` | Contact section and coffee dialog (from `assets-src/coffee-cat.png`) |
| `public/assets/jeff-spinning.png` | Easter-egg cutout (from `assets-src/spinning-cat-original.png` via `scripts/make-cutout.py`) |
| `public/assets/the-incident.mp4` | The Incident (1280×720 H.264/AAC, 60 s, faststart) |
| `public/assets/the-incident-poster.jpg` | Video poster, a frame captured at 0:55 |

`assets-src/` keeps originals and the previous site's audio; it is not shipped.
