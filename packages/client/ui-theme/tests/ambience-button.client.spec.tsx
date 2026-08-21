// @vitest-environment jsdom
/** AmbienceButton behavior: play/pause toggle with the autoplay-gesture
 * attention state, and the volume slider driving the durable write. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { AmbienceButton } from '../src/client/AmbienceButton.tsx'
import type { AmbienceButtonComponentProps } from '../src/client/AmbienceButton.tsx'
import { createAmbienceStore } from '../src/client/ambience-store.ts'
import type { AmbienceSnapshot } from '../src/client/ambience.ts'

afterEach(cleanup)

const COPY: Record<string, string> = {
  'ambience.play': 'Play',
  'ambience.pause': 'Pause',
  'ambience.resume': 'Resume',
  'ambience.volume': 'Volume',
  'ambience.label': 'Ambience',
}

/** Empty global standard-kit hooks (the row reads neither). */
function emptySessions() {
  const store = createSnapshotStore<SessionListState>(
    { ids: [], byId: {}, current: undefined, phase: 'ready', subagentsByParent: {}, jobsBySession: {}, currentAddress: undefined })
  return bindSnapshotSelector(store)
}
function emptyWorkspaces() {
  const store = createSnapshotStore<WorkspaceListState>({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready', error: null,
    baselinesReady: true, recentWorkspaceId: undefined,
  })
  return bindSnapshotSelector(store)
}

function mount(snapshot: AmbienceSnapshot) {
  const store = createAmbienceStore().create()
  store.actions.sync(snapshot)
  const toggle = vi.fn()
  const setVolume = vi.fn()
  const props: AmbienceButtonComponentProps = {
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    toggle,
    setVolume,
  }
  render(<AmbienceButton {...props} />)
  return { store, toggle, setVolume }
}

describe('AmbienceButton', () => {
  it('renders the play affordance and the volume slider from the snapshot', () => {
    mount({ enabled: false, volume: 0.4, pendingGesture: false, revision: 1 })
    expect(screen.getByRole('button', { name: /Play/ })).toBeDefined()
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false')
    const slider = screen.getByRole('slider', { name: /Volume/ }) as HTMLInputElement
    expect(slider.value).toBe('40')
  })

  it('click drives toggle; the slider drives setVolume', () => {
    const b = mount({ enabled: false, volume: 0.4, pendingGesture: false, revision: 1 })
    fireEvent.click(screen.getByRole('button', { name: /Play/ }))
    expect(b.toggle).toHaveBeenCalledOnce()
    fireEvent.change(screen.getByRole('slider', { name: /Volume/ }), { target: { value: '70' } })
    expect(b.setVolume).toHaveBeenCalledWith(0.7)
  })

  it('enabled without a pending gesture shows the pause affordance', () => {
    mount({ enabled: true, volume: 0.6, pendingGesture: false, revision: 2 })
    expect(screen.getByRole('button', { name: /Pause/ })).toBeDefined()
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true')
  })

  it('a withheld autoplay gesture shows the resume affordance and an attention dot', () => {
    const { container } = render(<AmbienceButton {...propsFor({ enabled: true, volume: 0.4, pendingGesture: true, revision: 2 })} />)
    expect(screen.getByRole('button', { name: /Resume/ })).toBeDefined()
    expect(container.querySelector('[class*="attention"]')).not.toBeNull()
  })
})

/** Build full props for a given snapshot (mount helper reuse). */
function propsFor(snapshot: AmbienceSnapshot): AmbienceButtonComponentProps {
  const store = createAmbienceStore().create()
  store.actions.sync(snapshot)
  return {
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    toggle: vi.fn(),
    setVolume: vi.fn(),
  }
}
