import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarState = 'expanded' | 'compact' | 'hidden'

const CYCLE: SidebarState[] = ['expanded', 'compact', 'hidden']

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
        set({ leftState: CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length] })
      },
      cycleRight: () => {
        const cur = get().rightState
        set({ rightState: CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length] })
      },
      setLeft: (s) => set({ leftState: s }),
      setRight: (s) => set({ rightState: s }),
    }),
    { name: 'formcraft-sidebar' }
  )
)
