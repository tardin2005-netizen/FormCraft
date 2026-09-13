export type ToolCategory =
  | 'Todas'
  | 'IA & Pesquisa'
  | 'Imagem & Design'
  | 'Criar vídeo'
  | 'Áudio & Voz'
  | 'Métricas'
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
  // Imagem & Design
  { name: 'Figma',            cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#A259FF', letter: 'F', url: 'https://figma.com',                      desc: 'Design colaborativo e prototipagem na web' },
  { name: 'Canva',            cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#00C4CC', letter: 'C', url: 'https://canva.com',                      desc: 'Criação gráfica acessível para todos' },
  { name: 'Midjourney',       cat: 'Imagem & Design',  pricing: 'ASSINATURA', color: '#2D3277', letter: 'M', url: 'https://midjourney.com',                 desc: 'Geração de imagens de alta qualidade com IA' },
  { name: 'Adobe Firefly',    cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#FF0000', letter: 'A', url: 'https://firefly.adobe.com',              desc: 'IA generativa integrada ao ecossistema Adobe' },
  { name: 'Framer',           cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#0E0E0E', letter: 'F', url: 'https://framer.com',                     desc: 'Design e prototipagem com animações avançadas' },
  { name: 'Spline',           cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#5F6FFF', letter: 'S', url: 'https://spline.design',                  desc: 'Modelagem e animação 3D no navegador' },
  { name: 'Webflow',          cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#4353FF', letter: 'W', url: 'https://webflow.com',                    desc: 'Criação de sites sem código com CMS' },
  // Criar vídeo
  { name: 'RunwayML',         cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#FF4081', letter: 'R', url: 'https://runwayml.com',                   desc: 'Edição e geração de vídeo com IA generativa' },
  { name: 'Sora',             cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#10A37F', letter: 'S', url: 'https://sora.openai.com',                desc: 'Geração de vídeos realistas pela OpenAI' },
  { name: 'Pika',             cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#6366F1', letter: 'P', url: 'https://pika.art',                       desc: 'Criação de vídeos curtos com IA' },
  { name: 'Luma AI',          cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#FF6B35', letter: 'L', url: 'https://lumalabs.ai',                    desc: 'Geração de vídeos e cenas 3D com IA' },
  { name: 'CapCut',           cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#000000', letter: 'C', url: 'https://capcut.com',                     desc: 'Edição de vídeo simples para redes sociais' },
  // Áudio & Voz
  { name: 'ElevenLabs',       cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#7B61FF', letter: 'E', url: 'https://elevenlabs.io',                  desc: 'Síntese de voz ultra-realista com IA' },
  { name: 'Suno',             cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#F59E0B', letter: 'S', url: 'https://suno.com',                       desc: 'Criação de músicas completas com IA' },
  { name: 'Udio',             cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#EC4899', letter: 'U', url: 'https://udio.com',                       desc: 'Geração de músicas com alta qualidade' },
  { name: 'Adobe Podcast',    cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#9C27B0', letter: 'A', url: 'https://podcast.adobe.com',              desc: 'Edição de áudio com IA para podcasters' },
  // Métricas
  { name: 'Google Analytics', cat: 'Métricas',         pricing: 'GRATUITO',   color: '#F4B400', letter: 'G', url: 'https://analytics.google.com',           desc: 'Análise de tráfego e comportamento no site' },
  { name: 'Hotjar',           cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#FD3A5C', letter: 'H', url: 'https://hotjar.com',                     desc: 'Mapas de calor e gravações de sessão' },
  { name: 'Mixpanel',         cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#7C3AED', letter: 'M', url: 'https://mixpanel.com',                   desc: 'Analytics de produto e funis de conversão' },
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
  'Todas','IA & Pesquisa','Imagem & Design','Criar vídeo','Áudio & Voz','Métricas','Banco de Imagens','Ícones & SVG',
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
