import type { ToolCategory } from './tools'

export type GlossaryArea = 'Marketing' | 'TI & Programação' | 'Design' | 'Edição de vídeo'
export type Nivel = 'Fácil' | 'Média' | 'Difícil'

export interface GlossaryTerm {
  termo: string
  area: GlossaryArea
  sinonimos: string[]
  definicao: string
  exemplo?: string
  /** Só para tecnologias: o quanto é difícil de aprender para quem está começando. */
  nivel?: Nivel
  relacionados?: string[]
}

export const AREAS: GlossaryArea[] = ['Marketing', 'TI & Programação', 'Design', 'Edição de vídeo']

function g(area: GlossaryArea, termo: string, sinonimos: string[], definicao: string, extra: { exemplo?: string; nivel?: Nivel; rel?: string[] } = {}): GlossaryTerm {
  return { termo, area, sinonimos, definicao, exemplo: extra.exemplo, nivel: extra.nivel, relacionados: extra.rel }
}

const M = 'Marketing', T = 'TI & Programação', D = 'Design', V = 'Edição de vídeo'

export const GLOSSARY: GlossaryTerm[] = [
  /* ───────────── Marketing ───────────── */
  g(M, 'Análise SWOT', ['SWOT', 'FOFA', 'matriz SWOT'], 'Quadro de quatro quadrantes para analisar uma marca ou negócio: Forças e Fraquezas (internas) e Oportunidades e Ameaças (externas). Ajuda a decidir onde investir e do que se proteger.', { exemplo: 'Uma loja pequena tem como força o atendimento, como fraqueza o pouco caixa, como oportunidade o Instagram e como ameaça os marketplaces.', rel: ['Posicionamento', 'Benchmarking'] }),
  g(M, 'Matriz BCG', ['BCG', 'matriz crescimento-participação', 'estrela vaca leiteira abacaxi'], 'Classifica produtos em quatro grupos pelo crescimento do mercado e pela participação que a marca tem nele: Estrela (cresce e domina), Vaca leiteira (domina, mas o mercado parou de crescer), Interrogação (mercado cresce, participação baixa) e Abacaxi (os dois baixos).', { exemplo: 'Vaca leiteira financia as Interrogações até virarem Estrelas; Abacaxis tendem a ser descontinuados.', rel: ['Análise SWOT', 'Matriz de Ansoff'] }),
  g(M, 'Matriz de Ansoff', ['Ansoff', 'matriz produto-mercado'], 'Mostra quatro caminhos de crescimento cruzando produto (atual ou novo) e mercado (atual ou novo): penetração de mercado, desenvolvimento de mercado, desenvolvimento de produto e diversificação.', { rel: ['Matriz BCG'] }),
  g(M, 'Cinco Forças de Porter', ['Porter', '5 forças'], 'Modelo que mede a pressão competitiva de um setor: rivalidade entre concorrentes, ameaça de novos entrantes, ameaça de substitutos, poder dos fornecedores e poder dos clientes.', { rel: ['Benchmarking', 'Análise SWOT'] }),
  g(M, 'Persona', ['personas', 'perfil de cliente ideal', 'ICP'], 'Personagem fictício, baseado em dados reais, que representa o cliente ideal da marca: idade, rotina, dores, desejos e onde ele consome conteúdo. Serve para escrever e decidir pensando em uma pessoa, não em um público abstrato.', { exemplo: 'Carla, 34, gerente de RH, quer treinar o time sem gastar muito e pesquisa no LinkedIn.', rel: ['Jornada do cliente', 'Segmentação'] }),
  g(M, 'Metas SMART', ['SMART', 'meta smart', 'objetivo smart'], 'Jeito de escrever metas para que sejam claras: Específica, Mensurável, Atingível, Relevante e com Tempo definido. Em vez de “vender mais”, vira “vender 200 unidades até 30 de junho”.', { rel: ['KPI', 'OKR'] }),
  g(M, 'OKR', ['OKRs', 'objetivos e resultados-chave'], 'Método de metas com um Objetivo inspirador e de 2 a 5 Resultados-Chave mensuráveis que provam que ele foi atingido.', { exemplo: 'Objetivo: ser referência em marketing local. KR1: 5.000 seguidores. KR2: 30 leads por mês.', rel: ['Metas SMART', 'KPI'] }),
  g(M, 'Funil de vendas', ['funil', 'funil de marketing', 'topo meio fundo'], 'Caminho que a pessoa percorre até comprar: topo (descobre o problema), meio (considera soluções) e fundo (decide a compra). Cada etapa pede um tipo de conteúdo diferente.', { exemplo: 'Topo: post educativo. Meio: e-book. Fundo: demonstração ou oferta.', rel: ['Lead', 'Jornada do cliente', 'Taxa de conversão'] }),
  g(M, 'Jornada do cliente', ['jornada de compra', 'customer journey'], 'Todas as etapas e pontos de contato que a pessoa vive com a marca, da primeira vez que ouve falar até depois da compra, incluindo o que ela sente e pensa em cada passo.', { rel: ['Persona', 'Funil de vendas'] }),
  g(M, 'Brand equity', ['valor de marca', 'patrimônio de marca'], 'O valor extra que uma marca tem só por ser conhecida e confiável: o consumidor aceita pagar mais ou prefere ela mesmo com produto parecido.', { exemplo: 'Mesma camiseta branca: uma com a marca famosa vende por 5 vezes mais.', rel: ['Branding', 'Posicionamento'] }),
  g(M, 'Branding', ['gestão de marca', 'construção de marca'], 'Conjunto de ações para construir a percepção da marca: nome, identidade visual, voz, valores e experiência. É o que fica na cabeça das pessoas, além do logo.', { rel: ['Brand equity', 'Tom de voz', 'Brandbook'] }),
  g(M, 'Posicionamento', ['posicionamento de marca'], 'O lugar que a marca quer ocupar na mente do cliente em relação aos concorrentes. Responde a: para quem somos, do que somos diferentes e por que importa.', { rel: ['Proposta de valor', 'Segmentação'] }),
  g(M, 'Proposta de valor', ['value proposition', 'diferencial'], 'Promessa clara do benefício que o cliente recebe e que a concorrência não entrega do mesmo jeito. Cabe em uma frase.', { rel: ['Posicionamento'] }),
  g(M, 'Segmentação, Público-alvo e Posicionamento (STP)', ['STP', 'segmentação', 'público-alvo', 'target'], 'Sequência clássica: dividir o mercado em grupos parecidos (segmentar), escolher quais atender (público-alvo) e definir como a marca será percebida por eles (posicionar).', { rel: ['Persona', 'Posicionamento'] }),
  g(M, '4 Ps do marketing', ['4Ps', 'mix de marketing', 'composto de marketing', 'produto preço praça promoção'], 'As quatro decisões básicas de uma oferta: Produto, Preço, Praça (onde e como chega ao cliente) e Promoção (como se comunica). Hoje também se fala em 7 Ps, com Pessoas, Processos e Evidências físicas.', { rel: ['Posicionamento'] }),
  g(M, 'Briefing', ['brief'], 'Documento que explica o que precisa ser feito antes de começar um trabalho criativo: objetivo, público, prazo, orçamento, tom, referências e o que evitar.', { rel: ['Persona', 'Tom de voz'] }),
  g(M, 'Tom de voz', ['voz da marca', 'tone of voice'], 'Jeito de a marca falar: mais formal ou descontraído, técnico ou simples, bem-humorado ou sério. Mantém todos os textos soando como a mesma pessoa.', { rel: ['Branding', 'Copywriting'] }),
  g(M, 'Copywriting', ['copy', 'texto persuasivo', 'redação publicitária'], 'Escrever textos com o objetivo de levar a pessoa a agir: clicar, se cadastrar, comprar. Foca no benefício para o leitor e em uma chamada clara no final.', { rel: ['CTA', 'Storytelling'] }),
  g(M, 'CTA', ['call to action', 'chamada para ação'], 'A frase ou botão que diz exatamente o que fazer em seguida, como “Baixe o guia grátis” ou “Falar com um consultor”.', { rel: ['Copywriting', 'Landing page'] }),
  g(M, 'Storytelling', ['contar histórias', 'narrativa de marca'], 'Usar uma história, com personagem, conflito e resolução, para explicar uma ideia ou marca de forma que as pessoas lembrem e se identifiquem.', { rel: ['Copywriting', 'Branding'] }),
  g(M, 'KPI', ['indicador-chave', 'indicador de desempenho', 'métrica principal'], 'Número escolhido para dizer se uma meta está sendo cumprida. Nem toda métrica é KPI: só a que está ligada ao objetivo.', { exemplo: 'Para uma campanha de leads: custo por lead e taxa de conversão da landing page.', rel: ['ROI', 'Metas SMART'] }),
  g(M, 'ROI', ['retorno sobre investimento', 'return on investment'], 'Quanto você ganhou em relação ao que gastou. (Ganho − Investimento) ÷ Investimento. ROI de 200% significa que cada R$ 1 investido voltou R$ 2 de lucro.', { rel: ['CAC', 'LTV', 'KPI'] }),
  g(M, 'CAC', ['custo de aquisição de cliente'], 'Quanto a empresa gasta em marketing e vendas, em média, para conquistar um novo cliente.', { exemplo: 'Gastou R$ 5.000 e trouxe 50 clientes: CAC de R$ 100.', rel: ['LTV', 'ROI'] }),
  g(M, 'LTV', ['lifetime value', 'valor do tempo de vida do cliente'], 'Quanto um cliente gera de receita ao longo de todo o tempo em que compra da marca. Só vale a pena adquirir clientes quando o LTV é maior que o CAC.', { rel: ['CAC', 'ROI'] }),
  g(M, 'CTR', ['taxa de cliques', 'click-through rate'], 'Percentual de pessoas que clicaram depois de ver um anúncio ou link. Cliques ÷ impressões.', { rel: ['CPC', 'CPM'] }),
  g(M, 'CPC', ['custo por clique'], 'Quanto você paga cada vez que alguém clica no seu anúncio.', { rel: ['CTR', 'CPM'] }),
  g(M, 'CPM', ['custo por mil', 'custo por mil impressões'], 'Quanto você paga para o anúncio aparecer mil vezes. Comum em campanhas de reconhecimento de marca.', { rel: ['CPC', 'CTR'] }),
  g(M, 'Taxa de conversão', ['conversão', 'conversion rate'], 'Percentual de pessoas que fizeram a ação desejada (comprar, assinar, preencher o formulário) entre todas que visitaram.', { rel: ['Funil de vendas', 'Teste A/B'] }),
  g(M, 'Lead', ['leads', 'contato qualificado'], 'Pessoa que demonstrou interesse e deixou um contato (e-mail, WhatsApp) em troca de algo, como um e-book. É um potencial cliente.', { rel: ['Funil de vendas', 'Landing page'] }),
  g(M, 'Landing page', ['página de captura', 'página de destino', 'LP'], 'Página feita com um único objetivo, como captar contatos ou vender um produto, sem menu nem distrações. Costuma ter título, benefícios, prova social e um CTA.', { rel: ['CTA', 'Taxa de conversão', 'Lead'] }),
  g(M, 'Marketing de conteúdo', ['content marketing', 'inbound marketing', 'inbound'], 'Atrair clientes produzindo conteúdo útil (artigos, vídeos, posts) em vez de interromper com anúncios. Inbound é a estratégia de atrair e converter com esse conteúdo.', { rel: ['Funil de vendas', 'SEO'] }),
  g(M, 'SEO', ['otimização para buscadores', 'search engine optimization'], 'Conjunto de práticas para o site aparecer melhor, sem pagar, nos resultados do Google: palavras-chave, velocidade, estrutura e links.', { rel: ['SEM', 'Marketing de conteúdo'] }),
  g(M, 'SEM', ['marketing de busca', 'google ads', 'links patrocinados'], 'Marketing em buscadores: aparecer no topo do Google pagando por clique (anúncios), somado ao SEO.', { rel: ['SEO', 'CPC'] }),
  g(M, 'Teste A/B', ['AB test', 'split test'], 'Mostrar duas versões (A e B) de algo, como um título ou botão, para metades diferentes do público e ver qual converte mais.', { rel: ['Taxa de conversão', 'Landing page'] }),
  g(M, 'Remarketing', ['retargeting'], 'Mostrar anúncios para quem já visitou seu site ou interagiu com a marca, lembrando de voltar e concluir a compra.', { rel: ['Funil de vendas'] }),
  g(M, 'Engajamento', ['engagement', 'taxa de engajamento'], 'Quanto as pessoas interagem com o conteúdo: curtidas, comentários, compartilhamentos, salvamentos. Mostra relevância, não só alcance.', { rel: ['Alcance e impressões'] }),
  g(M, 'Alcance e impressões', ['alcance', 'impressões', 'reach'], 'Alcance é quantas pessoas diferentes viram o conteúdo. Impressões é quantas vezes ele foi exibido, contando a mesma pessoa mais de uma vez.', { rel: ['Engajamento', 'CPM'] }),
  g(M, 'Benchmarking', ['benchmark', 'análise de concorrência'], 'Comparar sua marca com concorrentes ou líderes do setor para aprender o que eles fazem bem e onde há espaço.', { rel: ['Análise SWOT', 'Cinco Forças de Porter'] }),
  g(M, 'Growth hacking', ['growth', 'hacker de crescimento'], 'Abordagem de crescimento rápido baseada em fazer muitos experimentos baratos, medir e repetir o que funciona.', { rel: ['Teste A/B'] }),

  /* ───────────── TI & Programação ───────────── */
  g(T, 'Como funciona um site', ['site por dentro', 'anatomia de um site', 'como um site funciona'], 'Um site é feito de três partes: o front-end (o que aparece no navegador), o back-end (o programa no servidor que guarda dados e regras) e a hospedagem (o computador onde ele fica ligado 24h, acessado pelo endereço do domínio). O navegador pede uma página, o servidor responde, e o front-end mostra.', { rel: ['Front-end', 'Back-end', 'Hospedagem', 'Domínio e DNS'] }),
  g(T, 'Front-end', ['frontend', 'front end', 'interface'], 'A parte do site que a pessoa vê e usa: layout, botões, textos, animações. É feita com HTML, CSS e JavaScript.', { nivel: 'Média', rel: ['HTML', 'CSS', 'JavaScript', 'Back-end'] }),
  g(T, 'Back-end', ['backend', 'back end', 'servidor'], 'A parte que roda no servidor, invisível ao usuário: guarda dados, valida login, faz cálculos e responde ao front-end por meio de uma API.', { nivel: 'Difícil', rel: ['API', 'Banco de dados', 'Front-end'] }),
  g(T, 'Full-stack', ['fullstack', 'full stack'], 'Pessoa ou projeto que cobre front-end e back-end.', { rel: ['Front-end', 'Back-end'] }),
  g(T, 'HTML', ['html5', 'linguagem de marcação'], 'A estrutura da página: define o que é título, parágrafo, imagem, link e botão. Não é bem uma linguagem de programação, é de marcação.', { nivel: 'Fácil', exemplo: '<h1>Olá</h1> cria um título.', rel: ['CSS', 'JavaScript'] }),
  g(T, 'CSS', ['css3', 'folha de estilo'], 'A aparência da página: cores, fontes, espaçamentos, tamanhos e posição. Também controla o responsivo e as animações.', { nivel: 'Média', rel: ['HTML', 'Responsivo'] }),
  g(T, 'JavaScript', ['js', 'javascript'], 'A linguagem que dá comportamento à página: reagir a cliques, validar formulário, buscar dados e atualizar a tela sem recarregar. É a única que roda direto no navegador.', { nivel: 'Média', rel: ['TypeScript', 'React', 'Node.js'] }),
  g(T, 'TypeScript', ['ts'], 'JavaScript com tipos: você diz que tipo de dado cada variável guarda e o editor avisa os erros antes de rodar. Deixa projetos grandes mais seguros.', { nivel: 'Média', rel: ['JavaScript'] }),
  g(T, 'React', ['reactjs', 'react.js'], 'Biblioteca de JavaScript para montar interfaces com peças reutilizáveis chamadas componentes. A tela se atualiza sozinha quando os dados mudam.', { nivel: 'Média', exemplo: 'Um botão, um card e um menu viram componentes usados em várias telas.', rel: ['Componente', 'Estado (state)', 'Vite', 'JavaScript'] }),
  g(T, 'Vite', ['vite.js', 'bundler'], 'Ferramenta que prepara e roda um projeto web moderno: abre o site local quase instantaneamente enquanto você programa e gera os arquivos otimizados para publicar.', { nivel: 'Fácil', rel: ['React', 'Deploy'] }),
  g(T, 'Node.js', ['node', 'nodejs'], 'Permite rodar JavaScript fora do navegador, no computador ou no servidor. É a base para criar back-ends e usar ferramentas como o Vite.', { nivel: 'Média', rel: ['JavaScript', 'API', 'Back-end'] }),
  g(T, 'Python', ['py'], 'Linguagem de sintaxe simples, muito usada para automação, análise de dados, IA e back-end. Boa primeira linguagem.', { nivel: 'Fácil', rel: ['Back-end', 'Algoritmo'] }),
  g(T, 'Framework e biblioteca', ['framework', 'biblioteca', 'library'], 'Biblioteca é um conjunto de funções que você chama quando quiser (como o React). Framework é uma estrutura maior que dita como o projeto se organiza (como o Next.js ou o Angular).', { rel: ['React'] }),
  g(T, 'Componente', ['components', 'componentes'], 'Peça reutilizável de interface com visual e comportamento próprios, como um botão ou um card. Montar telas com componentes evita repetir código.', { rel: ['React', 'Design system'] }),
  g(T, 'Estado (state)', ['state', 'estado'], 'Os dados que mudam durante o uso e que a tela precisa refletir: texto digitado, item selecionado, menu aberto ou fechado.', { rel: ['React'] }),
  g(T, 'API', ['interface de programação', 'endpoint', 'webservice'], 'Uma porta de comunicação entre programas. O front-end pede dados a uma API e o servidor responde, geralmente em formato JSON.', { exemplo: 'O app de clima pede a previsão de São Paulo para uma API e mostra o resultado.', rel: ['REST', 'Back-end'] }),
  g(T, 'REST', ['api rest', 'restful'], 'Estilo comum de API que usa os endereços da web e os verbos GET (ler), POST (criar), PUT (atualizar) e DELETE (apagar).', { rel: ['API'] }),
  g(T, 'Banco de dados', ['database', 'bd', 'db'], 'Onde as informações ficam guardadas de forma organizada e permanente: usuários, pedidos, textos.', { nivel: 'Média', rel: ['SQL e NoSQL', 'Back-end', 'Firebase'] }),
  g(T, 'SQL e NoSQL', ['sql', 'nosql', 'banco relacional', 'postgres', 'mysql', 'mongodb'], 'SQL são bancos em tabelas ligadas entre si (PostgreSQL, MySQL), ótimos para dados bem estruturados. NoSQL guarda documentos flexíveis (MongoDB, Firestore), bom para dados que variam.', { rel: ['Banco de dados', 'Firebase'] }),
  g(T, 'Firebase', ['firestore', 'firebase hosting'], 'Plataforma do Google que entrega banco de dados, login de usuários e hospedagem prontos, sem você montar um servidor. Ótimo para começar.', { nivel: 'Fácil', rel: ['Banco de dados', 'Hospedagem', 'Autenticação'] }),
  g(T, 'Hospedagem', ['hosting', 'host', 'servidor web'], 'O serviço que mantém o seu site no ar, em um computador ligado o tempo todo. Exemplos: Firebase Hosting, Vercel, Netlify, Hostinger.', { rel: ['Domínio e DNS', 'Deploy'] }),
  g(T, 'Domínio e DNS', ['dns', 'domínio', 'endereço do site', 'registro.br'], 'Domínio é o endereço (meusite.com.br). O DNS é a “lista telefônica” da internet que liga esse nome ao servidor onde o site está.', { rel: ['Hospedagem', 'HTTPS'] }),
  g(T, 'HTTPS e SSL', ['https', 'ssl', 'certificado', 'cadeado'], 'O cadeado do navegador: a conexão é criptografada, então ninguém no meio consegue ler os dados enviados. Hoje é obrigatório para qualquer site.', { rel: ['Domínio e DNS', 'Segurança'] }),
  g(T, 'Deploy', ['publicar', 'subir o site', 'colocar no ar', 'build'], 'Levar o projeto do seu computador para a hospedagem, deixando-o acessível a todos. O build prepara os arquivos finais antes disso.', { rel: ['Hospedagem', 'CI/CD', 'Vite'] }),
  g(T, 'Git e GitHub', ['git', 'github', 'controle de versão', 'repositório', 'commit'], 'Git guarda o histórico de cada mudança no código e permite voltar atrás. GitHub é o site onde o repositório fica guardado e compartilhado. Commit é um “ponto salvo”.', { nivel: 'Média', rel: ['CI/CD', 'Deploy'] }),
  g(T, 'CI/CD', ['integração contínua', 'github actions', 'deploy automático'], 'Automação que, a cada mudança enviada ao repositório, testa o código e publica o site sozinha, sem fazer upload manual.', { rel: ['Git e GitHub', 'Deploy'] }),
  g(T, 'Responsivo', ['responsive', 'mobile first', 'adaptável'], 'Site que se ajusta bem a qualquer tamanho de tela: celular, tablet e computador. Mobile first significa desenhar primeiro para o celular.', { rel: ['CSS', 'UX'] }),
  g(T, 'SPA, SSR e SSG', ['spa', 'ssr', 'ssg', 'single page application', 'next.js'], 'SPA é um site que carrega uma vez e troca as telas sem recarregar (como o React puro). SSR gera cada página no servidor, bom para SEO. SSG gera as páginas antes, na hora de publicar.', { rel: ['React', 'SEO'] }),
  g(T, 'CMS', ['wordpress', 'wix', 'webflow', 'gerenciador de conteúdo'], 'Sistema para criar e editar um site sem programar tudo do zero, como WordPress, Wix e Webflow. Mais rápido de lançar, menos flexível que código próprio.', { nivel: 'Fácil', rel: ['No-code e low-code', 'Hospedagem'] }),
  g(T, 'No-code e low-code', ['no code', 'low code', 'sem código', 'bubble', 'framer'], 'Ferramentas para criar sites e apps arrastando blocos, com pouco ou nenhum código. Boas para validar uma ideia rápido.', { nivel: 'Fácil', rel: ['CMS'] }),
  g(T, 'Autenticação', ['login', 'autenticação e autorização', 'oauth'], 'Confirmar quem é o usuário (login). Autorização é decidir o que ele pode acessar depois de entrar.', { rel: ['MFA', 'Firebase'] }),
  g(T, 'Variável de ambiente', ['env', '.env', 'chave de api', 'segredo'], 'Valor secreto ou de configuração (como uma chave de API) guardado fora do código, para não ser exposto no repositório.', { rel: ['Git e GitHub', 'Segurança'] }),
  g(T, 'Cache', ['memória temporária'], 'Cópia guardada para o acesso ser mais rápido da próxima vez. Navegadores e servidores guardam cache; às vezes é preciso limpar para ver uma mudança.', { rel: ['CDN'] }),
  g(T, 'CDN', ['content delivery network'], 'Rede de servidores espalhados pelo mundo que entregam o site a partir do lugar mais perto de cada visitante, deixando tudo mais rápido.', { rel: ['Cache', 'Hospedagem'] }),
  g(T, 'Bug e debug', ['bug', 'debug', 'depurar', 'erro no código'], 'Bug é um erro que faz o programa se comportar de forma inesperada. Debug é o processo de achar e corrigir.', { rel: ['Algoritmo'] }),
  g(T, 'Algoritmo', ['lógica de programação'], 'Passo a passo para resolver um problema. Programar é, no fundo, escrever algoritmos de um jeito que o computador entenda.', { rel: ['Python', 'Bug e debug'] }),
  g(T, 'Nuvem', ['cloud', 'aws', 'azure', 'google cloud', 'computação em nuvem'], 'Usar computadores e serviços de grandes empresas pela internet (AWS, Google Cloud, Azure) em vez de ter servidor próprio, pagando pelo uso.', { rel: ['Hospedagem', 'Backup'] }),
  g(T, 'Backup', ['cópia de segurança', 'restore'], 'Cópia dos dados guardada em outro lugar para recuperar tudo se algo for apagado, corrompido ou sequestrado.', { rel: ['Nuvem'] }),
  g(T, 'Segurança', ['firewall', 'vpn', 'phishing', 'antivírus', 'ransomware'], 'Firewall filtra o que entra e sai da rede. VPN cria um túnel protegido. Phishing é golpe que imita uma empresa para roubar senha. Ransomware sequestra arquivos pedindo resgate.', { rel: ['MFA', 'HTTPS e SSL'] }),
  g(T, 'MFA', ['2fa', 'autenticação em dois fatores', 'verificação em duas etapas'], 'Segunda prova de identidade além da senha, como um código no celular. Impede o acesso mesmo se a senha vazar.', { rel: ['Autenticação', 'Segurança'] }),
  g(T, 'IA, LLM e prompt', ['inteligência artificial', 'llm', 'prompt', 'chatgpt', 'claude', 'modelo de linguagem'], 'LLM é um modelo de IA treinado em muito texto que conversa e escreve (ChatGPT, Claude, Gemini). Prompt é a instrução que você dá a ele; quanto mais claro e com contexto, melhor a resposta.', { rel: ['API'] }),
  g(T, 'Open source', ['código aberto', 'software livre'], 'Software cujo código é público: qualquer pessoa pode ver, usar e, conforme a licença, modificar.', { rel: ['Git e GitHub'] }),
  g(T, 'MVP', ['produto mínimo viável', 'minimum viable product'], 'A primeira versão mais simples de um produto, só com o essencial, lançada para aprender com usuários reais antes de investir mais.', { rel: ['No-code e low-code', 'Protótipo'] }),

  /* ───────────── Design ───────────── */
  g(D, 'UI e UX', ['ui', 'ux', 'user interface', 'user experience', 'experiência do usuário'], 'UI (interface) é como o produto parece: cores, botões, tipografia. UX (experiência) é como ele funciona e o que a pessoa sente ao usar: se acha o que precisa sem esforço.', { rel: ['Wireframe', 'Heurísticas de Nielsen'] }),
  g(D, 'Wireframe', ['esboço de tela', 'rascunho de interface'], 'Desenho simples, em preto e branco, da estrutura de uma tela: onde ficam textos, imagens e botões. Resolve a organização antes de pensar em cor e estilo.', { rel: ['Protótipo', 'UI e UX'] }),
  g(D, 'Protótipo', ['prototype', 'protótipo clicável'], 'Versão navegável do design, em que os botões levam a outras telas, para testar o fluxo com pessoas antes de programar.', { rel: ['Wireframe', 'MVP'] }),
  g(D, 'Mockup', ['mock-up', 'maquete visual'], 'Imagem realista de como o design ficará aplicado (um site no notebook, uma embalagem). Serve para apresentar, sem interação.', { rel: ['Protótipo'] }),
  g(D, 'Moodboard', ['painel de referências', 'mood board'], 'Colagem de imagens, cores, texturas e fontes que define o clima e a direção visual de um projeto antes de desenhar.', { rel: ['Branding', 'Paleta de cores'] }),
  g(D, 'Design system', ['sistema de design', 'biblioteca de componentes'], 'Conjunto de regras e peças reutilizáveis (cores, tipografia, componentes, espaçamentos) que mantém todas as telas de um produto consistentes e acelera o trabalho.', { rel: ['Design tokens', 'Componente', 'Tipografia'] }),
  g(D, 'Design tokens', ['tokens', 'variáveis de design'], 'Valores de design guardados com nome, como cor-primária ou espaço-16, usados por designers e programadores. Mudou o token, mudou em todo lugar.', { rel: ['Design system'] }),
  g(D, 'Tipografia', ['fonte', 'typography', 'tipo'], 'A escolha e o uso das fontes. Uma boa tipografia organiza a leitura com poucos tamanhos e pesos bem definidos.', { rel: ['Hierarquia visual', 'Serifa e sem serifa', 'Kerning, tracking e leading'] }),
  g(D, 'Serifa e sem serifa', ['serif', 'sans serif', 'sans-serif', 'fonte com serifa'], 'Serifa são os pequenos traços nas pontas das letras (Times, Georgia): passam tradição. Sem serifa (Helvetica, Inter) é mais limpa e moderna, comum em telas.', { rel: ['Tipografia'] }),
  g(D, 'Kerning, tracking e leading', ['kerning', 'tracking', 'leading', 'entrelinha', 'espaçamento de letras'], 'Kerning é o espaço entre duas letras específicas. Tracking é o espaço entre todas as letras de um texto. Leading (entrelinha) é a distância entre as linhas.', { rel: ['Tipografia'] }),
  g(D, 'Hierarquia visual', ['hierarquia', 'ordem de leitura'], 'Organizar tamanho, peso, cor e posição para mostrar o que é mais importante e guiar o olhar. Se tudo grita, nada é lido.', { rel: ['Tipografia', 'Grid'] }),
  g(D, 'Grid', ['grade', 'layout grid', 'colunas'], 'Grade invisível de colunas e margens que alinha os elementos da página e dá ritmo e ordem ao layout. Sites costumam usar 12 colunas.', { rel: ['Hierarquia visual', 'Responsivo'] }),
  g(D, 'Espaço em branco', ['white space', 'respiro', 'negative space'], 'Áreas vazias entre elementos. Não é desperdício: dá respiro, destaca o que importa e melhora a leitura.', { rel: ['Hierarquia visual'] }),
  g(D, 'Paleta de cores', ['paleta', 'color palette', 'cores da marca'], 'Conjunto de cores escolhidas para um projeto, geralmente uma principal, neutras de apoio e cores de feedback (sucesso, erro, alerta).', { rel: ['Contraste', 'Moodboard'] }),
  g(D, 'Contraste', ['contraste de cor', 'legibilidade'], 'Diferença de luminosidade entre texto e fundo. Contraste baixo cansa e exclui quem enxerga mal; as regras de acessibilidade pedem pelo menos 4,5 para 1 em texto comum.', { rel: ['Acessibilidade', 'Paleta de cores'] }),
  g(D, 'Acessibilidade', ['a11y', 'wcag', 'design inclusivo'], 'Desenhar para que todas as pessoas consigam usar, inclusive com deficiência visual, motora ou auditiva: bom contraste, texto alternativo, navegação por teclado, legendas.', { rel: ['Contraste'] }),
  g(D, 'Heurísticas de Nielsen', ['nielsen', '10 heurísticas', 'heurísticas de usabilidade'], 'Dez regras práticas de usabilidade, como mostrar o status do sistema, prevenir erros, ser consistente e dar controle ao usuário. Usadas para avaliar uma interface rapidamente.', { rel: ['UI e UX'] }),
  g(D, 'Affordance', ['affordance', 'convite ao uso'], 'Pista visual que mostra como algo pode ser usado: um botão com relevo parece clicável, uma barra de rolagem parece arrastável.', { rel: ['Microinteração', 'UI e UX'] }),
  g(D, 'Microinteração', ['micro-interação', 'microinteracoes', 'feedback visual'], 'Pequena animação ou resposta a uma ação, como o coração que pulsa ao curtir ou o botão que afunda ao clicar. Confirma que algo aconteceu.', { rel: ['Affordance', 'Hover'] }),
  g(D, 'Hover', ['efeito hover', 'passar o mouse'], 'Mudança visual quando o cursor passa sobre um elemento, indicando que ele é interativo.', { rel: ['Microinteração'] }),
  g(D, 'Vetor e raster', ['svg', 'vetorial', 'bitmap', 'png', 'jpg'], 'Vetor (SVG) é feito de formas matemáticas e amplia sem perder qualidade, ideal para logos e ícones. Raster (JPG, PNG) é feito de pixels e fica borrado quando ampliado demais.', { rel: ['Logotipo'] }),
  g(D, 'RGB e CMYK', ['rgb', 'cmyk', 'cor para impressão'], 'RGB (vermelho, verde, azul) é o modelo das telas. CMYK (ciano, magenta, amarelo, preto) é o da impressão. A mesma cor pode ficar diferente em cada um.', { rel: ['Paleta de cores'] }),
  g(D, 'Logotipo e identidade visual', ['logo', 'logotipo', 'identidade visual', 'marca gráfica', 'logomarca'], 'Logotipo é o símbolo ou nome desenhado da marca. Identidade visual é o conjunto todo: logo, cores, fontes, ícones e estilo de imagens.', { rel: ['Brandbook', 'Branding'] }),
  g(D, 'Brandbook', ['manual de marca', 'guia de marca', 'brand book', 'guia de estilo'], 'Manual que ensina a usar a marca: versões do logo, área de respiro, cores, tipografia e o que não fazer.', { rel: ['Logotipo e identidade visual', 'Branding'] }),
  g(D, 'Flat, skeuomorfismo e glassmorphism', ['flat design', 'skeuomorfismo', 'glassmorphism', 'neumorphism', 'estilos de design'], 'Flat usa formas chapadas e simples. Skeuomorfismo imita objetos reais com sombras e texturas. Glassmorphism simula vidro fosco e translúcido. Neumorphism parece relevo suave no fundo.', { rel: ['UI e UX'] }),
  g(D, 'Auto layout', ['auto-layout', 'layout automático', 'figma auto layout'], 'Recurso do Figma que faz um frame se ajustar sozinho ao conteúdo: espaçamento, alinhamento e crescimento automáticos, como o flexbox do CSS.', { rel: ['Componente', 'Design system'] }),
  g(D, 'Handoff', ['entrega para desenvolvimento', 'design handoff'], 'Passar o design pronto ao time de programação, com medidas, cores, fontes e comportamentos documentados.', { rel: ['Design system', 'Protótipo'] }),

  /* ───────────── Edição de vídeo ───────────── */
  g(V, 'Timeline', ['linha do tempo'], 'A faixa do editor onde os clipes, áudios e efeitos são organizados em camadas ao longo do tempo. É onde o vídeo é montado.', { rel: ['Corte', 'Montagem'] }),
  g(V, 'Corte', ['cut', 'cortar', 'corte seco'], 'Passar de um plano para o outro direto, sem efeito. É a transição mais comum e invisível.', { rel: ['Jump cut', 'Transição', 'Match cut'] }),
  g(V, 'Jump cut', ['jumpcut', 'corte brusco'], 'Corte dentro do mesmo plano, que elimina pausas e dá um salto no tempo. Muito usado em vlogs para deixar o ritmo rápido.', { rel: ['Corte', 'Ritmo'] }),
  g(V, 'Match cut', ['corte por semelhança', 'corte combinado'], 'Corte entre dois planos diferentes que se parecem em forma, movimento ou ideia, criando uma ligação visual elegante.', { exemplo: 'Um osso girando no ar vira uma nave espacial (2001: Uma Odisseia no Espaço).', rel: ['Corte', 'Transição'] }),
  g(V, 'J-cut e L-cut', ['j cut', 'l cut', 'corte em j', 'corte em l'], 'O áudio da próxima cena começa antes da imagem (J-cut) ou o áudio da cena anterior continua depois que a imagem já mudou (L-cut). Deixa as passagens suaves e naturais.', { rel: ['Corte', 'Mixagem'] }),
  g(V, 'A-roll e B-roll', ['a roll', 'b roll', 'imagens de cobertura', 'imagem de apoio'], 'A-roll é a imagem principal, como a pessoa falando para a câmera. B-roll são imagens de apoio que cobrem a fala e ilustram o assunto, escondendo cortes.', { rel: ['Timeline', 'Montagem'] }),
  g(V, 'Transição', ['fade', 'dissolve', 'wipe', 'transições'], 'Efeito entre dois clipes: dissolver (fade), cortar, deslizar (wipe). Quanto menos transições chamativas, mais profissional costuma ficar.', { rel: ['Corte', 'Whip pan'] }),
  g(V, 'Whip pan', ['whip', 'pan rápido', 'transição de câmera rápida'], 'Movimento muito rápido da câmera para o lado, que borra a imagem. Usado como transição dinâmica entre duas cenas.', { rel: ['Transição', 'Corte'] }),
  g(V, 'Keyframe', ['quadro-chave', 'keyframes'], 'Ponto marcado na timeline onde você define um valor (posição, zoom, opacidade). O programa calcula a animação entre dois keyframes.', { rel: ['Motion graphics', 'Zoom'] }),
  g(V, 'Zoom e punch-in', ['punch in', 'zoom in', 'aproximação'], 'Aproximar a imagem em um ponto do vídeo para dar ênfase ou esconder um corte, muito comum em edição para redes sociais.', { rel: ['Keyframe', 'Jump cut'] }),
  g(V, 'Correção e gradação de cor', ['color grading', 'color correction', 'correção de cor', 'colorização', 'grade'], 'Correção deixa a imagem natural e equilibrada (brilho, contraste, branco). Gradação (color grading) dá um estilo, como visual frio ou cinematográfico.', { rel: ['LUT'] }),
  g(V, 'LUT', ['luts', 'look up table', 'filtro de cor'], 'Arquivo que aplica um visual de cor pronto ao vídeo com um clique. Muito usado para padronizar o estilo ou converter imagens de câmeras log.', { rel: ['Correção e gradação de cor'] }),
  g(V, 'FPS', ['quadros por segundo', 'frame rate', 'fps'], 'Quantas imagens por segundo o vídeo tem. 24 fps é o cinema, 30 é o padrão de TV e internet, 60 deixa o movimento mais fluido e permite slow motion.', { rel: ['Slow motion', 'Resolução'] }),
  g(V, 'Resolução e proporção', ['resolução', 'proporção', 'aspect ratio', '1080p', '4k', '16:9', '9:16', 'vertical'], 'Resolução é a quantidade de pixels (1080p = Full HD, 4K = quatro vezes mais). Proporção é o formato: 16:9 para YouTube, 9:16 para Reels, TikTok e Shorts, 1:1 para quadrado.', { rel: ['FPS', 'Exportação'] }),
  g(V, 'Codec e bitrate', ['codec', 'bitrate', 'h.264', 'mp4', 'mov', 'formato de vídeo'], 'Codec é o método que comprime o vídeo (H.264 é o mais compatível). Bitrate é quanta informação por segundo ele guarda: mais bitrate, mais qualidade e arquivo maior.', { rel: ['Exportação'] }),
  g(V, 'Exportação', ['renderização', 'render', 'exportar vídeo'], 'Gerar o arquivo final do vídeo a partir do projeto de edição, escolhendo formato, resolução e qualidade para a plataforma de destino.', { rel: ['Codec e bitrate', 'Resolução e proporção'] }),
  g(V, 'Slow motion', ['câmera lenta', 'slow-mo', 'slowmo'], 'Fazer a ação parecer mais lenta. Fica bom quando filmado em 60 fps ou mais; em 30 fps, o efeito perde fluidez.', { rel: ['FPS'] }),
  g(V, 'Time-lapse', ['timelapse', 'lapso de tempo'], 'Acelerar o tempo mostrando horas em segundos, como o céu mudando ou uma obra sendo construída.', { rel: ['FPS'] }),
  g(V, 'Lower third', ['terço inferior', 'nome na tela', 'gc'], 'Faixa de texto no terço inferior da tela com o nome e o cargo de quem está falando.', { rel: ['Motion graphics'] }),
  g(V, 'Chroma key', ['tela verde', 'green screen', 'fundo verde'], 'Gravar a pessoa na frente de um fundo verde ou azul e, na edição, remover essa cor para colocar outro cenário atrás.', { rel: ['Rotoscopia'] }),
  g(V, 'Rotoscopia', ['rotoscopy', 'recorte de vídeo', 'remover fundo'], 'Recortar um objeto ou pessoa quadro a quadro para separá-lo do fundo, sem precisar de tela verde. Hoje ferramentas de IA fazem isso quase automaticamente.', { rel: ['Chroma key'] }),
  g(V, 'Motion graphics', ['motion', 'animação gráfica', 'after effects'], 'Textos, formas e ícones animados em vídeo, como infográficos, aberturas e títulos. Geralmente feitos no After Effects.', { rel: ['Keyframe', 'Lower third'] }),
  g(V, 'Montagem', ['edição narrativa', 'ritmo de edição'], 'A arte de escolher e ordenar os planos para contar a história com sentido e emoção. Boa montagem se sente, não se percebe.', { rel: ['Ritmo', 'Timeline'] }),
  g(V, 'Ritmo', ['pacing', 'cadência'], 'A velocidade com que os cortes acontecem. Cortes rápidos dão energia; planos longos dão calma e peso.', { rel: ['Jump cut', 'Montagem'] }),
  g(V, 'Plano e enquadramento', ['plano aberto', 'plano fechado', 'close', 'close-up', 'plano médio', 'plano detalhe', 'enquadramento'], 'Plano é o quanto se vê da cena: aberto mostra o ambiente, médio mostra a pessoa da cintura para cima, close mostra o rosto, detalhe mostra uma parte pequena. Enquadramento é como tudo é posicionado na imagem.', { rel: ['Regra dos terços'] }),
  g(V, 'Regra dos terços', ['terços', 'rule of thirds'], 'Dividir a imagem em uma grade 3×3 e colocar o assunto principal sobre as linhas ou cruzamentos, em vez de no centro. Deixa a imagem mais equilibrada.', { rel: ['Plano e enquadramento'] }),
  g(V, 'Mixagem de áudio', ['mixagem', 'ducking', 'trilha sonora', 'sfx', 'efeitos sonoros', 'áudio'], 'Equilibrar voz, música e efeitos. Ducking baixa a música automaticamente quando alguém fala. Trilha é a música de fundo e SFX são os efeitos sonoros.', { rel: ['J-cut e L-cut'] }),
  g(V, 'Legenda', ['legendas', 'closed caption', 'subtitle', 'legenda automática'], 'Texto na tela com a fala. Aumenta a retenção, já que muita gente assiste sem som, e ajuda a acessibilidade.', { rel: ['Retenção'] }),
  g(V, 'Hook', ['gancho', 'abertura', 'primeiros segundos'], 'Os primeiros segundos do vídeo, feitos para prender a atenção e evitar que a pessoa saia. Mostra o resultado ou uma pergunta curiosa antes de qualquer apresentação.', { rel: ['Retenção', 'Roteiro'] }),
  g(V, 'Retenção', ['retenção de audiência', 'tempo de visualização', 'watch time'], 'Quanto do vídeo as pessoas realmente assistem. É uma das métricas que mais pesam para o YouTube e o TikTok recomendarem o seu vídeo.', { rel: ['Hook', 'Legenda'] }),
  g(V, 'Roteiro e storyboard', ['roteiro', 'storyboard', 'script de vídeo', 'planejamento de vídeo'], 'Roteiro é o texto com falas e ações do vídeo. Storyboard é o roteiro desenhado, cena a cena, para planejar os planos antes de gravar.', { rel: ['Hook', 'Plano e enquadramento'] }),
  g(V, 'Thumbnail', ['capa do vídeo', 'miniatura'], 'A imagem de capa que aparece antes do vídeo. Junto do título, é o que decide se a pessoa clica.', { rel: ['Hook', 'Retenção'] }),
  g(V, 'Proxy', ['arquivos proxy', 'mídia proxy'], 'Cópias leves do vídeo usadas só durante a edição para o programa não travar com arquivos pesados. Na exportação, ele volta a usar os originais.', { rel: ['Exportação', 'Timeline'] }),
]

/* ───────────── Guias para pedidos ───────────── */

export interface Camada { rotulo: string; titulo: string; termos: string[]; nivel: Nivel }
export interface Etapa { titulo: string; texto: string; termos?: string[]; ferramentas?: string[] }

export interface Guide {
  id: string
  titulo: string
  /** Cada gatilho é uma lista de prefixos; todos precisam aparecer na pergunta (palavras normalizadas). */
  gatilhos: string[][]
  resumo: string
  /** Mapa de blocos que explica o assunto por inteiro (opcional). */
  camadas?: Camada[]
  etapas: Etapa[]
  categorias: Exclude<ToolCategory, 'Todas'>[]
}

export const GUIDES: Guide[] = [
  {
    id: 'site',
    titulo: 'Criar um site',
    gatilhos: [['site'], ['landing'], ['pagina', 'web'], ['portfolio'], ['loja', 'virtual']],
    resumo: 'Todo site tem três camadas. Você escolhe se monta sem código ou com código, e isso muda a dificuldade.',
    camadas: [
      { rotulo: 'O que a pessoa vê', titulo: 'Front-end', termos: ['HTML', 'CSS', 'JavaScript', 'React'], nivel: 'Média' },
      { rotulo: 'O que roda por trás', titulo: 'Back-end e dados', termos: ['Node.js', 'API', 'Banco de dados', 'Firebase'], nivel: 'Difícil' },
      { rotulo: 'Onde o site mora', titulo: 'Hospedagem e domínio', termos: ['Hospedagem', 'Domínio e DNS', 'HTTPS e SSL'], nivel: 'Fácil' },
    ],
    etapas: [
      { titulo: 'Planejar', texto: 'Defina o objetivo do site e as páginas: início, sobre, contato.', termos: ['Briefing', 'Persona'] },
      { titulo: 'Desenhar', texto: 'Faça um wireframe e depois o visual, pensando em celular e computador.', termos: ['Wireframe', 'Protótipo', 'Responsivo'], ferramentas: ['Figma', 'Canva'] },
      { titulo: 'Construir', texto: 'Sem código (fácil) ou com código: HTML, CSS e JavaScript, depois React com Vite (média).', termos: ['CMS', 'No-code e low-code', 'HTML', 'CSS', 'React', 'Vite'], ferramentas: ['WordPress', 'Wix', 'Framer'] },
      { titulo: 'Dados e login', texto: 'Se precisar de login ou dados, use um back-end ou o Firebase, que já traz banco de dados e hospedagem.', termos: ['API', 'Banco de dados', 'Firebase', 'Autenticação'] },
      { titulo: 'Publicar', texto: 'Publique, conecte o domínio e confira se o cadeado HTTPS está ativo.', termos: ['Deploy', 'Hospedagem', 'Domínio e DNS', 'HTTPS e SSL'] },
      { titulo: 'Medir', texto: 'Acompanhe as visitas e melhore o SEO para ser encontrado no Google.', termos: ['SEO', 'Taxa de conversão'] },
    ],
    categorias: ['CMS & Sites'],
  },
  {
    id: 'programar',
    titulo: 'Aprender programação do zero',
    gatilhos: [['aprender', 'program'], ['comecar', 'program'], ['aprender', 'cod'], ['programar']],
    resumo: 'Comece pelo que aparece na tela e vá subindo: HTML (fácil), CSS (média) e JavaScript (média). Depois escolha entre front-end e back-end.',
    etapas: [
      { titulo: 'HTML e CSS', texto: 'Monte uma página simples do zero.', termos: ['HTML', 'CSS'] },
      { titulo: 'JavaScript', texto: 'Faça a página reagir: cliques e formulários.', termos: ['JavaScript', 'Bug e debug'] },
      { titulo: 'Git e GitHub', texto: 'Aprenda a guardar e publicar o seu código.', termos: ['Git e GitHub'] },
      { titulo: 'Escolher um caminho', texto: 'Front-end com React ou back-end com Node.js ou Python.', termos: ['Front-end', 'Back-end', 'React', 'Node.js', 'Python'] },
      { titulo: 'Projeto real', texto: 'Construa um projeto pequeno e publique.', termos: ['Deploy', 'Algoritmo'] },
    ],
    categorias: ['IA & Pesquisa'],
  },
  {
    id: 'video',
    titulo: 'Editar um vídeo',
    gatilhos: [['edit', 'vide'], ['edic', 'vide'], ['cort', 'vide'], ['mont', 'vide'], ['edit', 'reel'], ['edit', 'tiktok']],
    resumo: 'Editar é organizar clipes na timeline, cortar o que sobra, cobrir com B-roll, ajustar cor e áudio e exportar no formato da plataforma.',
    etapas: [
      { titulo: 'Planejar', texto: 'Escreva o roteiro e pense no gancho dos primeiros segundos.', termos: ['Roteiro e storyboard', 'Hook'] },
      { titulo: 'Montar', texto: 'Importe os clipes e monte o corte bruto na timeline.', termos: ['Timeline', 'Corte'], ferramentas: ['CapCut'] },
      { titulo: 'Cortar e cobrir', texto: 'Corte pausas e cubra com imagens de apoio.', termos: ['Jump cut', 'A-roll e B-roll'] },
      { titulo: 'Ritmo e texto', texto: 'Ajuste ritmo, transições, zoom e legendas.', termos: ['Ritmo', 'Transição', 'Zoom e punch-in', 'Legenda'] },
      { titulo: 'Cor e áudio', texto: 'Corrija a cor e mixe o áudio, com a voz acima da música.', termos: ['Correção e gradação de cor', 'Mixagem de áudio'] },
      { titulo: 'Exportar', texto: 'Escolha a proporção: 16:9 para YouTube, 9:16 para Reels e TikTok.', termos: ['Resolução e proporção', 'Exportação', 'Codec e bitrate'], ferramentas: ['HandBrake', 'RunwayML'] },
    ],
    categorias: ['Criar vídeo', 'Áudio & Voz'],
  },
  {
    id: 'identidade',
    titulo: 'Criar uma identidade visual ou logo',
    gatilhos: [['logo'], ['identidade', 'visual'], ['criar', 'marca'], ['brandbook']],
    resumo: 'Identidade visual é o conjunto de logo, cores, fontes e estilo de imagens. Ela nasce do posicionamento: primeiro entender para quem e por quê, depois desenhar.',
    etapas: [
      { titulo: 'Entender a marca', texto: 'Defina posicionamento, público e tom de voz.', termos: ['Posicionamento', 'Tom de voz', 'Persona'] },
      { titulo: 'Referências', texto: 'Monte um moodboard com o clima visual que você quer.', termos: ['Moodboard'] },
      { titulo: 'Logotipo', texto: 'Esboce o logo em vetor, para ampliar sem perder qualidade.', termos: ['Logotipo e identidade visual', 'Vetor e raster'], ferramentas: ['Figma'] },
      { titulo: 'Cores e fontes', texto: 'Escolha a paleta e a tipografia, cuidando do contraste.', termos: ['Paleta de cores', 'Tipografia', 'Contraste'] },
      { titulo: 'Testar', texto: 'Teste em fundo claro, escuro e em mockups.', termos: ['Mockup'] },
      { titulo: 'Brandbook', texto: 'Reúna as regras de uso em um manual da marca.', termos: ['Brandbook'] },
    ],
    categorias: ['Imagem & Design', 'Ícones & SVG'],
  },
  {
    id: 'plano-marketing',
    titulo: 'Montar um plano de marketing',
    gatilhos: [['plano', 'marketing'], ['estrategia', 'marketing'], ['lancar', 'campanha'], ['campanha']],
    resumo: 'Um bom plano parte do diagnóstico, define para quem é, quais as metas e como chegar lá.',
    etapas: [
      { titulo: 'Diagnóstico', texto: 'Analise a sua marca e os concorrentes.', termos: ['Análise SWOT', 'Benchmarking', 'Cinco Forças de Porter'] },
      { titulo: 'Público', texto: 'Defina quem é o cliente e o caminho que ele percorre.', termos: ['Persona', 'Jornada do cliente'] },
      { titulo: 'Metas', texto: 'Escreva metas claras e escolha os indicadores.', termos: ['Metas SMART', 'KPI', 'OKR'] },
      { titulo: 'Posicionamento', texto: 'Decida o lugar da marca e a promessa de valor.', termos: ['Posicionamento', 'Proposta de valor'] },
      { titulo: 'Plano', texto: 'Planeje o mix e o funil, com conteúdo para cada etapa.', termos: ['4 Ps do marketing', 'Funil de vendas'] },
      { titulo: 'Medir e ajustar', texto: 'Execute, meça e melhore com testes.', termos: ['CTR', 'CAC', 'ROI', 'Teste A/B'] },
    ],
    categorias: ['Métricas', 'Redes Sociais'],
  },
  {
    id: 'social',
    titulo: 'Criar conteúdo para redes sociais',
    gatilhos: [['conteudo', 'rede'], ['post'], ['instagram'], ['reels'], ['criar', 'conteudo']],
    resumo: 'Conteúdo que funciona tem um gancho forte, entrega valor rápido e termina com uma chamada para ação.',
    etapas: [
      { titulo: 'Entender o público', texto: 'Defina a persona e o objetivo: alcance, engajamento ou venda.', termos: ['Persona', 'Funil de vendas'] },
      { titulo: 'Gancho e mensagem', texto: 'Escreva o gancho e a mensagem principal.', termos: ['Hook', 'Copywriting', 'Storytelling'] },
      { titulo: 'Criar', texto: 'Faça a arte ou grave e edite o vídeo na vertical.', ferramentas: ['Canva', 'CapCut'] },
      { titulo: 'Chamar para ação', texto: 'Feche com um CTA claro.', termos: ['CTA'] },
      { titulo: 'Medir', texto: 'Acompanhe e repita o que funcionou.', termos: ['Engajamento', 'Alcance e impressões', 'Retenção'] },
    ],
    categorias: ['Redes Sociais', 'Imagem & Design', 'Criar vídeo'],
  },
  {
    id: 'app',
    titulo: 'Criar um app ou produto digital',
    gatilhos: [['criar', 'app'], ['fazer', 'app'], ['aplicativo'], ['produto', 'digital'], ['startup']],
    resumo: 'Comece pequeno: valide a ideia com um MVP. Desenhe o fluxo, teste com pessoas e só então programe.',
    etapas: [
      { titulo: 'Problema e pessoa', texto: 'Descreva o problema e para quem é.', termos: ['Persona', 'MVP'] },
      { titulo: 'Desenhar', texto: 'Faça wireframes e um protótipo clicável.', termos: ['Wireframe', 'Protótipo', 'UI e UX'], ferramentas: ['Figma'] },
      { titulo: 'Testar', texto: 'Teste com usuários reais e ajuste.', termos: ['Heurísticas de Nielsen'] },
      { titulo: 'Construir o MVP', texto: 'No-code para validar rápido ou código com React e Firebase.', termos: ['No-code e low-code', 'React', 'Firebase', 'Autenticação'] },
      { titulo: 'Design system', texto: 'Crie peças reutilizáveis conforme o produto cresce.', termos: ['Design system', 'Componente'] },
      { titulo: 'Publicar e medir', texto: 'Publique, meça e evolua.', termos: ['Deploy', 'KPI'] },
    ],
    categorias: ['Imagem & Design', 'IA & Pesquisa'],
  },
]
