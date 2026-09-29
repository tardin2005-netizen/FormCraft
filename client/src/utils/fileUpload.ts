import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { auth, storage } from '../firebase'

export const MAX_UPLOAD_MB = 25

export interface UploadedFile {
  url: string
  storagePath: string
  size: number
}

export function uploadUserFile(file: File, onProgress: (pct: number) => void): Promise<UploadedFile> {
  const uid = auth.currentUser?.uid
  if (!uid) return Promise.reject(new Error('Você precisa estar logado para enviar arquivos.'))
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return Promise.reject(new Error(`Arquivo muito grande (máx. ${MAX_UPLOAD_MB} MB).`))
  }

  const safeName = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_')
  const storagePath = `users/${uid}/hub-files/${crypto.randomUUID()}-${safeName}`
  const task = uploadBytesResumable(ref(storage, storagePath), file, {
    contentType: file.type || (safeName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
  })

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      snap => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      err => reject(new Error(describeStorageError(err.code))),
      async () => resolve({ url: await getDownloadURL(task.snapshot.ref), storagePath, size: file.size }),
    )
  })
}

export function deleteUserFile(storagePath: string) {
  return deleteObject(ref(storage, storagePath)).catch(() => {})
}

function describeStorageError(code: string) {
  switch (code) {
    case 'storage/unauthorized':
      return 'O Firebase Storage recusou o envio. As regras de segurança precisam ser publicadas (arquivo storage.rules do projeto).'
    case 'storage/canceled':
      return 'Envio cancelado.'
    case 'storage/quota-exceeded':
      return 'A cota do Firebase Storage acabou.'
    case 'storage/retry-limit-exceeded':
      return 'A conexão caiu durante o envio. Tente de novo.'
    default:
      return `Não foi possível enviar o arquivo (${code}).`
  }
}
