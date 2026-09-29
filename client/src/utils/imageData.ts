// Images are stored inline in the Firestore document, which has a 1 MB limit.
// Photos/prints are resized and re-encoded; GIFs keep their animation but must already be small.

const MAX_SIDE = 1600
const MAX_BYTES = 700 * 1024 // leaves room for the rest of the document

function readAsDataURL(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Não foi possível ler essa imagem.'))
    img.src = src
  })
}

/** Returns a data URL small enough to save, or throws an Error with a message for the user. */
export async function imageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.')

  if (file.type === 'image/gif') {
    if (file.size > MAX_BYTES) throw new Error('GIF muito grande (máx. 700 KB). Reduza o tamanho ou use um print estático.')
    return readAsDataURL(file)
  }

  const img = await loadImage(await readAsDataURL(file))
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível processar a imagem.')
  ctx.fillStyle = '#ffffff' // transparent PNGs would turn black in JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  for (const quality of [0.85, 0.75, 0.6, 0.45]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length * 0.75 <= MAX_BYTES) return url
  }
  throw new Error('Imagem detalhada demais para salvar. Recorte só a parte importante e tente de novo.')
}
