/** Registers the sidebar shell into the layout-owned slot. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the ui-theme ambience service (ctx.ambience) and snapshot.
import type { AmbienceSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'
import type { SidebarRootInjected } from './contract/slots.ts'
import { SidebarRoot } from './SidebarRoot.tsx'
import { AmbienceToggle } from './AmbienceToggle.tsx'
import type { AmbienceToggleInjected } from './AmbienceToggle.tsx'
import { createAmbienceToggleStore } from './ambience-toggle-store.ts'
import { en, zh, type SidebarKey } from './locales.ts'

export type {
  SidebarFooterActionOwnerProps, SidebarRootComponentProps, SidebarRootInjected,
  SidebarSectionOwnerProps, SidebarSettingsOwnerProps,
} from './contract/slots.ts'
export type { SidebarKey } from './locales.ts'
export type { AmbienceToggleComponentProps, AmbienceToggleInjected } from './AmbienceToggle.tsx'
export type { AmbienceToggleState } from './ambience-toggle-store.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Sidebar shell controls copy. */
    sidebar: SidebarKey
  }
}

/** Dictionary namespace owned by this plugin (shell controls copy). */
const NS = 'sidebar'

/** Services required by the sidebar plugin. */
export const inject = ['slots', 'layout', 'sessions', 'workspaces', 'locale', 'ambience']

/** Registers the sidebar shell and its service callbacks.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sidebar: dictionaries')

  const injectProps = (): SidebarRootInjected => ({
    // The shell's New Session button rides the runtime's shared action
    // (current Session Workspace, then recent Workspace).
    startSession: (workspaceId) => { ctx.workspaces.startSession(workspaceId) },
    toggleSidebar: () => { ctx.layout.toggleSidebar() },
  })
  ctx.effect(
    () => ctx.slots.register({
      name: 'sidebar',
      locale: NS,
      // The shell owns geometry; ui-workspace registers the whole browsing
      // region (header, search, session list, workspace dialogs), ui-settings
      // registers the foot trigger + settings panel.
      children: {
        'sidebar.workspaces': { kind: 'single', scope: 'root' },
        'sidebar.settings': { kind: 'single', scope: 'root' },
        'sidebar.footer.action': { kind: 'list', scope: 'root' },
      },
      inject: injectProps,
    }, SidebarRoot),
    'ui-sidebar: slot registration',
  )

  // Whale-song ambience quick toggle at the foot: a thin view over the
  // ui-theme ambience service (the settings Appearance row owns volume).
  const ambienceStore = createAmbienceToggleStore()
  let ambienceBound: BoundActions<typeof ambienceStore> | undefined
  const syncAmbience = (snapshot: AmbienceSnapshot): void => {
    ambienceBound?.sync(snapshot)
  }
  ctx.on('ambience/change', syncAmbience)
  const ambienceInjected = (actions: BoundActions<typeof ambienceStore>): AmbienceToggleInjected => {
    ambienceBound = actions
    syncAmbience(ctx.ambience.getAmbience())
    return {
      toggle: () => { void ctx.ambience.toggle() },
    }
  }
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'ambience-toggle',
    order: 10,
    store: ambienceStore,
    locale: NS,
    inject: ambienceInjected,
  }, AmbienceToggle))
}
