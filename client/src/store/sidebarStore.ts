import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarState = 'expanded' | 'compact' | 'hidden'

const LEFT_CYCLE:  SidebarState[] = ['expanded', 'compact']
const RIGHT_CYCLE: SidebarState[] = ['expanded', 'compact', 'hidden']

export const LEFT_DEFAULT_WIDTH  = 220
export const LEFT_MIN_WIDTH      = 140
export const LEFT_MAX_WIDTH      = 480

export const RIGHT_DEFAULT_WIDTH = 264
export const RIGHT_MIN_WIDTH     = 180
export const RIGHT_MAX_WIDTH     = 480

interface SidebarStore {
  leftState: SidebarState
  rightState: SidebarState
  leftCustomWidth: number
  rightCustomWidth: number
  cycleLeft: () => void
  cycleRight: () => void
  setLeft: (s: SidebarState) => void
  setRight: (s: SidebarState) => void
  setLeftCustomWidth: (w: number) => void
  setRightCustomWidth: (w: number) => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      leftState: 'expanded',
      rightState: 'compact',
      leftCustomWidth: LEFT_DEFAULT_WIDTH,
      rightCustomWidth: RIGHT_DEFAULT_WIDTH,
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
      setLeftCustomWidth:  (w) => set({ leftCustomWidth:  Math.max(LEFT_MIN_WIDTH,  Math.min(LEFT_MAX_WIDTH,  w)) }),
      setRightCustomWidth: (w) => set({ rightCustomWidth: Math.max(RIGHT_MIN_WIDTH, Math.min(RIGHT_MAX_WIDTH, w)) }),
    }),
    { name: 'formcraft-sidebar' }
  )
)
