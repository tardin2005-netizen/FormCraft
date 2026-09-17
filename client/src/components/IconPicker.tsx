import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import s from './IconPicker.module.css'

type EmojiEntry = { e: string; t: string }

const EMOJI_LIST: EmojiEntry[] = [
  // Organização
  { e: '📁', t: 'pasta folder arquivo' }, { e: '📂', t: 'pasta folder aberta' }, { e: '🗂️', t: 'ficheiro arquivo' },
  { e: '📋', t: 'clipboard lista' }, { e: '📌', t: 'pin fixar importante' }, { e: '📍', t: 'localização mapa pin' },
  { e: '🏷️', t: 'etiqueta tag label' }, { e: '🗃️', t: 'caixa arquivo' }, { e: '🗄️', t: 'gaveta arquivo ficheiro' },
  { e: '📊', t: 'gráfico dados estatísticas' }, { e: '📈', t: 'crescimento alta gráfico' }, { e: '📉', t: 'queda baixo gráfico' },
  // Escrita & Notas
  { e: '📝', t: 'nota escrever anotação' }, { e: '✏️', t: 'lápis escrever editar' }, { e: '🖊️', t: 'caneta escrever' },
  { e: '📎', t: 'clipe anexo' }, { e: '📏', t: 'régua medida' }, { e: '📐', t: 'esquadro matemática' },
  { e: '🗒️', t: 'bloco notas rascunho' }, { e: '📓', t: 'caderno notas' }, { e: '📔', t: 'diário caderno' },
  { e: '📒', t: 'livro amarelo' }, { e: '📕', t: 'livro vermelho' }, { e: '📗', t: 'livro verde' },
  { e: '📘', t: 'livro azul' }, { e: '📙', t: 'livro laranja' }, { e: '📚', t: 'livros biblioteca' },
  // Trabalho & Negócios
  { e: '💼', t: 'maleta trabalho negócios' }, { e: '🏢', t: 'empresa escritório prédio' }, { e: '💰', t: 'dinheiro finanças' },
  { e: '💳', t: 'cartão crédito pagamento' }, { e: '🤝', t: 'aperto mão parceria' }, { e: '📞', t: 'telefone ligar' },
  { e: '📧', t: 'email mensagem correio' }, { e: '📤', t: 'enviar saída' }, { e: '📥', t: 'receber entrada' },
  { e: '🗓️', t: 'calendário agenda data' }, { e: '⏰', t: 'alarme relógio hora' }, { e: '⏱️', t: 'cronômetro tempo' },
  // Tech & Dev
  { e: '💻', t: 'computador laptop código' }, { e: '🖥️', t: 'monitor desktop pc' }, { e: '📱', t: 'celular mobile app' },
  { e: '⚙️', t: 'engrenagem configuração settings' }, { e: '🔧', t: 'chave ferramenta conserto' },
  { e: '🔩', t: 'parafuso técnico' }, { e: '🛠️', t: 'ferramentas construção' }, { e: '🚀', t: 'foguete deploy lançamento' },
  { e: '🤖', t: 'robô ia inteligência artificial' }, { e: '⚡', t: 'raio energia rápido' }, { e: '💡', t: 'ideia lâmpada insight' },
  { e: '🔐', t: 'cadeado segurança autenticação' }, { e: '🔑', t: 'chave acesso' }, { e: '🛡️', t: 'escudo proteção segurança' },
  { e: '🐛', t: 'bug erro problema' }, { e: '🔍', t: 'lupa busca pesquisa' }, { e: '📡', t: 'antena sinal api' },
  { e: '🗺️', t: 'mapa navegação fluxo' }, { e: '🧩', t: 'puzzle peça integração módulo' },
  // Estudo
  { e: '🎓', t: 'formatura faculdade diploma' }, { e: '🏫', t: 'escola estudo universidade' },
  { e: '🔬', t: 'microscópio ciência lab' }, { e: '🔭', t: 'telescópio astronomia' },
  { e: '🧪', t: 'tubo lab experimento' }, { e: '📜', t: 'pergaminho certificado' },
  { e: '🧠', t: 'cérebro inteligência conhecimento' }, { e: '🎯', t: 'alvo meta objetivo' },
  { e: '🏆', t: 'troféu conquista vitória' }, { e: '🥇', t: 'medalha ouro primeiro' },
  // Arte & Design
  { e: '🎨', t: 'paleta cores design arte' }, { e: '🖌️', t: 'pincel desenho pintura' },
  { e: '🖼️', t: 'quadro imagem galeria' }, { e: '✨', t: 'brilho magia destaque' },
  { e: '🎬', t: 'câmera vídeo produção' }, { e: '📸', t: 'foto câmera imagem' },
  { e: '🎵', t: 'nota musical som áudio' }, { e: '🎶', t: 'música playlist som' },
  // Pessoas
  { e: '👤', t: 'usuário pessoa perfil' }, { e: '👥', t: 'equipe grupo pessoas' },
  { e: '🧑‍💻', t: 'desenvolvedor programador dev' }, { e: '👨‍🏫', t: 'professor ensino' },
  // Marcadores & Estrelas
  { e: '⭐', t: 'estrela favorito importante' }, { e: '🌟', t: 'estrela brilhante destaque' },
  { e: '💎', t: 'diamante precioso valor' }, { e: '❤️', t: 'coração amor favorito' },
  { e: '💯', t: 'cem perfeito completo' }, { e: '✅', t: 'concluído aprovado ok' },
  { e: '🔴', t: 'vermelho círculo alerta' }, { e: '🟠', t: 'laranja círculo' },
  { e: '🟡', t: 'amarelo círculo aviso' }, { e: '🟢', t: 'verde círculo ok ativo' },
  { e: '🔵', t: 'azul círculo info' }, { e: '🟣', t: 'roxo violeta círculo' },
  // Natureza & Viagem
  { e: '🌍', t: 'mundo global terra planeta' }, { e: '🏠', t: 'casa home pessoal' },
  { e: '🏗️', t: 'construção projeto obra' }, { e: '🌿', t: 'folha natureza verde' },
  { e: '🌊', t: 'onda água mar' }, { e: '⛰️', t: 'montanha desafio subida' },
  // Misc
  { e: '🎁', t: 'presente gift surpresa' }, { e: '🎀', t: 'laço presente fita' },
  { e: '🔮', t: 'bola cristal magia futuro' }, { e: '🎲', t: 'dado jogo random' },
  { e: '🃏', t: 'carta curinga jogo' }, { e: '🧲', t: 'ímã atrair' },
  { e: '📦', t: 'caixa pacote entrega' }, { e: '🗺️', t: 'mapa localização' },
]

const CATEGORIES = [
  { label: 'Tudo', filter: '' },
  { label: '📁 Organização', filter: 'pasta arquivo lista' },
  { label: '💻 Tech', filter: 'computador código dev ia' },
  { label: '💼 Trabalho', filter: 'trabalho empresa dinheiro' },
  { label: '🎓 Estudo', filter: 'faculdade escola ciência' },
  { label: '🎨 Arte', filter: 'design arte foto música' },
  { label: '⭐ Marcadores', filter: 'estrela coração favorito círculo' },
]

interface Props {
  value: string
  onChange: (icon: string) => void
  onClose: () => void
}

export default function IconPicker({ value, onChange, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('')
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  const q = query.toLowerCase().trim()
  const filtered = EMOJI_LIST.filter(item => {
    const matchQuery = !q || item.e === q || item.t.includes(q)
    const matchCat = !cat || item.t.split(' ').some(w => cat.includes(w))
    return matchQuery && matchCat
  })

  function onHeaderMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, input')) return
    dragRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return
      const maxX = window.innerWidth / 2 - 60
      const maxY = window.innerHeight / 2 - 40
      setPos({
        x: Math.max(-maxX, Math.min(maxX, dragRef.current.px + ev.clientX - dragRef.current.mx)),
        y: Math.max(-maxY, Math.min(maxY, dragRef.current.py + ev.clientY - dragRef.current.my)),
      })
    }
    function onUp() {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <motion.div
        className={s.picker}
        style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
        initial={{ opacity: 0, scale: .94, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .94, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className={s.header} onMouseDown={onHeaderMouseDown} style={{ cursor: 'grab', userSelect: 'none' }}>
          <span className={s.title}>Escolher ícone</span>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.searchRow}>
          <input
            className={s.searchInput}
            placeholder="Buscar emoji..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={s.collectionRow}>
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              className={`${s.colBtn} ${cat === c.filter ? s.colBtnActive : ''}`}
              onClick={() => setCat(c.filter)}
            >{c.label}</button>
          ))}
        </div>

        <div className={s.grid}>
          {filtered.length === 0 && (
            <div className={s.empty}>Nenhum emoji encontrado</div>
          )}
          {filtered.map(item => (
            <button
              key={item.e}
              className={`${s.iconBtn} ${value === item.e ? s.iconBtnActive : ''}`}
              onClick={() => { onChange(item.e); onClose() }}
              title={item.t.split(' ')[0]}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{item.e}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  )
}

export function IconDisplay({
  value,
  size = 24,
  className,
}: {
  value: string
  size?: number
  color?: string
  className?: string
}) {
  if (!value) return null
  // Legacy iconify format (lucide:folder) — show as emoji fallback
  if (value.includes(':')) return <span style={{ fontSize: size, lineHeight: 1 }} className={className}>📁</span>
  return <span style={{ fontSize: size, lineHeight: 1 }} className={className}>{value}</span>
}
