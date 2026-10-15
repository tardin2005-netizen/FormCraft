import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normList } from './normalize'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore'
import { safeStorage } from '../utils/safeStorage'

export interface Note {
  id: string
  /** Dia da aula, AAAA-MM-DD */
  date: string
  subject: string
  body: string
  createdAt: string
  updatedAt: string
}

interface NotesStore {
  notes: Note[]
  hydrate: (notes: Note[]) => void
  addNote: (data: Pick<Note, 'date' | 'subject' | 'body'>) => string
  updateNote: (id: string, updates: Partial<Pick<Note, 'date' | 'subject' | 'body'>>) => void
  deleteNote: (id: string) => void
}

const str = (v: unknown, fb = '') => (typeof v === 'string' ? v : fb)
const normNote = (n: Record<string, any>): Note => ({
  id: n.id, date: str(n.date, new Date().toISOString().slice(0, 10)), subject: str(n.subject), body: str(n.body),
  createdAt: str(n.createdAt, new Date().toISOString()), updatedAt: str(n.updatedAt, str(n.createdAt, new Date().toISOString())),
})

function uid() { return auth.currentUser?.uid }
function saveToFirestore(note: Note) {
  const u = uid()
  if (!u) return
  setDoc(doc(collection(doc(db, 'users', u), 'notes'), note.id), note).catch(() => {})
}
function deleteFromFirestore(id: string) {
  const u = uid()
  if (!u) return
  deleteDoc(doc(collection(doc(db, 'users', u), 'notes'), id)).catch(() => {})
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      hydrate: (notes) => set({ notes: normList(notes, normNote) }),
      addNote: (data) => {
        const now = new Date().toISOString()
        const note: Note = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
        set(s => ({ notes: [note, ...s.notes] }))
        saveToFirestore(note)
        return note.id
      },
      updateNote: (id, updates) => {
        const notes = get().notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
        set({ notes })
        const note = notes.find(n => n.id === id)
        if (note) saveToFirestore(note)
      },
      deleteNote: (id) => {
        set(s => ({ notes: s.notes.filter(n => n.id !== id) }))
        deleteFromFirestore(id)
      },
    }),
    { name: 'formcraft-notes', storage: safeStorage, merge: (p: any, c) => ({ ...c, ...p, notes: normList(p?.notes, normNote) }) }
  )
)
