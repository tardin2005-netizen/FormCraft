import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc, collection, writeBatch } from 'firebase/firestore'
import { type WorkspaceContext, type ModuleType, type ModuleLayout } from '../data/contextTemplates'

export interface WorkspaceModule {
  id: string
  type: ModuleType
  name: string
  icon: string
  order: number
  enabled: boolean
  layout: ModuleLayout
}

export interface Workspace {
  id: string
  name: string
  context: WorkspaceContext
  icon: string
  color: string
  modules: WorkspaceModule[]
  createdAt: string
}

interface WorkspacesStore {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  addWorkspace: (ws: Omit<Workspace, 'id' | 'createdAt'>) => Workspace
  removeWorkspace: (id: string) => void
  updateWorkspace: (id: string, patch: Partial<Omit<Workspace, 'id'>>) => void
  setActive: (id: string | null) => void
  hydrate: (workspaces: Workspace[]) => void
}

function wsDoc(uid: string, id: string) {
  return doc(db, 'users', uid, 'workspaces', id)
}

export const useWorkspacesStore = create<WorkspacesStore>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,

      addWorkspace: (ws) => {
        const workspace: Workspace = {
          ...ws,
          id: `ws-${crypto.randomUUID()}`,
          createdAt: new Date().toISOString(),
        }
        set(s => ({ workspaces: [...s.workspaces, workspace] }))
        const uid = auth.currentUser?.uid
        if (uid) setDoc(wsDoc(uid, workspace.id), workspace).catch(() => {})
        return workspace
      },

      removeWorkspace: (id) => {
        set(s => ({
          workspaces: s.workspaces.filter(w => w.id !== id),
          activeWorkspaceId: s.activeWorkspaceId === id ? null : s.activeWorkspaceId,
        }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(wsDoc(uid, id)).catch(() => {})
      },

      updateWorkspace: (id, patch) => {
        set(s => ({
          workspaces: s.workspaces.map(w => w.id === id ? { ...w, ...patch } : w),
        }))
        const uid = auth.currentUser?.uid
        const ws = get().workspaces.find(w => w.id === id)
        if (uid && ws) setDoc(wsDoc(uid, id), { ...ws, ...patch }).catch(() => {})
      },

      setActive: (id) => set({ activeWorkspaceId: id }),

      hydrate: (workspaces) => set({ workspaces }),
    }),
    { name: 'formcraft-workspaces' }
  )
)
