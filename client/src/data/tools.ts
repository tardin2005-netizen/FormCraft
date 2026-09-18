export type ToolCategory =
  | 'Todas'
  | 'IA & Pesquisa'
  | 'Imagem & Design'
  | 'Criar vídeo'
  | 'Áudio & Voz'
  | 'Métricas'
  | 'Redes Sociais'
  | 'CMS & Sites'
  | 'Segurança'
  | 'Produtividade'
  | 'Banco de Imagens'
  | 'Ícones & SVG'

export interface Tool {
  name: string
  cat: Exclude<ToolCategory, 'Todas'>
  pricing: 'FREEMIUM' | 'GRATUITO' | 'ASSINATURA'
  color: string
  letter: string
  url: string
  desc: string
}

export const ALL_TOOLS: Tool[] = [
  // IA & Pesquisa
  { name: 'Perplexity',       cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#1BA1E2', letter: 'P', url: 'https://perplexity.ai',                 desc: 'Busca com IA e respostas com fontes' },
  { name: 'Gemini',           cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#4285F4', letter: 'G', url: 'https://gemini.google.com',              desc: 'IA do Google com multimodalidade' },
  { name: 'Claude',           cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#D97757', letter: 'C', url: 'https://claude.ai',                      desc: 'IA da Anthropic, ótima para raciocínio' },
  { name: 'ChatGPT',          cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#10A37F', letter: 'G', url: 'https://chatgpt.com',                    desc: 'IA da OpenAI, popular e versátil' },
  { name: 'Grok',             cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#1D9BF0', letter: 'X', url: 'https://grok.com',                       desc: 'IA do xAI com acesso ao Twitter/X' },
  { name: 'DeepSeek',         cat: 'IA & Pesquisa',    pricing: 'GRATUITO',   color: '#4A90D9', letter: 'D', url: 'https://deepseek.com',                   desc: 'IA de alta performance com código aberto' },
  { name: 'Copilot',          cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#0078D4', letter: 'M', url: 'https://copilot.microsoft.com',          desc: 'Assistente IA integrado ao Microsoft 365' },
  { name: 'Gems (Gemini)',    cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#4285F4', letter: 'G', url: 'https://gemini.google.com',              desc: 'Assistentes personalizados no Gemini com tom e instruções fixas' },
  { name: 'Omni Flash',       cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#34A853', letter: 'G', url: 'https://gemini.google.com',              desc: 'Modelo multimodal do Gemini para vídeo em várias cenas e edição por instrução' },
  { name: 'Perplexity Comet', cat: 'IA & Pesquisa',    pricing: 'ASSINATURA', color: '#1BA1E2', letter: 'P', url: 'https://www.perplexity.ai/',             desc: 'Navegador com IA integrada em todas as abas — pesquisa contextual enquanto você navega' },
  // Imagem & Design
  { name: 'Figma',            cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#A259FF', letter: 'F', url: 'https://figma.com',                      desc: 'Design colaborativo e prototipagem na web' },
  { name: 'Canva',            cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#00C4CC', letter: 'C', url: 'https://canva.com',                      desc: 'Criação gráfica acessível para todos' },
  { name: 'Midjourney',       cat: 'Imagem & Design',  pricing: 'ASSINATURA', color: '#2D3277', letter: 'M', url: 'https://midjourney.com',                 desc: 'Geração de imagens de alta qualidade com IA' },
  { name: 'Adobe Firefly',    cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#FF0000', letter: 'A', url: 'https://firefly.adobe.com',              desc: 'IA generativa integrada ao ecossistema Adobe' },
  { name: 'Lightroom',        cat: 'Imagem & Design',  pricing: 'ASSINATURA', color: '#31A8FF', letter: 'L', url: 'https://lightroom.adobe.com',            desc: 'Edição e organização profissional de fotos' },
  { name: 'Framer',           cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#0E0E0E', letter: 'F', url: 'https://framer.com',                     desc: 'Design e prototipagem com animações avançadas' },
  { name: 'Spline',           cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#5F6FFF', letter: 'S', url: 'https://spline.design',                  desc: 'Modelagem e animação 3D no navegador' },
  { name: 'Webflow',          cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#4353FF', letter: 'W', url: 'https://webflow.com',                    desc: 'Criação de sites sem código com CMS' },
  { name: 'GIMP',             cat: 'Imagem & Design',  pricing: 'GRATUITO',   color: '#5C5C5C', letter: 'G', url: 'https://www.gimp.org/',                  desc: 'Editor de imagens open source, alternativa ao Photoshop. Abre arquivos .PSD' },
  { name: 'Nano Banana',      cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#FBBC04', letter: 'G', url: 'https://gemini.google.com/',             desc: 'Edição de imagem por conversa no Gemini: troca fundo, muda cor, mantém personagem em outra cena' },
  // Criar vídeo
  { name: 'RunwayML',         cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#FF4081', letter: 'R', url: 'https://runwayml.com',                   desc: 'Edição e geração de vídeo com IA generativa' },
  { name: 'Sora',             cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#10A37F', letter: 'S', url: 'https://sora.openai.com',                desc: 'Geração de vídeos realistas pela OpenAI' },
  { name: 'Pika',             cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#6366F1', letter: 'P', url: 'https://pika.art',                       desc: 'Criação de vídeos curtos com IA' },
  { name: 'Luma AI',          cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#FF6B35', letter: 'L', url: 'https://lumalabs.ai',                    desc: 'Geração de vídeos e cenas 3D com IA' },
  { name: 'CapCut',           cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#000000', letter: 'C', url: 'https://capcut.com',                     desc: 'Edição de vídeo simples para redes sociais' },
  { name: 'OBS Studio',       cat: 'Criar vídeo',      pricing: 'GRATUITO',   color: '#302E31', letter: 'O', url: 'https://obsproject.com',                 desc: 'Gravação de tela e streaming open source' },
  { name: 'Kling AI',         cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#6366F1', letter: 'K', url: 'https://klingai.com/',                   desc: 'Gerador de vídeo da Kuaishou: texto ou imagem → vídeo com áudio nativo. Créditos gratuitos diários' },
  { name: 'Seedance 2.0',     cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#000000', letter: 'S', url: 'https://seed.bytedance.com/',            desc: 'Modelo de vídeo da ByteDance com geração multimodal e áudio nativo sincronizado' },
  { name: 'VEED Fabric',      cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#00D4AA', letter: 'V', url: 'https://www.veed.io/',                   desc: 'Transforma imagem em vídeo falando com lipsync. Apresentador virtual ou avatar de marca' },
  { name: 'HandBrake',        cat: 'Criar vídeo',      pricing: 'GRATUITO',   color: '#E85829', letter: 'H', url: 'https://handbrake.fr/',                  desc: 'Conversor de vídeo gratuito: .MOV pesado → .MP4 leve. Presets para YouTube e web' },
  { name: 'VLC',              cat: 'Criar vídeo',      pricing: 'GRATUITO',   color: '#FF7800', letter: 'V', url: 'https://www.videolan.org/vlc/',          desc: 'Reprodutor que abre qualquer formato sem codec extra. Também faz conversão simples' },
  { name: 'Eyecandy',         cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#FF3366', letter: 'E', url: 'https://eyecannndy.com/',                desc: 'Biblioteca de técnicas visuais: busca pelo efeito (match cut, VHS, projeção), não pelo filme' },
  // Áudio & Voz
  { name: 'ElevenLabs',       cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#7B61FF', letter: 'E', url: 'https://elevenlabs.io',                  desc: 'Síntese de voz ultra-realista com IA' },
  { name: 'Suno',             cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#F59E0B', letter: 'S', url: 'https://suno.com',                       desc: 'Criação de músicas completas com IA' },
  { name: 'Udio',             cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#EC4899', letter: 'U', url: 'https://udio.com',                       desc: 'Geração de músicas com alta qualidade' },
  { name: 'Adobe Podcast',    cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#9C27B0', letter: 'A', url: 'https://podcast.adobe.com',              desc: 'Edição de áudio com IA para podcasters' },
  { name: 'Fish Audio',       cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#0EA5E9', letter: 'F', url: 'https://fish.audio/pt/',                 desc: 'Voz por IA: texto-para-fala, transcrição e clonagem de voz a partir de 10–15s de áudio' },
  // Métricas
  { name: 'Google Analytics', cat: 'Métricas',         pricing: 'GRATUITO',   color: '#F4B400', letter: 'G', url: 'https://analytics.google.com',           desc: 'Análise de tráfego e comportamento no site' },
  { name: 'Hotjar',           cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#FD3A5C', letter: 'H', url: 'https://hotjar.com',                     desc: 'Mapas de calor e gravações de sessão' },
  { name: 'Mixpanel',         cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#7C3AED', letter: 'M', url: 'https://mixpanel.com',                   desc: 'Analytics de produto e funis de conversão' },
  { name: 'SimilarWeb',       cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#FF5F58', letter: 'S', url: 'https://similarweb.com',                 desc: 'Tráfego e ranking de qualquer site' },
  { name: 'SEMrush',          cat: 'Métricas',         pricing: 'ASSINATURA', color: '#FF6900', letter: 'S', url: 'https://semrush.com',                    desc: 'SEO, tráfego pago e análise de concorrentes' },
  { name: 'Ahrefs',           cat: 'Métricas',         pricing: 'ASSINATURA', color: '#0EA5E9', letter: 'A', url: 'https://ahrefs.com',                     desc: 'Backlinks, palavras-chave e auditoria SEO' },
  { name: 'Amplitude',        cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#1B55E2', letter: 'A', url: 'https://amplitude.com',                  desc: 'Analytics comportamental de produtos digitais' },
  { name: 'Clarity',          cat: 'Métricas',         pricing: 'GRATUITO',   color: '#0067B8', letter: 'C', url: 'https://clarity.microsoft.com',          desc: 'Mapas de calor e sessões grátis da Microsoft' },
  { name: 'CompaniesMarketCap', cat: 'Métricas',       pricing: 'GRATUITO',   color: '#1E293B', letter: 'C', url: 'https://companiesmarketcap.com/',        desc: 'Ranking de +11 mil empresas por valor de mercado, receita, lucro e funcionários' },
  { name: 'Not Just Analytics', cat: 'Métricas',       pricing: 'FREEMIUM',   color: '#8B5CF6', letter: 'N', url: 'https://www.notjustanalytics.com/',      desc: 'Análise avançada de Instagram e TikTok — inclusive de perfis alheios. Crescimento e engajamento por post' },
  // Redes Sociais
  { name: 'SocialBlade',      cat: 'Redes Sociais',    pricing: 'FREEMIUM',   color: '#333333', letter: 'S', url: 'https://socialblade.com',                desc: 'Estatísticas e ranking de canais e perfis' },
  { name: 'Buffer',           cat: 'Redes Sociais',    pricing: 'FREEMIUM',   color: '#168EEA', letter: 'B', url: 'https://buffer.com',                     desc: 'Agendamento de posts para múltiplas redes' },
  { name: 'Hootsuite',        cat: 'Redes Sociais',    pricing: 'ASSINATURA', color: '#143059', letter: 'H', url: 'https://hootsuite.com',                  desc: 'Gestão completa de redes sociais' },
  { name: 'Later',            cat: 'Redes Sociais',    pricing: 'FREEMIUM',   color: '#FF6B9D', letter: 'L', url: 'https://later.com',                      desc: 'Planejamento visual para Instagram e TikTok' },
  { name: 'Metricool',        cat: 'Redes Sociais',    pricing: 'FREEMIUM',   color: '#00B4D8', letter: 'M', url: 'https://metricool.com',                  desc: 'Analytics e agendamento de redes sociais' },
  { name: 'POPline Creators', cat: 'Redes Sociais',    pricing: 'GRATUITO',   color: '#E91E63', letter: 'P', url: 'https://poplinecreators.com.br/',        desc: 'Marketplace de campanhas: marcas publicam briefings, criadores se candidatam e recebem via PIX' },
  { name: 'CoCreators',       cat: 'Redes Sociais',    pricing: 'FREEMIUM',   color: '#FF6B35', letter: 'C', url: 'https://site.cocreators.app/',           desc: 'Plataforma brasileira de UGC: conecta marcas a criadores e nano-influenciadores' },
  // CMS & Sites
  { name: 'WordPress',        cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#21759B', letter: 'W', url: 'https://wordpress.com',                  desc: 'CMS mais usado do mundo, blogs e sites' },
  { name: 'Ghost',            cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#15171A', letter: 'G', url: 'https://ghost.org',                      desc: 'CMS moderno para blogs e newsletters' },
  { name: 'Wix',              cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#FAAD4D', letter: 'W', url: 'https://wix.com',                        desc: 'Criador de sites com arrastar e soltar' },
  { name: 'Squarespace',      cat: 'CMS & Sites',      pricing: 'ASSINATURA', color: '#000000', letter: 'S', url: 'https://squarespace.com',                desc: 'Sites com design profissional e templates' },
  { name: 'Shopify',          cat: 'CMS & Sites',      pricing: 'ASSINATURA', color: '#96BF48', letter: 'S', url: 'https://shopify.com',                    desc: 'Plataforma de e-commerce completa' },
  { name: 'GoDaddy',          cat: 'CMS & Sites',      pricing: 'ASSINATURA', color: '#00A4A6', letter: 'G', url: 'https://www.godaddy.com/',               desc: 'Registro de domínios e hospedagem de sites' },
  { name: 'Hostinger',        cat: 'CMS & Sites',      pricing: 'ASSINATURA', color: '#673DE6', letter: 'H', url: 'https://www.hostinger.com/',             desc: 'Hospedagem de sites e registro de domínios com preços acessíveis' },
  { name: 'Vercel',           cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#000000', letter: 'V', url: 'https://vercel.com',                     desc: 'Deploy instantâneo de frontends e Next.js — push no Git e o site já está no ar' },
  { name: 'Netlify',          cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#00C7B7', letter: 'N', url: 'https://netlify.com',                    desc: 'Hospedagem de sites estáticos e serverless functions com CI/CD automático' },
  { name: 'Railway',          cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#0B0D0E', letter: 'R', url: 'https://railway.app',                    desc: 'Deploy de backends, bancos de dados e APIs em minutos, sem configurar servidor' },
  { name: 'Render',           cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#46E3B7', letter: 'R', url: 'https://render.com',                     desc: 'Alternativa ao Heroku: hospeda apps full-stack, workers e bancos com plano gratuito' },
  { name: 'Cloudflare',       cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#F6821F', letter: 'C', url: 'https://cloudflare.com',                 desc: 'CDN, proteção DDoS, domínios e Cloudflare Pages para sites estáticos globais' },
  { name: 'Supabase',         cat: 'CMS & Sites',      pricing: 'FREEMIUM',   color: '#3ECF8E', letter: 'S', url: 'https://supabase.com',                   desc: 'Backend open source: banco Postgres, autenticação, storage e API gerada automaticamente' },
  // Segurança
  { name: 'Bitwarden',        cat: 'Segurança',        pricing: 'FREEMIUM',   color: '#175DDC', letter: 'B', url: 'https://bitwarden.com',                  desc: 'Gerenciador de senhas open source e seguro' },
  { name: 'NordPass',         cat: 'Segurança',        pricing: 'FREEMIUM',   color: '#4687FF', letter: 'N', url: 'https://nordpass.com',                   desc: 'Gerenciador de senhas da Nord Security' },
  { name: '1Password',        cat: 'Segurança',        pricing: 'ASSINATURA', color: '#0094F5', letter: '1', url: 'https://1password.com',                  desc: 'Cofre de senhas premium para times e famílias' },
  { name: 'Have I Been Pwned',cat: 'Segurança',        pricing: 'GRATUITO',   color: '#D73E3E', letter: 'H', url: 'https://haveibeenpwned.com',             desc: 'Verifica se seu e-mail foi vazado' },
  { name: 'Virustotal',       cat: 'Segurança',        pricing: 'GRATUITO',   color: '#394EFF', letter: 'V', url: 'https://virustotal.com',                 desc: 'Analisa arquivos e URLs em busca de malware' },
  { name: 'Brave',            cat: 'Segurança',        pricing: 'GRATUITO',   color: '#FB542B', letter: 'B', url: 'https://brave.com',                      desc: 'Navegador focado em privacidade com bloqueador nativo' },
  // Produtividade
  { name: 'Notion',           cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#000000', letter: 'N', url: 'https://notion.so',                      desc: 'Notas, wikis e banco de dados all-in-one' },
  { name: 'Obsidian',         cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#7E6AD2', letter: 'O', url: 'https://obsidian.md',                    desc: 'Notas em Markdown com links bidirecionais' },
  { name: 'Trello',           cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#0052CC', letter: 'T', url: 'https://trello.com',                     desc: 'Kanban simples para organizar projetos' },
  { name: 'Linear',           cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#5E6AD2', letter: 'L', url: 'https://linear.app',                     desc: 'Gestão de issues para times de produto' },
  { name: 'Todoist',          cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#DB4035', letter: 'T', url: 'https://todoist.com',                    desc: 'Gerenciador de tarefas cross-platform' },
  { name: 'Toggl',            cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#E01E5A', letter: 'T', url: 'https://toggl.com',                      desc: 'Time tracking simples com relatórios' },
  { name: 'AnyDesk',          cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#EF443B', letter: 'A', url: 'https://anydesk.com',                    desc: 'Acesso remoto a computadores com baixa latência' },
  { name: 'Visual Studio Code', cat: 'Produtividade',  pricing: 'GRATUITO',   color: '#007ACC', letter: 'V', url: 'https://code.visualstudio.com/',         desc: 'Editor de código da Microsoft, gratuito e mais usado do mercado. Para HTML/CSS, scripts e automações' },
  { name: 'Node.js',          cat: 'Produtividade',    pricing: 'GRATUITO',   color: '#339933', letter: 'N', url: 'https://nodejs.org/',                    desc: 'Ambiente JavaScript fora do navegador. Pré-requisito de muitas ferramentas modernas e projetos de IA' },
  { name: 'Padlet',           cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#FF4A6B', letter: 'P', url: 'https://padlet.com/',                    desc: 'Mural digital colaborativo: post-its com texto, imagens, vídeos e links editados em tempo real' },
  { name: 'MultCloud',        cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#2D8CFF', letter: 'M', url: 'https://www.multcloud.com/',             desc: 'Transfere e sincroniza arquivos entre nuvens (Google Drive, OneDrive, Dropbox e +30 serviços) sem baixar nada' },
  { name: 'iSyncr',          cat: 'Produtividade',    pricing: 'FREEMIUM',   color: '#A2AAAD', letter: 'i', url: 'https://www.jrtstudio.com/iSyncr-iTunes-for-Android', desc: 'Sincroniza músicas e playlists do iTunes/iCloud com Android via Wi-Fi ou USB' },
  // Banco de Imagens
  { name: 'Unsplash',         cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#111111', letter: 'U', url: 'https://unsplash.com',                   desc: 'Banco de fotos gratuito de alta qualidade' },
  { name: 'Pexels',           cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#05A081', letter: 'P', url: 'https://pexels.com',                     desc: 'Fotos e vídeos gratuitos para projetos web' },
  { name: 'Pixabay',          cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#2EC66B', letter: 'P', url: 'https://pixabay.com',                    desc: 'Fotos, ilustrações, vetores e vídeos livres' },
  { name: 'FoodiesFeed',      cat: 'Banco de Imagens', pricing: 'FREEMIUM',   color: '#F59E0B', letter: 'F', url: 'https://foodiesfeed.com',                desc: 'Banco especializado em fotografia de comida' },
  { name: 'Freepik',          cat: 'Banco de Imagens', pricing: 'FREEMIUM',   color: '#1273EB', letter: 'F', url: 'https://freepik.com',                    desc: 'Fotos, vetores e templates gráficos' },
  { name: 'Adobe Stock',      cat: 'Banco de Imagens', pricing: 'ASSINATURA', color: '#FF0000', letter: 'A', url: 'https://stock.adobe.com',                desc: 'Banco premium integrado ao Creative Cloud' },
  { name: 'Shutterstock',     cat: 'Banco de Imagens', pricing: 'ASSINATURA', color: '#E8132A', letter: 'S', url: 'https://shutterstock.com',               desc: 'Maior banco de imagens premium do mundo' },
  { name: 'Envato Elements',  cat: 'Banco de Imagens', pricing: 'ASSINATURA', color: '#82BC03', letter: 'E', url: 'https://elements.envato.com',            desc: 'Templates, fontes, fotos e assets ilimitados' },
  { name: 'StockSnap',        cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#3C8EF9', letter: 'S', url: 'https://stocksnap.io',                   desc: 'Fotos gratuitas com licença CC0' },
  { name: 'Kaboompics',       cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#E91E8C', letter: 'K', url: 'https://kaboompics.com',                 desc: 'Lifestyle, interiores e fotografia estética' },
  { name: 'Openverse',        cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#0073A8', letter: 'O', url: 'https://openverse.org',                  desc: 'Mecanismo para mídia com licenças abertas' },
  { name: 'Filmgrab',         cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#1A1A2E', letter: 'F', url: 'https://film-grab.com/',                 desc: 'Acervo de fotogramas de filmes por diretor, fotografia e gênero. Fonte de moodboard cinematográfico' },
  // Ícones & SVG
  { name: 'Iconify',          cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#1769AA', letter: 'I', url: 'https://iconify.design',                 desc: '200+ coleções e 300K+ ícones em uma API' },
  { name: 'SVG Repo',         cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#6C63FF', letter: 'S', url: 'https://svgrepo.com',                    desc: 'Repositório com SVGs prontos para uso' },
  { name: 'Lucide Icons',     cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#F56565', letter: 'L', url: 'https://lucide.dev',                     desc: 'Ícones limpos e consistentes, open source' },
  { name: 'Phosphor Icons',   cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#805AD5', letter: 'P', url: 'https://phosphoricons.com',              desc: 'Família flexível com 6 estilos de ícones' },
  { name: 'Tabler Icons',     cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#0CA5E9', letter: 'T', url: 'https://tabler.io/icons',                desc: '+5000 ícones SVG open source com stroke' },
  { name: 'Heroicons',        cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#6366F1', letter: 'H', url: 'https://heroicons.com',                  desc: 'Ícones do Tailwind UI, outline e solid' },
  { name: 'Material Symbols', cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#4285F4', letter: 'M', url: 'https://fonts.google.com/icons',         desc: 'Ícones do Material Design 3 (Google)' },
  { name: 'Remix Icon',       cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#0EA5E9', letter: 'R', url: 'https://remixicon.com',                  desc: '+2800 ícones neutros e versáteis' },
  { name: 'Bootstrap Icons',  cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#7952B3', letter: 'B', url: 'https://icons.getbootstrap.com',         desc: '+2000 ícones do framework Bootstrap' },
  { name: 'Hugeicons',        cat: 'Ícones & SVG',     pricing: 'FREEMIUM',   color: '#FF6B00', letter: 'H', url: 'https://hugeicons.com',                  desc: '+36K ícones premium com estilo consistente' },
  { name: 'Font Awesome',     cat: 'Ícones & SVG',     pricing: 'FREEMIUM',   color: '#528DD3', letter: 'F', url: 'https://fontawesome.com',                desc: 'Biblioteca de ícones mais usada da web' },
  { name: 'Simple Icons',     cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#111111', letter: 'S', url: 'https://simpleicons.org',                desc: 'Logos SVG de marcas e tecnologias populares' },
  { name: 'unDraw',           cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#6C63FF', letter: 'U', url: 'https://undraw.co',                      desc: 'Ilustrações SVG gratuitas e customizáveis' },
]

export const TOOL_CATS: ToolCategory[] = [
  'Todas','IA & Pesquisa','Imagem & Design','Criar vídeo','Áudio & Voz',
  'Métricas','Redes Sociais','CMS & Sites','Segurança','Produtividade',
  'Banco de Imagens','Ícones & SVG',
]

export const PRICING_COLOR: Record<string, string> = {
  FREEMIUM: '#f59e0b',
  GRATUITO: '#3ecf8e',
  ASSINATURA: '#e46ef7',
}

export const PRICING_LABEL: Record<string, string> = {
  FREEMIUM: 'Freemium',
  GRATUITO: 'Gratuito',
  ASSINATURA: 'Assinatura',
}
