// NomaiRing: a decorative ring-glyph ornament (Outer Wilds-inspired "ancient
// inscription" feel) — a thin circle with 12 tick marks, four of them longer
// at the cardinal points, and a clean gap. It is pure decoration: it never
// carries information, is aria-hidden, and takes currentColor so consumers
// tint it through their own token-driven color.

import clsx from 'clsx'
import css from './NomaiRing.module.css'

/** Tick angles around the ring, one per 30 degrees. */
const TICKS: readonly number[] = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

/**
 * Render a Nomai ring glyph.
 * @param props.size - outer diameter in px (default 24).
 * @param props.className - extra class for layout placement and tinting.
 * @returns the ring svg (aria-hidden; decorative only).
 */
export function NomaiRing({ size = 24, className }: {
  size?: number | undefined
  className?: string | undefined
}) {
  return (
    <svg
      className={clsx(css.ring, className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" className={css.circle} />
      {TICKS.map(angle => (
        <line
          key={angle}
          x1="12"
          y1="2.5"
          x2="12"
          y2={angle % 90 === 0 ? 5 : 3.8}
          transform={`rotate(${angle} 12 12)`}
          className={css.tick}
        />
      ))}
    </svg>
  )
}
