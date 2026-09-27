# Estudo FormCraft — plano e progresso

Pedido do usuário (2026-09-27, madrugada, antes de dormir). Trabalhar de forma autônoma.

## Contexto
- Repositório de trabalho: `D:\Project in claude\FORMCRAFT\.claude\worktrees\documento-analise-publicacao-0bb328` (branch `claude/documento-analise-publicacao-0bb328`, baseada em origin/main `d2827e7`).
- App: React 18 + Vite + Firebase (Auth Google, Firestore, Storage, Functions), CSS Modules, HashRouter. Código em `client/`.
- Commits locais ainda NÃO publicados (push para main foi bloqueado; o usuário publica manualmente):
  - `bc6dd3f` Conceitos + busca central
  - `3075b9f` Biblioteca de Padrões de Design
  - `f4dec0c` ErrorBoundary + busca blindada (correção do crash "tela bugada")
- NÃO publicar nada no site (não dar push em main, não fazer deploy). Commits locais são ok.
- Login exige Google → para testar no navegador, usar dev server local (`npm run dev` em `client/`) com um mock de usuário SÓ local (não commitar o mock).

## Tarefas
1. [ ] Responsividade mobile de todo o app (Layout, Dashboard, HubView — sem nenhuma media query, Biblioteca, Inbox, Tarefas, Coleções, Ferramentas, Salvos, Settings, Workspace, AreaView/ChatView, modais). Barra inferior mobile mostra só 5 itens.
2. [ ] Upload de PDF do computador em "+ Material" (Firebase Storage, `storage` já exportado em `client/src/firebase.ts`). Hoje só aceita URL.
3. [ ] Testar o site inteiro no navegador (desktop e mobile), anotar bugs, corrigir os seguros.
4. [ ] Estudar https://mobbin.com/discover/apps/web/latest e as imagens que o usuário mandou (GetYourGuide login/menu de perfil, Base App, v0) → ideias.
5. [ ] Propostas de tela de login (visuais/mockups, NÃO implementar no app).
6. [ ] Identidade visual própria (usuário acha que está com "cara de IA").
7. [ ] Documento final para o usuário analisar: `docs/estudo-formcraft/estudo-formcraft.html` (+ publicar como Artifact privado). Incluir: bugs achados/corrigidos, mudanças mobile, ideias de funcionalidade, visual, login, prioridades.

## Progresso
(atualizar a cada etapa concluída)
- 04:30 — Dev server local configurado (`.claude/launch.json`, nome `formcraft-dev`, porta 5199). Mock local: `localStorage.setItem('fc-dev-mock','1')` + trecho `DEV-ONLY-MOCK` em `client/src/contexts/AuthContext.tsx` (NÃO commitar; reverter no fim com `git checkout client/src/contexts/AuthContext.tsx`). Dados de teste semeados via localStorage (incluindo dados "legados" sem campos).
- 04:35 — BUG REAL reproduzido: dados antigos sem campos (links sem tags, coleções sem name/itemIds, tarefas sem tags/subtasks) quebravam Tarefas, Inbox e Coleções. Corrigido na raiz com `client/src/store/normalize.ts` ligado ao hydrate e ao merge do persist de todos os stores. Commit `ca5ca42`. Todas as rotas testadas renderizam.
- 04:50 — Tarefa 1 (mobile) FEITA: commit `eaa28eb` (barra "Mais", busca no topo, Hub/Dashboard/Área/Inbox responsivos) + Configurações (conta real, sair funciona, limpar cache honesto).
- 05:00 — Tarefa 2 (PDF) FEITA: commit `7689983` (upload Storage, drag&drop, progresso, storage.rules). Bucket existe (probe 403). Regras precisam `firebase deploy --only storage`.
- 05:40 — Testes de interação (tarefa 3) em andamento. Commits: `f60350f` (Hub: auto-seleção do que foi criado + semestre duplicado bloqueado), `ee9a1f5` (busca global real na paleta ⌘K, Encontrar/chips/Enter funcionando, modais de Hubs/IconPicker centralizados).
  Testado OK: Hub (semestre/matéria/aula/conceito/canal/mensagem), Biblioteca CRUD+filtro, busca home→aula, Tarefas criar/editar/mover, Inbox criar/filtrar, Coleções criar/abrir, Área adicionar, ⌘S/⌘N/⌘J/Esc, chat IA erro elegante, criar Hub.
  Anotado para o documento (não corrigido): Coleções painel lateral reorganiza cards de forma estranha; canal no Inbox PDF só URL; aviso React controlled→uncontrolled em algum input do Hub; resposta de erro do chat IA genérica.
- 06:00 — Tarefa 3 (testes) CONCLUÍDA. Workspaces: 6 contextos criados, todos os módulos abrem, adicionar item (Script) ok. Ferramentas: salvar favorito ok.
- 06:15 — Tarefa 4 (Mobbin) FEITA dentro do possível: navegador embutido leva 403; no Chrome do usuário (logado, plano grátis) só 2 telas por filtro. Referências vistas: Login → folk (centralizado minimalista, Google + e-mail) e Remote (split-screen com arte geométrica da marca); Signup → Sana AI (form à esquerda + screenshot do produto em notebook à direita), Perplexity; apps recentes: Calendly, AirOps, GetYourGuide, Base, H&M, Mintlify (plataforma de conhecimento). File Upload → Shopify, VEED (imagens não carregaram).
- 06:45 — Tarefas 5/6/7 FEITAS: documento `docs/estudo-formcraft/estudo-formcraft.html` publicado como Artifact privado: https://claude.ai/artifact/1Uc9wVjUropqggibRwp1NN
- FIM. Mock de login revertido, launch.json removido, servidor parado, tarefa agendada desativada. Todas as tarefas concluídas. 8 commits locais aguardando push do usuário.
