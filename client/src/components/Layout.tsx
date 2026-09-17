import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Hexagon, Inbox, BookMarked, Wrench, Settings,
  LogOut, Search, Link2, Sun, Moon, PanelLeft, Grid2X2, CheckSquare, Bookmark,
} from 'lucide-react'
import { useThemeStore, ACCENT_COLORS } from '../store/themeStore'
import { useAreasStore } from '../store/areasStore'
import { useAreaItemsStore } from '../store/areaItemsStore'
import { useSidebarStore } from '../store/sidebarStore'
import { useSavedToolsStore } from '../store/savedToolsStore'
import type { Accent } from '../store/themeStore'
import { useAuth } from '../contexts/AuthContext'
import { ALL_TOOLS, TOOL_CATS, type ToolCategory } from '../data/tools'
import SearchPalette from './SearchPalette'
import SaveLinkModal from './SaveLinkModal'
import QuickNote from './QuickNote'
import FormCraftChat from './FormCraftChat'
import s from './Layout.module.css'

const ACCENT_LABELS: Record<Accent, string> = {
  violet: 'Violeta', blue: 'Azul', green: 'Verde', orange: 'Laranja', pink: 'Rosa',
}

const NAV_ITEMS = [
  { to: '/',            Icon: LayoutDashboard, label: 'Início' },
  { to: '/hubs',        Icon: Hexagon,         label: 'Meus Hubs' },
  { to: '/tarefas',     Icon: CheckSquare,     label: 'Tarefas' },
  { to: '/inbox',       Icon: Inbox,           label: 'Inbox' },
  { to: '/colecoes',    Icon: BookMarked,      label: 'Coleções' },
  { to: '/salvos',      Icon: Bookmark,        label: 'Salvos' },
  { to: '/ferramentas', Icon: Wrench,          label: 'Ferramentas' },
  { to: '/settings',    Icon: Settings,        label: 'Config.' },
]

const LEFT_W  = { expanded: 220, compact: 56, hidden: 0 }
const RIGHT_W = { expanded: 264, compact: 48, hidden: 0 }

export default function Layout() {
  const { theme, toggle, accent, setAccent } = useThemeStore()
  const { areas } = useAreasStore()
  const { items: areaItems, addItem: addAreaItem } = useAreaItemsStore()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const areaMatch = location.pathname.match(/^\/area\/([^/]+)/)
  const activeAreaId = areaMatch ? areaMatch[1] : null

  const [expandedAreaIds, setExpandedAreaIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (activeAreaId) {
      setExpandedAreaIds(prev => new Set([...prev, activeAreaId]))
    }
  }, [activeAreaId])

  function toggleArea(id: string) {
    setExpandedAreaIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const { leftState, rightState, cycleLeft, cycleRight, setLeft, setRight } = useSidebarStore()
  const { saved: savedToolNames, isSaved, saveTool, unsaveTool } = useSavedToolsStore()

  const [newChatOpen,   setNewChatOpen]   = useState(false)
  const [newChatTitle,  setNewChatTitle]  = useState('')
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [saveLinkOpen,  setSaveLinkOpen]  = useState(false)
  const [settingsOpen,  setSettingsOpen]  = useState(false)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const [aiChatOpen,    setAiChatOpen]    = useState(false)
  const [toolCat,      setToolCat]      = useState<ToolCategory>('Todas')
  const [toolSearch,   setToolSearch]   = useState('')

  const avatarRef   = useRef<HTMLButtonElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); setSaveLinkOpen(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); setQuickNoteOpen(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') { e.preventDefault(); cycleLeft() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') { e.preventDefault(); setAiChatOpen(v => !v) }
      if (e.key === 'Escape') { setSearchOpen(false); setSettingsOpen(false); setSaveLinkOpen(false); setQuickNoteOpen(false); setAiChatOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        settingsRef.current && !settingsRef.current.contains(e.target as Node) &&
        avatarRef.current  && !avatarRef.current.contains(e.target as Node)
      ) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function getInitials(name: string | null) {
    if (!name) return '?'
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }

  const filteredTools = (() => {
    const matches = ALL_TOOLS.filter(t =>
      (toolCat === 'Todas' || t.cat === toolCat) &&
      (t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
       t.desc.toLowerCase().includes(toolSearch.toLowerCase()))
    )
    const saved = matches.filter(t => isSaved(t.name))
    const rest  = matches.filter(t => !isSaved(t.name))
    return [...saved, ...rest]
  })()

  function handleAddChat() {
    if (!newChatTitle.trim() || !activeAreaId) return
    addAreaItem({ areaId: activeAreaId, type: 'chat', title: newChatTitle.trim() })
    setNewChatTitle('')
    setNewChatOpen(false)
  }

  const leftW  = LEFT_W[leftState]
  const rightW = RIGHT_W[rightState]
  const isLeftHidden  = leftState  === 'hidden'
  const isRightHidden = rightState === 'hidden'

  return (
    <div className={s.shell}>

      {/* ── Left sidebar ── */}
      <motion.aside
        className={s.left}
        animate={{ width: leftW }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        style={{ overflow: 'hidden', flexShrink: 0 }}
      >
        {leftState !== 'hidden' && (
          <>
            <div className={s.leftHeader}>
              <AnimatePresence initial={false}>
                {leftState === 'expanded' && (
                  <motion.span
                    className={s.logo}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: .15 }}
                  >⬡ FormCraft</motion.span>
                )}
              </AnimatePresence>
              {leftState === 'compact' && <span className={s.logoMini}>⬡</span>}
              <button
                className={s.collapseBtn}
                onClick={cycleLeft}
                title={leftState === 'expanded' ? 'Compactar (⌘\\)' : 'Expandir (⌘\\)'}
              >
                <motion.span
                  animate={{ rotate: leftState === 'expanded' ? 180 : 0 }}
                  transition={{ duration: .2 }}
                >›</motion.span>
              </button>
            </div>

            <nav className={s.leftNav}>
              {NAV_ITEMS.map(({ to, Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `${s.navItem} ${isActive ? s.navActive : ''} ${leftState === 'compact' ? s.navCompact : ''}`
                  }
                  {...(leftState === 'compact' ? { 'data-label': label } : {})}
                >
                  <Icon size={16} className={s.navIcon} />
                  <AnimatePresence initial={false}>
                    {leftState === 'expanded' && (
                      <motion.span
                        className={s.navLabel}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: .15 }}
                      >{label}</motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              ))}
            </nav>

            <AnimatePresence initial={false}>
              {leftState === 'expanded' && (
                <motion.div
                  className={s.areasSection}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: .15 }}
                >
                  <div className={s.areasLabel}>Áreas</div>
                  {areas.map((a, i) => {
                    const chats = areaItems.filter(item => item.areaId === a.id && item.type === 'chat')
                    const isExpanded = expandedAreaIds.has(a.id)
                    const isActive = activeAreaId === a.id
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * .04, duration: .2 }}
                      >
                        <div
                          className={`${s.areaItem} ${isActive ? s.navActive : ''}`}
                          onClick={() => { navigate(`/area/${a.id}`); setExpandedAreaIds(prev => new Set([...prev, a.id])) }}
                        >
                          <span>{a.emoji}</span>
                          <span className={s.areaItemTitle}>{a.title}</span>
                          <span className={s.areaItemCount}>{areaItems.filter(item => item.areaId === a.id).length}</span>
                          <button
                            className={s.areaChevron}
                            onClick={e => { e.stopPropagation(); toggleArea(a.id) }}
                            title={isExpanded ? 'Recolher' : 'Expandir canais'}
                          >
                            <motion.span
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: .15 }}
                              style={{ display: 'inline-block' }}
                            >›</motion.span>
                          </button>
                        </div>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key="channels"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: .18 }}
                              style={{ overflow: 'hidden' }}
                            >
                              {chats.length === 0 && (
                                <div className={s.noChannels}>Nenhum canal ainda</div>
                              )}
                              {chats.map(chat => (
                                <NavLink
                                  key={chat.id}
                                  to={`/area/${a.id}/chat/${chat.id}`}
                                  className={({ isActive: ca }) => `${s.channelItem} ${ca ? s.navActive : ''}`}
                                >
                                  <span className={s.channelHash}>#</span>
                                  <span className={s.channelTitle}>{chat.title}</span>
                                </NavLink>
                              ))}
                              {isActive && (
                                <button className={s.addChannelBtn} onClick={() => setNewChatOpen(true)}>
                                  + Novo canal
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                  <button className={s.addAreaBtn} onClick={() => navigate('/?nova-area=1')}>
                    + Nova área
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {leftState === 'compact' && (
              <div className={s.areasIconsOnly}>
                {areas.map(a => {
                  const chats = areaItems.filter(item => item.areaId === a.id && item.type === 'chat')
                  const isExpanded = expandedAreaIds.has(a.id)
                  return (
                    <div key={a.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <NavLink
                        to={`/area/${a.id}`}
                        className={({ isActive }) => `${s.areaIconItem} ${isActive ? s.navActive : ''}`}
                        title={a.title}
                        onClick={() => setExpandedAreaIds(prev => new Set([...prev, a.id]))}
                      >{a.emoji}</NavLink>
                      {isExpanded && chats.map(chat => (
                        <NavLink
                          key={chat.id}
                          to={`/area/${a.id}/chat/${chat.id}`}
                          className={({ isActive }) => `${s.channelIconItem} ${isActive ? s.navActive : ''}`}
                          title={`#${chat.title}`}
                        >#</NavLink>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}

            <div className={s.leftBottom}>
              <AnimatePresence initial={false} mode="wait">
                {leftState === 'expanded' ? (
                  <motion.div
                    key="exp"
                    className={s.userCard}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .15 }}
                  >
                    <div
                      className={s.userAvatar}
                      style={user?.photoURL ? { padding: 0, overflow: 'hidden' } : {}}
                    >
                      {user?.photoURL
                        ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                        : getInitials(user?.displayName ?? null)
                      }
                    </div>
                    <div className={s.userInfo}>
                      <div className={s.userName}>{user?.displayName ?? 'Usuário'}</div>
                      <div className={s.userEmail}>{user?.email ?? ''}</div>
                    </div>
                    <button className={s.userSignOut} onClick={signOut} title="Sair da conta">
                      <LogOut size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cmp"
                    className={s.userAvatarCompact}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .15 }}
                  >
                    <div
                      className={s.userAvatarIcon}
                      style={user?.photoURL ? { padding: 0, overflow: 'hidden' } : {}}
                      title={user?.displayName ?? 'Usuário'}
                    >
                      {user?.photoURL
                        ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                        : getInitials(user?.displayName ?? null)
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.aside>

      {/* Sliver: show left sidebar when hidden */}
      {isLeftHidden && (
        <div className={s.leftSliver} onClick={() => setLeft('compact')} title="Mostrar sidebar (⌘\\)" />
      )}

      {/* ── Main wrapper ── */}
      <div className={s.mainWrapper}>
        <header className={s.topBar}>
          <div className={s.topLeft}>
            {isLeftHidden && (
              <button
                className={s.topIconBtn}
                onClick={() => setLeft('compact')}
                title="Mostrar sidebar (⌘\\)"
              >
                <PanelLeft size={15} />
              </button>
            )}
            <span className={s.topLogo}>⬡ FormCraft</span>
          </div>

          <div className={s.topActions}>
            <button className={s.topSearchBtn} onClick={() => setSearchOpen(true)}>
              <Search size={13} /> Buscar <kbd className={s.topKbd}>⌘K</kbd>
            </button>
            <button className={s.topSaveLinkBtn} onClick={() => setSaveLinkOpen(true)} title="Salvar link (⌘S)">
              <Link2 size={15} />
            </button>
            <button
              className={`${s.topIconBtn} ${rightState !== 'hidden' ? s.topIconActive : ''}`}
              onClick={cycleRight}
              title={
                rightState === 'expanded' ? 'Compactar ferramentas' :
                rightState === 'compact'  ? 'Ocultar ferramentas' : 'Mostrar ferramentas'
              }
            >
              <Grid2X2 size={15} />
            </button>
            <button
              className={`${s.topIconBtn} ${s.aiBtn} ${aiChatOpen ? s.topIconActive : ''}`}
              onClick={() => setAiChatOpen(v => !v)}
              title="FormCraft AI (⌘J)"
            >
              ⬡
            </button>
            <button className={s.topIconBtn} onClick={toggle} title="Tema">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className={s.avatarWrapper}>
              <button
                ref={avatarRef}
                className={s.avatar}
                onClick={() => setSettingsOpen(v => !v)}
                style={user?.photoURL ? { padding: 0, overflow: 'hidden' } : {}}
              >
                {user?.photoURL
                  ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                  : getInitials(user?.displayName ?? null)
                }
              </button>
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    ref={settingsRef}
                    className={s.settingsPopup}
                    initial={{ opacity: 0, y: -8, scale: .96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: .96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <div className={s.settingsUser}>
                      <div className={s.settingsAvatar} style={user?.photoURL ? { padding: 0, overflow: 'hidden' } : {}}>
                        {user?.photoURL
                          ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                          : getInitials(user?.displayName ?? null)
                        }
                      </div>
                      <div>
                        <div className={s.settingsName}>{user?.displayName ?? 'Usuário'}</div>
                        <div className={s.settingsEmail}>{user?.email ?? ''}</div>
                      </div>
                    </div>
                    <div className={s.settingsDivider} />
                    <div className={s.settingsRow}>
                      <span className={s.settingsRowLabel}>Tema</span>
                      <div className={s.themeToggle}>
                        <button className={`${s.themeOpt} ${theme === 'dark' ? s.themeOptActive : ''}`}
                          onClick={() => useThemeStore.getState().setTheme('dark')}>🌙</button>
                        <button className={`${s.themeOpt} ${theme === 'bw' ? s.themeOptActive : ''}`}
                          onClick={() => useThemeStore.getState().setTheme('bw')}>☀️</button>
                      </div>
                    </div>
                    <div className={s.settingsRow}>
                      <span className={s.settingsRowLabel}>Cor de destaque</span>
                      <div className={s.accentPicker}>
                        {(Object.keys(ACCENT_COLORS) as Accent[]).map(a => (
                          <button
                            key={a}
                            className={`${s.accentDot} ${accent === a ? s.accentDotActive : ''}`}
                            style={{ background: ACCENT_COLORS[a].accent }}
                            onClick={() => useThemeStore.getState().setAccent(a)}
                            title={ACCENT_LABELS[a]}
                          />
                        ))}
                      </div>
                    </div>
                    <div className={s.settingsDivider} />
                    <div className={s.settingsRow}>
                      <span className={s.settingsRowLabel}>Sidebar</span>
                      <div className={s.sidebarPills}>
                        {(['expanded','compact','hidden'] as const).map(st => (
                          <button
                            key={st}
                            className={`${s.sidebarPill} ${leftState === st ? s.sidebarPillActive : ''}`}
                            onClick={() => setLeft(st)}
                            title={st}
                          >
                            {st === 'expanded' ? '◧' : st === 'compact' ? '◫' : '□'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={s.settingsDivider} />
                    <NavLink to="/settings" className={s.settingsLink} onClick={() => setSettingsOpen(false)}>
                      ⚙️ Ver todas as configurações →
                    </NavLink>
                    <div className={s.settingsDivider} />
                    <button
                      className={s.settingsLogout}
                      onClick={() => { signOut(); setSettingsOpen(false) }}
                    >🚪 Sair da conta</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className={s.content}>
          <Outlet context={{ onOpenSearch: (q?: string) => { setSearchQuery(q ?? ''); setSearchOpen(true) }, onOpenSaveLink: () => setSaveLinkOpen(true) }} />
        </main>
      </div>

      {/* ── Right sidebar (Tools) ── */}
      <motion.aside
        className={s.right}
        animate={{ width: rightW }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        style={{ overflow: 'hidden', flexShrink: 0 }}
      >
        {rightState === 'compact' && (
          <motion.div
            key="compact"
            className={s.rightCompact}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .15 }}
          >
            <button className={s.rightExpandBtn} onClick={() => setRight('expanded')} title="Expandir ferramentas">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="6" height="6" rx="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5"/>
              </svg>
            </button>
            {TOOL_CATS.filter(c => c !== 'Todas').map(c => (
              <button
                key={c}
                className={`${s.catIconBtn} ${toolCat === c ? s.catIconActive : ''}`}
                onClick={() => { setToolCat(c); setRight('expanded') }}
                title={c}
              >
                {c === 'IA & Pesquisa' ? '🤖' :
                 c === 'Imagem & Design' ? '🎨' :
                 c === 'Criar vídeo' ? '🎬' :
                 c === 'Áudio & Voz' ? '🔊' :
                 c === 'Métricas' ? '📊' :
                 c === 'Banco de Imagens' ? '🖼️' : '◈'}
              </button>
            ))}
          </motion.div>
        )}

        {rightState === 'expanded' && (
          <motion.div
            key="expanded"
            className={s.rightExpanded}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .15 }}
          >
            <div className={s.rightHeader}>
              <span className={s.rightTitle}>⭐ Favoritas</span>
              <button className={s.rightCollapseBtn} onClick={cycleRight} title="Compactar">›</button>
            </div>

            <div className={s.toolSearchRow}>
              <input
                className={s.toolSearchInput}
                placeholder="🔍 Buscar favorita..."
                value={toolSearch}
                onChange={e => setToolSearch(e.target.value)}
              />
            </div>

            <div className={s.toolList}>
              {(() => {
                const favs = ALL_TOOLS.filter(t =>
                  isSaved(t.name) &&
                  (!toolSearch || t.name.toLowerCase().includes(toolSearch.toLowerCase()) || t.desc.toLowerCase().includes(toolSearch.toLowerCase()))
                )
                if (favs.length === 0) return (
                  <div className={s.toolEmptyFav}>
                    <div className={s.toolEmptyFavIcon}>☆</div>
                    <div className={s.toolEmptyFavText}>Nenhuma ferramenta favorita ainda</div>
                    <NavLink to="/ferramentas" className={s.toolEmptyFavLink} onClick={cycleRight}>
                      Abrir biblioteca →
                    </NavLink>
                  </div>
                )
                return favs.map((t, i) => (
                  <motion.a
                    key={t.name}
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.toolItem}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * .02, duration: .18 }}
                    whileHover={{ backgroundColor: 'var(--surface2)' }}
                  >
                    <span className={s.toolIcon} style={{ background: t.color }}>{t.letter}</span>
                    <span className={s.toolInfo}>
                      <span className={s.toolName}>{t.name}</span>
                      <span className={s.toolDesc}>{t.desc}</span>
                    </span>
                    <button
                      className={`${s.toolSaveBtn} ${s.toolSaved}`}
                      onClick={e => { e.preventDefault(); unsaveTool(t.name) }}
                      title="Remover dos favoritos"
                    >★</button>
                  </motion.a>
                ))
              })()}
            </div>

            <NavLink to="/ferramentas" className={s.toolsFooter}>
              Ver biblioteca completa →
            </NavLink>
          </motion.div>
        )}
      </motion.aside>

      {/* ── Mobile bottom nav ── */}
      <nav className={s.bottomNav}>
        {NAV_ITEMS.slice(0, 5).map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${s.bottomNavItem} ${isActive ? s.bottomNavActive : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {searchOpen    && <SearchPalette onClose={() => { setSearchOpen(false); setSearchQuery('') }} initialQuery={searchQuery} />}
      {saveLinkOpen  && <SaveLinkModal onClose={() => setSaveLinkOpen(false)} />}
      <AnimatePresence>{quickNoteOpen && <QuickNote onClose={() => setQuickNoteOpen(false)} />}</AnimatePresence>
      <FormCraftChat open={aiChatOpen} onClose={() => setAiChatOpen(false)} />

      {newChatOpen && (
        <div className={s.newChatBackdrop} onClick={() => setNewChatOpen(false)}>
          <div className={s.newChatModal} onClick={e => e.stopPropagation()}>
            <div className={s.newChatTitle}>Novo canal</div>
            <input
              className={s.newChatInput}
              placeholder="Nome do canal..."
              value={newChatTitle}
              onChange={e => setNewChatTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddChat(); if (e.key === 'Escape') setNewChatOpen(false) }}
              autoFocus
            />
            <div className={s.newChatFooter}>
              <button className={s.newChatCancel} onClick={() => setNewChatOpen(false)}>Cancelar</button>
              <button className={s.newChatSave} onClick={handleAddChat} disabled={!newChatTitle.trim()}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
