import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useAreasStore } from '../store/areasStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useAreaItemsStore } from '../store/areaItemsStore'
import { useWorkspacesStore } from '../store/workspacesStore'
import { useLinksStore } from '../store/linksStore'
import { useHubsStore } from '../store/hubsStore'
import WorkspaceCreator from '../components/WorkspaceCreator'
import VoiceSearch from '../components/VoiceSearch'
import s from './Dashboard.module.css'

interface OutletCtx { onOpenSearch: () => void }

type GHCommit = { sha: string; commit: { message: string; author: { date: string } } }
type GHRepo   = { stargazers_count: number; open_issues_count: number; pushed_at: string; description: string | null }

const TYPE_ICON: Record<string, string> = { link: '🔗', pdf: '📄', nota: '📝', imagem: '🖼️', prompt: '🤖' }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d === 1) return 'ontem'
  if (d < 7) return `${d} dias`
  return `${Math.floor(d / 7)} semanas`
}

const CHIPS = [
  { emoji: '🎬', label: 'gerar vídeo com IA' },
  { emoji: '✏️', label: 'criar artes e posts' },
  { emoji: '📊', label: 'analisar métricas' },
  { emoji: '🎤', label: 'gerar narração' },
]

const EMOJI_LIST = ['🎨','💻','📚','🎵','💼','🌱','🚀','⚡','🔥','🌍','🎯','🧠','📊','🏆','🎮','✏️','📷','🎬','🔬','💡']

function GitHubWidget() {
  const [repo,    setRepo]    = useState<GHRepo | null>(null)
  const [commits, setCommits] = useState<GHCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useState(() => {
    const owner = 'tardin2005-netizen', repoName = 'FormCraft'
    Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repoName}`).then(r => r.json()),
      fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=5`).then(r => r.json()),
    ])
      .then(([r, c]) => {
        if (r.message) { setError(true); return }
        setRepo(r); setCommits(Array.isArray(c) ? c : []); setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  })

  if (loading) return <div className={s.ghLoading}>Carregando dados do GitHub...</div>
  if (error)   return <div className={s.ghError}>⚠️ Repo não encontrado ou privado.</div>

  return (
    <div className={s.ghWidget}>
      <div className={s.ghHeader}>
        <span className={s.ghTitle}>tardin2005-netizen/FormCraft</span>
        <div className={s.ghMeta}>
          <span>⭐ {repo?.stargazers_count}</span>
          <span>🐛 {repo?.open_issues_count}</span>
          <span>{repo?.pushed_at ? new Date(repo.pushed_at).toLocaleDateString('pt-BR') : '—'}</span>
        </div>
      </div>
      <div className={s.ghCommits}>
        {commits.map(c => (
          <div key={c.sha} className={s.ghCommit}>
            <span className={s.ghSha}>{c.sha.slice(0,7)}</span>
            <span className={s.ghMsg}>{c.commit.message.split('\n')[0]}</span>
            <span className={s.ghDate}>{new Date(c.commit.author.date).toLocaleDateString('pt-BR')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { onOpenSearch } = useOutletContext<OutletCtx>()
  const { areas, addArea, removeArea } = useAreasStore()
  const { collections } = useCollectionsStore()
  const { items } = useAreaItemsStore()
  const { workspaces } = useWorkspacesStore()
  const { links } = useLinksStore()
  const { hubs } = useHubsStore()
  const [showWorkspaceCreator, setShowWorkspaceCreator] = useState(false)

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const thisWeekCount = items.filter(i => new Date(i.createdAt).getTime() > oneWeekAgo).length

  const recentLinks = [...links]
    .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))
    .slice(0, 5)

  const [heroQuery,    setHeroQuery]    = useState('')
  const [showGH,       setShowGH]       = useState(false)
  const [newAreaModal, setNewAreaModal] = useState(false)
  const [newArea,      setNewArea]      = useState({ emoji: '📁', title: '', desc: '', color: '#7c6ef7' })

  function handleAddArea() {
    if (!newArea.title.trim()) return
    addArea(newArea)
    setNewAreaModal(false)
    setNewArea({ emoji: '📁', title: '', desc: '', color: '#7c6ef7' })
  }

  return (
    <div className={s.page}>
      {/* Hero search */}
      <section className={s.hero}>
        <h1 className={s.heroTitle}>O que você precisa agora?</h1>
        <p className={s.heroSub}>Descreva ou fale sua dor e o FormCraft recomenda a ferramenta certa com IA.</p>
        <div className={s.heroSearch}>
          <span className={s.heroSearchIcon}>💬</span>
          <input
            className={s.heroInput}
            placeholder="ex: gerar vídeo com IA, analisar métricas do instagram..."
            value={heroQuery}
            onChange={e => setHeroQuery(e.target.value)}
            onFocus={onOpenSearch}
          />
          <button className={s.heroBtn}>Encontrar</button>
        </div>
        <div className={s.voiceRow}>
          <VoiceSearch />
          <span className={s.voiceHint}>ou fale sua dor — a IA recomenda a ferramenta certa</span>
        </div>
        <div className={s.chips}>
          {CHIPS.map(c => (
            <button key={c.label} className={s.chip} onClick={onOpenSearch}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div className={s.stats}>
        {[
          { n: areas.reduce((t, a) => t + a.count, 0), l: 'Itens salvos' },
          { n: areas.length, l: 'Áreas' },
          { n: thisWeekCount, l: 'Esta semana' },
          { n: collections.length, l: 'Coleções' },
        ].map(({ n, l }) => (
          <div key={l} className={s.statCard}>
            <div className={s.statNum}>{n}</div>
            <div className={s.statLabel}>{l}</div>
          </div>
        ))}
      </div>

      {/* GitHub */}
      {showGH && (
        <section className={s.section}>
          <div className={s.sectionRow}>
            <h2 className={s.sectionTitle}>Repositório GitHub</h2>
            <button className={s.sectionClose} onClick={() => setShowGH(false)}>✕</button>
          </div>
          <GitHubWidget />
        </section>
      )}

      {/* Meus Hubs */}
      <section className={s.section}>
        <div className={s.sectionRow}>
          <div>
            <h2 className={s.sectionTitle}>Meus Hubs</h2>
            <p className={s.sectionDesc}>Espaços estruturados para projetos longos — faculdade, estudos ou qualquer projeto com semestres, matérias e materiais organizados.</p>
          </div>
          <Link to="/hubs" className={s.sectionLink}>Ver todos →</Link>
        </div>
        {hubs.length === 0 ? (
          <Link to="/hubs" className={s.wsEmptyCard}>
            <span className={s.wsEmptyPlus}>+</span>
            <span className={s.wsEmptyTitle}>Criar primeiro Hub</span>
            <span className={s.wsEmptyDesc}>Organize faculdade, estudos ou projetos longos com estrutura de semestres e matérias.</span>
          </Link>
        ) : (
          <div className={s.hubGallery}>
            {hubs.map(hub => (
              <Link key={hub.id} to={`/hub/${hub.id}`} className={s.hubGalleryCard}>
                <div className={s.hubGalleryCover}>
                  <div
                    className={s.hubGalleryCoverBg}
                    style={{ background: `linear-gradient(135deg, ${hub.color}ee 0%, ${hub.color}88 100%)` }}
                  />
                  <span className={s.hubGalleryEmoji}>{hub.emoji}</span>
                  <span className={s.hubGalleryTitle}>{hub.name}</span>
                </div>
                <div className={s.hubGalleryMeta}>
                  <span className={s.hubGalleryMetaName}>{hub.name}</span>
                  <span className={s.hubGalleryMetaType}>{hub.type === 'faculdade' ? 'Faculdade' : 'Hub'}</span>
                </div>
              </Link>
            ))}
            <Link to="/hubs" className={s.hubGalleryAdd}>
              <span>+</span>
              <span>Novo Hub</span>
            </Link>
          </div>
        )}
      </section>

      {/* Workspaces adaptativos */}
      <section className={s.section}>
        <div className={s.sectionRow}>
          <div>
            <h2 className={s.sectionTitle}>Workspaces</h2>
            <p className={s.sectionDesc}>Ambientes de trabalho personalizados com módulos — ferramentas, tarefas, notas e fluxos reunidos num só lugar.</p>
          </div>
          <button className={s.newAreaBtn} onClick={() => setShowWorkspaceCreator(true)}>+ Novo espaço</button>
        </div>
        {workspaces.length === 0 ? (
          <button className={s.wsEmptyCard} onClick={() => setShowWorkspaceCreator(true)}>
            <span className={s.wsEmptyPlus}>+</span>
            <span className={s.wsEmptyTitle}>Criar primeiro workspace</span>
            <span className={s.wsEmptyDesc}>Design, Faculdade, TI, Marketing — o FormCraft se adapta ao seu contexto.</span>
          </button>
        ) : (
          <div className={s.wsGrid}>
            {workspaces.map(ws => (
              <button key={ws.id} className={s.wsCard} onClick={() => navigate(`/workspace/${ws.id}`)}>
                <div className={s.wsCardBar} style={{ background: ws.color }} />
                <div className={s.wsCardBody}>
                  <div className={s.wsCardIcon}>{ws.icon}</div>
                  <div className={s.wsCardName}>{ws.name}</div>
                  <div className={s.wsCardModules}>{ws.modules.filter(m => m.type !== 'overview').length} módulos</div>
                </div>
              </button>
            ))}
            <button className={s.areaCardAdd} onClick={() => setShowWorkspaceCreator(true)}>
              <span className={s.addPlusIcon}>+</span>
              <span>Novo espaço</span>
            </button>
          </div>
        )}
      </section>

      {/* Áreas */}
      <section className={s.section}>
        <div className={s.sectionRow}>
          <div>
            <h2 className={s.sectionTitle}>Suas áreas</h2>
            <p className={s.sectionDesc}>Coleções temáticas para guardar links, notas, PDFs e prompts por assunto — Faculdade, Finanças, Marketing e o que mais precisar.</p>
          </div>
          <div className={s.sectionActions}>
            <button className={s.ghToggleBtn} onClick={() => setShowGH(v => !v)}>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </button>
            <button className={s.newAreaBtn} onClick={() => setNewAreaModal(true)}>+ Nova área</button>
          </div>
        </div>
        <div className={s.areasGrid}>
          {areas.map(a => (
            <div key={a.id} className={s.areaCardWrapper}>
              <Link to={`/area/${a.id}`} className={s.areaCard}>
                <div className={s.areaCardBar} style={{ background: a.color }} />
                <div className={s.areaCardEmoji}>{a.emoji}</div>
                <div className={s.areaCardTitle}>{a.title}</div>
                <div className={s.areaCardDesc}>{a.desc}</div>
                <div className={s.areaCardCount}>{a.count} itens</div>
              </Link>
              <button
                className={s.areaDeleteBtn}
                onClick={(e) => { e.preventDefault(); if (confirm(`Apagar área "${a.title}"?`)) removeArea(a.id) }}
                title="Apagar área"
              >✕</button>
            </div>
          ))}
          <button className={s.areaCardAdd} onClick={() => setNewAreaModal(true)}>
            <span className={s.addPlusIcon}>+</span>
            <span>Nova área</span>
          </button>
        </div>
      </section>

      {/* Recentes */}
      {recentLinks.length > 0 && (
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Adicionados recentemente</h2>
          <div className={s.recentList}>
            {recentLinks.map(link => {
              const areaName = areas.find(a => a.id === link.areaId)?.title ?? ''
              return (
                <div key={link.id} className={s.recentItem}>
                  <span className={s.recentIcon}>{TYPE_ICON[link.type] ?? '🔗'}</span>
                  <div className={s.recentInfo}>
                    <div className={s.recentTitle}>{link.title}</div>
                    <div className={s.recentMeta}>
                      {areaName && `${areaName} · `}
                      {timeAgo(new Date(link.savedAt).toISOString())}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Workspace Creator */}
      {showWorkspaceCreator && (
        <WorkspaceCreator onClose={() => setShowWorkspaceCreator(false)} />
      )}

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
              <button className={s.modalSave} onClick={handleAddArea} disabled={!newArea.title.trim()}>Criar área</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
