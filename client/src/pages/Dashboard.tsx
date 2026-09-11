import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import s from './Dashboard.module.css'

interface Props { onOpenSearch: () => void }

type SelectedCtx = 'none' | 'pdf' | 'image'
type ToolCategory = 'Todas' | 'IA & Pesquisa' | 'Imagem & Design' | 'Criar vídeo' | 'Áudio & Voz' | 'Métricas'

interface Area { id: string; emoji: string; title: string; desc: string; count: number; color: string }
interface Tool { name: string; cat: string; pricing: 'FREEMIUM' | 'GRATUITO' | 'ASSINATURA'; color: string; letter: string; url: string }
interface GHCommit { sha: string; commit: { message: string; author: { date: string } } }
interface GHRepo  { stargazers_count: number; open_issues_count: number; pushed_at: string; description: string | null }

const INITIAL_AREAS: Area[] = [
  { id: 'ux', emoji: '🎨', title: 'UX & Design', desc: 'Referências, sistemas, tipografia', count: 24, color: '#7c6ef7' },
  { id: 'dev', emoji: '💻', title: 'Desenvolvimento', desc: 'Docs, snippets, repositórios', count: 18, color: '#4f8ef7' },
  { id: 'faculdade', emoji: '📚', title: 'Faculdade', desc: 'Aulas, briefings, ADOs', count: 31, color: '#3ecf8e' },
  { id: 'musica', emoji: '🎵', title: 'Música', desc: 'Referências, playlists', count: 9, color: '#f78c4f' },
  { id: 'negocios', emoji: '💼', title: 'Negócios', desc: 'Estratégia, mercado', count: 15, color: '#e46ef7' },
  { id: 'pessoal', emoji: '🌱', title: 'Pessoal', desc: 'Objetivos, reflexões', count: 7, color: '#facc15' },
]

const ALL_TOOLS: Tool[] = [
  { name: 'Perplexity',   cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#1BA1E2', letter: 'P', url: 'https://perplexity.ai' },
  { name: 'Gemini',       cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#4285F4', letter: 'G', url: 'https://gemini.google.com' },
  { name: 'Claude',       cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#D97757', letter: 'C', url: 'https://claude.ai' },
  { name: 'ChatGPT',      cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#10A37F', letter: 'G', url: 'https://chatgpt.com' },
  { name: 'Figma',        cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#A259FF', letter: 'F', url: 'https://figma.com' },
  { name: 'Canva',        cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#00C4CC', letter: 'C', url: 'https://canva.com' },
  { name: 'Midjourney',   cat: 'Imagem & Design',  pricing: 'ASSINATURA', color: '#2D3277', letter: 'M', url: 'https://midjourney.com' },
  { name: 'Adobe Firefly',cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#FF0000', letter: 'A', url: 'https://firefly.adobe.com' },
  { name: 'RunwayML',     cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#FF4081', letter: 'R', url: 'https://runwayml.com' },
  { name: 'Sora',         cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#10A37F', letter: 'S', url: 'https://sora.openai.com' },
  { name: 'Pika',         cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#6366F1', letter: 'P', url: 'https://pika.art' },
  { name: 'ElevenLabs',   cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#7B61FF', letter: 'E', url: 'https://elevenlabs.io' },
  { name: 'Suno',         cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#F59E0B', letter: 'S', url: 'https://suno.com' },
  { name: 'Udio',         cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#EC4899', letter: 'U', url: 'https://udio.com' },
  { name: 'Google Analytics', cat: 'Métricas',     pricing: 'GRATUITO',   color: '#F4B400', letter: 'G', url: 'https://analytics.google.com' },
  { name: 'Hotjar',       cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#FD3A5C', letter: 'H', url: 'https://hotjar.com' },
]

const TOOL_CATS: ToolCategory[] = ['Todas', 'IA & Pesquisa', 'Imagem & Design', 'Criar vídeo', 'Áudio & Voz', 'Métricas']
const PRICING_COLOR: Record<string, string> = { FREEMIUM: '#f59e0b', GRATUITO: '#3ecf8e', ASSINATURA: '#e46ef7' }

const RECENT = [
  { icon: '📄', title: 'Princípios de Design Visual.pdf', area: 'UX & Design', time: '2h atrás' },
  { icon: '🔗', title: 'Figma Handbook', area: 'UX & Design', time: '5h atrás' },
  { icon: '📝', title: 'Ideias para o TCC', area: 'Faculdade', time: 'ontem' },
  { icon: '🖼️', title: 'Moodboard marca pessoal', area: 'Design', time: '2 dias' },
  { icon: '🤖', title: 'Prompt para geração de paleta', area: 'UX & Design', time: '3 dias' },
]

const EMOJI_LIST = ['🎨','💻','📚','🎵','💼','🌱','🚀','⚡','🔥','🌍','🎯','🧠','📊','🏆','🎮','✏️','📷','🎬','🔬','💡']

function GitHubWidget() {
  const [repo, setRepo]       = useState<GHRepo | null>(null)
  const [commits, setCommits] = useState<GHCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    const owner = 'tardin2005-netizen'
    const repoName = 'FormCraft'
    Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repoName}`).then(r => r.json()),
      fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=5`).then(r => r.json()),
    ])
      .then(([r, c]) => {
        if (r.message) { setError(true); return }
        setRepo(r)
        setCommits(Array.isArray(c) ? c : [])
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) return <div className={s.ghLoading}>Carregando dados do GitHub...</div>
  if (error)   return (
    <div className={s.ghError}>
      <span>⚠️ Repositório não encontrado ou privado.</span>
      <span className={s.ghErrorSub}>Conecte o GitHub nas configurações para análise completa.</span>
    </div>
  )

  return (
    <div className={s.ghWidget}>
      <div className={s.ghHeader}>
        <div className={s.ghTitle}>
          <span className={s.ghIcon}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </span>
          tardin2005-netizen/FormCraft
        </div>
        <div className={s.ghMeta}>
          <span>⭐ {repo?.stargazers_count ?? 0}</span>
          <span>🐛 {repo?.open_issues_count ?? 0} issues</span>
          <span>🕐 {repo?.pushed_at ? new Date(repo.pushed_at).toLocaleDateString('pt-BR') : '—'}</span>
        </div>
      </div>
      {repo?.description && <p className={s.ghDesc}>{repo.description}</p>}
      <div className={s.ghCommitsLabel}>Últimos commits</div>
      <div className={s.ghCommits}>
        {commits.map((c) => (
          <div key={c.sha} className={s.ghCommit}>
            <span className={s.ghSha}>{c.sha.slice(0, 7)}</span>
            <span className={s.ghMsg}>{c.commit.message.split('\n')[0]}</span>
            <span className={s.ghDate}>{new Date(c.commit.author.date).toLocaleDateString('pt-BR')}</span>
          </div>
        ))}
        {commits.length === 0 && <div className={s.ghEmpty}>Nenhum commit encontrado.</div>}
      </div>
    </div>
  )
}

export default function Dashboard({ onOpenSearch }: Props) {
  const { theme, toggle } = useThemeStore()

  const [areas, setAreas]             = useState<Area[]>(INITIAL_AREAS)
  const [selectedCtx, setSelectedCtx] = useState<SelectedCtx>('none')
  const [toolCat, setToolCat]         = useState<ToolCategory>('Todas')
  const [toolSearch, setToolSearch]   = useState('')
  const [swapped, setSwapped]         = useState(false)
  const [newAreaModal, setNewAreaModal] = useState(false)
  const [newArea, setNewArea]         = useState({ emoji: '📁', title: '', desc: '', color: '#7c6ef7' })
  const [showGH, setShowGH]           = useState(false)

  const filteredTools = ALL_TOOLS.filter(t => {
    const matchCat  = toolCat === 'Todas' || t.cat === toolCat
    const matchName = t.name.toLowerCase().includes(toolSearch.toLowerCase())
    return matchCat && matchName
  })

  function addArea() {
    if (!newArea.title.trim()) return
    setAreas(prev => [...prev, { ...newArea, id: newArea.title.toLowerCase().replace(/\s+/g, '-'), count: 0 }])
    setNewAreaModal(false)
    setNewArea({ emoji: '📁', title: '', desc: '', color: '#7c6ef7' })
  }

  // Left sidebar
  const leftSidebar = (
    <aside className={`${s.sidebar} ${swapped ? s.sidebarRight : s.sidebarLeft}`}>
      <div className={s.logo}>⬡ FormCraft</div>

      <nav className={s.nav}>
        <Link to="/" className={`${s.navItem} ${s.navActive}`}>🏠 Dashboard</Link>
        <Link to="/inbox" className={s.navItem}>📥 Inbox</Link>
        <Link to="/colecoes" className={s.navItem}>🗂️ Coleções</Link>
        <Link to="/settings" className={s.navItem}>⚙️ Configurações</Link>
      </nav>

      <div className={s.sidebarSection}>
        <div className={s.sectionLabel}>Áreas</div>
        {areas.map((a) => (
          <Link key={a.id} to={`/area/${a.id}`} className={s.areaItem}>
            <span>{a.emoji}</span>
            <span className={s.areaTitle}>{a.title}</span>
            <span className={s.areaCount}>{a.count}</span>
          </Link>
        ))}
        <button className={s.addAreaSidebar} onClick={() => setNewAreaModal(true)}>+ Nova área</button>
      </div>

      <div className={s.sidebarBottom}>
        <button className={s.searchKbdBtn} onClick={onOpenSearch}>
          🔎 Buscar <kbd className={s.kbdHint}>⌘K</kbd>
        </button>
        <button className={s.themeBtn} onClick={toggle}>
          {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro'}
        </button>
      </div>
    </aside>
  )

  // Right sidebar (tools)
  const rightSidebar = (
    <aside className={`${s.toolsSidebar} ${swapped ? s.toolsLeft : s.toolsRight}`}>
      <div className={s.toolsHeader}>
        <span>🛠️ Ferramentas</span>
        <div className={s.ctxSwitch}>
          {(['none','pdf','image'] as SelectedCtx[]).map((c) => (
            <button
              key={c}
              className={`${s.ctxBtn} ${selectedCtx === c ? s.ctxActive : ''}`}
              onClick={() => setSelectedCtx(selectedCtx === c && c !== 'none' ? 'none' : c)}
              title={c === 'none' ? 'Geral' : c === 'pdf' ? 'PDF' : 'Imagem'}
            >{c === 'none' ? '—' : c === 'pdf' ? '📄' : '🖼️'}</button>
          ))}
        </div>
      </div>

      {selectedCtx !== 'none' && (
        <div className={s.ctxPanel}>
          <div className={s.ctxLabel}>{selectedCtx === 'pdf' ? '📄 PDF selecionado' : '🖼️ Imagem selecionada'}</div>
          {(selectedCtx === 'pdf'
            ? ['Resumir documento', 'Extrair tópicos', 'Criar flashcards']
            : ['Descrever imagem', 'Extrair paleta', 'Identificar fontes']
          ).map(t => <button key={t} className={s.ctxTool}>{t}</button>)}
        </div>
      )}

      <div className={s.toolCats}>
        {TOOL_CATS.map(c => (
          <button
            key={c}
            className={`${s.toolCatBtn} ${toolCat === c ? s.toolCatActive : ''}`}
            onClick={() => setToolCat(c)}
          >{c}</button>
        ))}
      </div>

      <div className={s.toolSearchRow}>
        <input
          className={s.toolSearchInput}
          placeholder="🔍 Buscar ferramenta..."
          value={toolSearch}
          onChange={e => setToolSearch(e.target.value)}
        />
      </div>

      <div className={s.toolList}>
        {filteredTools.map(t => (
          <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" className={s.toolItem}>
            <span className={s.toolIcon} style={{ background: t.color }}>{t.letter}</span>
            <span className={s.toolName}>{t.name}</span>
            <span className={s.toolPricing} style={{ color: PRICING_COLOR[t.pricing] }}>{t.pricing}</span>
          </a>
        ))}
      </div>

      <div className={s.toolsFooter}>Ver todas as {ALL_TOOLS.length} ferramentas →</div>
    </aside>
  )

  return (
    <div className={s.layout}>
      {swapped ? rightSidebar : leftSidebar}

      <main className={s.main}>
        {/* Header */}
        <header className={s.header}>
          <div className={s.headerLeft}>
            <h1 className={s.greeting}>Olá, Charles 👋</h1>
            <p className={s.subtitle}>Seu hub de conhecimento pessoal</p>
          </div>
          <div className={s.headerRight}>
            <button className={s.swapBtn} onClick={() => setSwapped(v => !v)} title="Trocar lado das barras">
              ⇄ Trocar barras
            </button>
            <button className={s.ghBtn} onClick={() => setShowGH(v => !v)}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </button>
            <button className={s.addBtn} onClick={onOpenSearch}>+ Adicionar</button>
            <div className={s.avatar}>JT</div>
          </div>
        </header>

        {/* Stats */}
        <div className={s.stats}>
          {[
            { n: areas.reduce((s, a) => s + a.count, 0), l: 'Itens salvos' },
            { n: areas.length, l: 'Áreas' },
            { n: 12, l: 'Esta semana' },
            { n: 3, l: 'Coleções' },
          ].map(({ n, l }) => (
            <div key={l} className={s.statCard}>
              <div className={s.statNum}>{n}</div>
              <div className={s.statLabel}>{l}</div>
            </div>
          ))}
        </div>

        {/* GitHub analysis */}
        {showGH && (
          <section className={s.section}>
            <div className={s.sectionRow}>
              <h2 className={s.sectionTitle}>Repositório GitHub</h2>
              <button className={s.sectionClose} onClick={() => setShowGH(false)}>✕</button>
            </div>
            <GitHubWidget />
          </section>
        )}

        {/* Áreas */}
        <section className={s.section}>
          <div className={s.sectionRow}>
            <h2 className={s.sectionTitle}>Áreas de Conhecimento</h2>
            <button className={s.newAreaBtn} onClick={() => setNewAreaModal(true)}>+ Nova área</button>
          </div>
          <div className={s.areasGrid}>
            {areas.map((a) => (
              <Link key={a.id} to={`/area/${a.id}`} className={s.areaCard}>
                <div className={s.areaCardBar} style={{ background: a.color }} />
                <div className={s.areaCardEmoji}>{a.emoji}</div>
                <div className={s.areaCardTitle}>{a.title}</div>
                <div className={s.areaCardDesc}>{a.desc}</div>
                <div className={s.areaCardCount}>{a.count} itens</div>
              </Link>
            ))}
            <button className={s.areaCardAdd} onClick={() => setNewAreaModal(true)}>
              <span className={s.addPlusIcon}>+</span>
              <span>Nova área</span>
            </button>
          </div>
        </section>

        {/* Recentes */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Adicionados recentemente</h2>
          <div className={s.recentList}>
            {RECENT.map((r, i) => (
              <div key={i} className={s.recentItem}>
                <span className={s.recentIcon}>{r.icon}</span>
                <div className={s.recentInfo}>
                  <div className={s.recentTitle}>{r.title}</div>
                  <div className={s.recentMeta}>{r.area} · {r.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {swapped ? leftSidebar : rightSidebar}

      {/* Modal nova área */}
      {newAreaModal && (
        <div className={s.backdrop} onClick={() => setNewAreaModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3>Nova área de conhecimento</h3>

            <div className={s.emojiPicker}>
              {EMOJI_LIST.map(e => (
                <button
                  key={e}
                  className={`${s.emojiBtn} ${newArea.emoji === e ? s.emojiSelected : ''}`}
                  onClick={() => setNewArea(p => ({ ...p, emoji: e }))}
                >{e}</button>
              ))}
            </div>

            <input
              className={s.modalInput}
              placeholder="Nome da área (ex: Finanças)"
              value={newArea.title}
              onChange={e => setNewArea(p => ({ ...p, title: e.target.value }))}
              autoFocus
            />
            <input
              className={s.modalInput}
              placeholder="Descrição curta (ex: Contas, comprovantes)"
              value={newArea.desc}
              onChange={e => setNewArea(p => ({ ...p, desc: e.target.value }))}
            />

            <div className={s.colorRow}>
              <span className={s.colorLabel}>Cor:</span>
              {['#7c6ef7','#4f8ef7','#3ecf8e','#f78c4f','#e46ef7','#facc15','#f43f5e'].map(c => (
                <button
                  key={c}
                  className={`${s.colorDot} ${newArea.color === c ? s.colorSelected : ''}`}
                  style={{ background: c }}
                  onClick={() => setNewArea(p => ({ ...p, color: c }))}
                />
              ))}
            </div>

            <div className={s.modalBtns}>
              <button className={s.modalCancel} onClick={() => setNewAreaModal(false)}>Cancelar</button>
              <button className={s.modalSave} onClick={addArea} disabled={!newArea.title.trim()}>Criar área</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
