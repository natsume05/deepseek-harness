/**
 * Footer ambience-toggle store: a mirror of the whale-song ambience service
 * snapshot. The plugin's apply-world change listener is the only writer; the
 * toggle reads via props.useStore.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { AmbienceSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'

/** Store state mirrored from the ambience snapshot (the toggle needs no volume). */
export interface AmbienceToggleState {
  /** Whether the user wants the soundscape playing. */
  enabled: boolean
  /** True while enabled but the browser withheld playback (no gesture yet). */
  pendingGesture: boolean
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
}

/** Declared action shape giving the exported factory a stable return type. */
type AmbienceToggleActions = {
  sync: (draft: AmbienceToggleState, snapshot: AmbienceSnapshot) => void
}

/**
 * Declares the ambience-toggle state and write surface.
 * @returns the store handle.
 */
export function createAmbienceToggleStore(): EngineStoreHandle<AmbienceToggleState, AmbienceToggleActions> {
  return defineStore({
    init: (): AmbienceToggleState => ({ enabled: false, pendingGesture: false, revision: -1 }),
    actions: {
      sync: (draft, snapshot) => {
        if (snapshot.revision <= draft.revision) return
        draft.enabled = snapshot.enabled
        draft.pendingGesture = snapshot.pendingGesture
        draft.revision = snapshot.revision
      },
    },
  })
}
