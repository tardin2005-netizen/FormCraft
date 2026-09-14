import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

export interface SavedLink {
  id: string
  url: string
  title: string
  desc: string
  favicon: string
  ogImage?: string
  areaId: string
  tags: string[]
  type: 'link' | 'pdf' | 'nota' | 'imagem' | 'prompt'
  savedAt: number
  color?: string
}

interface LinksStore {
  links: SavedLink[]
  addLink: (link: Omit<SavedLink, 'id' | 'savedAt'>) => void
  removeLink: (id: string) => void
  hydrate: (links: SavedLink[]) => void
}

function d(uid: string, id: string) { return doc(db, 'users', uid, 'links', id) }

export const useLinksStore = create<LinksStore>()(
  persist(
    (set) => ({
      links: [],
      addLink: (link) => {
        const newLink: SavedLink = { ...link, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), savedAt: Date.now() }
        set(s => ({ links: [newLink, ...s.links] }))
        const uid = auth.currentUser?.uid
        if (uid) setDoc(d(uid, newLink.id), newLink).catch(() => {})
      },
      removeLink: (id) => {
        set(s => ({ links: s.links.filter(l => l.id !== id) }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(d(uid, id)).catch(() => {})
      },
      hydrate: (links) => set({ links }),
    }),
    { name: 'formcraft-links' }
  )
)
