import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

export type DeadlineType   = 'prova' | 'entrega' | 'projeto' | 'outro'
export type DeadlineStatus = 'pendente' | 'concluido'

export interface Deadline {
  id: string
  titulo: string
  tipo: DeadlineType
  data: string     // YYYY-MM-DD
  peso: number     // 0–100 (%)
  materiaId: string
  hubId: string
  semesterId: string
  status: DeadlineStatus
  criadoEm: string
}

export type DeadlineInput = Omit<Deadline, 'id' | 'criadoEm'>

interface DeadlinesStore {
  deadlines: Deadline[]
  hydrate: (d: Deadline[]) => void
  add: (d: DeadlineInput) => void
  update: (id: string, d: Partial<DeadlineInput>) => void
  remove: (id: string) => void
  toggle: (id: string) => void
}

function fs(item: Deadline) {
  const uid = auth.currentUser?.uid
  if (uid) setDoc(doc(db, 'users', uid, 'deadlines', item.id), item).catch(() => {})
}

export const useDeadlinesStore = create<DeadlinesStore>()(
  persist(
    (set, get) => ({
      deadlines: [],

      hydrate: (deadlines) => set({ deadlines }),

      add: (d) => {
        const item: Deadline = { ...d, id: crypto.randomUUID(), criadoEm: new Date().toISOString() }
        set(s => ({ deadlines: [...s.deadlines, item] }))
        fs(item)
      },

      update: (id, d) => {
        const current = get().deadlines.find(x => x.id === id)
        if (!current) return
        const updated: Deadline = { ...current, ...d }
        set(s => ({ deadlines: s.deadlines.map(x => x.id === id ? updated : x) }))
        fs(updated)
      },

      remove: (id) => {
        set(s => ({ deadlines: s.deadlines.filter(x => x.id !== id) }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(doc(db, 'users', uid, 'deadlines', id)).catch(() => {})
      },

      toggle: (id) => {
        const current = get().deadlines.find(x => x.id === id)
        if (!current) return
        get().update(id, { status: current.status === 'pendente' ? 'concluido' : 'pendente' })
      },
    }),
    { name: 'formcraft-deadlines' }
  )
)
