# OIIA Cat Rave ☕

A one-minute spinning-cat rave set to an OIIA psytrance remix, followed by a sudden,
wholesome coffee break. Vite + React + TypeScript, no animation libraries.

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

## How it works

| Piece | File | Notes |
|---|---|---|
| State machine | `src/state/experience.ts` | `ready → playing → transitioning → coffee`. Events that don't apply to the current phase are ignored, so late audio callbacks can't break the flow. |
| Audio | `src/audio/RaveAudioEngine.ts` | One `<audio>` element. It's routed through an `AudioContext` + `AnalyserNode` only once the context is actually running, so the song never "plays" silently. Autoplay is attempted on load; if blocked, the **Tap to Start the Rave 🎵** button appears. |
| Choreography | `src/rave/choreography.ts` | Pure TS. Reads `audio.currentTime` against a measured beat map (150 BPM, first beat 0.13 s, drops at 6.13 / 31.73 / 44.53 s) and blends in live bass/energy from the analyser. |
| Particles | `src/rave/particles.ts` | One canvas: twinkles, beat sparks, paw prints, "OIIA" word pops, spectrum strip. Sprites are pre-rendered. |
| Scenes | `src/components/` | `RaveScene`, `SpinningCat`, `TransitionOverlay`, `CoffeeScene`. Per-frame work writes `transform`/`opacity` directly; React never re-renders per frame. |

The intro ends on the audio element's real `ended` event. Timeouts only pace the
wind-down → pop → coffee animation.

**Reduced motion** (`prefers-reduced-motion: reduce`): no spinning, flashes, trails or
particle bursts. The cat sways gently to the beat and the transition becomes a cross-fade.
**Skip Intro** is always available.

**Debugging (dev only):** `window.__oiia.engine` and `window.__oiia.state` in the console.
Stripped from production builds.

## Assets

| File | Used for |
|---|---|
| `public/assets/spinning-cat.png` | Transparent cutout of the main cat (349×486) |
| `public/assets/coffee-cat.png` | Coffee scene photo, shown in a framed card |
| `public/assets/oiia-remix.mp3` | Soundtrack (60.3 s) |
| `public/assets/spinning-reference.png` | Motion reference only, not used at runtime |

The cutout is generated from `assets-src/spinning-cat-original.png` (flat `#DDDDDD`
background) by `scripts/make-cutout.py` (needs Pillow, NumPy, SciPy):

```bash
python scripts/make-cutout.py assets-src/spinning-cat-original.png public/assets/spinning-cat.png <preview-dir>
```
