import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

export type HubToolOverrides = Record<string, { add: string[]; remove: string[] }>

interface HubToolsStore {
  overrides: HubToolOverrides
  addTool: (hubId: string, name: string) => void
  removeTool: (hubId: string, name: string) => void
  hydrate: (overrides: HubToolOverrides) => void
}

function persistRemote(overrides: HubToolOverrides) {
  const uid = auth.currentUser?.uid
  if (uid) setDoc(doc(db, 'users', uid, 'meta', 'hubTools'), { overrides }).catch(() => {})
}

const without = (list: string[], name: string) => list.filter(n => n !== name)

export const useHubToolsStore = create<HubToolsStore>()(
  persist(
    (set, get) => ({
      overrides: {},
      addTool: (hubId, name) => {
        const cur = get().overrides[hubId] ?? { add: [], remove: [] }
        const next = cur.remove.includes(name)
          ? { add: cur.add, remove: without(cur.remove, name) }
          : { add: cur.add.includes(name) ? cur.add : [...cur.add, name], remove: cur.remove }
        const overrides = { ...get().overrides, [hubId]: next }
        set({ overrides }); persistRemote(overrides)
      },
      removeTool: (hubId, name) => {
        const cur = get().overrides[hubId] ?? { add: [], remove: [] }
        const next = cur.add.includes(name)
          ? { add: without(cur.add, name), remove: cur.remove }
          : { add: cur.add, remove: cur.remove.includes(name) ? cur.remove : [...cur.remove, name] }
        const overrides = { ...get().overrides, [hubId]: next }
        set({ overrides }); persistRemote(overrides)
      },
      hydrate: (overrides) => set({ overrides }),
    }),
    { name: 'formcraft-hub-tools' }
  )
)
