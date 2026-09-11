import { Link } from 'react-router-dom'
import { useThemeStore, ACCENT_COLORS } from '../store/themeStore'
import type { Accent } from '../store/themeStore'
import s from './Settings.module.css'

const ACCENT_LABELS: Record<Accent, string> = {
  violet: 'Violeta',
  blue: 'Azul',
  green: 'Verde',
  orange: 'Laranja',
  pink: 'Rosa',
}

export default function Settings() {
  const { theme, setTheme, accent, setAccent } = useThemeStore()

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.headerLeft}>
          <Link to="/" className={s.back}>← Dashboard</Link>
          <span className={s.title}>Configurações</span>
        </div>
      </header>

      <div className={s.content}>
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Aparência</h2>

          <div className={s.row}>
            <div className={s.rowLabel}>
              <div className={s.rowName}>Tema</div>
              <div className={s.rowDesc}>Escolha o estilo visual do app</div>
            </div>
            <div className={s.themeOptions}>
              <button
                className={`${s.themeOption} ${theme === 'dark' ? s.themeActive : ''}`}
                onClick={() => setTheme('dark')}
              >
                🌙 Escuro
              </button>
              <button
                className={`${s.themeOption} ${theme === 'bw' ? s.themeActive : ''}`}
                onClick={() => setTheme('bw')}
              >
                ☀️ Claro
              </button>
            </div>
          </div>

          <div className={s.row}>
            <div className={s.rowLabel}>
              <div className={s.rowName}>Cor de destaque</div>
              <div className={s.rowDesc}>Cor usada em botões e elementos ativos</div>
            </div>
            <div className={s.accentOptions}>
              {(Object.keys(ACCENT_COLORS) as Accent[]).map((a) => (
                <button
                  key={a}
                  className={`${s.accentDot} ${accent === a ? s.accentActive : ''}`}
                  style={{ background: ACCENT_COLORS[a].accent }}
                  onClick={() => setAccent(a)}
                  title={ACCENT_LABELS[a]}
                />
              ))}
            </div>
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Sobre</h2>
          <div className={s.about}>
            <div className={s.aboutLogo}>⬡ FormCraft</div>
            <div className={s.aboutDesc}>Seu hub de conhecimento pessoal. Organize links, PDFs, notas e mais.</div>
            <div className={s.aboutVersion}>v0.1.0</div>
          </div>
        </section>
      </div>
    </div>
  )
}
