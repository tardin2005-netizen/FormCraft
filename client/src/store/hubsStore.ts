import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore'

export type HubType = 'faculdade' | 'personal' | 'projects' | 'custom'

export interface HubChat {
  id: string
  hubId: string
  name: string
  emoji: string
  createdAt: string
}

export interface HubChatMessage {
  id: string
  chatId: string
  hubId: string
  text: string
  url?: string
  subjectId?: string
  createdAt: string
}

export interface Hub {
  id: string
  type: HubType
  name: string
  emoji: string
  color: string
  createdAt: string
}

export interface Semester {
  id: string
  hubId: string
  name: string
  year: number
  period: '1' | '2'
}

export interface Subject {
  id: string
  hubId: string
  semesterId: string
  name: string
  emoji: string
  color: string
  professor?: string
  credits?: number
}

export interface ClassItem {
  id: string
  hubId: string
  semesterId: string
  subjectId: string
  title: string
  type: 'aula' | 'trabalho' | 'prova' | 'extra'
  date: string
  notes?: string
}

export interface HubContent {
  id: string
  hubId: string
  semesterId?: string
  subjectId?: string
  classId?: string
  type: 'link' | 'note' | 'pdf' | 'file'
  title: string
  url?: string
  content?: string
  createdAt: string
}

interface HubsStore {
  hubs: Hub[]
  semesters: Semester[]
  subjects: Subject[]
  classes: ClassItem[]
  contents: HubContent[]
  hubChats: HubChat[]
  hubChatMessages: HubChatMessage[]

  addHub: (h: Omit<Hub, 'id' | 'createdAt'>) => void
  removeHub: (id: string) => void

  addSemester: (s: Omit<Semester, 'id'>) => void
  removeSemester: (id: string) => void

  addSubject: (s: Omit<Subject, 'id'>) => void
  removeSubject: (id: string) => void

  addClassItem: (c: Omit<ClassItem, 'id'>) => void
  removeClassItem: (id: string) => void

  addContent: (c: Omit<HubContent, 'id' | 'createdAt'>) => void
  removeContent: (id: string) => void

  addChat: (c: Omit<HubChat, 'id' | 'createdAt'>) => void
  removeChat: (id: string) => void

  addChatMessage: (m: Omit<HubChatMessage, 'id' | 'createdAt'>) => void
  removeChatMessage: (id: string) => void

  hydrateHubs: (hubs: Hub[]) => void
  hydrateSemesters: (s: Semester[]) => void
  hydrateSubjects: (s: Subject[]) => void
  hydrateClasses: (c: ClassItem[]) => void
  hydrateContents: (c: HubContent[]) => void
  hydrateChats: (c: HubChat[]) => void
  hydrateChatMessages: (c: HubChatMessage[]) => void
}

function d(uid: string, col: string, id: string) {
  return doc(db, 'users', uid, col, id)
}

function fs<T extends object>(col: string, item: T & { id: string }) {
  const uid = auth.currentUser?.uid
  if (uid) setDoc(d(uid, col, item.id), item).catch(() => {})
}
function fsDel(col: string, id: string) {
  const uid = auth.currentUser?.uid
  if (uid) deleteDoc(d(uid, col, id)).catch(() => {})
}

export const useHubsStore = create<HubsStore>()(
  persist(
    (set) => ({
      hubs: [],
      semesters: [],
      subjects: [],
      classes: [],
      contents: [],
      hubChats: [],
      hubChatMessages: [],

      addHub: (h) => {
        const hub: Hub = { ...h, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        set(s => ({ hubs: [...s.hubs, hub] }))
        fs('hubs', hub)
      },
      removeHub: (id) => {
        set(s => ({ hubs: s.hubs.filter(h => h.id !== id) }))
        fsDel('hubs', id)
      },

      addSemester: (sem) => {
        const semester: Semester = { ...sem, id: crypto.randomUUID() }
        set(s => ({ semesters: [...s.semesters, semester] }))
        fs('hubSemesters', semester)
      },
      removeSemester: (id) => {
        set(s => ({ semesters: s.semesters.filter(x => x.id !== id) }))
        fsDel('hubSemesters', id)
      },

      addSubject: (sub) => {
        const subject: Subject = { ...sub, id: crypto.randomUUID() }
        set(s => ({ subjects: [...s.subjects, subject] }))
        fs('hubSubjects', subject)
      },
      removeSubject: (id) => {
        set(s => ({ subjects: s.subjects.filter(x => x.id !== id) }))
        fsDel('hubSubjects', id)
      },

      addClassItem: (cl) => {
        const item: ClassItem = { ...cl, id: crypto.randomUUID() }
        set(s => ({ classes: [...s.classes, item] }))
        fs('hubClasses', item)
      },
      removeClassItem: (id) => {
        set(s => ({ classes: s.classes.filter(x => x.id !== id) }))
        fsDel('hubClasses', id)
      },

      addContent: (c) => {
        const content: HubContent = { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        set(s => ({ contents: [...s.contents, content] }))
        fs('hubContents', content)
      },
      removeContent: (id) => {
        set(s => ({ contents: s.contents.filter(x => x.id !== id) }))
        fsDel('hubContents', id)
      },

      addChat: (c) => {
        const chat: HubChat = { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        set(s => ({ hubChats: [...s.hubChats, chat] }))
        fs('hubChats', chat)
      },
      removeChat: (id) => {
        set(s => ({ hubChats: s.hubChats.filter(x => x.id !== id) }))
        fsDel('hubChats', id)
      },

      addChatMessage: (m) => {
        const msg: HubChatMessage = { ...m, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        set(s => ({ hubChatMessages: [...s.hubChatMessages, msg] }))
        fs('hubChatMessages', msg)
      },
      removeChatMessage: (id) => {
        set(s => ({ hubChatMessages: s.hubChatMessages.filter(x => x.id !== id) }))
        fsDel('hubChatMessages', id)
      },

      hydrateHubs: (hubs) => set({ hubs }),
      hydrateSemesters: (semesters) => set({ semesters }),
      hydrateSubjects: (subjects) => set({ subjects }),
      hydrateClasses: (classes) => set({ classes }),
      hydrateContents: (contents) => set({ contents }),
      hydrateChats: (hubChats) => set({ hubChats }),
      hydrateChatMessages: (hubChatMessages) => set({ hubChatMessages }),
    }),
    { name: 'formcraft-hubs' }
  )
)

// Exposto temporariamente para importação de estrutura via console
;(window as unknown as Record<string, unknown>).__hubsStore = useHubsStore
