import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Area {
  id: string
  emoji: string
  title: string
  desc: string
  count: number
  color: string
}

interface AreasStore {
  areas: Area[]
  addArea: (a: Omit<Area, 'id' | 'count'>) => void
  removeArea: (id: string) => void
  updateAreaCount: (id: string, count: number) => void
}

export const useAreasStore = create<AreasStore>()(
  persist(
    (set) => ({
      areas: [],
      addArea: (a) =>
        set((state) => ({
          areas: [
            ...state.areas,
            { ...a, id: crypto.randomUUID(), count: 0 },
          ],
        })),
      removeArea: (id) =>
        set((state) => ({ areas: state.areas.filter((a) => a.id !== id) })),
      updateAreaCount: (id, count) =>
        set((state) => ({
          areas: state.areas.map((a) => (a.id === id ? { ...a, count } : a)),
        })),
    }),
    { name: 'formcraft-areas' }
  )
)
