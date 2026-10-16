import { ALL_TOOLS, type Tool, type ToolCategory } from '../data/tools'
import type { Hub } from '../store/hubsStore'
import type { HubToolOverrides } from '../store/hubToolsStore'
import { normalize, searchTools, tokenHit, wordsOf } from './globalSearch'

type Cat = Exclude<ToolCategory, 'Todas'>

const DESIGN: Cat[] = ['Imagem & Design', 'Criar vídeo', 'Ícones & SVG', 'Banco de Imagens', 'Áudio & Voz']
const TECH: Cat[] = ['Segurança', 'CMS & Sites', 'Produtividade', 'IA & Pesquisa']
const MARKETING: Cat[] = ['Métricas', 'Redes Sociais', 'IA & Pesquisa', 'Produtividade']

/** Which tool categories a hub starts with, guessed from its name. The user can add/remove tools per hub afterwards. */
export function defaultCategories(hub: Pick<Hub, 'name'>): Cat[] {
  const n = normalize(hub.name)
  const out = new Set<Cat>()
  if (/\b(design|ux|ui|criativ\w*)\b/.test(n)) DESIGN.forEach(c => out.add(c))
  if (/\b(ti|tecnologia|dev|infra\w*|sistemas?|suporte)\b/.test(n)) TECH.forEach(c => out.add(c))
  if (/(marketing|mkt|social|midia|vendas|negocio)/.test(n)) MARKETING.forEach(c => out.add(c))
  return [...out]
}

export function toolsForHub(hub: Hub, overrides: HubToolOverrides): Tool[] {
  const cats = defaultCategories(hub)
  const o = overrides[hub.id] ?? { add: [], remove: [] }
  return ALL_TOOLS.filter(t => (cats.includes(t.cat) && !o.remove.includes(t.name)) || o.add.includes(t.name))
}

export function hubsForTool(tool: Tool, hubs: Hub[], overrides: HubToolOverrides): Hub[] {
  return hubs.filter(h => toolsForHub(h, overrides).some(t => t.name === tool.name))
}

/** Plain words ("figma", "vídeo") plus intent phrases ("preciso editar um vídeo"). */
export function findTools(query: string, pool: Tool[], limit = 8): Tool[] {
  const tokens = normalize(query.trim()).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return pool
  const direct = pool.filter(t => {
    const hay = normalize(`${t.name} ${t.cat} ${t.desc} ${(t.tags ?? []).join(' ')}`)
    const w = wordsOf(hay)
    return tokens.every(tk => tokenHit(hay, w, tk))
  })
  const names = new Set(direct.map(t => t.name))
  const intent = searchTools(query, pool, limit).filter(t => !names.has(t.name))
  return [...direct, ...intent].slice(0, Math.max(limit, direct.length))
}
