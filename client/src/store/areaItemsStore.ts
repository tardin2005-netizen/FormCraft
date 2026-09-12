import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AreaItemType = 'link' | 'note' | 'file'

export interface AreaItem {
  id: string
  areaId: string
  type: AreaItemType
  title: string
  url?: string
  content?: string
  createdAt: string
}

interface AreaItemsStore {
  items: AreaItem[]
  addItem: (item: Omit<AreaItem, 'id' | 'createdAt'>) => void
  removeItem: (id: string) => void
  getByArea: (areaId: string) => AreaItem[]
}

export const useAreaItemsStore = create<AreaItemsStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      getByArea: (areaId) => get().items.filter((i) => i.areaId === areaId),
    }),
    { name: 'formcraft-area-items' }
  )
)
