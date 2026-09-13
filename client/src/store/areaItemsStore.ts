import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

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
  hydrate: (items: AreaItem[]) => void
}

function d(uid: string, id: string) { return doc(db, 'users', uid, 'areaItems', id) }

export const useAreaItemsStore = create<AreaItemsStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const newItem: AreaItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        set(s => ({ items: [...s.items, newItem] }))
        const uid = auth.currentUser?.uid
        if (uid) setDoc(d(uid, newItem.id), newItem).catch(() => {})
      },
      removeItem: (id) => {
        set(s => ({ items: s.items.filter(i => i.id !== id) }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(d(uid, id)).catch(() => {})
      },
      getByArea: (areaId) => get().items.filter(i => i.areaId === areaId),
      hydrate: (items) => set({ items }),
    }),
    { name: 'formcraft-area-items' }
  )
)
