import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

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
  hydrate: (collections: Collection[]) => void
}

function d(uid: string, id: string) { return doc(db, 'users', uid, 'collections', id) }

export const useCollectionsStore = create<CollectionsStore>()(
  persist(
    (set, get) => ({
      collections: [],
      addCollection: (c) => {
        const col: Collection = { ...c, id: `col-${Date.now()}`, createdAt: Date.now() }
        set(s => ({ collections: [...s.collections, col] }))
        const uid = auth.currentUser?.uid
        if (uid) setDoc(d(uid, col.id), col).catch(() => {})
      },
      removeCollection: (id) => {
        set(s => ({ collections: s.collections.filter(c => c.id !== id) }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(d(uid, id)).catch(() => {})
      },
      addItemToCollection: (colId, itemId) => {
        set(s => ({
          collections: s.collections.map(c =>
            c.id === colId && !c.itemIds.includes(itemId)
              ? { ...c, itemIds: [...c.itemIds, itemId] }
              : c
          )
        }))
        const uid = auth.currentUser?.uid
        const col = get().collections.find(c => c.id === colId)
        if (uid && col) setDoc(d(uid, colId), col).catch(() => {})
      },
      removeItemFromCollection: (colId, itemId) => {
        set(s => ({
          collections: s.collections.map(c =>
            c.id === colId ? { ...c, itemIds: c.itemIds.filter(i => i !== itemId) } : c
          )
        }))
        const uid = auth.currentUser?.uid
        const col = get().collections.find(c => c.id === colId)
        if (uid && col) setDoc(d(uid, colId), col).catch(() => {})
      },
      hydrate: (collections) => set({ collections }),
    }),
    { name: 'formcraft-collections' }
  )
)
