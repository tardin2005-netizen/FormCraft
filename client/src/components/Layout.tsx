import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Hexagon, Inbox, BookMarked, Wrench, Settings,
  LogOut, Search, Link2, Sun, Moon, PanelLeft, Grid2X2, CheckSquare, Bookmark, Library, MoreHorizontal,
  UserRound, ChevronRight, Palette, Monitor, Keyboard, Download, X, Lightbulb,
} from 'lucide-react'
import { useThemeStore, ACCENT_COLORS } from '../store/themeStore'
import { useAreasStore } from '../store/areasStore'
import { useAreaItemsStore } from '../store/areaItemsStore'
import { useSidebarStore, LEFT_DEFAULT_WIDTH, LEFT_MIN_WIDTH } from '../store/sidebarStore'
import { useSavedToolsStore } from '../store/savedToolsStore'
import type { Accent } from '../store/themeStore'
import { useAuth } from '../contexts/AuthContext'
import { ALL_TOOLS, TOOL_CATS, type ToolCategory } from '../data/tools'
import SearchPalette from './SearchPalette'
import ErrorBoundary from './ErrorBoundary'
import RescueBanner from './RescueBanner'
import { usePwaInstall, promptInstall } from '../hooks/usePwaInstall'
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
  { to: '/conceitos',   Icon: Lightbulb,       label: 'Conceitos' },
  { to: '/biblioteca',  Icon: Library,         label: 'Biblioteca' },
  { to: '/tarefas',     Icon: CheckSquare,     label: 'Tarefas' },
  { to: '/inbox',       Icon: Inbox,           label: 'Inbox' },
  { to: '/colecoes',    Icon: BookMarked,      label: 'Coleções' },
  { to: '/salvos',      Icon: Bookmark,        label: 'Salvos' },
  { to: '/ferramentas', Icon: Wrench,          label: 'Ferramentas' },
  { to: '/settings',    Icon: Settings,        label: 'Config.' },
]

const MOBILE_PRIMARY = 4

const MOD_KEY = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'
const SHORTCUTS: [string[], string][] = [
  [['Mod', 'K'], 'Buscar em tudo'],
  [['Mod', 'S'], 'Salvar um link'],
  [['Mod', 'N'], 'Nota rápida'],
  [['Mod', 'J'], 'Chat com a IA'],
  [['Mod', '\\'], 'Mostrar ou recolher a barra lateral'],
  [['?'], 'Abrir esta lista'],
  [['Esc'], 'Fechar janelas e painéis'],
]

const LEFT_W  = { expanded: 220, compact: 56, hidden: 0 }
const RIGHT_W = { expanded: 264, compact: 48, hidden: 0 }

export default function Layout() {
  const { theme, mode, setMode, toggle, accent, setAccent } = useThemeStore()
  const { areas } = useAreasStore()
  const { items: areaItems, addItem: addAreaItem } = useAreaItemsStore()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const areaMatch = location.pathname.match(/^\/area\/([^/]+)/)
  const activeAreaId = areaMatch ? areaMatch[1] : null

  const [expandedAreaIds, setExpandedAreaIds] = useState<Set<string>>(new Set())

  useEffect(() => { setMoreOpen(false) }, [location.pathname])

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

  const { leftState, rightState, cycleLeft, cycleRight, setLeft, setRight, leftCustomWidth, setLeftCustomWidth } = useSidebarStore()
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const { saved: savedToolNames, isSaved, saveTool, unsaveTool } = useSavedToolsStore()

  const [newChatOpen,   setNewChatOpen]   = useState(false)
  const [newChatTitle,  setNewChatTitle]  = useState('')
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [saveLinkOpen,  setSaveLinkOpen]  = useState(false)
  const [settingsOpen,  setSettingsOpen]  = useState(false)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const [aiChatOpen,    setAiChatOpen]    = useState(false)
  const [moreOpen,      setMoreOpen]      = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [iosHelpOpen,   setIosHelpOpen]   = useState(false)
  const pwa = usePwaInstall()
  const [installDismissed, setInstallDismissed] = useState(() => { try { return localStorage.getItem('formcraft-install-dismissed') === '1' } catch { return false } })
  const dismissInstall = () => { setInstallDismissed(true); try { localStorage.setItem('formcraft-install-dismissed', '1') } catch { /* ignore */ } }
  async function installApp() {
    if (pwa.canPrompt) { if (await promptInstall()) dismissInstall() }
    else setIosHelpOpen(true)
  }
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
      if (e.key === 'Escape') { setSearchOpen(false); setSettingsOpen(false); setSaveLinkOpen(false); setQuickNoteOpen(false); setAiChatOpen(false); setShortcutsOpen(false); setIosHelpOpen(false) }
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))
      if (e.key === '?' && !typing) { e.preventDefault(); setShortcutsOpen(v => !v) }
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

  function handleLeftResizeStart(e: React.MouseEvent) {
    e.preventDefault()
    const startX = e.clientX
    const startW = leftState === 'compact' ? LEFT_MIN_WIDTH : leftCustomWidth

    setIsResizingLeft(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    function onMove(ev: MouseEvent) {
      const newW = startW + (ev.clientX - startX)
      if (newW < 100) {
        setLeft('compact')
      } else {
        setLeft('expanded')
        setLeftCustomWidth(newW)
      }
    }

    function onUp() {
      setIsResizingLeft(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function handleLeftResizeDblClick() {
    setLeft('expanded')
    setLeftCustomWidth(LEFT_DEFAULT_WIDTH)
  }

  function handleAddChat() {
    if (!newChatTitle.trim() || !activeAreaId) return
    addAreaItem({ areaId: activeAreaId, type: 'chat', title: newChatTitle.trim() })
    setNewChatTitle('')
    setNewChatOpen(false)
  }

  const leftW = leftState === 'hidden' ? 0 : leftState === 'compact' ? LEFT_W.compact : leftCustomWidth
  const rightW = RIGHT_W[rightState]
  const isLeftHidden  = leftState  === 'hidden'
  const isRightHidden = rightState === 'hidden'

  return (
    <div className={s.shell}>

      {/* ── Left sidebar ── */}
      <motion.aside
        className={s.left}
        animate={{ width: leftW }}
        transition={isResizingLeft ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 30 }}
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

            {leftState === 'expanded' && pwa.available && !installDismissed && (
              <div className={s.installCard}>
                <button className={s.installClose} onClick={dismissInstall} aria-label="Dispensar aviso de instalação"><X size={13} /></button>
                <div className={s.installIcon}><Download size={16} /></div>
                <div className={s.installTitle}>Instale o FormCraft</div>
                <div className={s.installText}>Abre em janela própria, direto da área de trabalho ou da tela inicial do celular.</div>
                <button className={s.installBtn} onClick={installApp}>Instalar app</button>
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

      {/* ── Left resize handle ── */}
      {!isLeftHidden && (
        <div
          className={`${s.resizeHandle} ${isResizingLeft ? s.resizeHandleActive : ''}`}
          onMouseDown={handleLeftResizeStart}
          onDoubleClick={handleLeftResizeDblClick}
          title="Arrastar para redimensionar · Duplo clique para restaurar"
        />
      )}

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
            <button className={`${s.topIconBtn} ${s.mobileOnly}`} onClick={() => setSearchOpen(true)} aria-label="Buscar">
              <Search size={16} />
            </button>
            <button className={s.topSaveLinkBtn} onClick={() => setSaveLinkOpen(true)} title="Salvar link (⌘S)">
              <Link2 size={15} />
            </button>
            <button
              className={`${s.topIconBtn} ${s.desktopOnly} ${rightState !== 'hidden' ? s.topIconActive : ''}`}
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
            <button className={`${s.topIconBtn} ${s.desktopOnly}`} onClick={toggle} title="Tema">
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
                    <NavLink to="/settings" className={s.menuItem} onClick={() => setSettingsOpen(false)}>
                      <UserRound size={16} /><span>Minha conta</span><ChevronRight size={14} className={s.menuChevron} />
                    </NavLink>
                    <div className={s.menuGroup}>
                      <div className={s.menuItemStatic}><Palette size={16} /><span>Aparência</span></div>
                      <div className={s.segmented} role="radiogroup" aria-label="Tema">
                        {([['bw', 'Claro', Sun], ['dark', 'Escuro', Moon], ['system', 'Sistema', Monitor]] as const).map(([m, label, Ico]) => (
                          <button key={m} role="radio" aria-checked={mode === m}
                            className={`${s.segBtn} ${mode === m ? s.segActive : ''}`}
                            onClick={() => setMode(m)}><Ico size={13} />{label}</button>
                        ))}
                      </div>
                      <div className={s.accentPicker} aria-label="Cor de destaque">
                        {(Object.keys(ACCENT_COLORS) as Accent[]).map(a => (
                          <button
                            key={a}
                            className={`${s.accentDot} ${accent === a ? s.accentDotActive : ''}`}
                            style={{ background: ACCENT_COLORS[a].accent }}
                            onClick={() => useThemeStore.getState().setAccent(a)}
                            title={ACCENT_LABELS[a]}
                            aria-label={`Cor ${ACCENT_LABELS[a]}`}
                          />
                        ))}
                      </div>
                    </div>
                    <button className={s.menuItem} onClick={() => { setShortcutsOpen(true); setSettingsOpen(false) }}>
                      <Keyboard size={16} /><span>Atalhos de teclado</span><kbd className={s.menuKbd}>?</kbd>
                    </button>
                    {pwa.available && (
                      <button className={s.menuItem} onClick={() => { setSettingsOpen(false); installApp() }}>
                        <Download size={16} /><span>Instalar app</span>
                      </button>
                    )}
                    <div className={s.settingsDivider} />
                    <button className={`${s.menuItem} ${s.menuDanger}`} onClick={() => { setSettingsOpen(false); signOut() }}>
                      <LogOut size={16} /><span>Sair da conta</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className={s.content}>
          <RescueBanner />
          <ErrorBoundary key={location.pathname}>
            <Outlet context={{ onOpenSearch: (q?: string) => { setSearchQuery(q ?? ''); setSearchOpen(true) }, onOpenSaveLink: () => setSaveLinkOpen(true), onOpenQuickNote: () => setQuickNoteOpen(true) }} />
          </ErrorBoundary>
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
      <nav className={s.bottomNav} aria-label="Navegação principal">
        {NAV_ITEMS.slice(0, MOBILE_PRIMARY).map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${s.bottomNavItem} ${isActive ? s.bottomNavActive : ''}`}
            onClick={() => setMoreOpen(false)}
          >
            <Icon size={20} />
            <span>{label === 'Meus Hubs' ? 'Hubs' : label}</span>
          </NavLink>
        ))}
        <button
          className={`${s.bottomNavItem} ${moreOpen || NAV_ITEMS.slice(MOBILE_PRIMARY).some(i => location.pathname.startsWith(i.to)) ? s.bottomNavActive : ''}`}
          onClick={() => setMoreOpen(v => !v)}
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={20} />
          <span>Mais</span>
        </button>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div className={s.moreBackdrop} onClick={() => setMoreOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className={s.moreSheet} role="dialog" aria-label="Mais opções"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
              <div className={s.moreHandle} />
              <div className={s.moreGrid}>
                {NAV_ITEMS.slice(MOBILE_PRIMARY).map(({ to, Icon, label }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => `${s.moreItem} ${isActive ? s.moreItemActive : ''}`}
                    onClick={() => setMoreOpen(false)}>
                    <Icon size={20} />
                    <span>{label === 'Config.' ? 'Configurações' : label}</span>
                  </NavLink>
                ))}
              </div>
              <div className={s.moreRow}>
                <button className={s.moreAction} onClick={() => { setSaveLinkOpen(true); setMoreOpen(false) }}><Link2 size={16} /> Salvar link</button>
                <button className={s.moreAction} onClick={() => { setQuickNoteOpen(true); setMoreOpen(false) }}><Inbox size={16} /> Nota rápida</button>
                <button className={s.moreAction} onClick={toggle}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} Tema {theme === 'dark' ? 'claro' : 'escuro'}</button>
                {pwa.available && <button className={s.moreAction} onClick={() => { setMoreOpen(false); installApp() }}><Download size={16} /> Instalar app</button>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {searchOpen && (
        <ErrorBoundary key="search"><SearchPalette onClose={() => { setSearchOpen(false); setSearchQuery('') }} initialQuery={searchQuery} /></ErrorBoundary>
      )}
      {saveLinkOpen && (
        <ErrorBoundary key="save-link"><SaveLinkModal onClose={() => setSaveLinkOpen(false)} /></ErrorBoundary>
      )}
      <AnimatePresence>{quickNoteOpen && <ErrorBoundary key="quick-note"><QuickNote onClose={() => setQuickNoteOpen(false)} /></ErrorBoundary>}</AnimatePresence>
      <ErrorBoundary key="ai-chat"><FormCraftChat open={aiChatOpen} onClose={() => setAiChatOpen(false)} /></ErrorBoundary>

      {shortcutsOpen && (
        <div className={s.sheetBackdrop} onClick={() => setShortcutsOpen(false)}>
          <div className={s.infoPanel} role="dialog" aria-label="Atalhos de teclado" onClick={e => e.stopPropagation()}>
            <div className={s.infoHead}>
              <h2>Atalhos de teclado</h2>
              <button className={s.infoClose} onClick={() => setShortcutsOpen(false)} aria-label="Fechar"><X size={16} /></button>
            </div>
            <dl className={s.shortcutList}>
              {SHORTCUTS.map(([keys, what]) => (
                <div key={what} className={s.shortcutRow}>
                  <dt>{what}</dt>
                  <dd>{keys.map(k => <kbd key={k}>{k === 'Mod' ? MOD_KEY : k}</kbd>)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {iosHelpOpen && (
        <div className={s.sheetBackdrop} onClick={() => setIosHelpOpen(false)}>
          <div className={s.infoPanel} role="dialog" aria-label="Como instalar o app" onClick={e => e.stopPropagation()}>
            <div className={s.infoHead}>
              <h2>Instalar no iPhone ou iPad</h2>
              <button className={s.infoClose} onClick={() => setIosHelpOpen(false)} aria-label="Fechar"><X size={16} /></button>
            </div>
            <ol className={s.iosSteps}>
              <li>Abra o FormCraft no <b>Safari</b>.</li>
              <li>Toque em <b>Compartilhar</b> (o quadrado com a seta para cima).</li>
              <li>Escolha <b>Adicionar à Tela de Início</b> e confirme.</li>
            </ol>
          </div>
        </div>
      )}

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
