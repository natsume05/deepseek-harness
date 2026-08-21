/** Host registration for the browser theme preference and pre-plugin palette. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import { injectBootTheme } from './boot-theme.ts'
import {
  DEFAULT_PREFERENCE, DEFAULT_VISUAL_STYLE, THEME_SETTINGS_NAMESPACE, ThemeSettingsSchema,
  type ThemePreference, type ThemeSettings, type VisualStyle,
} from './theme-settings.ts'
import { AMBIENCE_SETTINGS_NAMESPACE, AmbienceSettingsSchema } from './ambience-settings.ts'

export {
  DEFAULT_PREFERENCE, DEFAULT_VISUAL_STYLE, THEME_PREFERENCE_FIELD, THEME_PREFERENCES,
  THEME_SETTINGS_NAMESPACE, VISUAL_STYLE_FIELD, VISUAL_STYLES,
  type ThemePreference, type ThemeSettings, type VisualStyle,
} from './theme-settings.ts'
export {
  AMBIENCE_DEFAULT_VOLUME, AMBIENCE_ENABLED_FIELD, AMBIENCE_SETTINGS_NAMESPACE, AMBIENCE_VOLUME_FIELD,
  type AmbienceSettings,
} from './ambience-settings.ts'

const THEME_NAMESPACE = settingsNamespace(THEME_SETTINGS_NAMESPACE)
const AMBIENCE_NAMESPACE = settingsNamespace(AMBIENCE_SETTINGS_NAMESPACE)

/** Read the registered section or use the schema defaults without a settings provider. */
function readSettings(ctx: Context): { preference: ThemePreference; style: VisualStyle } {
  const settings = ctx.get('settings')
  if (settings === undefined) return { preference: DEFAULT_PREFERENCE, style: DEFAULT_VISUAL_STYLE }
  const section = settings.get(THEME_NAMESPACE) as ThemeSettings | undefined
  if (section === undefined) return { preference: DEFAULT_PREFERENCE, style: DEFAULT_VISUAL_STYLE }
  return { preference: section.preference, style: section.style }
}

/**
 * Register the durable theme section and initial-theme index transform when
 * their optional Host services are composed.
 * @param ctx - Host context that may acquire settings and HTTP services.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(THEME_NAMESPACE, ThemeSettingsSchema)
    settingsCtx.settings.register(AMBIENCE_NAMESPACE, AmbienceSettingsSchema)
  })
  ctx.inject(['webServer'], (httpCtx) => {
    httpCtx.effect(
      () => httpCtx.webServer.tapIndex((html) => {
        const { preference, style } = readSettings(ctx)
        return injectBootTheme(html, preference, style)
      }),
      'client-ui-theme: initial theme bootstrap',
    )
  })
}
