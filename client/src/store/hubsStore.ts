import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normList, normHub, normSemester, normSubject, normClass, normHubContent, normConcept } from './normalize'
import { deleteUserFile } from '../utils/fileUpload'
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
  storagePath?: string
  fileSize?: number
  createdAt: string
}

/** A term worth finding later. Linked to a class (aula) or standalone ("avulso"). */
export interface Concept {
  id: string
  hubId?: string
  semesterId?: string
  subjectId?: string
  classId?: string
  /** Free-text context for standalone concepts, e.g. "Marketing", "Trabalho". */
  contexto?: string
  termo: string
  definicao: string
  imageData?: string
  tags: string[]
  criadoEm: string
}

interface HubsStore {
  hubs: Hub[]
  semesters: Semester[]
  subjects: Subject[]
  classes: ClassItem[]
  contents: HubContent[]
  hubChats: HubChat[]
  hubChatMessages: HubChatMessage[]
  concepts: Concept[]

  addHub: (h: Omit<Hub, 'id' | 'createdAt'>) => void
  updateHub: (id: string, updates: Partial<Pick<Hub, 'name' | 'emoji' | 'color'>>) => void
  removeHub: (id: string) => void

  addSemester: (s: Omit<Semester, 'id'>) => Semester
  removeSemester: (id: string) => void

  addSubject: (s: Omit<Subject, 'id'>) => Subject
  updateSubject: (id: string, updates: Partial<Omit<Subject, 'id'>>) => void
  removeSubject: (id: string) => void

  addClassItem: (c: Omit<ClassItem, 'id'>) => ClassItem
  removeClassItem: (id: string) => void

  addContent: (c: Omit<HubContent, 'id' | 'createdAt'>) => void
  removeContent: (id: string) => void

  addChat: (c: Omit<HubChat, 'id' | 'createdAt'>) => HubChat
  removeChat: (id: string) => void

  addChatMessage: (m: Omit<HubChatMessage, 'id' | 'createdAt'>) => void
  removeChatMessage: (id: string) => void

  addConcept: (c: Omit<Concept, 'id' | 'criadoEm'>) => Concept
  updateConcept: (id: string, patch: Partial<Omit<Concept, 'id' | 'criadoEm'>>) => void
  removeConcept: (id: string) => void

  hydrateHubs: (hubs: Hub[]) => void
  hydrateSemesters: (s: Semester[]) => void
  hydrateSubjects: (s: Subject[]) => void
  hydrateClasses: (c: ClassItem[]) => void
  hydrateContents: (c: HubContent[]) => void
  hydrateChats: (c: HubChat[]) => void
  hydrateChatMessages: (c: HubChatMessage[]) => void
  hydrateConcepts: (c: Concept[]) => void
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
    (set, get) => ({
      hubs: [],
      semesters: [],
      subjects: [],
      classes: [],
      contents: [],
      hubChats: [],
      hubChatMessages: [],
      concepts: [],

      addHub: (h) => {
        const hub: Hub = { ...h, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        set(s => ({ hubs: [...s.hubs, hub] }))
        fs('hubs', hub)
      },
      updateHub: (id, updates) => {
        set(s => {
          const hubs = s.hubs.map(h => h.id === id ? { ...h, ...updates } : h)
          const updated = hubs.find(h => h.id === id)
          if (updated) fs('hubs', updated)
          return { hubs }
        })
      },
      removeHub: (id) => {
        set(s => ({ hubs: s.hubs.filter(h => h.id !== id) }))
        fsDel('hubs', id)
      },

      addSemester: (sem) => {
        const semester: Semester = { ...sem, id: crypto.randomUUID() }
        set(s => ({ semesters: [...s.semesters, semester] }))
        fs('hubSemesters', semester)
        return semester
      },
      removeSemester: (id) => {
        set(s => ({ semesters: s.semesters.filter(x => x.id !== id) }))
        fsDel('hubSemesters', id)
      },

      addSubject: (sub) => {
        const subject: Subject = { ...sub, id: crypto.randomUUID() }
        set(s => ({ subjects: [...s.subjects, subject] }))
        fs('hubSubjects', subject)
        return subject
      },
      updateSubject: (id, updates) => {
        set(s => {
          const subjects = s.subjects.map(x => x.id === id ? { ...x, ...updates } : x)
          const updated = subjects.find(x => x.id === id)
          if (updated) fs('hubSubjects', updated)
          return { subjects }
        })
      },
      removeSubject: (id) => {
        set(s => ({ subjects: s.subjects.filter(x => x.id !== id) }))
        fsDel('hubSubjects', id)
      },

      addClassItem: (cl) => {
        const item: ClassItem = { ...cl, id: crypto.randomUUID() }
        set(s => ({ classes: [...s.classes, item] }))
        fs('hubClasses', item)
        return item
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
        const item = get().contents.find(x => x.id === id)
        if (item?.storagePath) deleteUserFile(item.storagePath)
        set(s => ({ contents: s.contents.filter(x => x.id !== id) }))
        fsDel('hubContents', id)
      },

      addChat: (c) => {
        const chat: HubChat = { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        set(s => ({ hubChats: [...s.hubChats, chat] }))
        fs('hubChats', chat)
        return chat
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

      addConcept: (c) => {
        const concept: Concept = { ...c, id: crypto.randomUUID(), criadoEm: new Date().toISOString() }
        set(s => ({ concepts: [...s.concepts, concept] }))
        fs('hubConcepts', concept)
        return concept
      },
      updateConcept: (id, patch) => {
        const current = get().concepts.find(x => x.id === id)
        if (!current) return
        const updated: Concept = { ...current, ...patch }
        set(s => ({ concepts: s.concepts.map(x => x.id === id ? updated : x) }))
        fs('hubConcepts', updated)
      },
      removeConcept: (id) => {
        set(s => ({ concepts: s.concepts.filter(x => x.id !== id) }))
        fsDel('hubConcepts', id)
      },

      hydrateHubs: (hubs) => set({ hubs: normList(hubs, normHub) as any }),
      hydrateSemesters: (semesters) => set({ semesters: normList(semesters, normSemester) as any }),
      hydrateSubjects: (subjects) => set({ subjects: normList(subjects, normSubject) as any }),
      hydrateClasses: (classes) => set({ classes: normList(classes, normClass) as any }),
      hydrateContents: (contents) => set({ contents: normList(contents, normHubContent) as any }),
      hydrateChats: (hubChats) => set({ hubChats }),
      hydrateChatMessages: (hubChatMessages) => set({ hubChatMessages }),
      hydrateConcepts: (concepts) => set({ concepts: normList(concepts, normConcept) as any }),
    }),
    {
      name: 'formcraft-hubs',
      merge: (p: any, c) => ({
        ...c, ...p,
        hubs: normList(p?.hubs, normHub) as any, semesters: normList(p?.semesters, normSemester) as any,
        subjects: normList(p?.subjects, normSubject) as any, classes: normList(p?.classes, normClass) as any,
        contents: normList(p?.contents, normHubContent) as any, concepts: normList(p?.concepts, normConcept) as any,
        hubChats: Array.isArray(p?.hubChats) ? p.hubChats : [], hubChatMessages: Array.isArray(p?.hubChatMessages) ? p.hubChatMessages : [],
      }),
    }
  )
)

