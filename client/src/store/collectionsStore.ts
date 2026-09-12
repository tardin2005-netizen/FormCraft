import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Collection {
  id: string
  name: string
  emoji: string
  color: string
  desc: string
  itemIds: string[]
  createdAt: number
}

interface CollectionsStore {
  collections: Collection[]
  addCollection: (c: Omit<Collection, 'id' | 'createdAt'>) => void
  removeCollection: (id: string) => void
  addItemToCollection: (colId: string, itemId: string) => void
  removeItemFromCollection: (colId: string, itemId: string) => void
}

export const useCollectionsStore = create<CollectionsStore>()(
  persist(
    (set) => ({
      collections: [],
      addCollection: (c) => set(s => ({
        collections: [...s.collections, { ...c, id: `col-${Date.now()}`, createdAt: Date.now() }]
      })),
      removeCollection: (id) => set(s => ({ collections: s.collections.filter(c => c.id !== id) })),
      addItemToCollection: (colId, itemId) => set(s => ({
        collections: s.collections.map(c =>
          c.id === colId && !c.itemIds.includes(itemId)
            ? { ...c, itemIds: [...c.itemIds, itemId] }
            : c
        )
      })),
      removeItemFromCollection: (colId, itemId) => set(s => ({
        collections: s.collections.map(c =>
          c.id === colId ? { ...c, itemIds: c.itemIds.filter(i => i !== itemId) } : c
        )
      })),
    }),
    { name: 'formcraft-collections' }
  )
)
