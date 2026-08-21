/**
 * Ambience footer-action store: a mirror of the ambience service snapshot.
 * The plugin's apply-world change listener is the only writer; the button
 * component reads via props.useStore.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import { AMBIENCE_DEFAULT_VOLUME } from '../ambience-settings.ts'
import type { AmbienceSnapshot } from './ambience.ts'

/** Store state mirrored from the ambience snapshot. */
export interface AmbienceRowState {
  /** Whether the user wants the soundscape playing. */
  enabled: boolean
  /** Playback volume (0..1). */
  volume: number
  /** True while enabled but the browser withheld playback (no gesture yet). */
  pendingGesture: boolean
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
}

/** Declared action shape giving the exported factory a stable return type. */
type AmbienceRowActions = {
  sync: (draft: AmbienceRowState, snapshot: AmbienceSnapshot) => void
}

/**
 * Declares the ambience row state and write surface.
 * @returns the store handle.
 */
export function createAmbienceStore(): EngineStoreHandle<AmbienceRowState, AmbienceRowActions> {
  return defineStore({
    init: (): AmbienceRowState => ({
      enabled: false,
      volume: AMBIENCE_DEFAULT_VOLUME,
      pendingGesture: false,
      revision: -1,
    }),
    actions: {
      sync: (draft, snapshot) => {
        if (snapshot.revision <= draft.revision) return
        draft.enabled = snapshot.enabled
        draft.volume = snapshot.volume
        draft.pendingGesture = snapshot.pendingGesture
        draft.revision = snapshot.revision
      },
    },
  })
}
