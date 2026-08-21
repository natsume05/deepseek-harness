/**
 * Whale-song ambience row in the Appearance settings section: a play/pause
 * toggle (with a warm attention dot when the browser withheld autoplay) and
 * a volume slider. The durable preference lives in the `ui-ambience`
 * namespace; the toggle click doubles as the autoplay user gesture.
 */
import clsx from 'clsx'
import { IconPauseOutline16, IconPlayOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createAmbienceStore } from './ambience-store.ts'
import css from './AmbienceButton.module.css'

/** Injected business face: the ambience service writes. */
export interface AmbienceButtonInjected {
  /** Toggle the soundscape (resumes when an autoplay gesture is pending). */
  toggle: () => void
  /** Set the durable playback volume (0..1). */
  setVolume: (volume: number) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type AmbienceButtonComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createAmbienceStore>>
  & PropsLocale<'settings.theme'> & AmbienceButtonInjected

/**
 * Render the ambience row.
 * @param props - composed slot props.
 * @returns the toggle + volume slider element tree.
 */
export function AmbienceButton({ useStore, toggle, setVolume, t }: AmbienceButtonComponentProps) {
  const state = useStore(s => s)
  const label = state.enabled
    ? (state.pendingGesture ? t('ambience.resume') : t('ambience.pause'))
    : t('ambience.play')
  return (
    <div className={css.group}>
      <div className={css.titleRow}>
        <span className={css.title}>{t('ambience.label')}</span>
        <button
          type="button"
          className={clsx(css.toggle, state.enabled && css.on)}
          aria-label={label}
          aria-pressed={state.enabled}
          onClick={() => { toggle() }}
        >
          {state.enabled && !state.pendingGesture ? <IconPauseOutline16 /> : <IconPlayOutline16 />}
          {state.pendingGesture && <span className={css.attention} aria-hidden="true" />}
        </button>
      </div>
      <label className={css.volume}>
        <span className={css.volumeLabel}>{t('ambience.volume')}</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(state.volume * 100)}
          aria-label={t('ambience.volume')}
          onChange={(event) => { setVolume(Number(event.currentTarget.value) / 100) }}
        />
      </label>
    </div>
  )
}