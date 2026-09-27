import type { Concept, Hub, Subject, ClassItem } from '../store/hubsStore'
import type { DesignPattern } from '../store/libraryStore'

export function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Searching the collection name returns every pattern, like a subject name returns its concepts.
const LIBRARY_ALIASES = 'biblioteca de design padroes de design padrao animacoes animacao efeitos referencias'

export type SearchResult =
  | { kind: 'concept'; item: Concept; subject?: Subject; classItem?: ClassItem }
  | { kind: 'pattern'; item: DesignPattern }

interface Sources {
  concepts: Concept[]
  hubs: Hub[]
  subjects: Subject[]
  classes: ClassItem[]
  patterns: DesignPattern[]
}

export function searchAll(query: string, src: Sources): SearchResult[] {
  const q = normalize(query.trim())
  const tokens = q.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []
  const matches = (hay: string) => tokens.every(t => hay.includes(t))

  const results: { r: SearchResult; title: string }[] = []

  for (const c of src.concepts) {
    const subject = src.subjects.find(x => x.id === c.subjectId)
    const hub = src.hubs.find(x => x.id === c.hubId)
    const classItem = src.classes.find(x => x.id === c.classId)
    const hay = normalize([c.termo, c.definicao, ...c.tags, subject?.name, hub?.name, classItem?.title].filter(Boolean).join(' '))
    if (matches(hay)) results.push({ r: { kind: 'concept', item: c, subject, classItem }, title: c.termo })
  }

  for (const p of src.patterns) {
    const hay = normalize([p.nomePrincipal, ...p.sinonimos, p.categoria, ...p.tags, p.ondeUsar, p.oQueE, LIBRARY_ALIASES].join(' '))
    if (matches(hay)) results.push({ r: { kind: 'pattern', item: p }, title: [p.nomePrincipal, ...p.sinonimos].join(' ') })
  }

  const rank = (title: string) => (normalize(title).includes(q) ? 0 : 1)
  return results.sort((a, b) => rank(a.title) - rank(b.title)).map(x => x.r)
}
