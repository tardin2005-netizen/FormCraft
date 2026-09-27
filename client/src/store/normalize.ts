// Docs saved before a field existed come back from Firestore/localStorage without it.
// Every entity passes through here on hydrate so components can trust their types.

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
const num = (v: unknown, fallback = 0) => (typeof v === 'number' && !Number.isNaN(v) ? v : fallback)

type AnyObj = Record<string, any>

export function normList<T>(list: unknown, fn: (x: AnyObj) => T): T[] {
  return arr<AnyObj>(list).filter(x => x && typeof x === 'object' && x.id).map(fn)
}

export const normLink = (l: AnyObj) => ({
  ...l,
  url: str(l.url), title: str(l.title, 'Sem título'), desc: str(l.desc), favicon: str(l.favicon),
  areaId: str(l.areaId), tags: arr<string>(l.tags).filter(t => typeof t === 'string'),
  type: str(l.type, 'link'), savedAt: num(l.savedAt, Date.now()),
})

export const normArea = (a: AnyObj) => ({
  ...a, emoji: str(a.emoji, '📁'), title: str(a.title, 'Sem nome'), desc: str(a.desc),
  count: num(a.count), color: str(a.color, '#7c6ef7'),
})

export const normCollection = (c: AnyObj) => ({
  ...c, name: str(c.name, 'Sem nome'), emoji: str(c.emoji, '📁'), color: str(c.color, '#7c6ef7'),
  desc: str(c.desc), itemIds: arr<string>(c.itemIds), createdAt: num(c.createdAt, Date.now()),
})

export const normTask = (t: AnyObj) => ({
  ...t, title: str(t.title, 'Sem título'), status: str(t.status, 'todo'), urgency: str(t.urgency, 'medium'),
  recurrence: str(t.recurrence, 'none'), tags: arr<string>(t.tags),
  subtasks: arr<AnyObj>(t.subtasks).filter(Boolean), createdAt: str(t.createdAt, new Date().toISOString()),
})

export const normAreaItem = (i: AnyObj) => ({
  ...i, areaId: str(i.areaId), type: str(i.type, 'note'), title: str(i.title, 'Sem título'),
  createdAt: str(i.createdAt, new Date().toISOString()),
})

export const normContentItem = (i: AnyObj) => ({
  ...i, data: i.data && typeof i.data === 'object' ? i.data : {}, tags: arr<string>(i.tags),
  starred: !!i.starred, createdAt: str(i.createdAt, new Date().toISOString()),
  updatedAt: str(i.updatedAt, str(i.createdAt, new Date().toISOString())),
})

export const normWorkspace = (w: AnyObj) => ({
  ...w, name: str(w.name, 'Sem nome'), icon: str(w.icon, '📁'), color: str(w.color, '#7c6ef7'),
  modules: arr<AnyObj>(w.modules).filter(Boolean), createdAt: str(w.createdAt, new Date().toISOString()),
})

export const normConcept = (c: AnyObj) => ({
  ...c, termo: str(c.termo, 'Sem termo'), definicao: str(c.definicao), tags: arr<string>(c.tags), sinonimos: arr<string>(c.sinonimos),
  criadoEm: str(c.criadoEm, new Date().toISOString()),
})

export const normPattern = (p: AnyObj) => ({
  ...p, nomePrincipal: str(p.nomePrincipal, 'Sem nome'), sinonimos: arr<string>(p.sinonimos),
  categoria: str(p.categoria, 'Outro'), oQueE: str(p.oQueE), comoFunciona: str(p.comoFunciona),
  ondeUsar: str(p.ondeUsar), tags: arr<string>(p.tags), criadoEm: str(p.criadoEm),
})

export const normHubContent = (c: AnyObj) => ({ ...c, title: str(c.title, 'Sem título'), type: str(c.type, 'note'), createdAt: str(c.createdAt, new Date().toISOString()) })
export const normClass = (c: AnyObj) => ({ ...c, title: str(c.title, 'Sem título'), type: str(c.type, 'aula'), date: str(c.date) })
export const normSubject = (s: AnyObj) => ({ ...s, name: str(s.name, 'Sem nome'), emoji: str(s.emoji, '📚'), color: str(s.color, '#7c6ef7') })
export const normSemester = (s: AnyObj) => ({ ...s, name: str(s.name, 'Semestre'), year: num(s.year, new Date().getFullYear()), period: str(s.period, '1') })
export const normHub = (h: AnyObj) => ({ ...h, name: str(h.name, 'Sem nome'), emoji: str(h.emoji, '📁'), color: str(h.color, '#7c6ef7'), type: str(h.type, 'custom') })
