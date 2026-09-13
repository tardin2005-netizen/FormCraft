import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useHubsStore, type HubType } from '../store/hubsStore'
import s from './Hubs.module.css'

const HUB_TYPES: { type: HubType; label: string; emoji: string; desc: string; color: string }[] = [
  { type: 'faculdade', label: 'Faculdade', emoji: '🎓', desc: 'Semestres, matérias, aulas e materiais', color: '#7c6ef7' },
  { type: 'personal',  label: 'Pessoal',   emoji: '🌱', desc: 'Links, notas e arquivos pessoais',       color: '#3ecf8e' },
  { type: 'projects',  label: 'Projetos',  emoji: '🚀', desc: 'Organize projetos e referências',        color: '#f78c4f' },
  { type: 'custom',    label: 'Livre',     emoji: '✦',  desc: 'Estrutura livre, você define',           color: '#e46ef7' },
]

const EMOJIS = ['🎓','🌱','🚀','✦','💡','🔬','🎨','💼','🏆','📊','🎵','📷','🔥','⚡','🌍']
const COLORS  = ['#7c6ef7','#4f8ef7','#3ecf8e','#f78c4f','#e46ef7','#facc15','#f43f5e']

interface NewHubForm {
  type: HubType; name: string; emoji: string; color: string
}

export default function Hubs() {
  const { hubs, addHub, removeHub } = useHubsStore()
  const [modal,    setModal]    = useState(false)
  const [step,     setStep]     = useState<'type' | 'details'>('type')
  const [form,     setForm]     = useState<NewHubForm>({
    type: 'faculdade', name: '', emoji: '🎓', color: '#7c6ef7',
  })
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    drag.current = { mx: e.clientX, my: e.clientY, px: modalPos.x, py: modalPos.y }
    const onMove = (ev: MouseEvent) => {
      if (!drag.current) return
      setModalPos({ x: drag.current.px + ev.clientX - drag.current.mx, y: drag.current.py + ev.clientY - drag.current.my })
    }
    const onUp = () => { drag.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [modalPos])

  function openModal() { setModal(true); setStep('type'); setModalPos({ x: 0, y: 0 }) }
  function closeModal() { setModal(false); setForm({ type: 'faculdade', name: '', emoji: '🎓', color: '#7c6ef7' }) }

  function selectType(t: typeof HUB_TYPES[0]) {
    setForm(f => ({ ...f, type: t.type, emoji: t.emoji, color: t.color }))
    setStep('details')
  }

  function create() {
    if (!form.name.trim()) return
    addHub({ ...form, name: form.name.trim() })
    closeModal()
  }

  const typeInfo = HUB_TYPES.find(t => t.type === form.type)!

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.title}>Meus Hubs</h1>
          <p className={s.sub}>Organize seu conhecimento em espaços dedicados</p>
        </div>
        <button className={s.newBtn} onClick={openModal}>+ Novo Hub</button>
      </div>

      {hubs.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>⬡</div>
          <div className={s.emptyTitle}>Crie seu primeiro hub</div>
          <div className={s.emptyDesc}>Hubs organizam todo o seu conteúdo — faculdade, projetos ou qualquer área da sua vida.</div>
          <div className={s.typeCards}>
            {HUB_TYPES.map(t => (
              <button key={t.type} className={s.typeCard} onClick={() => { selectType(t); setModal(true) }}>
                <span className={s.typeEmoji}>{t.emoji}</span>
                <span className={s.typeLabel}>{t.label}</span>
                <span className={s.typeDesc}>{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={s.grid}>
          {hubs.map((hub, i) => {
            const info = HUB_TYPES.find(t => t.type === hub.type)
            return (
              <motion.div
                key={hub.id}
                className={s.hubCardWrap}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * .04 }}
              >
                <Link to={`/hub/${hub.id}`} className={s.hubCard}>
                  <div className={s.hubCardBar} style={{ background: hub.color }} />
                  <div className={s.hubCardEmoji}>{hub.emoji}</div>
                  <div className={s.hubCardName}>{hub.name}</div>
                  <div className={s.hubCardType}>{info?.label}</div>
                </Link>
                <button
                  className={s.deleteBtn}
                  onClick={e => {
                    e.preventDefault()
                    if (confirm(`Apagar hub "${hub.name}"?`)) removeHub(hub.id)
                  }}
                  title="Apagar"
                >✕</button>
              </motion.div>
            )
          })}
          <button className={s.addCard} onClick={openModal}>
            <span className={s.addPlus}>+</span>
            <span>Novo Hub</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <>
            <div className={s.backdrop} onClick={closeModal} />
            <motion.div
              className={s.modal}
              initial={{ opacity: 0, scale: .94, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{ transform: `translate(calc(-50% + ${modalPos.x}px), calc(-50% + ${modalPos.y}px))` }}
            >
              {step === 'type' ? (
                <>
                  <div className={`${s.modalHeader} ${s.modalDrag}`} onMouseDown={onHeaderMouseDown}>
                    <span>Tipo de Hub</span>
                    <button className={s.modalClose} onClick={closeModal}>✕</button>
                  </div>
                  <div className={s.typeGrid}>
                    {HUB_TYPES.map(t => (
                      <button key={t.type} className={s.typeOption} onClick={() => selectType(t)}>
                        <span className={s.typeOptionEmoji}>{t.emoji}</span>
                        <span className={s.typeOptionLabel}>{t.label}</span>
                        <span className={s.typeOptionDesc}>{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className={`${s.modalHeader} ${s.modalDrag}`} onMouseDown={onHeaderMouseDown}>
                    <button className={s.backBtn} onClick={() => setStep('type')}>← Voltar</button>
                    <span>{typeInfo.emoji} Hub {typeInfo.label}</span>
                    <button className={s.modalClose} onClick={closeModal}>✕</button>
                  </div>
                  <div className={s.modalBody}>
                    <div className={s.emojiRow}>
                      {EMOJIS.map(e => (
                        <button
                          key={e}
                          className={`${s.emojiBtn} ${form.emoji === e ? s.emojiActive : ''}`}
                          onClick={() => setForm(f => ({ ...f, emoji: e }))}
                        >{e}</button>
                      ))}
                    </div>
                    <input
                      className={s.nameInput}
                      placeholder={`Nome do hub (ex: ${typeInfo.label})`}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      autoFocus
                    />
                    <div className={s.colorRow}>
                      {COLORS.map(c => (
                        <button
                          key={c}
                          className={`${s.colorDot} ${form.color === c ? s.colorActive : ''}`}
                          style={{ background: c }}
                          onClick={() => setForm(f => ({ ...f, color: c }))}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={s.modalFooter}>
                    <button className={s.cancelBtn} onClick={closeModal}>Cancelar</button>
                    <button className={s.createBtn} disabled={!form.name.trim()} onClick={create}>
                      Criar Hub
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
