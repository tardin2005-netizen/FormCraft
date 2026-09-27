import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { normalize } from '../utils/globalSearch'
import s from './Login.module.css'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function authError(code: string | undefined) {
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'A janela do Google foi fechada antes de terminar. Tente de novo.'
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente de novo.'
    case 'auth/invalid-email':
      return 'Esse e-mail não parece válido. Confira e tente de novo.'
    case 'auth/operation-not-allowed':
      return 'O login por e-mail ainda não está ativado. Entre com o Google por enquanto.'
    case 'auth/unauthorized-continue-uri':
    case 'auth/unauthorized-domain':
      return 'Este endereço do site não está autorizado no Firebase para login.'
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'Esse link de acesso expirou ou já foi usado. Peça um novo.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet. Verifique a rede e tente de novo.'
    default:
      return 'Não foi possível entrar. Tente de novo.'
  }
}

/* ── Demo shown beside the login: sample data, not the user's ── */
const DEMO = [
  { origin: 'Gestão de Marcas · Aula 02', title: 'Brand equity', text: 'Valor que a marca agrega ao produto além do funcional.', kind: 'aula' },
  { origin: 'Estratégias Digitais · Aula 05', title: 'Funil de vendas', text: 'Jornada do cliente do primeiro contato até a compra.', kind: 'aula' },
  { origin: 'Biblioteca · Card', title: 'Floating Card', text: 'Card solto sobre o fundo, com sombra e profundidade.', kind: 'lib' },
  { origin: 'Prova 1 · em 6 dias', title: 'Estratégias Digitais', text: 'Conteúdo: aulas 01 a 05, funil e jornada.', kind: 'prova' },
  { origin: 'Biblioteca · Hover', title: 'Efeito hover', text: 'Mudança visual ao passar o mouse; mostra que é clicável.', kind: 'lib' },
  { origin: 'Comportamento do Consumidor · Aula 03', title: 'Jornada de compra', text: 'Etapas que a pessoa percorre até decidir comprar.', kind: 'aula' },
] as const

const DEMO_QUERIES = ['brand equity', 'funil', 'hover', 'prova', '']

function Highlight({ text, query }: { text: string; query: string }) {
  const token = normalize(query).split(/\s+/).filter(Boolean)[0]
  const idx = token ? normalize(text).indexOf(token) : -1
  if (idx < 0) return <>{text}</>
  return <>{text.slice(0, idx)}<mark className={s.mark}>{text.slice(idx, idx + token.length)}</mark>{text.slice(idx + token.length)}</>
}

function Showcase() {
  const [query, setQuery] = useState('')
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setQuery('brand equity'); return }
    let qi = 0, ci = 0, deleting = false, timer: number
    const tick = () => {
      const target = DEMO_QUERIES[qi]
      if (!deleting) {
        ci++
        setQuery(target.slice(0, ci))
        if (ci >= target.length) { deleting = true; timer = window.setTimeout(tick, 1900); return }
        timer = window.setTimeout(tick, 85)
      } else {
        ci--
        setQuery(target.slice(0, Math.max(0, ci)))
        if (ci <= 0) { deleting = false; qi = (qi + 1) % DEMO_QUERIES.length; timer = window.setTimeout(tick, 450); return }
        timer = window.setTimeout(tick, 35)
      }
    }
    timer = window.setTimeout(tick, 700)
    return () => window.clearTimeout(timer)
  }, [auto])

  const results = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean)
    if (!tokens.length) return DEMO.slice(0, 4)
    return DEMO.filter(d => {
      const hay = normalize(`${d.title} ${d.text} ${d.origin}`)
      return tokens.every(t => hay.includes(t))
    }).slice(0, 4)
  }, [query])

  return (
    <div className={s.showcase}>
      <div className={s.showHead}>
        <span className={s.meta}>Exemplo · busca em todos os semestres</span>
      </div>
      <label className={s.demoSearch}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        <input
          id="login-demo-search"
          value={query}
          onChange={e => { setAuto(false); setQuery(e.target.value) }}
          onFocus={() => setAuto(false)}
          placeholder="Experimente: funil, hover, prova…"
          aria-label="Busca de exemplo"
          autoComplete="off"
        />
        {auto && <span className={s.caret} aria-hidden="true" />}
      </label>
      <div className={s.demoGrid} aria-live="polite">
        {results.length === 0 ? (
          <p className={s.demoEmpty}>Nenhum exemplo com “{query}”. No seu FormCraft a busca cobre tudo que você guardar.</p>
        ) : results.map(d => (
          <article key={d.title + d.origin} className={s.demoCard}>
            <span className={`${s.demoOrigin} ${d.kind === 'lib' ? s.originLib : ''} ${d.kind === 'prova' ? s.originProva : ''}`}>{d.origin}</span>
            <span className={s.demoTitle}><Highlight text={d.title} query={query} /></span>
            <span className={s.demoText}>{d.text}</span>
          </article>
        ))}
      </div>
      <p className={s.showCaption}>Aulas, Biblioteca e provas no mesmo resultado, do 1º ao último semestre.</p>
    </div>
  )
}

export default function Login() {
  const { signInWithGoogle, sendEmailLink, emailLinkNeedsEmail, completeEmailLink } = useAuth()
  const [busy, setBusy] = useState<'google' | 'email' | null>(null)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (emailLinkNeedsEmail) emailRef.current?.focus() }, [emailLinkNeedsEmail])

  async function handleGoogle() {
    setError(''); setBusy('google')
    try { await signInWithGoogle() }
    catch (e) { setError(authError((e as { code?: string }).code)) }
    finally { setBusy(null) }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(value)) { setError(authError('auth/invalid-email')); return }
    setError(''); setBusy('email')
    try {
      if (emailLinkNeedsEmail) await completeEmailLink(value)
      else { await sendEmailLink(value); setSentTo(value) }
    } catch (err) {
      setError(authError((err as { code?: string }).code))
    } finally { setBusy(null) }
  }

  return (
    <div className={s.page}>
      <main className={s.left}>
        <div className={s.card}>
          <span className={s.tab}>FORMCRAFT</span>

          {sentTo ? (
            <div className={s.sent}>
              <h1 className={s.title}>Confira seu e-mail</h1>
              <p className={s.sub}>Enviamos um link de acesso para <b>{sentTo}</b>. Abra o e-mail neste aparelho e toque no link para entrar.</p>
              <p className={s.fine}>Não chegou? Veja a caixa de spam ou <button type="button" className={s.linkBtn} onClick={() => { setSentTo(''); setError('') }}>use outro e-mail</button>.</p>
            </div>
          ) : (
            <>
              <h1 className={s.title}>{emailLinkNeedsEmail ? 'Confirme seu e-mail' : 'Entrar no seu caderno'}</h1>
              <p className={s.sub}>
                {emailLinkNeedsEmail
                  ? 'Você abriu o link de acesso em outro navegador. Digite o e-mail para onde ele foi enviado.'
                  : 'Aulas, PDFs, conceitos e referências da faculdade num lugar só.'}
              </p>

              {!emailLinkNeedsEmail && (
                <>
                  <button type="button" className={s.primary} onClick={handleGoogle} disabled={busy !== null}>
                    {busy === 'google' ? <span className={s.spinner} /> : <GoogleIcon />}
                    {busy === 'google' ? 'Entrando…' : 'Continuar com Google'}
                  </button>
                  <div className={s.or}><span>ou</span></div>
                </>
              )}

              <form className={s.form} onSubmit={handleEmail} noValidate>
                <label className={s.label} htmlFor="login-email">E-mail</label>
                <input
                  ref={emailRef}
                  id="login-email"
                  className={s.input}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                />
                <button type="submit" className={s.secondary} disabled={busy !== null}>
                  {busy === 'email' ? 'Enviando…' : emailLinkNeedsEmail ? 'Entrar' : 'Enviar link de acesso'}
                </button>
              </form>

              {error && <p className={s.error} role="alert">{error}</p>}

              <p className={s.fine}>Sem senha: o link de acesso chega no seu e-mail. Seus dados ficam na sua conta e só você vê.</p>
            </>
          )}
        </div>
      </main>

      <aside className={s.right} aria-label="Como o FormCraft funciona">
        <div className={s.pitch}>
          <h2 className={s.pitchTitle}>Tudo que você estudou, a uma busca de distância.</h2>
          <p className={s.pitchSub}>Guarde PDFs e resumos por aula e ache qualquer conceito de qualquer semestre.</p>
        </div>
        <Showcase />
      </aside>
    </div>
  )
}
