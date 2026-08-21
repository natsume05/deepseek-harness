/** `settings.theme` namespace dictionaries (the Appearance row's copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'appearance.title': '外观',
  'appearance.light': '浅色',
  'appearance.dark': '深色',
  'appearance.system': '跟随系统',
  'appearance.style.title': '视觉风格',
  'appearance.style.classic': '经典',
  'appearance.style.modern': '深空',
  'appearance.style.whale-song': '鲸歌',
  'ambience.play': '播放鲸歌音景',
  'ambience.pause': '暂停鲸歌音景',
  'ambience.resume': '点击续播鲸歌音景',
  'ambience.volume': '鲸歌音景音量',
  'ambience.label': '鲸歌音景',
} satisfies Record<string, string>

/** The settings.theme namespace key union. */
export type ThemeKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'appearance.title': 'Appearance',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'appearance.style.title': 'Visual style',
  'appearance.style.classic': 'Classic',
  'appearance.style.modern': 'Deep Space',
  'appearance.style.whale-song': 'Whale Song',
  'ambience.play': 'Play whale-song ambience',
  'ambience.pause': 'Pause whale-song ambience',
  'ambience.resume': 'Click to resume whale-song ambience',
  'ambience.volume': 'Whale-song ambience volume',
  'ambience.label': 'Whale-song ambience',
} satisfies Record<ThemeKey, string>
