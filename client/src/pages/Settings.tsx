import { useState } from 'react'
import { useThemeStore, ACCENT_COLORS } from '../store/themeStore'
import type { Accent } from '../store/themeStore'
import s from './Settings.module.css'

const ACCENT_LABELS: Record<Accent, string> = {
  violet:'Violeta', blue:'Azul', green:'Verde', orange:'Laranja', pink:'Rosa',
}

function ThemePreviewDark() {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.previewSvg}>
      <rect width="200" height="130" fill="#0e0e10"/>
      <rect x="0" y="0" width="48" height="130" fill="#18181b"/>
      <rect x="8" y="12" width="32" height="6" rx="3" fill="#2a2a32"/>
      <rect x="8" y="26" width="24" height="4" rx="2" fill="#2a2a32"/>
      <rect x="8" y="34" width="28" height="4" rx="2" fill="#2a2a32"/>
      <rect x="8" y="42" width="20" height="4" rx="2" fill="#2a2a32"/>
      <rect x="56" y="10" width="136" height="18" rx="4" fill="#18181b"/>
      <rect x="62" y="35" width="40" height="34" rx="4" fill="#18181b"/>
      <rect x="108" y="35" width="40" height="34" rx="4" fill="#18181b"/>
      <rect x="154" y="35" width="32" height="34" rx="4" fill="#18181b"/>
      <rect x="62" y="75" width="124" height="6" rx="2" fill="#18181b"/>
      <rect x="62" y="85" width="100" height="6" rx="2" fill="#18181b"/>
      <rect x="62" y="95" width="112" height="6" rx="2" fill="#18181b"/>
    </svg>
  )
}

function ThemePreviewLight() {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.previewSvg}>
      <rect width="200" height="130" fill="#f5f5f5"/>
      <rect x="0" y="0" width="48" height="130" fill="#ffffff"/>
      <rect x="8" y="12" width="32" height="6" rx="3" fill="#d0d0d0"/>
      <rect x="8" y="26" width="24" height="4" rx="2" fill="#d0d0d0"/>
      <rect x="8" y="34" width="28" height="4" rx="2" fill="#d0d0d0"/>
      <rect x="8" y="42" width="20" height="4" rx="2" fill="#d0d0d0"/>
      <rect x="56" y="10" width="136" height="18" rx="4" fill="#ffffff"/>
      <rect x="62" y="35" width="40" height="34" rx="4" fill="#ebebeb"/>
      <rect x="108" y="35" width="40" height="34" rx="4" fill="#ebebeb"/>
      <rect x="154" y="35" width="32" height="34" rx="4" fill="#ebebeb"/>
      <rect x="62" y="75" width="124" height="6" rx="2" fill="#ebebeb"/>
      <rect x="62" y="85" width="100" height="6" rx="2" fill="#ebebeb"/>
      <rect x="62" y="95" width="112" height="6" rx="2" fill="#ebebeb"/>
    </svg>
  )
}

export default function Settings() {
  const { theme, setTheme, accent, setAccent } = useThemeStore()

  const [pendingTheme,  setPendingTheme]  = useState(theme)
  const [pendingAccent, setPendingAccent] = useState(accent)
  const [pendingName,   setPendingName]   = useState('João Ramiro')
  const [saved,         setSaved]         = useState(false)

  const isDirty =
    pendingTheme !== theme ||
    pendingAccent !== accent ||
    pendingName !== 'João Ramiro'

  function handleSave() {
    setTheme(pendingTheme)
    setAccent(pendingAccent)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Configurações</h1>
      </div>

      <div className={s.content}>
        {/* Visual */}
        <section className={s.section}>
          <div className={s.sectionLabel}>VISUAL</div>
          <p className={s.sectionDesc}>Escolha a aparência do aplicativo.</p>

          <div className={s.themeCards}>
            <button
              className={`${s.themeCard} ${pendingTheme === 'dark' ? s.themeCardActive : ''}`}
              onClick={() => setPendingTheme('dark')}
            >
              <div className={s.themePreview}><ThemePreviewDark /></div>
              <div className={s.themeCardInfo}>
                <div className={s.themeCardName}>
                  Escuro
                  {pendingTheme === 'dark' && <span className={s.activeTag}>✓ Ativo</span>}
                </div>
                <div className={s.themeCardDesc}>Fundo escuro, ideal para uso noturno.</div>
              </div>
            </button>

            <button
              className={`${s.themeCard} ${pendingTheme === 'bw' ? s.themeCardActive : ''}`}
              onClick={() => setPendingTheme('bw')}
            >
              <div className={s.themePreviewLight}><ThemePreviewLight /></div>
              <div className={s.themeCardInfo}>
                <div className={s.themeCardName}>
                  Branco
                  {pendingTheme === 'bw' && <span className={s.activeTag}>✓ Ativo</span>}
                </div>
                <div className={s.themeCardDesc}>Interface clara, fundo branco e texto escuro.</div>
              </div>
            </button>
          </div>

          <div className={s.accentRow}>
            <div className={s.accentLabel}>Cor de destaque</div>
            <div className={s.accentPicker}>
              {(Object.keys(ACCENT_COLORS) as Accent[]).map(a => (
                <button
                  key={a}
                  className={`${s.accentDot} ${pendingAccent === a ? s.accentDotActive : ''}`}
                  style={{ background: ACCENT_COLORS[a].accent }}
                  onClick={() => setPendingAccent(a)}
                  title={ACCENT_LABELS[a]}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Conta */}
        <section className={s.section}>
          <div className={s.sectionLabel}>CONTA</div>

          <div className={s.accountCard}>
            <div className={s.accountAvatar} style={{ background: ACCENT_COLORS[pendingAccent].accent }}>
              JT
            </div>
            <div className={s.accountInfo}>
              <input
                className={s.accountNameInput}
                value={pendingName}
                onChange={e => setPendingName(e.target.value)}
              />
              <div className={s.accountEmail}>tardin2005@gmail.com</div>
            </div>
          </div>

          <button className={s.logoutBtn}>→ Sair da conta</button>
        </section>

        {/* Dados */}
        <section className={s.section}>
          <div className={s.sectionLabel}>DADOS</div>
          <p className={s.sectionDesc}>Gerencie seus dados locais armazenados no aplicativo.</p>
          <div className={s.dangerCard}>
            <div className={s.dangerInfo}>
              <div className={s.dangerTitle}>Resetar conta</div>
              <div className={s.dangerDesc}>Apaga todas as suas áreas, itens, links e coleções salvos localmente. Esta ação não pode ser desfeita.</div>
            </div>
            <button
              className={s.resetBtn}
              onClick={() => {
                if (!confirm('Tem certeza? Todos os seus dados locais serão apagados e você começará do zero.')) return
                const keys = ['formcraft-areas','formcraft-area-items','formcraft-collections','formcraft-links','formcraft-prefs']
                keys.forEach(k => localStorage.removeItem(k))
                window.location.reload()
              }}
            >
              Limpar dados
            </button>
          </div>
        </section>

        {/* Sobre */}
        <section className={s.section}>
          <div className={s.sectionLabel}>SOBRE</div>
          <div className={s.aboutCard}>
            <div className={s.aboutLogo}>⬡ FormCraft</div>
            <div className={s.aboutDesc}>Seu hub de conhecimento pessoal. Organize links, PDFs, notas e mais.</div>
            <div className={s.aboutVersion}>v0.1.0</div>
          </div>
        </section>
      </div>

      {/* Save bar */}
      <div className={`${s.saveBar} ${isDirty || saved ? s.saveBarVisible : ''}`}>
        {saved ? (
          <span className={s.savedMsg}>✓ Alterações salvas</span>
        ) : (
          <>
            <span className={s.saveBarMsg}>Você tem alterações não salvas</span>
            <button className={s.saveBtn} onClick={handleSave}>Salvar alterações</button>
          </>
        )}
      </div>
    </div>
  )
}
