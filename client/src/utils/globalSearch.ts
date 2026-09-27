import type { Concept, Hub, Subject, ClassItem } from '../store/hubsStore'
import type { DesignPattern } from '../store/libraryStore'

export function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Searching the collection name returns every pattern, like a subject name returns its concepts.
const LIBRARY_ALIASES = 'biblioteca de design padroes de design padrao animacoes animacao efeitos referencias'

const STOPWORDS = new Set(['com', 'de', 'do', 'da', 'dos', 'das', 'para', 'pra', 'por', 'que', 'uma', 'um', 'meu', 'minha', 'meus', 'minhas', 'no', 'na', 'nos', 'nas', 'em', 'os', 'as', 'e', 'o', 'a', 'ia', 'ai', 'quero', 'preciso', 'algo', 'fazer'])

// Crude Portuguese stem so "gerar" matches "gera", "métricas" matches "métrica", "narração" matches "narrar".
const stem = (t: string) => (t.length >= 5 ? t.slice(0, Math.max(4, t.length - 2)) : t)

// How people describe a need vs. how tools describe themselves.
const INTENT_SYNONYMS: Record<string, string[]> = {
  narr: ['voz', 'audio', 'fala'], locu: ['voz', 'audio'], dubl: ['voz'], podc: ['audio', 'podcast'],
  arte: ['design', 'grafi', 'imag'], post: ['design', 'grafi', 'social', 'rede'], bann: ['design', 'grafi'],
  logo: ['design', 'grafi'], thum: ['design', 'imag'], cria: [], foto: ['imag', 'foto'],
  vide: ['vide'], reel: ['vide'], clip: ['vide'], musi: ['musi'], metr: ['metr', 'analyt', 'anal'],
  site: ['site', 'cms', 'web'], land: ['site'], cod: ['codi', 'program', 'dev'], resu: ['resum', 'texto'],
}
const GENERIC = new Set(['gera', 'cria', 'crie', 'faze', 'usar', 'ferr', 'melh', 'app', 'apps', 'onli', 'grat'])

export function searchTools<T extends { name: string; cat: string; desc: string }>(query: string, tools: T[], limit = 6): T[] {
  const tokens = normalize(query).split(/[^a-z0-9]+/).filter(t => t.length >= 3 && !STOPWORDS.has(t)).map(stem)
  if (tokens.length === 0) return []
  const groups = tokens.map(tk => {
    const syn = Object.entries(INTENT_SYNONYMS).find(([k]) => tk.startsWith(k))?.[1] ?? []
    return { alts: [tk, ...syn], generic: GENERIC.has(tk) }
  })
  const distinct = groups.filter(g => !g.generic)
  const need = distinct.length ? Math.max(1, Math.ceil(distinct.length / 2)) : groups.length

  return tools
    .map(t => {
      const words = normalize(`${t.name} ${t.cat} ${t.desc}`).split(/[^a-z0-9]+/)
      const nameWords = normalize(t.name).split(/[^a-z0-9]+/)
      const hit = (alts: string[], ws: string[]) => alts.some(a => ws.some(w => w.startsWith(a)))
      let score = 0, distinctHits = 0, genericHits = 0
      for (const g of groups) {
        if (!hit(g.alts, words)) continue
        score += (g.generic ? 0.3 : 1) * (hit(g.alts, nameWords) ? 2 : 1)
        if (g.generic) genericHits++; else distinctHits++
      }
      return { t, score, ok: distinct.length ? distinctHits >= need : genericHits >= need }
    })
    .filter(x => x.ok)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.t)
}

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
    const hay = normalize([c.termo, ...(c.sinonimos ?? []), c.definicao, c.comoFunciona, c.ondeUsar, ...c.tags, c.contexto, subject?.name, hub?.name, classItem?.title].filter(Boolean).join(' '))
    if (matches(hay)) results.push({ r: { kind: 'concept', item: c, subject, classItem }, title: [c.termo, ...(c.sinonimos ?? [])].join(' ') })
  }

  for (const p of src.patterns) {
    const hay = normalize([p.nomePrincipal, ...p.sinonimos, p.categoria, ...p.tags, p.ondeUsar, p.oQueE, LIBRARY_ALIASES].join(' '))
    if (matches(hay)) results.push({ r: { kind: 'pattern', item: p }, title: [p.nomePrincipal, ...p.sinonimos].join(' ') })
  }

  const rank = (title: string) => (normalize(title).includes(q) ? 0 : 1)
  return results.sort((a, b) => rank(a.title) - rank(b.title)).map(x => x.r)
}

/** Where a concept opens: its class inside the hub, or the Conceitos page for standalone ones. */
export function conceptHref(c: Pick<Concept, 'id' | 'hubId' | 'semesterId' | 'subjectId' | 'classId'>) {
  return c.classId && c.hubId
    ? `/hub/${c.hubId}?sem=${c.semesterId ?? ''}&subj=${c.subjectId ?? ''}&cls=${c.classId}`
    : `/conceitos/${c.id}`
}
