/**
 * Whale-song ambience quick toggle at the sidebar foot: play/pause (with a
 * warm attention dot when the browser withheld autoplay), icon-only on the
 * rail and icon + label when wide. The volume slider stays in the settings
 * Appearance row; this surface only flips the durable `enabled` preference
 * through the ui-theme ambience service.
 */
import clsx from 'clsx'
import { IconPauseOutline16, IconPlayOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createAmbienceToggleStore } from './ambience-toggle-store.ts'
import css from './AmbienceToggle.module.css'

/** Injected business face: the ambience service toggle write. */
export interface AmbienceToggleInjected {
  /** Toggle the soundscape (resumes when an autoplay gesture is pending). */
  toggle: () => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type AmbienceToggleComponentProps =
  PropsRuntime<'sidebar.footer.action'> & PropsStore<ReturnType<typeof createAmbienceToggleStore>>
  & PropsLocale<'sidebar'> & AmbienceToggleInjected

/**
 * Render the ambience quick toggle.
 * @param props - composed slot props.
 * @returns the footer-action button element tree.
 */
export function AmbienceToggle({ wide, useStore, toggle, t }: AmbienceToggleComponentProps) {
  const state = useStore(s => s)
  const label = state.enabled
    ? (state.pendingGesture ? t('footer.ambience.resume') : t('footer.ambience.pause'))
    : t('footer.ambience.play')
  return (
    <Tooltip label={t('footer.ambience.label')} side="top" delayMs={500} disabled={wide}>
      <button
        type="button"
        className={clsx(css.toggle, state.enabled && css.on, !wide && css.rail)}
        aria-label={label}
        aria-pressed={state.enabled}
        onClick={() => { toggle() }}
      >
        {state.enabled && !state.pendingGesture ? <IconPauseOutline16 /> : <IconPlayOutline16 />}
        {state.pendingGesture && <span className={css.attention} aria-hidden="true" />}
        {wide && <span className={css.label}>{t('footer.ambience.label')}</span>}
      </button>
    </Tooltip>
  )
}
