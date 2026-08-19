/** Appearance row store: snapshot-mirror action and the revision guard. */
import { describe, expect, it } from 'vitest'
import { createAppearanceRowStore } from '../src/client/settings-store.ts'

describe('createAppearanceRowStore', () => {
  it('init shape: system preference with modern style at revision -1', () => {
    const store = createAppearanceRowStore().create()
    expect(store.getSnapshot()).toEqual({ preference: 'system', style: 'modern', revision: -1 })
  })

  it('sync mirrors the preference, style, and revision', () => {
    const store = createAppearanceRowStore().create()
    store.actions.sync('dark', 'classic', 0)
    expect(store.getSnapshot()).toEqual({ preference: 'dark', style: 'classic', revision: 0 })
    store.actions.sync('light', 'modern', 2)
    expect(store.getSnapshot().preference).toBe('light')
    expect(store.getSnapshot().style).toBe('modern')
    expect(store.getSnapshot().revision).toBe(2)
  })

  it('revision guard drops stale and duplicate writes', () => {
    const store = createAppearanceRowStore().create()
    store.actions.sync('dark', 'classic', 3)
    store.actions.sync('system', 'modern', 2)
    store.actions.sync('system', 'modern', 3)
    expect(store.getSnapshot().preference).toBe('dark')
    expect(store.getSnapshot().style).toBe('classic')
    expect(store.getSnapshot().revision).toBe(3)
  })
})
