/** Ambience-toggle store: snapshot-mirror action and the revision guard. */
import { describe, expect, it } from 'vitest'
import { createAmbienceToggleStore } from '../src/client/ambience-toggle-store.ts'

describe('createAmbienceToggleStore', () => {
  it('init shape: disabled, no pending gesture at revision -1', () => {
    const store = createAmbienceToggleStore().create()
    expect(store.getSnapshot()).toEqual({ enabled: false, pendingGesture: false, revision: -1 })
  })

  it('sync mirrors the snapshot; the revision guard drops stale and duplicate writes', () => {
    const store = createAmbienceToggleStore().create()
    store.actions.sync({ enabled: true, volume: 0.4, pendingGesture: true, revision: 1 })
    expect(store.getSnapshot()).toEqual({ enabled: true, pendingGesture: true, revision: 1 })
    store.actions.sync({ enabled: false, volume: 0.4, pendingGesture: false, revision: 0 })
    expect(store.getSnapshot().enabled).toBe(true)
    store.actions.sync({ enabled: false, volume: 0.4, pendingGesture: false, revision: 1 })
    expect(store.getSnapshot().enabled).toBe(true)
    expect(store.getSnapshot().revision).toBe(1)
  })
})
