import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHubsStore } from '../store/hubsStore'

const SEED_KEY = 'formcraft-seed-aula-ia-adcreative-gptmaker-2026-10-28-v1'
const HUB_ID = '83b8b5a9-3cad-45f5-b780-edcb97fd126c'
const CLASS_TITLE = 'Aula de IA — AdCreative.ai e GPT Maker'

const NOTE = `Ferramenta usada na aula de Inteligência Artificial de 28/10/2026: https://pt-br.adcreative.ai/

Para que serve: gera imagens de campanha (Social Post, anúncios) com IA a partir da identidade da marca. Foi muito útil para criar imagens de campanhas e vale levar para a aula.

Como funcionou na aula
- Configuração da marca (feita uma vez): Importar site (escaneia o site da marca), Nome e descrição, Logo, Cores, Conta de anúncios e Identidade da marca (opcional).
- Em Projetos, criamos um Social Post com um prompt, ex.: anúncio de OFERTA de moda fitness feminina, visual premium e aspiracional, formato 4:5, usando a imagem enviada como principal.
- Nível: Profissional. A ferramenta devolve várias variações (texto, selo de 20% OFF, botão "Compre agora") já com a marca aplicada.
- Dá para organizar em Favoritos e em Nova coleção.

Ideia: usar nos projetos do Grupo Live / Live Star para gerar criativos de campanha.`

const NOTE_GPTMAKER = `GPT Maker (https://www.gptmaker.ai/) — usado na aula de IA de 28/10/2026 para criar um agente de atendimento personalizado.

O que fizemos
- Criamos o agente "LIVE!" (suporte em LivStar), com um modelo de IA escolhido no próprio painel e o botão "Teste sua IA" para conversar com ele antes de publicar.
- Perfil: nome, tom de comunicação (Formal, Normal ou Descontraída) e o campo Comportamento, onde se descreve como o agente deve conversar. No nosso: atender pelo Instagram de forma simpática, ágil e acolhedora, explicar ofertas e promoções, nunca inventar preços, descontos ou prazos e valorizar a diversidade de corpos.
- Trabalho: finalidade (Suporte, Vendas ou Uso pessoal), para quem presta suporte (LivStar), site oficial (opcional) e uma descrição da empresa.
- Outras abas do agente: Treinamentos, Intenções, Integrações, Servidores MCP, Canais e Configurações.

Integrações disponíveis
- ElevenLabs: o agente responde em áudio, deixando o atendimento mais humano.
- Google Calendar: agenda reuniões, cria o link da chamada e envia os convites.
- Plug Chat: direciona o atendimento a um humano quando a IA não souber responder.
- E-vendi: dá à IA acesso aos produtos da loja (preços, fotos e links).
- Instagram (em Canais): respostas automatizadas.

Ideia: criar um agente para a Live Star atender os clientes do Grupo Live.`

/** Registra a aula de IA de 28/10/2026 (AdCreative.ai e GPT Maker) uma vez, na matéria de IA do hub da faculdade. */
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
        date: '2026-10-28',
        notes: 'Usamos o AdCreative.ai para gerar imagens de campanha e o GPT Maker para criar um agente de atendimento. Links e prints anexados.',
      })
      const base = { hubId: HUB_ID, semesterId: subject.semesterId, subjectId: subject.id, classId: cls.id }
      addContent({ ...base, type: 'link', title: 'AdCreative.ai — criativos de campanha com IA', url: 'https://pt-br.adcreative.ai/' })
      addContent({ ...base, type: 'note', title: 'Resumo — como usamos o AdCreative.ai', content: NOTE })
      addContent({ ...base, type: 'file', title: 'Print — Social Posts gerados no AdCreative.ai (28/10)', url: `${import.meta.env.BASE_URL}aulas/adcreative-ai-2026-10-28.webp` })
      addContent({ ...base, type: 'link', title: 'GPT Maker — agentes de atendimento com IA', url: 'https://www.gptmaker.ai/' })
      addContent({ ...base, type: 'note', title: 'Resumo — como usamos o GPT Maker', content: NOTE_GPTMAKER })
      addContent({ ...base, type: 'file', title: 'Print — GPT Maker: Perfil do agente', url: `${import.meta.env.BASE_URL}aulas/gptmaker-perfil-2026-10-28.webp` })
      addContent({ ...base, type: 'file', title: 'Print — GPT Maker: Trabalho (finalidade e empresa)', url: `${import.meta.env.BASE_URL}aulas/gptmaker-trabalho-2026-10-28.webp` })
      addContent({ ...base, type: 'file', title: 'Print — GPT Maker: Integrações', url: `${import.meta.env.BASE_URL}aulas/gptmaker-integracoes-2026-10-28.webp` })
    }
    localStorage.setItem(SEED_KEY, '1')
  }, [user, subjects, classes, addClassItem, addContent])
}
