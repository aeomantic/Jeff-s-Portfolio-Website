const base = import.meta.env.BASE_URL

export const ASSETS = {
  spinningCat: `${base}assets/spinning-cat.png`,
  coffeeCat: `${base}assets/coffee-cat.png`,
  music: `${base}assets/oiia-remix.mp3`,
} as const

/** Fallback duration (s) until the audio element reports metadata. */
export const TRACK_DURATION_FALLBACK = 60.3

/**
 * Beat map for "Oiiaioooooiai cat meme psytrance remix".
 *
 * Measured by decoding the MP3 in the browser and fitting a beat grid to the
 * bass-onset envelope: a steady 150.00 BPM, first beat at 0.13 s, and bars
 * that start on the first drop (beat 15, 6.13 s). The choreography reads
 * `audio.currentTime` against this map, so it stays locked to the music
 * through pauses, buffering and background tabs.
 */
export const TRACK = {
  bpm: 150,
  firstBeat: 0.13,
  /** A beat index that starts a bar (the first drop). */
  barAnchorBeat: 15,
} as const

export type SectionKind = 'intro' | 'drop' | 'break' | 'outro' | 'fade'

export interface Section {
  start: number
  kind: SectionKind
  /** Base visual intensity 0..1 when no live analysis is available. */
  level: number
  /** Target spin speed in revolutions per second. 0 = stop and face the camera. */
  spin: number
}

export const SECTIONS: readonly Section[] = [
  { start: 0, kind: 'intro', level: 0.4, spin: 1.0 },
  { start: 1.75, kind: 'intro', level: 0.25, spin: 0 }, // vocal gap: stop and stare
  { start: 2.93, kind: 'intro', level: 0.4, spin: 1.2 },
  { start: 5.3, kind: 'intro', level: 0.25, spin: 0 }, // tiny gap before the drop
  { start: 5.7, kind: 'intro', level: 0.55, spin: 1.6 }, // wind-up
  { start: 6.13, kind: 'drop', level: 0.85, spin: 2.0 },
  { start: 30.53, kind: 'break', level: 0.3, spin: 0 },
  { start: 31.73, kind: 'drop', level: 0.92, spin: 2.3 },
  { start: 43.33, kind: 'break', level: 0.4, spin: 0 },
  { start: 44.53, kind: 'drop', level: 1, spin: 2.7 },
  { start: 57.33, kind: 'outro', level: 0.7, spin: 1.6 },
  { start: 59.33, kind: 'fade', level: 0.35, spin: 0.7 },
]

/** Moments where the kick drum comes back in. */
export const DROPS: readonly number[] = [6.13, 31.73, 44.53]

/** Time ranges where every beat has a kick drum. */
export const KICK_RANGES: ReadonlyArray<readonly [number, number]> = [
  [6.1, 30.5],
  [31.7, 43.3],
  [44.5, 59.3],
]
