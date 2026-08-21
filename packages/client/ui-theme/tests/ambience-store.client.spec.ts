/** Ambience row store: snapshot-mirror action and the revision guard. */
import { describe, expect, it } from 'vitest'
import { createAmbienceStore } from '../src/client/ambience-store.ts'
import { AMBIENCE_DEFAULT_VOLUME } from '../src/ambience-settings.ts'

describe('createAmbienceStore', () => {
  it('init shape: disabled, default volume, no pending gesture at revision -1', () => {
    const store = createAmbienceStore().create()
    expect(store.getSnapshot()).toEqual({
      enabled: false, volume: AMBIENCE_DEFAULT_VOLUME, pendingGesture: false, revision: -1,
    })
  })

  it('sync mirrors the snapshot; the revision guard drops stale and duplicate writes', () => {
    const store = createAmbienceStore().create()
    store.actions.sync({ enabled: true, volume: 0.7, pendingGesture: true, revision: 1 })
    expect(store.getSnapshot()).toEqual({ enabled: true, volume: 0.7, pendingGesture: true, revision: 1 })
    store.actions.sync({ enabled: false, volume: 0.2, pendingGesture: false, revision: 0 })
    expect(store.getSnapshot().enabled).toBe(true)
    store.actions.sync({ enabled: false, volume: 0.2, pendingGesture: false, revision: 1 })
    expect(store.getSnapshot().enabled).toBe(true)
    expect(store.getSnapshot().revision).toBe(1)
  })
})