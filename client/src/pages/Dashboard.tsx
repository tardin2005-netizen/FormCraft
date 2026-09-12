import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useAreasStore } from '../store/areasStore'
import s from './Dashboard.module.css'

interface OutletCtx { onOpenSearch: () => void }

type GHCommit = { sha: string; commit: { message: string; author: { date: string } } }
type GHRepo   = { stargazers_count: number; open_issues_count: number; pushed_at: string; description: string | null }

const RECENT = [
  { icon: '📄', title: 'Princípios de Design Visual.pdf', area: 'UX & Design', time: '2h atrás' },
  { icon: '🔗', title: 'Figma Handbook', area: 'UX & Design', time: '5h atrás' },
  { icon: '📝', title: 'Ideias para o TCC', area: 'Faculdade', time: 'ontem' },
  { icon: '🖼️', title: 'Moodboard marca pessoal', area: 'Design', time: '2 dias' },
  { icon: '🤖', title: 'Prompt para geração de paleta', area: 'UX & Design', time: '3 dias' },
]

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
  const { onOpenSearch } = useOutletContext<OutletCtx>()
  const { areas, addArea, removeArea } = useAreasStore()

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
        <p className={s.heroSub}>Descreva um problema e o FormCraft recomenda a ferramenta certa — ou entre numa área abaixo.</p>
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
          { n: 12, l: 'Esta semana' },
          { n: 3,  l: 'Coleções' },
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

      {/* Áreas */}
      <section className={s.section}>
        <div className={s.sectionRow}>
          <h2 className={s.sectionTitle}>Suas áreas</h2>
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
