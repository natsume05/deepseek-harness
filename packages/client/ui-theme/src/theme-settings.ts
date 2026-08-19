/** Theme preferences stored in the Host user-settings document. */

import z from '@deepseek-ai/schemastery'

/** Built-in preferences accepted at the registry and settings boundaries. */
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const

/** Visual styles: the classic snapshot (pre-redesign tokens) and the modern design. */
export const VISUAL_STYLES = ['classic', 'modern'] as const

/** Settings namespace owned by the theme plugin. */
export const THEME_SETTINGS_NAMESPACE = 'ui-theme'

/** Field carrying the selected built-in theme preference. */
export const THEME_PREFERENCE_FIELD = 'preference'

/** Field carrying the selected visual style. */
export const VISUAL_STYLE_FIELD = 'style'

/** Theme preference persisted by the product Appearance row. */
export type ThemePreference = typeof THEME_PREFERENCES[number]

/** Visual style persisted by the product Appearance row. */
export type VisualStyle = typeof VISUAL_STYLES[number]

/** Default preference when the user-settings document has no override. */
export const DEFAULT_PREFERENCE: ThemePreference = 'system'

/** Default visual style (the modern design); `classic` is the rollback snapshot. */
export const DEFAULT_VISUAL_STYLE: VisualStyle = 'modern'

/** Durable theme section shared by the Host schema and the browser scope. */
export interface ThemeSettings {
  /** Selected built-in preference. */
  preference: ThemePreference
  /** Selected visual style. */
  style: VisualStyle
}

/** Durable theme schema; also the wire envelope the browser scope validates against. */
export const ThemeSettingsSchema: z<ThemeSettings> = z.object({
  [THEME_PREFERENCE_FIELD]: z.union([...THEME_PREFERENCES]).default(DEFAULT_PREFERENCE),
  [VISUAL_STYLE_FIELD]: z.union([...VISUAL_STYLES]).default(DEFAULT_VISUAL_STYLE),
})

/**
 * Narrow one wire or registry value to a persistable preference.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in preference.
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.some(preference => preference === value)
}

/**
 * Narrow one wire or registry value to a persistable visual style.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in visual style.
 */
export function isVisualStyle(value: unknown): value is VisualStyle {
  return VISUAL_STYLES.some(style => style === value)
}
