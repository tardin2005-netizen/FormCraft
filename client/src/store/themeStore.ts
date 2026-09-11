import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'bw'
type Accent = 'violet' | 'blue' | 'green' | 'orange' | 'pink'

const ACCENT_COLORS: Record<Accent, { accent: string; muted: string }> = {
  violet: { accent: '#7c6ef7', muted: 'rgba(124,110,247,0.15)' },
  blue:   { accent: '#4f8ef7', muted: 'rgba(79,142,247,0.15)' },
  green:  { accent: '#3ecf8e', muted: 'rgba(62,207,142,0.15)' },
  orange: { accent: '#f78c4f', muted: 'rgba(247,140,79,0.15)' },
  pink:   { accent: '#e46ef7', muted: 'rgba(228,110,247,0.15)' },
}

interface ThemeStore {
  theme: Theme
  accent: Accent
  setTheme: (t: Theme) => void
  toggle: () => void
  setAccent: (a: Accent) => void
}

function applyTheme(theme: Theme, accent: Accent) {
  document.documentElement.setAttribute('data-theme', theme)
  const c = ACCENT_COLORS[accent]
  document.documentElement.style.setProperty('--accent', c.accent)
  document.documentElement.style.setProperty('--accent-muted', c.muted)
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      accent: 'violet',
      setTheme: (t) => {
        set({ theme: t })
        applyTheme(t, get().accent)
      },
      toggle: () => {
        const next = get().theme === 'dark' ? 'bw' : 'dark'
        set({ theme: next })
        applyTheme(next, get().accent)
      },
      setAccent: (a) => {
        set({ accent: a })
        applyTheme(get().theme, a)
      },
    }),
    {
      name: 'formcraft-prefs',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme, state.accent)
      },
    }
  )
)

export { ACCENT_COLORS }
export type { Accent }
