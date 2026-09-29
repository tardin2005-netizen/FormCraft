import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'bw'
type ThemeMode = Theme | 'system'
type Accent = 'violet' | 'blue' | 'green' | 'orange' | 'pink'

const ACCENT_COLORS: Record<Accent, { accent: string; muted: string }> = {
  violet: { accent: '#7c6ef7', muted: 'rgba(124,110,247,0.15)' },
  blue:   { accent: '#4f8ef7', muted: 'rgba(79,142,247,0.15)' },
  green:  { accent: '#3ecf8e', muted: 'rgba(62,207,142,0.15)' },
  orange: { accent: '#f78c4f', muted: 'rgba(247,140,79,0.15)' },
  pink:   { accent: '#e46ef7', muted: 'rgba(228,110,247,0.15)' },
}

interface ThemeStore {
  /** Theme actually applied. */
  theme: Theme
  /** What the user picked; 'system' follows the OS. */
  mode: ThemeMode
  accent: Accent
  setTheme: (t: Theme) => void
  setMode: (m: ThemeMode) => void
  toggle: () => void
  setAccent: (a: Accent) => void
}

const systemQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null
const systemTheme = (): Theme => (systemQuery && !systemQuery.matches ? 'bw' : 'dark')

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
      mode: 'dark',
      accent: 'violet',
      setTheme: (t) => get().setMode(t),
      setMode: (m) => {
        const theme = m === 'system' ? systemTheme() : m
        set({ mode: m, theme })
        applyTheme(theme, get().accent)
      },
      toggle: () => get().setMode(get().theme === 'dark' ? 'bw' : 'dark'),
      setAccent: (a) => {
        set({ accent: a })
        applyTheme(get().theme, a)
      },
    }),
    {
      name: 'formcraft-prefs',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (!state.mode) state.mode = state.theme
        if (state.mode === 'system') state.theme = systemTheme()
        applyTheme(state.theme, state.accent)
      },
    }
  )
)

systemQuery?.addEventListener('change', () => {
  const { mode, accent } = useThemeStore.getState()
  if (mode !== 'system') return
  const theme = systemTheme()
  useThemeStore.setState({ theme })
  applyTheme(theme, accent)
})

export { ACCENT_COLORS }
export type { Accent, Theme, ThemeMode }
