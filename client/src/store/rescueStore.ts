import { create } from 'zustand'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Items that exist in this browser's cache but not in Firestore (writes that failed before
// ignoreUndefinedProperties, or failed for any other reason). They are copied here before the
// cache is replaced by the cloud data, and only sent to the cloud when the user confirms.

export const RESCUE_LABELS: Record<string, [string, string]> = {
  links: ['link', 'links'], collections: ['coleção', 'coleções'], areas: ['área', 'áreas'],
  areaItems: ['item de área', 'itens de área'], hubs: ['hub', 'hubs'], hubSemesters: ['semestre', 'semestres'],
  hubSubjects: ['matéria', 'matérias'], hubClasses: ['aula', 'aulas'], hubContents: ['material', 'materiais'],
  hubChats: ['canal', 'canais'], hubChatMessages: ['mensagem', 'mensagens'], hubConcepts: ['conceito', 'conceitos'],
  contentItems: ['item de módulo', 'itens de módulo'], tasks: ['tarefa', 'tarefas'], designPatterns: ['padrão', 'padrões'],
}

type Item = Record<string, unknown> & { id: string }
type Stash = Record<string, Item[]>

const keyFor = (uid: string) => `formcraft-rescue-${uid}`
function read(uid: string): Stash {
  try { return JSON.parse(localStorage.getItem(keyFor(uid)) || '{}') } catch { return {} }
}
function write(uid: string, stash: Stash) {
  try {
    if (Object.values(stash).some(l => l.length)) localStorage.setItem(keyFor(uid), JSON.stringify(stash))
    else localStorage.removeItem(keyFor(uid))
  } catch { /* storage full or blocked: keep in memory only */ }
}

export function itemLabel(it: Item): string {
  const v = it.title ?? it.name ?? it.termo ?? it.nomePrincipal ?? it.text ?? it.url ?? it.id
  return String(v).slice(0, 80)
}

interface RescueStore {
  uid: string | null
  stash: Stash
  uploading: boolean
  result: { ok: number; failed: number } | null
  load: (uid: string) => void
  add: (uid: string, collection: string, items: Item[]) => void
  discard: () => void
  upload: () => Promise<void>
}

export const useRescueStore = create<RescueStore>((set, get) => ({
  uid: null,
  stash: {},
  uploading: false,
  result: null,

  load: (uid) => set({ uid, stash: read(uid), result: null }),

  add: (uid, collection, items) => {
    if (!items.length) return
    const stash = { ...read(uid) }
    const existing = new Map((stash[collection] ?? []).map(i => [i.id, i]))
    for (const it of items) existing.set(it.id, it)
    stash[collection] = [...existing.values()]
    write(uid, stash)
    set({ uid, stash })
  },

  discard: () => {
    const { uid } = get()
    if (uid) write(uid, {})
    set({ stash: {}, result: null })
  },

  upload: async () => {
    const { uid, stash } = get()
    if (!uid || auth.currentUser?.uid !== uid) return
    set({ uploading: true, result: null })
    let ok = 0, failed = 0
    const remaining: Stash = {}
    for (const [collection, items] of Object.entries(stash)) {
      for (const it of items) {
        try {
          await setDoc(doc(db, 'users', uid, collection, it.id), JSON.parse(JSON.stringify(it)))
          ok++
        } catch {
          failed++
          ;(remaining[collection] ??= []).push(it)
        }
      }
    }
    write(uid, remaining)
    set({ stash: remaining, uploading: false, result: { ok, failed } })
  },
}))
