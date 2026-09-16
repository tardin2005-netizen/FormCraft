import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarState = 'expanded' | 'compact' | 'hidden'

const LEFT_CYCLE:  SidebarState[] = ['expanded', 'compact']
const RIGHT_CYCLE: SidebarState[] = ['expanded', 'compact', 'hidden']

interface SidebarStore {
  leftState: SidebarState
  rightState: SidebarState
  cycleLeft: () => void
  cycleRight: () => void
  setLeft: (s: SidebarState) => void
  setRight: (s: SidebarState) => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      leftState: 'expanded',
      rightState: 'compact',
      cycleLeft: () => {
        const cur = get().leftState
        const idx = LEFT_CYCLE.indexOf(cur === 'hidden' ? 'compact' : cur)
        set({ leftState: LEFT_CYCLE[(idx + 1) % LEFT_CYCLE.length] })
      },
      cycleRight: () => {
        const cur = get().rightState
        set({ rightState: RIGHT_CYCLE[(RIGHT_CYCLE.indexOf(cur) + 1) % RIGHT_CYCLE.length] })
      },
      setLeft: (s) => set({ leftState: s }),
      setRight: (s) => set({ rightState: s }),
    }),
    { name: 'formcraft-sidebar' }
  )
)
