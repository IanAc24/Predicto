export const settings = {
  title: 'Settings',
  placeholder: 'Language, theme and data status will appear here.',
} as const

export type SettingsDict = Record<keyof typeof settings, string>
