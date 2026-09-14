import { useState, useRef, useCallback } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import app from '../firebase'
import s from './PdfProcessorModal.module.css'

const functions = getFunctions(app, 'us-central1')
const processAulaPdfFn = httpsCallable<
  { text: string; subjectName?: string; fileName?: string },
  { title: string; summary: string; keyPoints: string[]; sections: Array<{ heading: string; content: string }> }
>(functions, 'processAulaPdf')

interface Props {
  subjectName: string
  onSave: (title: string, content: string) => void
  onClose: () => void
}

type Stage = 'drop' | 'extracting' | 'processing' | 'result' | 'error'

export default function PdfProcessorModal({ subjectName, onSave, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('drop')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    title: string
    summary: string
    keyPoints: string[]
    sections: Array<{ heading: string; content: string }>
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function extractTextFromPdf(file: File): Promise<string> {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
    GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url,
    ).toString()

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise
    setPageCount(pdf.numPages)

    const texts: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress(Math.round((i / pdf.numPages) * 60))
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str ?? '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (pageText) texts.push(`[Página ${i}]\n${pageText}`)
    }
    return texts.join('\n\n')
  }

  async function processFile(file: File) {
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setError('Selecione um arquivo PDF.')
      setStage('error')
      return
    }

    setFileName(file.name)
    setStage('extracting')
    setProgress(0)

    try {
      const text = await extractTextFromPdf(file)
      if (!text.trim()) {
        setError('Não foi possível extrair texto deste PDF. O arquivo pode ser uma imagem escaneada sem OCR.')
        setStage('error')
        return
      }

      setStage('processing')
      setProgress(70)
      const res = await processAulaPdfFn({ text, subjectName, fileName: file.name })
      setProgress(100)
      setResult(res.data)
      setStage('result')
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao processar o PDF.')
      setStage('error')
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [subjectName])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleSave() {
    if (!result) return
    const content = buildContent(result)
    onSave(result.title, content)
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div className={s.modal}>
        <div className={s.header}>
          <span>📄 Processar PDF da Aula</span>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.body}>
          {stage === 'drop' && (
            <div
              className={`${s.dropZone} ${dragOver ? s.dragOver : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className={s.dropIcon}>📥</div>
              <div className={s.dropTitle}>Arraste o PDF da aula aqui</div>
              <div className={s.dropSub}>ou clique para selecionar o arquivo</div>
              <div className={s.dropHint}>O conteúdo será resumido automaticamente pelo Claude</div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className={s.fileInput}
                onChange={onFileChange}
              />
            </div>
          )}

          {(stage === 'extracting' || stage === 'processing') && (
            <div className={s.progressWrap}>
              <div className={s.progressIcon}>
                {stage === 'extracting' ? '📖' : '🧠'}
              </div>
              <div className={s.progressTitle}>
                {stage === 'extracting'
                  ? `Lendo PDF${pageCount ? ` (${pageCount} páginas)` : ''}…`
                  : 'Claude está analisando o conteúdo…'}
              </div>
              <div className={s.progressFile}>{fileName}</div>
              <div className={s.progressBar}>
                <div className={s.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={s.progressPct}>{progress}%</div>
            </div>
          )}

          {stage === 'error' && (
            <div className={s.errorWrap}>
              <div className={s.errorIcon}>⚠️</div>
              <div className={s.errorMsg}>{error}</div>
              <button className={s.retryBtn} onClick={() => { setStage('drop'); setError('') }}>
                Tentar novamente
              </button>
            </div>
          )}

          {stage === 'result' && result && (
            <div className={s.resultWrap}>
              <div className={s.resultFile}>📄 {fileName}</div>
              <h2 className={s.resultTitle}>{result.title}</h2>
              <p className={s.resultSummary}>{result.summary}</p>

              {result.keyPoints.length > 0 && (
                <div className={s.section}>
                  <div className={s.sectionLabel}>Pontos-chave</div>
                  <ul className={s.keyPoints}>
                    {result.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.sections.map((sec, i) => (
                <div key={i} className={s.section}>
                  <div className={s.sectionLabel}>{sec.heading}</div>
                  <p className={s.sectionContent}>{sec.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {stage === 'result' && (
          <div className={s.footer}>
            <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
            <button className={s.saveBtn} onClick={handleSave}>
              ✓ Salvar no Hub
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function buildContent(result: {
  title: string
  summary: string
  keyPoints: string[]
  sections: Array<{ heading: string; content: string }>
}): string {
  const parts: string[] = []
  parts.push(`📋 RESUMO\n${result.summary}`)
  if (result.keyPoints.length > 0) {
    parts.push(`🎯 PONTOS-CHAVE\n${result.keyPoints.map(p => `• ${p}`).join('\n')}`)
  }
  for (const sec of result.sections) {
    parts.push(`📌 ${sec.heading}\n${sec.content}`)
  }
  return parts.join('\n\n')
}
