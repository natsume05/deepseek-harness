/** Ambience preferences stored in the Host user-settings document. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the whale-song soundscape feature. */
export const AMBIENCE_SETTINGS_NAMESPACE = 'ui-ambience'

/** Field carrying whether the whale-song soundscape is enabled. */
export const AMBIENCE_ENABLED_FIELD = 'enabled'

/** Field carrying the ambience volume (0..1). */
export const AMBIENCE_VOLUME_FIELD = 'volume'

/** Default ambience volume when the user-settings document has no override. */
export const AMBIENCE_DEFAULT_VOLUME = 0.4

/** Durable ambience section shared by the Host schema and the browser scope. */
export interface AmbienceSettings {
  /** Whether the whale-song soundscape should play. */
  enabled: boolean
  /** Playback volume (0..1). */
  volume: number
}

/** Durable ambience schema; also the wire envelope the browser scope validates against. */
export const AmbienceSettingsSchema: z<AmbienceSettings> = z.object({
  [AMBIENCE_ENABLED_FIELD]: z.boolean().default(false),
  [AMBIENCE_VOLUME_FIELD]: z.number().min(0).max(1).default(AMBIENCE_DEFAULT_VOLUME),
})
