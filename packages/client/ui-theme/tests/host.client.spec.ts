import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import { SettingsProvider, settingsNamespace, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import {
  AMBIENCE_DEFAULT_VOLUME, AMBIENCE_SETTINGS_NAMESPACE, DEFAULT_PREFERENCE, DEFAULT_VISUAL_STYLE,
  THEME_SETTINGS_NAMESPACE, apply,
} from '@deepseek-ai/dsh-client-ui-theme'

class MemorySettings extends SettingsProvider {
  readonly writable = true
  protected load(): Promise<Record<string, unknown>> { return Promise.resolve({}) }
  protected persist(_ns: SettingsNamespace, _section: Record<string, unknown>): Promise<void> {
    return Promise.resolve()
  }
}

describe('ui-theme host', () => {
  it('registers, validates, and disposes the durable theme and ambience namespaces with their fiber', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    const fiber = ctx.plugin({ apply })
    await fiber.await()
    const ns = settingsNamespace(THEME_SETTINGS_NAMESPACE)
    expect(ctx.settings.get(ns)).toEqual({ preference: DEFAULT_PREFERENCE, style: DEFAULT_VISUAL_STYLE })
    await ctx.settings.update(ns, { preference: 'dark' })
    expect(ctx.settings.get(ns)).toEqual({ preference: 'dark', style: DEFAULT_VISUAL_STYLE })
    await expect(ctx.settings.update(ns, { preference: 'sepia' })).rejects.toThrow()
    await expect(ctx.settings.update(ns, { style: 'retro' })).rejects.toThrow()
    const ambienceNs = settingsNamespace(AMBIENCE_SETTINGS_NAMESPACE)
    expect(ctx.settings.get(ambienceNs)).toEqual({ enabled: false, volume: AMBIENCE_DEFAULT_VOLUME })
    await ctx.settings.update(ambienceNs, { enabled: true })
    expect(ctx.settings.get(ambienceNs)).toEqual({ enabled: true, volume: AMBIENCE_DEFAULT_VOLUME })
    await expect(ctx.settings.update(ambienceNs, { volume: 2 })).rejects.toThrow()
    await fiber.dispose()
    const remaining = ctx.settings.describe().map(row => row.ns)
    expect(remaining).not.toContain(ns)
    expect(remaining).not.toContain(ambienceNs)
  })

  it('renders the current durable preference and disposes the index transform', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    let transform: ((html: string) => string) | undefined
    let disposed = false
    ctx.provide('webServer', {
      tapIndex: (next: (html: string) => string) => {
        transform = next
        return () => { disposed = true }
      },
    } as WebServer)
    const fiber = ctx.plugin({ apply })
    await fiber.await()
    expect(transform?.('<body></body>')).toContain('const preference = "system"')
    expect(transform?.('<body></body>')).toContain(`const style = "${DEFAULT_VISUAL_STYLE}"`)
    await ctx.settings.update(settingsNamespace(THEME_SETTINGS_NAMESPACE), { preference: 'dark', style: 'classic' })
    expect(transform?.('<body></body>')).toContain('const preference = "dark"')
    expect(transform?.('<body></body>')).toContain('const style = "classic"')
    await fiber.dispose()
    expect(disposed).toBe(true)
    expect(transform?.('<body></body>')).toContain('const preference = "system"')
  })

  it('uses the system preference when only an HTTP server exists', async () => {
    const ctx = new Context()
    let transform: ((html: string) => string) | undefined
    ctx.provide('webServer', {
      tapIndex: (next: (html: string) => string) => {
        transform = next
        return () => undefined
      },
    } as WebServer)
    await ctx.plugin({ apply }).await()
    expect(transform?.('<body></body>')).toContain('const preference = "system"')
  })
})
