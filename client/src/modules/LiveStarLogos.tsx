import { useState } from 'react'
import s from './LiveStarLogos.module.css'
import Glyph from '../components/Glyph'

const BASE = `${import.meta.env.BASE_URL}livstar/`
const file = (n: string) => `${BASE}livstar-${n}.png`

type Bg = 'creme' | 'branco' | 'checker' | 'checkerDark' | 'escuro'
interface Asset { name: string; tag: string; slug: string; bg: Bg; square?: boolean; portrait?: boolean }

const BG_STYLE: Record<Bg, React.CSSProperties> = {
  creme: { background: '#f8f4ef' },
  branco: { background: '#fff' },
  checker: {},
  checkerDark: {},
  escuro: { background: '#7a4a00' },
}

const LOGO_SECTIONS: { title: string; items: Asset[] }[] = [
  { title: 'Logo (a estrela)', items: [
    { name: 'Fundo original', tag: 'PNG', slug: 'logo-estrela-fundo-creme', bg: 'creme' },
    { name: 'Fundo branco', tag: 'PNG', slug: 'logo-estrela-fundo-branco', bg: 'branco' },
    { name: 'Fundo transparente', tag: 'PNG', slug: 'logo-estrela-transparente', bg: 'checker' },
    { name: 'Versão clara (fundo marrom)', tag: 'PNG', slug: 'logo-estrela-clara-para-fundo-escuro', bg: 'escuro' },
    { name: 'Branca · fundo transparente', tag: 'PNG', slug: 'logo-estrela-branca-transparente', bg: 'checkerDark' },
  ] },
  { title: 'Logotipo (nome com a estrela e as faixas)', items: [
    { name: 'Fundo original', tag: 'PNG', slug: 'logotipo-fundo-creme', bg: 'creme' },
    { name: 'Fundo branco', tag: 'PNG', slug: 'logotipo-fundo-branco', bg: 'branco' },
    { name: 'Fundo transparente', tag: 'PNG', slug: 'logotipo-transparente', bg: 'checker' },
    { name: 'Versão clara (fundo marrom)', tag: 'PNG', slug: 'logotipo-claro-para-fundo-escuro', bg: 'escuro' },
    { name: 'Branca · fundo transparente', tag: 'PNG', slug: 'logotipo-branco-transparente', bg: 'checkerDark' },
  ] },
  { title: 'Outros elementos', items: [
    { name: 'Só o nome', tag: 'PNG · fundo original', slug: 'so-nome-fundo-creme', bg: 'creme' },
    { name: 'Só o nome', tag: 'PNG · transparente', slug: 'so-nome-transparente', bg: 'checker' },
    { name: 'Faixas 1-2-3-4', tag: 'PNG · transparente', slug: 'elemento-faixas-transparente', bg: 'checker' },
  ] },
]

const POST_BACKGROUNDS: Asset[] = [
  { name: 'Fundo marrom listrado', tag: 'PNG 1600×2000', slug: 'fundo-post-marrom', bg: 'escuro', portrait: true },
  { name: 'Fundo creme', tag: 'PNG 1600×2000', slug: 'fundo-post-creme', bg: 'creme', portrait: true },
]

const AVATARS: Asset[] = [
  { name: 'Estrela · creme', tag: 'PNG 1080×1080', slug: 'perfil-estrela-creme', bg: 'creme', square: true },
  { name: 'Estrela · marrom', tag: 'PNG 1080×1080', slug: 'perfil-estrela-marrom', bg: 'escuro', square: true },
  { name: 'Logotipo · creme', tag: 'PNG 1080×1080', slug: 'perfil-logotipo-creme', bg: 'creme', square: true },
]

const COLORS = [
  { name: 'Marrom', hex: '#7A4A00' },
  { name: 'Bege', hex: '#D9C0A0' },
  { name: 'Creme', hex: '#F8F4EF' },
]

function AssetCard({ a }: { a: Asset }) {
  const url = file(a.slug)
  return (
    <div className={s.card}>
      <div className={`${s.preview} ${a.square ? s.square : ''} ${a.portrait ? s.portrait : ''} ${a.bg === 'checker' ? s.checker : a.bg === 'checkerDark' ? s.checkerDark : ''}`} style={BG_STYLE[a.bg]}>
        <img src={url} alt={a.name} loading="lazy" />
        {a.square && <span className={s.ring} />}
      </div>
      <div className={s.name}>{a.name}<span className={s.tag}>{a.tag}</span></div>
      <a className={s.dl} href={url} download={`livstar-${a.slug}.png`}><Glyph value="ph:download-simple" size={15} /> Baixar</a>
    </div>
  )
}

function Mock({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className={s.mock}><div className={s.mockLabel}>{label}</div>{children}</div>
}

export function LiveStarLogos() {
  const [copied, setCopied] = useState<string | null>(null)
  function copy(hex: string) {
    navigator.clipboard.writeText(hex).catch(() => {})
    setCopied(hex)
    setTimeout(() => setCopied(null), 1500)
  }
  return (
    <div>
      <p className={s.hint}>Todas as versões da marca da agência Live Star (logo, logotipo e elementos), prontas para baixar com um clique.</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <a className={s.dl} style={{ padding: '9px 18px' }} href={`${BASE}livstar-todas-as-logos.zip`} download="livstar-todas-as-logos.zip">
          <Glyph value="ph:download-simple" size={15} /> Baixar tudo (.zip)
        </a>
      </div>
      {LOGO_SECTIONS.map(sec => (
        <div key={sec.title} className={s.section}>
          <h3 className={s.sectionTitle}>{sec.title}</h3>
          <div className={s.grid}>{sec.items.map(a => <AssetCard key={a.slug} a={a} />)}</div>
        </div>
      ))}
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Fundos de post (4:5)</h3>
        <div className={s.grid}>{POST_BACKGROUNDS.map(a => <AssetCard key={a.slug} a={a} />)}</div>
      </div>
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Cores da marca</h3>
        <div className={s.palette}>
          {COLORS.map(c => (
            <button key={c.hex} className={s.sw} onClick={() => copy(c.hex)}>
              <i style={{ background: c.hex, borderBottom: '1px solid var(--border)' }} />
              <span>{c.name}<small>{copied === c.hex ? 'Copiado!' : `${c.hex} · copiar`}</small></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LiveStarAvatars() {
  const a = file('perfil-estrela-marrom'), b = file('perfil-estrela-creme'), c = file('perfil-logotipo-creme')
  return (
    <div>
      <p className={s.hint}>Arquivos quadrados 1080×1080. As redes cortam em círculo, então a marca fica centralizada na área segura (o círculo tracejado).</p>
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Versões para baixar</h3>
        <div className={s.grid}>{AVATARS.map(x => <AssetCard key={x.slug} a={x} />)}</div>
      </div>
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Como fica em cada rede</h3>
        <div className={s.mocks}>
          <Mock label="Instagram">
            <div className={s.prof}>
              <div className={s.av} style={{ width: 96, height: 96 }}><img src={a} alt="" /></div>
              <div><div className={s.user}>livstar.ag</div><div className={s.sub}>Agência · Live Star</div></div>
            </div>
          </Mock>
          <Mock label="TikTok">
            <div style={{ textAlign: 'center' }}>
              <div className={s.av} style={{ width: 88, height: 88, margin: '0 auto' }}><img src={a} alt="" /></div>
              <div className={s.user} style={{ marginTop: 8 }}>livstar.ag</div>
            </div>
          </Mock>
          <Mock label="Facebook">
            <div className={s.cover} />
            <div className={s.prof} style={{ marginTop: -34, paddingLeft: 12 }}>
              <div className={s.av} style={{ width: 90, height: 90, border: '4px solid var(--surface)' }}><img src={a} alt="" /></div>
              <div style={{ paddingTop: 36 }}><div className={s.user}>Live Star</div><div className={s.sub}>Agência de marketing</div></div>
            </div>
          </Mock>
          <Mock label="Tamanhos pequenos">
            <div style={{ display: 'flex', gap: 10 }}>
              {[a, b, c].map(u => <div key={u} className={s.av} style={{ width: 44, height: 44 }}><img src={u} alt="" /></div>)}
            </div>
          </Mock>
        </div>
      </div>
    </div>
  )
}
