import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

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
  hydrate: (areas: Area[]) => void
}

function d(uid: string, id: string) { return doc(db, 'users', uid, 'areas', id) }

export const useAreasStore = create<AreasStore>()(
  persist(
    (set, get) => ({
      areas: [],
      addArea: (a) => {
        const area: Area = { ...a, id: crypto.randomUUID(), count: 0 }
        set(s => ({ areas: [...s.areas, area] }))
        const uid = auth.currentUser?.uid
        if (uid) setDoc(d(uid, area.id), area).catch(() => {})
      },
      removeArea: (id) => {
        set(s => ({ areas: s.areas.filter(a => a.id !== id) }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(d(uid, id)).catch(() => {})
      },
      updateAreaCount: (id, count) => {
        set(s => ({ areas: s.areas.map(a => a.id === id ? { ...a, count } : a) }))
        const uid = auth.currentUser?.uid
        const area = get().areas.find(a => a.id === id)
        if (uid && area) setDoc(d(uid, id), { ...area, count }).catch(() => {})
      },
      hydrate: (areas) => set({ areas }),
    }),
    { name: 'formcraft-areas' }
  )
)
