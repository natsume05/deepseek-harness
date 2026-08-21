/** `sidebar` namespace dictionaries: shell controls (brand row, New Session, fold toggle). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'session.new': '新会话',
  'session.new.label': '新建会话',
  'toggle.open': '打开侧边栏',
  'toggle.collapse': '收起侧边栏',
  'footer.ambience.play': '播放鲸歌音景',
  'footer.ambience.pause': '暂停鲸歌音景',
  'footer.ambience.resume': '点击续播鲸歌音景',
  'footer.ambience.label': '鲸歌音景',
} satisfies Record<string, string>

/** The sidebar namespace key union. */
export type SidebarKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'session.new': 'New Session',
  'session.new.label': 'New session',
  'toggle.open': 'Open sidebar',
  'toggle.collapse': 'Collapse sidebar',
  'footer.ambience.play': 'Play whale-song ambience',
  'footer.ambience.pause': 'Pause whale-song ambience',
  'footer.ambience.resume': 'Click to resume whale-song ambience',
  'footer.ambience.label': 'Whale-song ambience',
} satisfies Record<SidebarKey, string>
