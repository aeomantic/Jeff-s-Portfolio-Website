import type { CSSProperties, ReactNode } from 'react'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'p'

interface SplitLinesProps {
  as?: HeadingTag
  lines: ReactNode[]
  className?: string
  id?: string
  /** Seconds before the first line starts rising. */
  delay?: number
}

/** A heading whose lines rise one by one out of their own masks. */
export function SplitLines({ as: Tag = 'h2', lines, className, id, delay = 0 }: SplitLinesProps) {
  return (
    <Tag id={id} className={className} data-reveal="lines" style={{ '--delay': `${delay}s` } as CSSProperties}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span style={{ '--i': i } as CSSProperties}>{line}</span>
        </span>
      ))}
    </Tag>
  )
}

interface RunningHeadProps {
  index: string
  title: string
  aside?: ReactNode
}

/** The thin editorial rule and metadata row that opens each section. */
export function RunningHead({ index, title, aside }: RunningHeadProps) {
  return (
    <div className="running-head mono" aria-hidden="true">
      <span className="running-head__index">({index})</span>
      <span className="running-head__title">{title}</span>
      {aside ? <span className="running-head__aside">{aside}</span> : null}
    </div>
  )
}

interface IconProps {
  size?: number
}

export function ArrowIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 7h11.5M7.5 2 12.5 7l-5 5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function ArrowDownIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v11.5M2 7.5 7 12.5l5-5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function ArrowUpIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 13V1.5M2 6.5 7 1.5l5 5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function PlayIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
    </svg>
  )
}

export function PauseIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 1.5h2.8v11H3zM8.2 1.5H11v11H8.2z" fill="currentColor" />
    </svg>
  )
}

export function ReplayIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.2 7a4.8 4.8 0 1 0 1.5-3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 1v3h3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function SoundIcon({ muted, size = 16 }: IconProps & { muted: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" />
      {muted ? (
        <path d="m10.5 6 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.3" />
      ) : (
        <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.3 3.6a6 6 0 0 1 0 8.8" stroke="currentColor" strokeWidth="1.3" />
      )}
    </svg>
  )
}

export function FullscreenIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function PlusIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
