import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

interface SavedToolsStore {
  saved: string[]
  saveTool: (name: string) => void
  unsaveTool: (name: string) => void
  isSaved: (name: string) => boolean
  hydrate: (saved: string[]) => void
}

function fsDoc(uid: string) {
  return doc(db, 'users', uid, 'meta', 'savedTools')
}

export const useSavedToolsStore = create<SavedToolsStore>()(
  persist(
    (set, get) => ({
      saved: [],
      saveTool: (name) => {
        const next = get().saved.includes(name) ? get().saved : [...get().saved, name]
        set({ saved: next })
        const uid = auth.currentUser?.uid
        if (uid) setDoc(fsDoc(uid), { saved: next }).catch(() => {})
      },
      unsaveTool: (name) => {
        const next = get().saved.filter(n => n !== name)
        set({ saved: next })
        const uid = auth.currentUser?.uid
        if (uid) setDoc(fsDoc(uid), { saved: next }).catch(() => {})
      },
      isSaved: (name) => get().saved.includes(name),
      hydrate: (saved) => set({ saved }),
    }),
    { name: 'formcraft-saved-tools' }
  )
)
