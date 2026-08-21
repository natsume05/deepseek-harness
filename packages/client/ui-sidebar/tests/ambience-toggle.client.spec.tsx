// @vitest-environment jsdom
/** AmbienceToggle behavior: footer quick toggle with the autoplay-gesture
 * attention state, icon-only on the rail and icon + label when wide. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { AmbienceToggle } from '../src/client/AmbienceToggle.tsx'
import type { AmbienceToggleComponentProps } from '../src/client/AmbienceToggle.tsx'
import { createAmbienceToggleStore } from '../src/client/ambience-toggle-store.ts'

afterEach(cleanup)

const COPY: Record<string, string> = {
  'footer.ambience.play': 'Play',
  'footer.ambience.pause': 'Pause',
  'footer.ambience.resume': 'Resume',
  'footer.ambience.label': 'Ambience',
}

/** Empty global standard-kit hooks (the toggle reads neither). */
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

function mount(wide: boolean, enabled: boolean, pendingGesture = false) {
  const store = createAmbienceToggleStore().create()
  store.actions.sync({ enabled, volume: 0.4, pendingGesture, revision: 1 })
  const toggle = vi.fn()
  const props: AmbienceToggleComponentProps = {
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    toggle,
    wide,
  }
  render(<AmbienceToggle {...props} />)
  return { toggle }
}

describe('AmbienceToggle', () => {
  it('renders the play affordance (icon-only on the rail) from the snapshot', () => {
    mount(false, false)
    expect(screen.getByRole('button', { name: /Play/ })).toBeDefined()
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false')
  })

  it('click drives the service toggle', () => {
    const b = mount(true, false)
    fireEvent.click(screen.getByRole('button', { name: /Play/ }))
    expect(b.toggle).toHaveBeenCalledOnce()
  })

  it('wide shows the label; enabled without a pending gesture shows pause', () => {
    mount(true, true)
    expect(screen.getByRole('button', { name: /Pause/ })).toBeDefined()
    expect(screen.getByText('Ambience')).toBeDefined()
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true')
  })

  it('a withheld autoplay gesture shows the resume affordance and an attention dot', () => {
    const { container } = render(<AmbienceToggle {...propsFor(true, true, true)} />)
    expect(screen.getByRole('button', { name: /Resume/ })).toBeDefined()
    expect(container.querySelector('[class*="attention"]')).not.toBeNull()
  })
})

/** Build full props for a given snapshot (mount helper reuse). */
function propsFor(wide: boolean, enabled: boolean, pendingGesture = false): AmbienceToggleComponentProps {
  const store = createAmbienceToggleStore().create()
  store.actions.sync({ enabled, volume: 0.4, pendingGesture, revision: 1 })
  return {
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    toggle: vi.fn(),
    wide,
  }
}
