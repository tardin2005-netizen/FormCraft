import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHubsStore } from '../store/hubsStore'

const SEED_KEY = 'formcraft-seed-aula-ia-adcreative-2026-10-29-v1'
const HUB_ID = '83b8b5a9-3cad-45f5-b780-edcb97fd126c'
const CLASS_TITLE = 'Aula de IA — AdCreative.ai (criativos de campanha)'

const NOTE = `Ferramenta usada na aula de Inteligência Artificial de 29/10/2026: https://pt-br.adcreative.ai/

Para que serve: gera imagens de campanha (Social Post, anúncios) com IA a partir da identidade da marca. Foi muito útil para criar imagens de campanhas e vale levar para a aula.

Como funcionou na aula
- Configuração da marca (feita uma vez): Importar site (escaneia o site da marca), Nome e descrição, Logo, Cores, Conta de anúncios e Identidade da marca (opcional).
- Em Projetos, criamos um Social Post com um prompt, ex.: anúncio de OFERTA de moda fitness feminina, visual premium e aspiracional, formato 4:5, usando a imagem enviada como principal.
- Nível: Profissional. A ferramenta devolve várias variações (texto, selo de 20% OFF, botão "Compre agora") já com a marca aplicada.
- Dá para organizar em Favoritos e em Nova coleção.

Ideia: usar nos projetos do Grupo Live / Live Star para gerar criativos de campanha.`

/** Registra a aula de IA de 29/10/2026 (AdCreative.ai) uma vez, na matéria de IA do hub da faculdade. */
export function useSeedAulaIA() {
  const { user } = useAuth()
  const { subjects, classes, addClassItem, addContent } = useHubsStore()

  useEffect(() => {
    if (!user || localStorage.getItem(SEED_KEY)) return
    const hubSubjects = subjects.filter(s => s.hubId === HUB_ID)
    if (hubSubjects.length < 15) return // espera o Firestore carregar
    const subject = hubSubjects.find(s => /(^|[^a-zà-ú])ia([^a-zà-ú]|$)|intelig[eê]ncia artificial/i.test(s.name))
    if (!subject) return
    if (!classes.some(c => c.subjectId === subject.id && c.title === CLASS_TITLE)) {
      const cls = addClassItem({
        hubId: HUB_ID,
        semesterId: subject.semesterId,
        subjectId: subject.id,
        title: CLASS_TITLE,
        type: 'aula',
        date: '2026-10-29',
        notes: 'Usamos o AdCreative.ai para gerar imagens de campanha. Print e link anexados.',
      })
      const base = { hubId: HUB_ID, semesterId: subject.semesterId, subjectId: subject.id, classId: cls.id }
      addContent({ ...base, type: 'link', title: 'AdCreative.ai — criativos de campanha com IA', url: 'https://pt-br.adcreative.ai/' })
      addContent({ ...base, type: 'note', title: 'Resumo — como usamos o AdCreative.ai', content: NOTE })
      addContent({ ...base, type: 'file', title: 'Print — Social Posts gerados no AdCreative.ai (29/10)', url: `${import.meta.env.BASE_URL}aulas/adcreative-ai-2026-10-29.webp` })
    }
    localStorage.setItem(SEED_KEY, '1')
  }, [user, subjects, classes, addClassItem, addContent])
}
