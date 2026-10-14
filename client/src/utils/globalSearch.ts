import type { Concept, Hub, Subject, ClassItem, HubContent } from '../store/hubsStore'
import type { ContentItem } from '../store/contentItemsStore'
import { GLOSSARY, GUIDES, type GlossaryTerm, type Guide } from '../data/glossary'
import { ALL_TOOLS, type Tool } from '../data/tools'
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
  edit: ['edic', 'editor'], anim: ['anim', 'motion'], efei: ['efei', 'transic'],
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
  const matches = (hay: string) => { const w = wordsOf(hay); return tokens.every(t => tokenHit(hay, w, t)) }

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


export const MODULE_TAB_LABELS: Record<string, string> = {
  snippets: 'Snippets', 'tools-db': 'Ferramentas', scripts: 'Scripts', troubleshooting: 'Troubleshooting',
  notes: 'Notas', references: 'Referências', links: 'Links', biblioteca: 'Biblioteca',
}

const TITLE_KEYS = ['title', 'titulo', 'name', 'nome', 'label', 'termo', 'tool', 'url']

function flatten(v: unknown, out: string[], depth = 0) {
  if (depth > 4 || v == null) return
  if (typeof v === 'string') { if (!v.startsWith('data:') && v.length < 8000) out.push(v) }
  else if (typeof v === 'number') out.push(String(v))
  else if (Array.isArray(v)) v.forEach(x => flatten(x, out, depth + 1))
  else if (typeof v === 'object') Object.values(v as Record<string, unknown>).forEach(x => flatten(x, out, depth + 1))
}

export const wordsOf = (s: string) => s.split(/[^a-z0-9]+/).filter(Boolean)

// Short tokens (ex: "ti") only match whole words, otherwise "ti" would match "tipografia".
export function tokenHit(hay: string, words: string[], t: string) {
  return t.length <= 2 ? words.includes(t) : hay.includes(t)
}

// Never print credentials in result previews: "senha: abc123" becomes "senha: ••••••".
const maskSecrets = (s: string) => s.replace(/(senha|password|passwd|pwd|token|secret|chave|pin)(\s*[:=-]?\s*)(\S+)/gi, (_m, k, sep) => `${k}${sep}••••••`)

function excerptOf(text: string, tokens: string[]) {
  const norm = normalize(text)
  for (const t of tokens.filter(x => x.length >= 3)) {
    const i = norm.indexOf(t)
    if (i >= 0) {
      const from = Math.max(0, i - 28), to = Math.min(text.length, i + t.length + 48)
      const raw = text.slice(from, to).replace(/\s+/g, ' ').trim()
      return (from > 0 ? '…' : '') + maskSecrets(raw) + (to < text.length ? '…' : '')
    }
  }
  return undefined
}

export interface HubItemHit { item: ContentItem; hub?: Hub; tabKey: string; moduleLabel: string; title: string; excerpt?: string }

/** Full-text search across every hub module item (snippets, notas, scripts, links…). The hub name and module name also count, so "TI" lists what is inside the TI hub. */
export function searchHubItems(query: string, items: ContentItem[], hubs: Hub[], limit = 12): HubItemHit[] {
  const tokens = normalize(query.trim()).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []
  const q = tokens.join(' ')
  const hits: (HubItemHit & { rank: number })[] = []
  for (const item of items) {
    const parts: string[] = []
    flatten(item.data, parts)
    const text = parts.join(' \n ')
    const hub = hubs.find(h => h.id === item.workspaceId)
    const tabKey = item.moduleId.replace(`hub-${item.workspaceId}-`, '')
    const moduleLabel = MODULE_TAB_LABELS[tabKey] ?? tabKey
    const title = String(TITLE_KEYS.map(k => item.data[k]).find(v => typeof v === 'string' && v) ?? parts[0] ?? moduleLabel)
    const textNorm = normalize([text, item.tags.join(' ')].join(' '))
    const metaNorm = normalize([hub?.name, moduleLabel].filter(Boolean).join(' '))
    const hay = textNorm + ' ' + metaNorm
    const words = wordsOf(hay)
    if (!tokens.every(t => tokenHit(hay, words, t))) continue
    const inText = tokens.every(t => tokenHit(textNorm, wordsOf(textNorm), t))
    const rank = normalize(title).includes(q) ? 0 : inText ? 1 : 2
    hits.push({ item, hub, tabKey, moduleLabel, title, excerpt: inText ? excerptOf(text, tokens) : undefined, rank })
  }
  return hits
    .sort((a, b) => a.rank - b.rank || Number(b.item.starred) - Number(a.item.starred) || b.item.updatedAt.localeCompare(a.item.updatedAt))
    .slice(0, limit)
}

export interface FacHit { kind: 'subject' | 'class' | 'content'; id: string; hub?: Hub; title: string; sub: string; href: string }

/** Disciplinas, aulas e materiais dos hubs de faculdade. */
export function searchFaculdade(query: string, src: { hubs: Hub[]; subjects: Subject[]; classes: ClassItem[]; contents: HubContent[] }, limit = 8): FacHit[] {
  const tokens = normalize(query.trim()).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []
  const match = (...f: (string | undefined)[]) => { const hay = normalize(f.filter(Boolean).join(' ')); const w = wordsOf(hay); return tokens.every(t => tokenHit(hay, w, t)) }
  const hubOf = (id: string) => src.hubs.find(h => h.id === id)
  const out: FacHit[] = []
  for (const s of src.subjects) {
    const hub = hubOf(s.hubId)
    if (match(s.name, s.professor, hub?.name)) out.push({ kind: 'subject', id: s.id, hub, title: s.name, sub: `${hub?.name ?? ''} · Disciplina`, href: `/hub/${s.hubId}?sem=${s.semesterId}&subj=${s.id}` })
  }
  for (const c of src.classes) {
    const hub = hubOf(c.hubId); const subj = src.subjects.find(x => x.id === c.subjectId)
    if (match(c.title, c.notes, subj?.name, hub?.name)) out.push({ kind: 'class', id: c.id, hub, title: c.title, sub: `${hub?.name ?? ''} · ${subj?.name ?? 'Aula'}`, href: `/hub/${c.hubId}?sem=${c.semesterId}&subj=${c.subjectId}&cls=${c.id}` })
  }
  for (const c of src.contents) {
    const hub = hubOf(c.hubId); const subj = src.subjects.find(x => x.id === c.subjectId)
    if (match(c.title, c.content, c.url, subj?.name, hub?.name)) out.push({ kind: 'content', id: c.id, hub, title: c.title, sub: `${hub?.name ?? ''} · ${subj?.name ?? 'Material'}`, href: `/hub/${c.hubId}?sem=${c.semesterId ?? ''}&subj=${c.subjectId ?? ''}&cls=${c.classId ?? ''}` })
  }
  return out.slice(0, limit)
}


/** Patterns that answer a request like "preciso editar um vídeo": any distinctive word (or its synonym) in name, category, tags or description. */
export function searchPatternsByIntent(query: string, patterns: DesignPattern[], limit = 6): DesignPattern[] {
  const tokens = normalize(query).split(/[^a-z0-9]+/).filter(x => x.length >= 3 && !STOPWORDS.has(x) && !GENERIC.has(stem(x))).map(stem)
  if (tokens.length === 0) return []
  const groups = tokens.map(tk => [tk, ...(Object.entries(INTENT_SYNONYMS).find(([k]) => tk.startsWith(k))?.[1] ?? [])])
  const need = Math.max(1, Math.ceil(groups.length / 2))
  return patterns
    .map(p => {
      const nameWords = wordsOf(normalize([p.nomePrincipal, ...p.sinonimos, p.categoria].join(' ')))
      const words = [...nameWords, ...wordsOf(normalize([...p.tags, p.oQueE, p.ondeUsar].join(' ')))]
      let score = 0, hits = 0
      for (const alts of groups) {
        if (alts.some(a => nameWords.some(w => w.startsWith(a)))) { score += 2; hits++ }
        else if (alts.some(a => words.some(w => w.startsWith(a)))) { score += 1; hits++ }
      }
      return { p, score, ok: hits >= need }
    })
    .filter(x => x.ok)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.p)
}


const GLOSSARY_FILLER = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'que', 'e', 'de', 'do', 'da', 'dos', 'das', 'para', 'pra', 'em', 'no', 'na', 'sao', 'significa', 'quer', 'dizer', 'definicao', 'explica', 'explique', 'preciso', 'quero', 'saber', 'entender', 'meu', 'minha'])

/** Terms from the built-in glossary (marketing, TI, design, vídeo). Understands "o que é React", "matriz bcg", "match cut". */
export function searchGlossary(query: string, limit = 8): GlossaryTerm[] {
  const all = normalize(query.trim()).split(/\s+/).filter(Boolean)
  const tokens = all.filter(x => !GLOSSARY_FILLER.has(x))
  const use = tokens.length ? tokens : all
  if (use.length === 0) return []
  const q = use.join(' ')
  const out: { t: GlossaryTerm; rank: number }[] = []
  for (const t of GLOSSARY) {
    const nameList = [t.termo, ...t.sinonimos].map(normalize)
    const names = nameList.join(' | ')
    const hay = names + ' ' + normalize(`${t.definicao} ${t.area}`)
    if (!use.every(tk => tokenHit(hay, wordsOf(hay), tk))) continue
    const nameWords = wordsOf(names)
    const rank = nameList.some(n => n === q) ? 0
      : nameList.some(n => n.startsWith(q)) ? 1
      : names.includes(q) ? 2
      : use.every(tk => tokenHit(names, nameWords, tk)) ? 3 : 4
    out.push({ t, rank })
  }
  return out.sort((a, b) => a.rank - b.rank).slice(0, limit).map(x => x.t)
}

/** Guides for requests like "preciso criar um site" or "editar um vídeo". */
export function findGuides(query: string): Guide[] {
  const words = wordsOf(normalize(query))
  if (words.length === 0) return []
  return GUIDES.filter(g => g.gatilhos.some(trig => trig.every(p => words.some(w => w.startsWith(p)))))
}

export function guideTools(g: Guide, limit = 4): Tool[] {
  const used = new Set(g.etapas.flatMap(e => e.ferramentas ?? []))
  const perCat = Math.max(2, Math.ceil(limit / g.categorias.length))
  return g.categorias.flatMap(c => ALL_TOOLS.filter(x => x.cat === c && !used.has(x.name)).slice(0, perCat)).slice(0, limit)
}

export function toolByName(name: string): Tool | undefined {
  return ALL_TOOLS.find(x => x.name === name)
}

export function glossaryByName(name: string): GlossaryTerm | undefined {
  return GLOSSARY.find(t => t.termo === name)
}
