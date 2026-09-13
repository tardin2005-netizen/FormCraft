import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { type ModuleType } from '../data/contextTemplates'

export interface ContentItem {
  id: string
  workspaceId: string
  moduleId: string
  contentType: ModuleType
  data: Record<string, unknown>
  tags: string[]
  starred: boolean
  createdAt: string
  updatedAt: string
}

interface ContentItemsStore {
  items: ContentItem[]
  addItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => ContentItem
  updateItem: (id: string, patch: Partial<Omit<ContentItem, 'id'>>) => void
  removeItem: (id: string) => void
  toggleStar: (id: string) => void
  getByModule: (moduleId: string) => ContentItem[]
  getByWorkspace: (workspaceId: string) => ContentItem[]
  hydrate: (items: ContentItem[]) => void
}

function d(uid: string, id: string) {
  return doc(db, 'users', uid, 'contentItems', id)
}

export const useContentItemsStore = create<ContentItemsStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const now = new Date().toISOString()
        const newItem: ContentItem = { ...item, id: `ci-${crypto.randomUUID()}`, createdAt: now, updatedAt: now }
        set(s => ({ items: [...s.items, newItem] }))
        const uid = auth.currentUser?.uid
        if (uid) setDoc(d(uid, newItem.id), newItem).catch(() => {})
        return newItem
      },

      updateItem: (id, patch) => {
        const updatedAt = new Date().toISOString()
        set(s => ({
          items: s.items.map(i => i.id === id ? { ...i, ...patch, updatedAt } : i),
        }))
        const uid = auth.currentUser?.uid
        const item = get().items.find(i => i.id === id)
        if (uid && item) setDoc(d(uid, id), { ...item, ...patch, updatedAt }).catch(() => {})
      },

      removeItem: (id) => {
        set(s => ({ items: s.items.filter(i => i.id !== id) }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(d(uid, id)).catch(() => {})
      },

      toggleStar: (id) => {
        const item = get().items.find(i => i.id === id)
        if (!item) return
        const starred = !item.starred
        set(s => ({ items: s.items.map(i => i.id === id ? { ...i, starred } : i) }))
        const uid = auth.currentUser?.uid
        if (uid) setDoc(d(uid, id), { ...item, starred }).catch(() => {})
      },

      getByModule: (moduleId) => get().items.filter(i => i.moduleId === moduleId),
      getByWorkspace: (workspaceId) => get().items.filter(i => i.workspaceId === workspaceId),

      hydrate: (items) => set({ items }),
    }),
    { name: 'formcraft-content-items' }
  )
)
