/** ui-theme apply wiring: service provision, settings dictionaries riding the
 * locale service, declaration-aware Appearance row registration, snapshot
 * projection into the row store, and HMR collapse recovery. */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { TestRemote, usePinnedBrowserLanguages } from '@deepseek-ai/dsh-client-test-runtime'
import { SettingsScopeBinder } from '@deepseek-ai/dsh-client-ui-settings/client'
import { apply, inject, SETTINGS_NS } from '@deepseek-ai/dsh-client-ui-theme/client'
import type { AmbienceButtonInjected, AmbienceRuntime, AppearanceRowInjected, ThemeRuntime } from '@deepseek-ai/dsh-client-ui-theme/client'
import { THEME_SETTINGS_NAMESPACE, ThemeSettingsSchema } from '../src/theme-settings.ts'
import { AMBIENCE_DEFAULT_VOLUME, AMBIENCE_ENABLED_FIELD, AMBIENCE_SETTINGS_NAMESPACE, AMBIENCE_VOLUME_FIELD, AmbienceSettingsSchema } from '../src/ambience-settings.ts'
import { AmbienceButton } from '../src/client/AmbienceButton.tsx'
import { AppearanceRow } from '../src/client/AppearanceRow.tsx'
import { createAmbienceStore } from '../src/client/ambience-store.ts'
import type { createAppearanceRowStore } from '../src/client/settings-store.ts'

// The service reads its initial locale from the browser; these specs assert
// the shipped Chinese copy, so they state the browser they assume.
usePinnedBrowserLanguages('zh-CN')

const SLOT = 'settings.general.item'

afterEach(() => { vi.unstubAllGlobals() })

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

async function bench(isLoopback = true) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  let preference = 'system'
  let ambienceEnabled = false
  let ambienceVolume = AMBIENCE_DEFAULT_VOLUME
  const namespace = () => ({
    ns: THEME_SETTINGS_NAMESPACE,
    schema: ThemeSettingsSchema.toJSON(),
    value: { preference },
    applies: 'live' as const,
    secrets: [],
    revision: 0,
  })
  const ambienceNamespace = () => ({
    ns: AMBIENCE_SETTINGS_NAMESPACE,
    schema: AmbienceSettingsSchema.toJSON(),
    value: { enabled: ambienceEnabled, volume: ambienceVolume },
    applies: 'live' as const,
    secrets: [],
    revision: 0,
  })
  const describe = vi.fn(() => Promise.resolve({
    rpcId: 'theme-describe' as never,
    result: {
      ok: true as const,
      value: { writable: true, hasDocument: true, namespaces: [namespace(), ambienceNamespace()] },
    },
  }))
  const mutate = vi.fn((request: { ns: string; ops: { op?: string; path?: string[]; value: unknown }[] }) => {
    if (request.ns === THEME_SETTINGS_NAMESPACE) preference = request.ops[0]!.value as string
    if (request.ns === AMBIENCE_SETTINGS_NAMESPACE) {
      for (const op of request.ops) {
        if (op.path?.[0] === AMBIENCE_ENABLED_FIELD) ambienceEnabled = op.value as boolean
        if (op.path?.[0] === AMBIENCE_VOLUME_FIELD) ambienceVolume = op.value as number
      }
    }
    const view = request.ns === THEME_SETTINGS_NAMESPACE ? namespace() : ambienceNamespace()
    return Promise.resolve({
      rpcId: 'theme-mutate' as never,
      result: { ok: true as const, value: view },
    })
  })
  ctx.provide('connection', { api: { settings: { describe, mutate } }, isLoopback } as never)
  // The settings transport and the forwarded-event port the plugin injects.
  new TestRemote(ctx)
  await ctx.plugin(SettingsScopeBinder).await()
  return {
    ctx, slots: ctx.get('slots') as SlotRegistry, locale, describe, mutate,
    setHostPreference: (next: string) => { preference = next },
  }
}

/** Stand in for the settings shell: declare the General item slot from root. */
function declareItems(slots: SlotRegistry): () => void {
  return slots.register(
    { name: 'root', children: { [SLOT]: { kind: 'list', scope: 'root' } } } as never,
    () => null,
  )
}

/** Mirror the framework's inject choreography: bake a real instance from the
 * declared handle and hand its actions to the entry's inject factory. */
function faceOf(slots: SlotRegistry) {
  const entry = slots.entries(SLOT).find(e => e.component === AppearanceRow)!
  const handle = entry.store as ReturnType<typeof createAppearanceRowStore>
  const instance = handle.create()
  const face = (entry.inject as unknown as (a: typeof instance.actions) => AppearanceRowInjected)(instance.actions)
  return { entry, instance, face }
}

describe('ui-theme apply', () => {
  it('declares the slot and locale services', () => {
    expect(inject).toEqual(['slots', 'locale', 'connection', 'remote', 'settingsScope'])
  })

  it('provides the service, registers localized copy, and registers the row (declaration before or after apply)', async () => {
    const before = await bench()
    declareItems(before.slots)
    await before.ctx.plugin({ inject: [...inject], apply }).await()
    expect(before.locale.bind(SETTINGS_NS)('appearance.title')).toBe('外观')
    before.locale.setLocale('en')
    expect(before.locale.bind(SETTINGS_NS)('appearance.title')).toBe('Appearance')
    const entry = before.slots.entries(SLOT).find(e => e.component === AppearanceRow)!
    expect(entry.options).toMatchObject({ id: 'appearance', order: 10 })

    const after = await bench()
    const fiber = after.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(after.slots.entries(SLOT)).toHaveLength(0)
    declareItems(after.slots)
    await Promise.resolve()
    expect(after.slots.entries(SLOT).some(e => e.component === AppearanceRow)).toBe(true)
  })

  it('projects service snapshots into the row store and routes face writes back', async () => {
    const b = await bench()
    declareItems(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const theme = b.ctx.get('theme') as ThemeRuntime
    // An event ahead of any inject hits the unbound-actions arm.
    theme.setTheme('dark')

    const { instance, face } = faceOf(b.slots)
    // The inject-time re-sync sealed the init window: the mirror is current.
    expect(instance.getSnapshot().preference).toBe('dark')
    // Copy rides the standard locale seat: the entry declares the namespace.
    expect(b.slots.entries(SLOT).find(e => e.component === AppearanceRow)!.locale).toBe(SETTINGS_NS)

    face.setTheme('system')
    expect(theme.getTheme().preference).toBe('system')
    expect(instance.getSnapshot().preference).toBe('system')
    await vi.waitFor(() => { expect(b.mutate).toHaveBeenCalledTimes(2) })
  })

  it('loads Host settings at boot, refreshes its namespace, and keeps remote browsers process-local', async () => {
    const b = await bench()
    b.setHostPreference('dark')
    declareItems(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const theme = b.ctx.get('theme') as ThemeRuntime
    await vi.waitFor(() => { expect(theme.getTheme().preference).toBe('dark') })
    b.ctx.remote.$dispatch('settings/document-updated', ['unrelated', 0])
    expect(b.describe).toHaveBeenCalledTimes(2)
    b.setHostPreference('light')
    b.ctx.remote.$dispatch('settings/document-updated', [THEME_SETTINGS_NAMESPACE, 0])
    await vi.waitFor(() => { expect(theme.getTheme().preference).toBe('light') })
    b.setHostPreference('dark')
    b.ctx.emit('connection/reset')
    await vi.waitFor(() => { expect(theme.getTheme().preference).toBe('dark') })

    const remote = await bench(false)
    declareItems(remote.slots)
    await remote.ctx.plugin({ inject: [...inject], apply }).await()
    const remoteTheme = remote.ctx.get('theme') as ThemeRuntime
    remoteTheme.setTheme('dark')
    await Promise.resolve()
    expect(remote.describe).not.toHaveBeenCalled()
    expect(remote.mutate).not.toHaveBeenCalled()
  })

  it('activates before a slow initial settings read and converges when it settles', async () => {
    const b = await bench()
    b.setHostPreference('dark')
    const describe = b.describe.getMockImplementation()!
    const pending = deferred<Awaited<ReturnType<typeof describe>>>()
    b.describe.mockImplementationOnce(() => pending.promise)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const theme = b.ctx.get('theme') as ThemeRuntime
    expect(theme.getTheme().preference).toBe('system')
    pending.resolve(await describe())
    await vi.waitFor(() => { expect(theme.getTheme().preference).toBe('dark') })
    await fiber.dispose()
  })

  it('ignores an invalid preference crossing the settings wire', async () => {
    const b = await bench()
    b.setHostPreference('sepia')
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const theme = b.ctx.get('theme') as ThemeRuntime
    await vi.waitFor(() => { expect(b.describe).toHaveBeenCalledTimes(2) })
    expect(theme.getTheme().preference).toBe('system')
  })

  it('recovers after an HMR collapse of the declaring entry (stale disposer must not block)', async () => {
    const b = await bench()
    const host = declareItems(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    expect(b.slots.entries(SLOT)).toHaveLength(2)

    // Collapse: the declarer dies, the cascade removes our entry while the
    // apply closure still holds its (now stale) disposer.
    host()
    expect(b.slots.entries(SLOT)).toHaveLength(0)

    declareItems(b.slots)
    await Promise.resolve()
    expect(b.slots.entries(SLOT).some(e => e.component === AppearanceRow)).toBe(true)
  })

  it('provides the ambience service and registers its Appearance row (snapshots project, faces route back)', async () => {
    // jsdom has no media element; the service's default factory needs one.
    vi.stubGlobal('Audio', vi.fn(function () {
      return { loop: false, preload: '', src: '', volume: 0, play: vi.fn(() => Promise.resolve()), pause: vi.fn() }
    }))
    const b = await bench()
    declareItems(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const ambience = b.ctx.get('ambience') as AmbienceRuntime
    expect(ambience.getAmbience()).toMatchObject({ enabled: false, volume: AMBIENCE_DEFAULT_VOLUME })
    const entry = b.slots.entries(SLOT).find(e => e.component === AmbienceButton)!
    expect(entry.options).toMatchObject({ id: 'ambience', order: 20 })
    const handle = entry.store as ReturnType<typeof createAmbienceStore>
    const instance = handle.create()
    const face = (entry.inject as unknown as (a: typeof instance.actions) => AmbienceButtonInjected)(instance.actions)
    face.toggle()
    await vi.waitFor(() => { expect(instance.getSnapshot().enabled).toBe(true) })
    expect(ambience.getAmbience().enabled).toBe(true)
    expect(b.mutate).toHaveBeenCalledWith(expect.objectContaining({ ns: AMBIENCE_SETTINGS_NAMESPACE }))
  })

  it('teardown removes the row and the dictionaries; teardown without a declaration is quiet', async () => {
    const b = await bench()
    declareItems(b.slots)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries(SLOT)).toHaveLength(2)
    await fiber.dispose()
    expect(b.slots.entries(SLOT)).toHaveLength(0)
    // Dictionary disposal: translation falls back to the bare key.
    expect(b.locale.bind(SETTINGS_NS)('appearance.title')).toBe('appearance.title')

    // Never-declared bench: the effect disposer's dispose arm stays undefined.
    const quiet = await bench()
    const f2 = quiet.ctx.plugin({ inject: [...inject], apply })
    await f2.await()
    await f2.dispose()
    expect(quiet.slots.entries(SLOT)).toHaveLength(0)
  })
})
