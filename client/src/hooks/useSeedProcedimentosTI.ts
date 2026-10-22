import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHubsStore } from '../store/hubsStore'
import { useContentItemsStore } from '../store/contentItemsStore'

const SEED_KEY = 'formcraft-seed-procedimento-backup-google-v1'
const FACULDADE_HUB_ID = '83b8b5a9-3cad-45f5-b780-edcb97fd126c'

const BODY = `Guia rápido: exportar o E-mail e o Drive de um colaborador (8 passos).
Tudo é feito no Console de administração (admin.google.com).

Caminho: Trocar senha → Entrar na conta → Dados e privacidade → Baixar seus dados → Só E-mail + Drive → Criar exportação → Link chega por e-mail

FASE 1 · Preparar o acesso
1. Admin > Diretório > Usuários: ache o colaborador (filtro E-mail, "Começa com"), Redefinir senha > Gerar uma senha automaticamente > Redefinir. Copie a senha.
2. Entre no Google com o e-mail do colaborador e a senha nova, em janela anônima.

FASE 2 · Escolher o que entra no backup
3. Gerenciar sua Conta do Google > Dados e privacidade.
4. Role até Ferramentas e clique em Baixar seus dados.
5. Clique em Desmarcar tudo (vem 61 de 63 marcados).
6. Marque só Gmail e Drive (contador: 2 de 63).
7. Clique em Próxima etapa.

FASE 3 · Gerar e receber o backup
8. Destino: Enviar link de download por e-mail · Frequência: Exportar uma vez · Tipo: .zip · Tamanho: 10 GB (vem 2 GB, troque). Clique em Criar exportação.
O Google manda o link para o e-mail do colaborador; abra na mesma conta e baixe (vale por uma semana).

Se algo travar
- A senha nova derruba o acesso dele: avise antes, ou só faça quando o acesso já estiver encerrado.
- Pediu verificação em duas etapas: no Admin, gere um código de backup para o usuário.
- Baixar seus dados não funciona: o Admin precisa liberar o Google Takeout na unidade do usuário (Apps > Serviços adicionais do Google).
- Passou de 10 GB: o Google divide em vários .zip; baixe todos.`

/** Cria uma vez o snippet "Backup de usuário Google" (com o PDF anexado) no hub de TI. */
export function useSeedProcedimentosTI() {
  const { user } = useAuth()
  const hubs = useHubsStore(s => s.hubs)
  const subjects = useHubsStore(s => s.subjects)
  const { items, addItem } = useContentItemsStore()

  useEffect(() => {
    if (!user || localStorage.getItem(SEED_KEY)) return
    // Espera o Firestore carregar (mesmo critério do hub da faculdade)
    if (subjects.filter(x => x.hubId === FACULDADE_HUB_ID).length < 15) return
    // O hub de TI é o que já tem snippets de Servidor/Procedimento; se não achar, tenta pelo nome.
    const hasItServers = (hubId: string) => items.some(i => {
      if (i.moduleId !== `hub-${hubId}-snippets`) return false
      const c = (i.data as { category?: string }).category
      return c === 'Servidor' || c === 'Procedimento'
    })
    const ti = hubs.find(h => hasItServers(h.id))
      ?? hubs.find(h => /(^|[^a-zà-ú])ti([^a-zà-ú]|$)|tecnologia|suporte|infra|inform[aá]tica|sistemas/i.test(h.name))
    if (!ti) return
    const moduleId = `hub-${ti.id}-snippets`
    const already = items.some(i => i.moduleId === moduleId && (i.data as { title?: string }).title === 'Backup de usuário Google')
    if (!already) {
      addItem({
        workspaceId: ti.id,
        moduleId,
        contentType: 'snippets',
        data: {
          title: 'Backup de usuário Google',
          body: BODY,
          category: 'Procedimento',
          tags: 'google, backup, workspace, takeout',
          fileUrl: `${import.meta.env.BASE_URL}procedimentos/guia-backup-usuario-google.pdf`,
          fileName: 'Guia – Backup de usuário Google.pdf',
        },
        tags: ['google', 'backup', 'workspace', 'takeout'],
        starred: false,
      })
    }
    localStorage.setItem(SEED_KEY, '1')
  }, [user, hubs, subjects, items, addItem])
}
